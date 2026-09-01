import os
import sys
from pathlib import Path
from typing import Optional, List, Dict, Any
from dotenv import load_dotenv

load_dotenv()

gitproof_dir = str(Path(__file__).parent / "gitproof")
verifier_dir = str(Path(__file__).parent / "credential_verifier-main")

for p in [gitproof_dir, verifier_dir]:
    if p not in sys.path:
        sys.path.insert(0, p)

from fastapi import FastAPI, HTTPException, Request, Body
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from pydantic import BaseModel, Field
from graph import signal_graph
from gitproof.app import app as gitproof_app
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
    title="Signal — AI Job Application Tracker API",
    description=(
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
        "service": "Signal — AI Job Application Tracker",
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


@app.post("/api/pipeline/run")
def run_full_pipeline(req: PipelineRunRequest):
    """Run all 6 agents in sequence via the LangGraph state machine."""
    try:
        initial_state = {
            "inbound_email": req.inbound_email,
            "application_id": f"app_{int(os.times().system * 1000)}",
            "company": req.company,
            "job_title": req.job_title,
            "job_description": req.job_description,
            "candidate_profile": req.candidate_profile or {"skills": ["TypeScript", "React", "Python", "FastAPI", "Docker"]},
            "github_token": req.github_token,
            "github_username": req.github_username,
            "ingestion_result": None,
            "minsky_forensics": None,
            "career_optimization": None,
            "kanban_state": None,
            "drafted_outreach": None,
            "scheduled_nudges": None,
            "errors": [],
        }

        final_state = signal_graph.invoke(initial_state)

        return {
            "success": True,
            "pipeline": "Signal 6-Agent Career Workflow",
            "results": {
                "ingestion": final_state.get("ingestion_result"),
                "minsky_forensics": final_state.get("minsky_forensics"),
                "career_optimization": final_state.get("career_optimization"),
                "kanban_state": final_state.get("kanban_state"),
                "drafted_outreach": final_state.get("drafted_outreach"),
                "scheduled_nudges": final_state.get("scheduled_nudges"),
            }
        }
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
