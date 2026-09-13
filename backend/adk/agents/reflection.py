"""
Agent 7: ReflectionLearningAgent — Self-reflection, mistake distillation & continuous learning engine.
"""

import time
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field

from adk.base import BaseAgent, AgentContext, AgentResult, AgentFeedback, AgentLesson, IMemoryStore
from graph import get_gemini_llm


class LessonExtractionSchema(BaseModel):
    trigger_pattern: str = Field(description="Context or skill keyword when this lesson applies (e.g. SENIOR_CLOUD_SYSTEMS, RECRUITER_OUTREACH)")
    lesson_text: str = Field(description="Actionable, distilled rule explaining what to avoid and what to do instead")
    weight: float = Field(description="Priority weight from 1.0 to 2.0 based on importance")


class ReflectionLearningAgent(BaseAgent):
    """Reflects on user corrections, interview failures, and recruiter critiques to extract reusable learning lessons."""

    def __init__(self, memory_store: Optional[IMemoryStore] = None):
        super().__init__(name="ReflectionLearningAgent", memory_store=memory_store)

    def process(self, context: AgentContext) -> AgentResult:
        # In standard pipeline, review applied lessons
        return AgentResult(
            agent_name=self.name,
            success=True,
            data={"status": "ACTIVE_LEARNING_LISTENER", "active_lessons_count": len(self.memory.list_all_lessons()) if self.memory else 0},
        )

    def learn_from_feedback(self, feedback: AgentFeedback) -> AgentLesson:
        """Core self-reflection loop: turn user correction or rejection feedback into a reusable lesson."""
        if self.memory:
            self.memory.record_feedback(feedback)

        llm = get_gemini_llm("gemini-3.6-flash")
        extracted_lesson = None

        if llm:
            try:
                prompt = f"""You are the Signal Reflection & Learning Agent.
A mistake or correction occurred in the job tracking / career multi-agent pipeline.
Analyze this feedback and distill a single, reusable, high-impact rule so future agents do NOT repeat this mistake.

Agent Involved: {feedback.agent_name}
Feedback Type: {feedback.feedback_type}
User Correction / Rejection Critique:
"{feedback.user_correction}"

Desired Behavior:
"{feedback.desired_behavior or 'Produce more accurate, non-generic, high-conviction output.'}"

Output a crisp, actionable rule with an appropriate trigger pattern and priority weight."""
                structured_llm = llm.with_structured_output(LessonExtractionSchema)
                res = structured_llm.invoke(prompt)
                if hasattr(res, "model_dump"):
                    extracted_lesson = res.model_dump()
            except Exception as e:
                print(f"[ReflectionLearningAgent] Lesson extraction LLM note: {e}")

        if not extracted_lesson:
            extracted_lesson = {
                "trigger_pattern": f"{feedback.agent_name.upper()}_CORRECTION",
                "lesson_text": f"When executing {feedback.agent_name}, adhere to user correction: {feedback.user_correction}",
                "weight": 1.2,
            }

        lesson_id = f"lsn-{uuid.uuid4().hex[:8]}"
        lesson = AgentLesson(
            id=lesson_id,
            agent_name=feedback.agent_name,
            trigger_pattern=extracted_lesson.get("trigger_pattern", "GENERAL"),
            lesson_text=extracted_lesson.get("lesson_text", feedback.user_correction),
            weight=float(extracted_lesson.get("weight", 1.0)),
            created_at=datetime.now(timezone.utc).isoformat(),
        )

        if self.memory:
            self.memory.save_lesson(lesson)

        return lesson
