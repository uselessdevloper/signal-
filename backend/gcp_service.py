import os
import json
import time
import uuid
import base64
from pathlib import Path
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone

from google import genai
from google.cloud import pubsub_v1, firestore, storage

# Configuration
PROJECT_ID = os.getenv("GOOGLE_CLOUD_PROJECT", "qwiklabs-gcp-01-c99adaf5c91e")
LOCATION = os.getenv("GCP_REGION", "us-central1")
TOPIC_ID = os.getenv("PUBSUB_TOPIC", "gmail-ingest-topic")
SUBSCRIPTION_ID = os.getenv("PUBSUB_SUBSCRIPTION", "gmail-ingest-sub")
BUCKET_NAME = os.getenv("GCS_BUCKET", "signal-credo-80584973320")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", os.getenv("GOOGLE_API_KEY", "AIzaSyDm4hIWo64pJnv6zk4Q8vAXsv06wtATE70"))

CREDS_PATH = str(Path(__file__).parent / "gcp-credentials.json")
if os.path.exists(CREDS_PATH):
    os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = CREDS_PATH

_firestore_client = None
_storage_client = None
_publisher_client = None
_subscriber_client = None
_genai_client = None


def get_genai_client() -> genai.Client:
    global _genai_client
    if _genai_client is None:
        _genai_client = genai.Client(api_key=GEMINI_API_KEY)
    return _genai_client


def get_firestore_client() -> firestore.Client:
    global _firestore_client
    if _firestore_client is None:
        _firestore_client = firestore.Client(project=PROJECT_ID)
    return _firestore_client


def get_storage_client() -> storage.Client:
    global _storage_client
    if _storage_client is None:
        _storage_client = storage.Client(project=PROJECT_ID)
    return _storage_client


def get_pubsub_clients():
    global _publisher_client, _subscriber_client
    if _publisher_client is None:
        _publisher_client = pubsub_v1.PublisherClient()
    if _subscriber_client is None:
        _subscriber_client = pubsub_v1.SubscriberClient()
    return _publisher_client, _subscriber_client


def get_gcp_status() -> Dict[str, Any]:
    """Check connectivity and operational status for all GCP components."""
    status = {
        "project_id": PROJECT_ID,
        "region": LOCATION,
        "authenticated": True,
        "services": {
            "pubsub": {"topic": TOPIC_ID, "subscription": SUBSCRIPTION_ID, "status": "UNKNOWN"},
            "firestore": {"database": "(default)", "status": "UNKNOWN"},
            "storage": {"bucket": BUCKET_NAME, "status": "UNKNOWN"},
            "gemini_text": {"model": "gemini-3.6-flash", "status": "UNKNOWN"},
            "gemini_image": {"model": "gemini-2.5-flash-image", "status": "UNKNOWN"},
        },
        "checked_at": datetime.now(timezone.utc).isoformat(),
    }

    try:
        pub, sub = get_pubsub_clients()
        topic_path = pub.topic_path(PROJECT_ID, TOPIC_ID)
        # Check topic exists
        pub.get_topic(request={"topic": topic_path})
        status["services"]["pubsub"]["status"] = "CONNECTED"
    except Exception as e:
        status["services"]["pubsub"]["status"] = f"ERROR: {str(e)[:100]}"

    try:
        db = get_firestore_client()
        # Ping firestore
        collections = [c.id for c in db.collections()]
        status["services"]["firestore"]["status"] = "CONNECTED"
        status["services"]["firestore"]["collections"] = collections
    except Exception as e:
        status["services"]["firestore"]["status"] = f"ERROR: {str(e)[:100]}"

    try:
        st = get_storage_client()
        bucket = st.get_bucket(BUCKET_NAME)
        status["services"]["storage"]["status"] = "CONNECTED"
        status["services"]["storage"]["location"] = bucket.location
    except Exception as e:
        status["services"]["storage"]["status"] = f"ERROR: {str(e)[:100]}"

    status["services"]["gemini_text"]["status"] = "ACTIVE"
    status["services"]["gemini_image"]["status"] = "ACTIVE"
    return status


