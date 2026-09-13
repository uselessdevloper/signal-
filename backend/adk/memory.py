"""
ADKMemoryManager — Persistent SQLite & Cloud Firestore Dual-Layer Memory.
Provides episodic recall, user feedback tracking, and reflective lesson retrieval.
"""

import json
import sqlite3
import threading
import uuid
from pathlib import Path
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional

from adk.base import IMemoryStore, AgentFeedback, AgentLesson


class ADKMemoryManager(IMemoryStore):
    """Thread-safe persistent memory manager implementing the learning loop."""

    def __init__(self, db_path: Optional[str] = None):
        if db_path is None:
            db_path = str(Path(__file__).parent.parent / "signal_memory.db")
        self.db_path = db_path
        self._lock = threading.Lock()
        self._init_sqlite()

    def _get_conn(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path, timeout=30.0, check_same_thread=False)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA journal_mode=WAL;")
        return conn

    def _init_sqlite(self):
        with self._lock:
            conn = self._get_conn()
            conn.executescript("""
                CREATE TABLE IF NOT EXISTS analyses (
                    id          TEXT PRIMARY KEY,
                    agent_name  TEXT NOT NULL,
                    payload_json TEXT NOT NULL,
                    created_at  TEXT NOT NULL
                );

                CREATE TABLE IF NOT EXISTS feedback (
                    id              TEXT PRIMARY KEY,
                    agent_name      TEXT NOT NULL,
                    application_id  TEXT,
                    feedback_type   TEXT NOT NULL,
                    user_correction TEXT NOT NULL,
                    desired_behavior TEXT,
                    created_at      TEXT NOT NULL
                );

                CREATE TABLE IF NOT EXISTS lessons (
                    id              TEXT PRIMARY KEY,
                    agent_name      TEXT NOT NULL,
                    trigger_pattern TEXT NOT NULL,
                    lesson_text     TEXT NOT NULL,
                    weight          REAL NOT NULL DEFAULT 1.0,
                    created_at      TEXT NOT NULL
                );
            """)
            conn.commit()

            # Seed initial high-impact foundational lessons if empty
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM lessons")
            if cursor.fetchone()[0] == 0:
                initial_lessons = [
                    (
                        "lsn-init-01",
                        "AIDraftingAgent",
                        "SENIOR_DISTRIBUTED_SYSTEMS",
                        "When applying for Senior/Staff roles, do NOT focus on simple REST endpoints. Highlight distributed consensus, idempotent message ingestion, and latency SLA metrics.",
                        1.5,
                        datetime.now(timezone.utc).isoformat(),
                    ),
                    (
                        "lsn-init-02",
                        "CareerOptimizerAgent",
                        "GREENHOUSE_ATS_FORMATTING",
                        "Always align verified skill bullets with exact Greenhouse rubric terminology (e.g. 'System Design & Scalability', 'Code Review Hygiene').",
                        1.2,
                        datetime.now(timezone.utc).isoformat(),
                    ),
                    (
                        "lsn-init-03",
                        "MinskyForensicsAgent",
                        "STUDENT_PORTFOLIO_AUDIT",
                        "Ensure Ed25519/GPG commit signatures are cross-referenced with contributor email to eliminate impersonation false positives.",
                        1.0,
                        datetime.now(timezone.utc).isoformat(),
                    ),
                ]
                cursor.executemany(
                    "INSERT INTO lessons (id, agent_name, trigger_pattern, lesson_text, weight, created_at) VALUES (?, ?, ?, ?, ?, ?)",
                    initial_lessons,
                )
                conn.commit()
            conn.close()

    def save_analysis(self, analysis_id: str, data: Dict[str, Any]) -> None:
        agent_name = data.get("agent_name", "UnknownAgent")
        with self._lock:
            conn = self._get_conn()
            conn.execute(
                "INSERT OR REPLACE INTO analyses (id, agent_name, payload_json, created_at) VALUES (?, ?, ?, ?)",
                (analysis_id, agent_name, json.dumps(data), datetime.now(timezone.utc).isoformat()),
            )
            conn.commit()
            conn.close()

    def record_feedback(self, feedback: AgentFeedback) -> str:
        feedback_id = f"fb-{uuid.uuid4().hex[:8]}"
        with self._lock:
            conn = self._get_conn()
            conn.execute(
                "INSERT INTO feedback (id, agent_name, application_id, feedback_type, user_correction, desired_behavior, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
                (
                    feedback_id,
                    feedback.agent_name,
                    feedback.application_id,
                    feedback.feedback_type,
                    feedback.user_correction,
                    feedback.desired_behavior,
                    datetime.now(timezone.utc).isoformat(),
                ),
            )
            conn.commit()
            conn.close()

        # Mirror to Cloud Firestore if configured
        try:
            from gcp_service import get_firestore_client
            db = get_firestore_client()
            db.collection("agent_feedback").document(feedback_id).set({
                "id": feedback_id,
                "agent_name": feedback.agent_name,
                "application_id": feedback.application_id,
                "feedback_type": feedback.feedback_type,
                "user_correction": feedback.user_correction,
                "created_at": datetime.now(timezone.utc).isoformat(),
            })
        except Exception as e:
            print(f"[ADK Memory] Firestore feedback mirror note: {e}")

        return feedback_id

    def save_lesson(self, lesson: AgentLesson) -> None:
        with self._lock:
            conn = self._get_conn()
            conn.execute(
                "INSERT OR REPLACE INTO lessons (id, agent_name, trigger_pattern, lesson_text, weight, created_at) VALUES (?, ?, ?, ?, ?, ?)",
                (
                    lesson.id,
                    lesson.agent_name,
                    lesson.trigger_pattern,
                    lesson.lesson_text,
                    lesson.weight,
                    lesson.created_at,
                ),
            )
            conn.commit()
            conn.close()

        # Mirror to Cloud Firestore
        try:
            from gcp_service import get_firestore_client
            db = get_firestore_client()
            db.collection("agent_lessons").document(lesson.id).set({
                "id": lesson.id,
                "agent_name": lesson.agent_name,
                "trigger_pattern": lesson.trigger_pattern,
                "lesson_text": lesson.lesson_text,
                "weight": lesson.weight,
                "created_at": lesson.created_at,
            })
        except Exception as e:
            print(f"[ADK Memory] Firestore lesson mirror note: {e}")

    def retrieve_relevant_lessons(self, agent_name: str, context_query: str) -> List[AgentLesson]:
        """Fetch lessons relevant to this agent and context to avoid repeating past mistakes."""
        with self._lock:
            conn = self._get_conn()
            cursor = conn.cursor()
            cursor.execute(
                "SELECT id, agent_name, trigger_pattern, lesson_text, weight, created_at FROM lessons WHERE agent_name = ? OR agent_name = 'GLOBAL' ORDER BY weight DESC LIMIT 5",
                (agent_name,),
            )
            rows = cursor.fetchall()
            conn.close()

        lessons = []
        for r in rows:
            lessons.append(AgentLesson(
                id=r["id"],
                agent_name=r["agent_name"],
                trigger_pattern=r["trigger_pattern"],
                lesson_text=r["lesson_text"],
                weight=r["weight"],
                created_at=r["created_at"],
            ))
        return lessons

    def get_active_lessons(self, agent_name: Optional[str] = None) -> List[AgentLesson]:
        with self._lock:
            conn = self._get_conn()
            cursor = conn.cursor()
            if agent_name:
                cursor.execute(
                    "SELECT id, agent_name, trigger_pattern, lesson_text, weight, created_at FROM lessons WHERE agent_name = ? OR agent_name = 'GLOBAL' ORDER BY weight DESC",
                    (agent_name,),
                )
            else:
                cursor.execute(
                    "SELECT id, agent_name, trigger_pattern, lesson_text, weight, created_at FROM lessons ORDER BY weight DESC"
                )
            rows = cursor.fetchall()
            conn.close()

        return [
            AgentLesson(
                id=r["id"],
                agent_name=r["agent_name"],
                trigger_pattern=r["trigger_pattern"],
                lesson_text=r["lesson_text"],
                weight=r["weight"],
                created_at=r["created_at"],
            )
            for r in rows
        ]

    def list_all_lessons(self) -> List[Dict[str, Any]]:
        lessons = self.get_active_lessons()
        return [l.model_dump() for l in lessons]


# Singleton instance for the application
global_memory_manager = ADKMemoryManager()
