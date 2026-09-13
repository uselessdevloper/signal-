import os
import sys
from pathlib import Path
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
from dotenv import load_dotenv

load_dotenv()

gitproof_dir = str(Path(__file__).parent / "gitproof")
verifier_dir = str(Path(__file__).parent / "credential_verifier-main")

for p in [gitproof_dir, verifier_dir]:
    if p not in sys.path:
        sys.path.insert(0, p)

from fastapi import FastAPI, HTTPException, Request, Body
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from pydantic import BaseModel, Field
from graph import signal_graph
from gitproof.app import app as gitproof_app
import auth
import json

try:
    from verifier import verify_credential, REGISTRY_PATH
except ImportError:
    import importlib.util
    spec = importlib.util.spec_from_file_location("verifier", Path(verifier_dir) / "verifier.py")
    verifier_mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(verifier_mod)
    verify_credential = verifier_mod.verify_credential
    REGISTRY_PATH = verifier_mod.REGISTRY_PATH

app = FastAPI(
    title="SIGNAL: Simplified Information for Guiding Networked Applications & Leads API",
    description=(
        "SIGNAL (Simplified Information for Guiding Networked Applications & Leads) - "
        "6-agent LangGraph pipeline for autonomous job application tracking. "
        "Agents: Email Ingestion (Cloud Pub/Sub), MINSKY Code Forensics, "
        "Career Optimization, Live Kanban (Cloud Firestore), AI Drafting (Gemini 2.5 Flash), "
        "and Scheduled Nudges (Cloud Tasks)."
    ),
    version="3.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

SESSION_SECRET = os.getenv("SESSION_SECRET", "signal-dev-secret-2026")

app.add_middleware(SessionMiddleware, secret_key=SESSION_SECRET, same_site="lax")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "service": "SIGNAL (Simplified Information for Guiding Networked Applications & Leads)",
        "acronym": "Simplified Information for Guiding Networked Applications & Leads",
        "version": "3.0.0",
        "gcp_stack": {
            "llm": "Gemini 2.5 Flash (Vertex AI)",
            "ingestion": "Cloud Pub/Sub",
            "database": "Cloud Firestore",
            "scheduler": "Cloud Tasks",
            "compute": "Cloud Run",
        },
        "agents": {
            "1": "Email & Ingestion Agent",
            "2": "MINSKY Code Forensics Agent",
            "3": "Career Optimization Agent",
            "4": "Tracking Agent (Live Kanban)",
            "5": "AI Drafting Agent",
            "6": "Scheduled Nudge Agent",
        },
        "docs": "/docs",
    }


@app.get("/api/health")
def health():
    return {
        "status": "healthy",
        "pipeline": "LangGraph 6-Agent StateMachine",
        "gemini_model": "gemini-2.5-flash",
    }


FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")


@app.get("/auth/login")
def auth_login(request: Request):
    state = auth.generate_state()
    request.session["oauth_state"] = state
    return RedirectResponse(auth.get_authorize_url(state))


@app.get("/auth/callback")
def auth_callback(
    request: Request,
    code: str = None,
    state: str = None,
    error: str = None,
):
    if error:
        return RedirectResponse(f"{FRONTEND_URL}/dashboard/settings?auth_error={error}")

    expected = request.session.pop("oauth_state", None)
    if not state or state != expected:
        return RedirectResponse(f"{FRONTEND_URL}/dashboard/settings?auth_error=invalid_state")

    if not code:
        return RedirectResponse(f"{FRONTEND_URL}/dashboard/settings?auth_error=missing_code")

    try:
        token = auth.exchange_code_for_token(code)
        github_user = auth.get_authenticated_user(token)
    except Exception as exc:
        return RedirectResponse(f"{FRONTEND_URL}/dashboard/settings?auth_error={str(exc)}")

    request.session["github_token"] = token
    request.session["github_user"] = github_user
    username = github_user.get("login", "")
    return RedirectResponse(f"{FRONTEND_URL}/dashboard/settings?connected=true&github_username={username}")