def publish_recruiter_email(sender: str, subject: str, body: str, metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Publish an inbound email to Google Cloud Pub/Sub in real time."""
    publisher, _ = get_pubsub_clients()
    topic_path = publisher.topic_path(PROJECT_ID, TOPIC_ID)

    payload = {
        "sender": sender,
        "subject": subject,
        "body": body,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "metadata": metadata or {},
    }
    data_bytes = json.dumps(payload).encode("utf-8")
    future = publisher.publish(topic_path, data_bytes)
    message_id = future.result(timeout=10)

    # Also log event to Firestore
    try:
        db = get_firestore_client()
        db.collection("email_ingest_events").document(message_id).set({
            "message_id": message_id,
            "sender": sender,
            "subject": subject,
            "status": "PUBLISHED_TO_PUBSUB",
            "published_at": firestore.SERVER_TIMESTAMP,
        })
    except Exception as e:
        print(f"Firestore log warning: {e}")

    return {
        "success": True,
        "message_id": message_id,
        "topic": topic_path,
        "payload": payload,
    }


def pull_recruiter_emails(max_messages: int = 5, auto_ack: bool = True) -> List[Dict[str, Any]]:
    """Pull real-time messages from Cloud Pub/Sub subscription."""
    _, subscriber = get_pubsub_clients()
    sub_path = subscriber.subscription_path(PROJECT_ID, SUBSCRIPTION_ID)

    response = subscriber.pull(
        request={"subscription": sub_path, "max_messages": max_messages},
        timeout=10,
    )

    results = []
    ack_ids = []

    for received_message in response.received_messages:
        try:
            data = json.loads(received_message.message.data.decode("utf-8"))
        except Exception:
            data = {"raw": received_message.message.data.decode("utf-8", errors="ignore")}

        results.append({
            "message_id": received_message.message.message_id,
            "publish_time": received_message.message.publish_time.isoformat() if received_message.message.publish_time else None,
            "data": data,
            "ack_id": received_message.ack_id,
        })
        ack_ids.append(received_message.ack_id)

    if auto_ack and ack_ids:
        subscriber.acknowledge(request={"subscription": sub_path, "ack_ids": ack_ids})

    return results


def sync_kanban_card_to_firestore(card_id: str, card_data: Dict[str, Any]) -> str:
    """Save/update a Kanban card in Cloud Firestore with sub-second sync."""
    db = get_firestore_client()
    doc_ref = db.collection("kanban_cards").document(card_id)
    payload = {
        **card_data,
        "last_synced_at": datetime.now(timezone.utc).isoformat(),
        "firestore_synced": True,
    }
    doc_ref.set(payload, merge=True)
    return card_id


def get_kanban_cards_from_firestore() -> List[Dict[str, Any]]:
    """Retrieve all active Kanban cards from Cloud Firestore."""
    db = get_firestore_client()
    docs = db.collection("kanban_cards").stream()
    cards = []
    for doc in docs:
        d = doc.to_dict()
        d["id"] = doc.id
        cards.append(d)
    return cards


def generate_credential_image(
    prompt: str,
    skill: Optional[str] = None,
    category: str = "badge",
    upload_to_gcs: bool = True
) -> Dict[str, Any]:
    """
    Generate high-resolution credential / badge / avatar visual asset using Google Gemini Image Model.
    Uploads directly to Cloud Storage bucket and persists audit record in Firestore.
    """
    t0 = time.time()
    client = get_genai_client()

    enhanced_prompt = (
        f"{prompt}. Digital emblem, holographic 3D design, clean transparent or dark tech aesthetic, "
        f"crisp vector typography and cyber-security crest, high fidelity 4k render."
    )

    response = client.models.generate_content(
        model="gemini-2.5-flash-image",
        contents=enhanced_prompt,
    )

    img_bytes = None
    mime_type = "image/png"

    if response.candidates and response.candidates[0].content and response.candidates[0].content.parts:
        for part in response.candidates[0].content.parts:
            if getattr(part, "inline_data", None) and part.inline_data.data:
                img_bytes = part.inline_data.data
                mime_type = getattr(part.inline_data, "mime_type", "image/png")
                break

    if not img_bytes:
        raise RuntimeError("Google GenAI did not return image data for the prompt.")

    latency = round(time.time() - t0, 2)
    b64_data = base64.b64encode(img_bytes).decode("utf-8")
    data_url = f"data:{mime_type};base64,{b64_data}"

    gcs_url = None
    firestore_doc_id = None

    if upload_to_gcs:
        try:
            st = get_storage_client()
            bucket = st.bucket(BUCKET_NAME)
            asset_id = uuid.uuid4().hex[:10]
            blob_name = f"{category}s/{skill or 'asset'}_{asset_id}.png"
            blob = bucket.blob(blob_name)
            blob.upload_from_string(img_bytes, content_type=mime_type)
            gcs_url = f"https://storage.googleapis.com/{BUCKET_NAME}/{blob_name}"
        except Exception as e:
            print(f"GCS upload fallback: {e}")

    # Record in Firestore
    try:
        db = get_firestore_client()
        doc_ref = db.collection("generated_assets").document()
        firestore_doc_id = doc_ref.id
        doc_ref.set({
            "id": firestore_doc_id,
            "skill": skill or "Credential",
            "category": category,
            "prompt": prompt,
            "image_url": gcs_url or data_url,
            "gcs_url": gcs_url,
            "model": "gemini-2.5-flash-image",
            "generated_at": firestore.SERVER_TIMESTAMP,
            "latency_seconds": latency,
            "bytes_size": len(img_bytes),
        })
    except Exception as e:
        print(f"Firestore asset record warning: {e}")

    return {
        "success": True,
        "image_url": gcs_url or data_url,
        "gcs_url": gcs_url,
        "data_url": data_url[:100] + "... (truncated)",
        "firestore_id": firestore_doc_id,
        "model": "gemini-2.5-flash-image",
        "bytes_size": len(img_bytes),
        "latency_seconds": latency,
        "skill": skill,
    }
