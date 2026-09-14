#!/usr/bin/env python3
"""
SIGNAL Comprehensive Real-Time CLI Test Suite
Tests all 18 multi-agent pipelines, Google Cloud integrations, and frontend pages.
"""

import sys
import json
import time
import urllib.request
import urllib.error

LIVE_FRONTEND_URL = "https://signal-frontend-80584973320.us-central1.run.app"
LIVE_BACKEND_URL = "https://signal-backend-80584973320.us-central1.run.app"

PASSED = "✅ PASS"
FAILED = "❌ FAIL"

results = []

def request(url, method="GET", data=None, headers=None):
    if headers is None:
        headers = {}
    if data is not None and isinstance(data, dict):
        data = json.dumps(data).encode("utf-8")
        headers["Content-Type"] = "application/json"
    
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    start = time.time()
    try:
        with urllib.request.urlopen(req, timeout=40) as response:
            status = response.status
            body = response.read().decode("utf-8")
            elapsed = (time.time() - start) * 1000
            try:
                parsed = json.loads(body)
            except Exception:
                parsed = body
            return status, parsed, elapsed
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        elapsed = (time.time() - start) * 1000
        try:
            parsed = json.loads(body)
        except Exception:
            parsed = body
        return e.code, parsed, elapsed
    except Exception as e:
        elapsed = (time.time() - start) * 1000
        return 0, str(e), elapsed

def test_step(step_num, title, fn):
    print(f"\n========================================================")
    print(f"STEP {step_num:02d}: {title}")
    print(f"========================================================")
    try:
        success, msg = fn()
        status_label = PASSED if success else FAILED
        print(f"Result: {status_label} -> {msg}")
        results.append((step_num, title, success, msg))
    except Exception as e:
        print(f"Result: {FAILED} -> Unhandled Exception: {e}")
        results.append((step_num, title, False, str(e)))

# ----------------- BACKEND & GCP TESTS -----------------

def test_1_backend_health():
    status, body, ms = request(f"{LIVE_BACKEND_URL}/api/gcp/status")
    if status == 200 and body.get("authenticated") is True:
        services = body.get("services", {})
        return True, f"HTTP {status} ({ms:.1f}ms) | Project: {body.get('project_id')} | Vertex AI: {services.get('gemini_text', {}).get('status')} | BigQuery: {services.get('bigquery', {}).get('status')} | Cloud TTS: {services.get('cloud_tts', {}).get('status')}"
    return False, f"Status: {status}, Body: {body}"

def test_2_vertex_search_grounding():
    payload = {"company": "Google DeepMind", "role": "Research Scientist"}
    status, body, ms = request(f"{LIVE_BACKEND_URL}/api/gcp/grounding/verify-company", method="POST", data=payload)
    if status == 200 and (body.get("success") is True or body.get("verified") is True):
        return True, f"HTTP {status} ({ms:.1f}ms) | Grounded: {body.get('company')} | Legitimacy Score: {body.get('legitimacy_score')}%"
    return False, f"Status: {status}, Body: {body}"

def test_3_cloud_text_to_speech():
    payload = {"text": "Hello, this is your SIGNAL interviewer briefing.", "voice": "en-US-Neural2-F", "speaking_rate": 1.05}
    status, body, ms = request(f"{LIVE_BACKEND_URL}/api/gcp/tts/synthesize", method="POST", data=payload)
    if status == 200 and body.get("success") is True and len(body.get("audio_base64", "")) > 100:
        return True, f"HTTP {status} ({ms:.1f}ms) | Voice: {body.get('voice')} | Audio Payload: {body.get('bytes_size')} chars"
    return False, f"Status: {status}, Body: {body}"

def test_4_bigquery_market_radar():
    status, body, ms = request(f"{LIVE_BACKEND_URL}/api/gcp/bigquery/market-radar?limit=5")
    if status == 200 and body.get("success") is True:
        rows = body.get("events", [])
        return True, f"HTTP {status} ({ms:.1f}ms) | BigQuery Table Query Active | Events returned: {len(rows)}"
    return False, f"Status: {status}, Body: {body}"

def test_5_email_ingestion_agent():
    payload = {
        "sender": "recruiter@stripe.com",
        "subject": "Interview Scheduled: Backend Systems Intern",
        "body": "Hi Utkarsh, we are excited to invite you for a 45-min technical interview for Backend Systems Intern on Friday at 3 PM UTC."
    }
    status, body, ms = request(f"{LIVE_BACKEND_URL}/api/email/ingest", method="POST", data=payload)
    if status == 200 and body.get("success") is True:
        ingestion = body.get("data", {}).get("ingestion_result", {})
        return True, f"HTTP {status} ({ms:.1f}ms) | Parsed Company: {ingestion.get('company')} | Role: {ingestion.get('role')} | Stage: {ingestion.get('stage')}"
    return False, f"Status: {status}, Body: {body}"