@app.post("/auth/logout")
def auth_logout(request: Request):
    request.session.clear()
    return {"status": "logged_out"}



class PipelineRunRequest(BaseModel):
    inbound_email: Optional[Dict[str, Any]] = None
    company: Optional[str] = "TechCorp"
    job_title: Optional[str] = "Full Stack Engineer"
    job_description: Optional[str] = "Looking for a full-stack engineer experienced in React, TypeScript, Python, and scalable cloud systems."
    candidate_profile: Optional[Dict[str, Any]] = Field(default_factory=dict)
    github_token: Optional[str] = None
    github_username: Optional[str] = None


class EmailIngestRequest(BaseModel):
    sender: str
    subject: str
    body: str
    pubsub_message_id: Optional[str] = None


class MinskyAuditRequest(BaseModel):
    github_token: Optional[str] = None
    github_username: Optional[str] = None
    skills: Optional[List[str]] = None


class GapAnalysisRequest(BaseModel):
    job_description: str
    verified_skills: Optional[List[str]] = None


class DraftingRequest(BaseModel):
    company: str
    role: str
    skills: Optional[List[str]] = None


class NudgeScheduleRequest(BaseModel):
    company: str
    role: str
    interview_date: Optional[str] = None


from adk.orchestrator import global_orchestrator
from adk.memory import global_memory_manager
from adk.scorecard import global_scorecard_engine

class FeedbackSubmitRequest(BaseModel):
    agent_name: str
    user_correction: str
    feedback_type: Optional[str] = "USER_CORRECTION"
    application_id: Optional[str] = None
    desired_behavior: Optional[str] = None
    original_output: Optional[str] = None

class ScorecardGenerateRequest(BaseModel):
    job_description: Optional[str] = None
    company: Optional[str] = "TechCorp"
    job_title: Optional[str] = "Full Stack Engineer"
    candidate_profile: Optional[Dict[str, Any]] = None
    stage: Optional[str] = "Technical Screen"

@app.post("/api/pipeline/run")
def run_full_pipeline(req: PipelineRunRequest):
    """Run all 7 ADK agents in sequence with episodic memory and Greenhouse scorecard."""
    try:
        context_dict = {
            "application_id": f"app_{int(os.times().system * 1000)}",
            "company": req.company or "TechCorp",
            "job_title": req.job_title or "Full Stack Engineer",
            "job_description": req.job_description or "Full stack development with TypeScript, React, Python, and scalable distributed systems.",
            "candidate_profile": req.candidate_profile or {"skills": ["TypeScript", "React", "Python", "FastAPI", "Docker", "GCP"]},
            "inbound_email": req.inbound_email,
            "github_token": req.github_token,
            "github_username": req.github_username,
        }

        result = global_orchestrator.run_pipeline(context_dict)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={"code": "PIPELINE_EXECUTION_ERROR", "message": str(e)}
        )


@app.post("/api/email/ingest")
def ingest_email_pubsub(req: EmailIngestRequest):
    """Agent 1: Parse a recruiter email received via Cloud Pub/Sub push subscription."""
    from graph import email_ingestion_agent
    state = {
        "inbound_email": {
            "sender": req.sender,
            "subject": req.subject,
            "body": req.body,
        },
        "company": None,
        "job_title": None,
    }
    result = email_ingestion_agent(state)
    return {"success": True, "data": result}


@app.post("/api/minsky/audit")
def minsky_audit(req: MinskyAuditRequest):
    """Agent 2: MINSKY code forensics — verify GitHub contributions via GPG signatures + metadata heuristics."""
    from graph import minsky_forensics_agent
    state = {
        "github_token": req.github_token,
        "github_username": req.github_username,
        "candidate_profile": {"skills": req.skills or ["TypeScript", "Python", "React", "Go"]},
    }
    result = minsky_forensics_agent(state)
    return {"success": True, "data": result}


@app.post("/api/optimize/gap-analysis")
def optimize_gap_analysis(req: GapAnalysisRequest):
    """Agent 3: Semantic gap analysis between verified skill badges and a job description."""
    from graph import career_optimization_agent
    state = {
        "job_description": req.job_description,
        "minsky_forensics": {
            "verified_badges": [{"skill": s, "proof_score": 90} for s in (req.verified_skills or ["TypeScript", "Python", "React"])]
        }
    }
    result = career_optimization_agent(state)
    return {"success": True, "data": result}


@app.get("/api/kanban/state")
def get_kanban_state():
    """Agent 4: Fetch the current live Kanban board state synced from Cloud Firestore."""
    from graph import tracking_agent
    state = {"company": "Acme Corp", "job_title": "Software Engineer", "ingestion_result": {}}
    result = tracking_agent(state)
    return {"success": True, "data": result.get("kanban_state")}


@app.post("/api/draft/outreach")
def generate_drafted_outreach(req: DraftingRequest):
    """Agent 5: Generate evidence-backed cover letters and cold outreach using Gemini 2.5 Flash."""
    from graph import ai_drafting_agent
    state = {
        "company": req.company,
        "job_title": req.role,
        "minsky_forensics": {
            "verified_badges": [{"skill": s, "proof_score": 92} for s in (req.skills or ["TypeScript", "Python"])]
        }
    }
    result = ai_drafting_agent(state)
    return {"success": True, "data": result.get("drafted_outreach")}


class ImageGenerateRequest(BaseModel):
    prompt: str
    skill: Optional[str] = None
    category: Optional[str] = "badge"


@app.get("/api/gcp/status")
def get_gcp_service_status():
    """Check live status of Google Cloud services (Pub/Sub, Firestore, Storage, Gemini Text/Image)."""
    import gcp_service
    return gcp_service.get_gcp_status()


@app.post("/api/image/generate")
def generate_image_api(req: ImageGenerateRequest):
    """Real-time credential badge & passport avatar image generation powered by Google Gemini Image Model."""
    import gcp_service
    try:
        result = gcp_service.generate_credential_image(
            prompt=req.prompt,
            skill=req.skill,
            category=req.category or "badge",
            upload_to_gcs=True,
        )
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={"code": "IMAGE_GENERATION_FAILED", "message": str(e)}
        )


@app.post("/api/pubsub/publish")
def publish_email_to_pubsub(req: EmailIngestRequest):
    """Publish an incoming recruiter email to Google Cloud Pub/Sub topic in real time."""
    import gcp_service
    try:
        result = gcp_service.publish_recruiter_email(
            sender=req.sender,
            subject=req.subject,
            body=req.body,
        )
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={"code": "PUBSUB_PUBLISH_FAILED", "message": str(e)}
        )


@app.post("/api/pubsub/pull")
def pull_and_process_pubsub_emails(max_messages: int = 5):
    """Pull real-time messages from Cloud Pub/Sub and ingest them into Firestore via Agent 1."""
    import gcp_service
    from graph import email_ingestion_agent

    try:
        messages = gcp_service.pull_recruiter_emails(max_messages=max_messages, auto_ack=True)
        processed = []
        for msg in messages:
            data = msg.get("data", {})
            state = {
                "inbound_email": {
                    "sender": data.get("sender", "recruiter@unknown.com"),
                    "subject": data.get("subject", "Job Update"),
                    "body": data.get("body", ""),
                },
                "company": None,
                "job_title": None,
            }
            res = email_ingestion_agent(state)
            processed.append({
                "message_id": msg.get("message_id"),
                "ingestion": res,
            })

        return {
            "success": True,
            "pulled_count": len(messages),
            "processed": processed,
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={"code": "PUBSUB_PULL_FAILED", "message": str(e)}
        )


@app.post("/api/nudge/schedule")
def schedule_nudges(req: NudgeScheduleRequest):
    """Agent 6: Schedule interview prep alerts and recruiter follow-ups via Google Cloud Tasks."""
    from graph import scheduled_nudge_agent
    state = {
        "company": req.company,
        "job_title": req.role,
        "ingestion_result": {"parsed": {"interview_date": req.interview_date}}
    }
    result = scheduled_nudge_agent(state)
    return {"success": True, "data": result.get("scheduled_nudges")}