def test_6_minsky_code_forensics():
    payload = {
        "github_username": "uselessdevloper",
        "skills": ["TypeScript", "Python", "React", "Go"]
    }
    status, body, ms = request(f"{LIVE_BACKEND_URL}/api/minsky/audit", method="POST", data=payload)
    if status == 200 and body.get("success") is True:
        minsky = body.get("data", {}).get("minsky_forensics", {})
        badges = minsky.get("verified_badges", [])
        return True, f"HTTP {status} ({ms:.1f}ms) | Verified Badges: {len(badges)} | Trust Score: {minsky.get('overall_trust_score')}%"
    return False, f"Status: {status}, Body: {body}"

def test_7_career_optimization_gap_analysis():
    payload = {
        "job_description": "We are seeking a Distributed Systems Engineer with expertise in Go, Kubernetes, Kafka, and microservices.",
        "verified_skills": ["TypeScript", "Python", "React", "Google Cloud"]
    }
    status, body, ms = request(f"{LIVE_BACKEND_URL}/api/optimize/gap-analysis", method="POST", data=payload)
    if status == 200 and body.get("success") is True:
        opt = body.get("data", {}).get("career_optimization", {})
        return True, f"HTTP {status} ({ms:.1f}ms) | Match Score: {opt.get('match_score')}% | Target: {opt.get('suggested_headline')}"
    return False, f"Status: {status}, Body: {body}"

def test_8_tracking_kanban_state():
    status, body, ms = request(f"{LIVE_BACKEND_URL}/api/kanban/state")
    if status == 200 and body.get("success") is True:
        board = body.get("data", {}).get("columns", {})
        return True, f"HTTP {status} ({ms:.1f}ms) | Live Kanban Stages: {list(board.keys())}"
    return False, f"Status: {status}, Body: {body}"

def test_9_ai_drafting_agent():
    payload = {
        "company": "Stripe",
        "role": "Backend Engineer Intern",
        "skills": ["Python", "FastAPI", "PostgreSQL", "Google Cloud"]
    }
    status, body, ms = request(f"{LIVE_BACKEND_URL}/api/draft/outreach", method="POST", data=payload)
    if status == 200 and body.get("success") is True:
        draft = body.get("data", {})
        return True, f"HTTP {status} ({ms:.1f}ms) | Cold Email Generated ({len(draft.get('cold_email', ''))} chars) | Cover Letter Generated ({len(draft.get('cover_letter', ''))} chars)"
    return False, f"Status: {status}, Body: {body}"

def test_10_full_pipeline_orchestrator():
    payload = {
        "company": "Vercel",
        "job_title": "Frontend Systems Engineer",
        "job_description": "Building next-generation web infrastructure with Next.js, Turbopack, and Edge Networks.",
        "candidate_profile": {"skills": ["Next.js", "TypeScript", "React", "Tailwind CSS", "Node.js"]}
    }
    status, body, ms = request(f"{LIVE_BACKEND_URL}/api/pipeline/run", method="POST", data=payload)
    if status == 200 and body.get("success") is True:
        pipeline = body.get("data", {})
        return True, f"HTTP {status} ({ms:.1f}ms) | Pipeline executed across all agents successfully | Application ID: {pipeline.get('application_id')}"
    return False, f"Status: {status}, Body: {body}"

# ----------------- FRONTEND TESTS -----------------

def test_11_frontend_landing_page():
    status, body, ms = request(LIVE_FRONTEND_URL)
    if status == 200:
        return True, f"HTTP {status} ({ms:.1f}ms) | Next.js Landing Page Live"
    return False, f"Status: {status}"

def test_12_frontend_dashboard():
    status, body, ms = request(f"{LIVE_FRONTEND_URL}/dashboard")
    if status == 200:
        return True, f"HTTP {status} ({ms:.1f}ms) | Dashboard, Student ID & GitProof Audit Live"
    return False, f"Status: {status}"

def test_13_frontend_google_cloud_hub():
    status, body, ms = request(f"{LIVE_FRONTEND_URL}/dashboard/integrations")
    if status == 200:
        return True, f"HTTP {status} ({ms:.1f}ms) | Google Cloud Native Hub Live"
    return False, f"Status: {status}"