@app.get("/api/adk/agents")
def list_adk_agents():
    """List all 7 registered Google ADK enterprise agents with memory stats."""
    return {
        "success": True,
        "framework": "Google ADK (Agent Development Kit) v3.0",
        "memory_backend": "Dual-Layer (SQLite + Cloud Firestore)",
        "reflection_loop": "Continuous Self-Correction via GitProof Distillation",
        "agents": [
            {
                "id": "1",
                "name": "ATSNormalizerAgent",
                "role": "Recruiter Ingestion & Entity Extraction",
                "cloud_service": "Cloud Pub/Sub + Gemini Flash",
                "memory_enabled": True,
            },
            {
                "id": "2",
                "name": "MinskyForensicsAgent",
                "role": "Cryptographic Git & Code Proof Verification",
                "cloud_service": "GitHub API + Trust Registry",
                "memory_enabled": True,
            },
            {
                "id": "3",
                "name": "GreenhouseScorecardAgent",
                "role": "4-Dimension Candidate Rubric & Fit Evaluation",
                "cloud_service": "Greenhouse Scorecard Engine + Gemini Flash",
                "memory_enabled": True,
            },
            {
                "id": "4",
                "name": "LifecycleTrackerAgent",
                "role": "Live Real-Time Application Kanban & Stage Sync",
                "cloud_service": "Cloud Firestore Native Mode",
                "memory_enabled": True,
            },
            {
                "id": "5",
                "name": "AdaptiveDraftingAgent",
                "role": "Personalized Outreach with Mistake Correction Injection",
                "cloud_service": "Gemini 3.6 Flash + Episodic Memory",
                "memory_enabled": True,
            },
            {
                "id": "6",
                "name": "ScheduledNudgeAgent",
                "role": "Follow-Up & Interview Preparation Scheduler",
                "cloud_service": "Google Cloud Tasks",
                "memory_enabled": False,
            },
            {
                "id": "7",
                "name": "ReflectionLearningAgent",
                "role": "Continuous Learning from Rejections & User Feedback",
                "cloud_service": "GitProof Lesson Distillation Engine",
                "memory_enabled": True,
            },
        ],
    }


@app.post("/api/memory/feedback")
def submit_agent_feedback(req: FeedbackSubmitRequest):
    """Submit human correction/feedback on an agent's output, triggering the reflection distillation loop."""
    try:
        res = global_orchestrator.submit_feedback_and_learn(
            agent_name=req.agent_name,
            user_correction=req.user_correction,
            feedback_type=req.feedback_type or "USER_CORRECTION",
            application_id=req.application_id,
            desired_behavior=req.desired_behavior,
        )
        return res
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={"code": "FEEDBACK_SUBMISSION_FAILED", "message": str(e)}
        )


@app.get("/api/memory/lessons")
def get_memory_lessons(agent_name: Optional[str] = None):
    """Retrieve distilled persistent lessons and behavioral rules learned by agents."""
    try:
        lessons = global_memory_manager.get_active_lessons(agent_name=agent_name)
        return {
            "success": True,
            "count": len(lessons),
            "lessons": [lesson.model_dump() for lesson in lessons],
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={"code": "LESSONS_FETCH_FAILED", "message": str(e)}
        )


@app.post("/api/scorecard/generate")
def generate_greenhouse_scorecard(req: ScorecardGenerateRequest):
    """Generate a Greenhouse-standard 4-dimension candidate scorecard."""
    try:
        scorecard = global_scorecard_engine.evaluate_candidate(
            job_description=req.job_description or "Full-stack engineer with TypeScript, React, Python, and cloud infrastructure.",
            candidate_profile=req.candidate_profile or {"skills": ["TypeScript", "Python", "React", "Docker"]},
            stage=req.stage or "Technical Screen",
            company=req.company or "TechCorp",
            role=req.job_title or "Full Stack Engineer",
        )
        return {"success": True, "scorecard": scorecard.model_dump()}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={"code": "SCORECARD_GENERATION_FAILED", "message": str(e)}
        )


from gmail_service import global_gmail_service
from adk.shortlist_engine import global_shortlist_engine


class GmailConnectRequest(BaseModel):
    email: Optional[str] = "off.utkarsh.sinha@gmail.com"
    pubsub_topic: Optional[str] = "gmail-ingest-topic"


class ShortlistPredictRequest(BaseModel):
    company: str
    role: str
    stage: Optional[str] = "Applied"
    email_body: Optional[str] = None
    skills: Optional[List[str]] = None
    proof_score: Optional[int] = 96


class GmailTokenRequest(BaseModel):
    access_token: str
    refresh_token: Optional[str] = None
    expires_in: Optional[int] = 3600


class RawEmailIngestRequest(BaseModel):
    sender: str
    subject: str
    body: str
    received_at: Optional[str] = None


@app.post("/api/gmail/token")
def set_gmail_token(req: GmailTokenRequest):
    """Save user Gmail OAuth access token for direct Gmail REST API v1 mailbox queries."""
    global_gmail_service.save_token(
        access_token=req.access_token,
        refresh_token=req.refresh_token,
        expires_in=req.expires_in or 3600
    )
    return {"success": True, "message": "Gmail token stored successfully"}


@app.post("/api/gmail/ingest-raw")
def ingest_raw_email(req: RawEmailIngestRequest):
    """Dynamically parse and score any incoming raw email in real time."""
    app = global_gmail_service.process_dynamic_raw_email(
        sender=req.sender,
        subject=req.subject,
        body=req.body,
        received_at=req.received_at
    )
    return {"success": True, "application": app.model_dump()}


@app.post("/api/gmail/connect")
def connect_gmail_mailbox(req: GmailConnectRequest):
    """Connect user email (off.utkarsh.sinha@gmail.com) and register Cloud Pub/Sub watch."""
    global_gmail_service.user_email = req.email or "off.utkarsh.sinha@gmail.com"
    return global_gmail_service.get_connection_status()


@app.get("/api/gmail/status")
def get_gmail_status():
    """Retrieve the real-time Gmail connection, Pub/Sub watch status, and tracked applications."""
    return global_gmail_service.get_connection_status()


@app.post("/api/gmail/sync")
def sync_gmail_applications(limit: int = 12):
    """Scan connected mailbox for historical & active job applications, compute shortlist probability, and sync to Firestore."""
    try:
        apps = global_gmail_service.scan_and_sync_mailbox(limit=limit)
        return {
            "success": True,
            "connected_email": global_gmail_service.user_email,
            "synced_count": len(apps),
            "synced_at": datetime.now(timezone.utc).isoformat(),
            "applications": [a.model_dump() for a in apps],
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={"code": "GMAIL_SYNC_FAILED", "message": str(e)}
        )


@app.post("/api/shortlist/predict")
def predict_shortlist_probability(req: ShortlistPredictRequest):
    """Compute AI Shortlisting Probability Score for any job application."""
    try:
        res = global_shortlist_engine.predict_shortlist_probability(
            company=req.company,
            role=req.role,
            stage=req.stage or "Applied",
            email_body=req.email_body,
            candidate_skills=req.skills or ["TypeScript", "Python", "React", "Cloud Architecture"],
            proof_score=req.proof_score or 96,
        )
        return {"success": True, "prediction": res.model_dump()}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={"code": "SHORTLIST_PREDICTION_FAILED", "message": str(e)}
        )


@app.post("/api/credentials/verify")
def verify_vc(payload: dict = Body(...)):
    """Verify a W3C Verifiable Credential against the Signal trust registry."""
    try:
        cred = payload.get("credential", payload)
        result = verify_credential(cred)
        return {
            "success": result.get("status") == "VERIFIED",
            "result": result
        }
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail={"code": "VERIFICATION_ERROR", "message": str(e)}
        )


@app.get("/api/credentials/registry")
def get_registry():
    if os.path.exists(REGISTRY_PATH):
        with open(REGISTRY_PATH, "r") as f:
            return json.load(f)
    return {}


app.mount("/gitproof", gitproof_app)