def test_14_frontend_tracker():
    status, body, ms = request(f"{LIVE_FRONTEND_URL}/dashboard/tracker")
    if status == 200:
        return True, f"HTTP {status} ({ms:.1f}ms) | Live Application Kanban Tracker Live"
    return False, f"Status: {status}"

def test_15_frontend_certificates():
    status, body, ms = request(f"{LIVE_FRONTEND_URL}/dashboard/certificates")
    if status == 200:
        return True, f"HTTP {status} ({ms:.1f}ms) | Credentials & Anti-Cheat Forensics Live"
    return False, f"Status: {status}"

def test_16_frontend_internships():
    status, body, ms = request(f"{LIVE_FRONTEND_URL}/dashboard/internships")
    if status == 200:
        return True, f"HTTP {status} ({ms:.1f}ms) | AI Opportunity Matcher Live"
    return False, f"Status: {status}"

def test_17_frontend_passport_verification():
    status, body, ms = request(f"{LIVE_FRONTEND_URL}/verify/passport/CDY26S7421")
    if status == 200:
        return True, f"HTTP {status} ({ms:.1f}ms) | Public Cryptographic Verification Endpoint Live"
    return False, f"Status: {status}"

def test_18_frontend_public_profile():
    status, body, ms = request(f"{LIVE_FRONTEND_URL}/p/uselessdevloper")
    if status == 200:
        return True, f"HTTP {status} ({ms:.1f}ms) | Public Candidate Proof Portfolio Live"
    return False, f"Status: {status}"

def main():
    print("\n" + "="*70)
    print("🚀 STARTING SIGNAL FULL STACK REAL-TIME CLI TEST SUITE")
    print(f"Backend Target:  {LIVE_BACKEND_URL}")
    print(f"Frontend Target: {LIVE_FRONTEND_URL}")
    print("="*70)
    
    test_step(1, "Google Cloud Health & Credentials", test_1_backend_health)
    test_step(2, "Vertex AI Search Grounding", test_2_vertex_search_grounding)
    test_step(3, "Google Cloud Text-to-Speech (Neural2)", test_3_cloud_text_to_speech)
    test_step(4, "Google BigQuery Real-Time Market Radar", test_4_bigquery_market_radar)
    test_step(5, "Agent 1: Email & Ingestion Agent", test_5_email_ingestion_agent)
    test_step(6, "Agent 2: MINSKY Code Forensics Agent", test_6_minsky_code_forensics)
    test_step(7, "Agent 3: Career Optimization & Gap Analysis Agent", test_7_career_optimization_gap_analysis)
    test_step(8, "Agent 4: Tracking Agent & Live Kanban Sync", test_8_tracking_kanban_state)
    test_step(9, "Agent 5: AI Drafting Agent (Outreach & Letters)", test_9_ai_drafting_agent)
    test_step(10, "Full Pipeline Orchestrator (Multi-Agent Mesh)", test_10_full_pipeline_orchestrator)
    test_step(11, "Frontend: Landing Page (/) ", test_11_frontend_landing_page)
    test_step(12, "Frontend: Dashboard (/dashboard)", test_12_frontend_dashboard)
    test_step(13, "Frontend: Google Cloud Native Hub (/dashboard/integrations)", test_13_frontend_google_cloud_hub)
    test_step(14, "Frontend: Live Application Tracker (/dashboard/tracker)", test_14_frontend_tracker)
    test_step(15, "Frontend: Certificates & Anti-Cheat (/dashboard/certificates)", test_15_frontend_certificates)
    test_step(16, "Frontend: Opportunity Matcher (/dashboard/internships)", test_16_frontend_internships)
    test_step(17, "Frontend: Public Passport Verification (/verify/passport/[id])", test_17_frontend_passport_verification)
    test_step(18, "Frontend: Public Candidate Portfolio (/p/[username])", test_18_frontend_public_profile)

    print("\n" + "="*70)
    print("                      FINAL TEST MATRIX SUMMARY                     ")
    print("="*70)
    all_passed = True
    for step_num, title, success, msg in results:
        status_label = PASSED if success else FAILED
        if not success:
            all_passed = False
        print(f"Step {step_num:02d} [{status_label}]: {title}")
    
    print("="*70)
    if all_passed:
        print("🎉 ALL 18/18 REAL-TIME TESTS PASSED WITH 100% SUCCESS!")
    else:
        print("⚠️ SOME TESTS ENCOUNTERED ISSUES. SEE LOGS ABOVE.")
    print("="*70 + "\n")

if __name__ == "__main__":
    main()
