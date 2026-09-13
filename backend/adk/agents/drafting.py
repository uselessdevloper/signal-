"""
Agent 5: AdaptiveDraftingAgent — Evidence-backed outreach generator with dynamic mistake learning injection.
"""

import time
from typing import Dict, Any, Optional, List
from pydantic import BaseModel, Field

from adk.base import BaseAgent, AgentContext, AgentResult, IMemoryStore
from graph import get_gemini_llm


class DraftingSchema(BaseModel):
    subject_line: str = Field(description="High open-rate recruiter email subject")
    cover_letter: str = Field(description="Evidence-backed personalized cover letter referencing verified skills")
    cold_email: str = Field(description="Concise 4-sentence recruiter outreach message")
    follow_up_message: str = Field(description="Polite interview follow-up template")


class AdaptiveDraftingAgent(BaseAgent):
    """Generates tailored recruiter outreach, dynamically incorporating learned lessons from past rejections & mistakes."""

    def __init__(self, memory_store: Optional[IMemoryStore] = None):
        super().__init__(name="AdaptiveDraftingAgent", memory_store=memory_store)

    def process(self, context: AgentContext) -> AgentResult:
        t0 = time.time()
        company = context.company or "Google Cloud"
        role = context.role or "Senior Software Engineer"
        skills = [s.get("name") if isinstance(s, dict) else s for s in context.candidate_profile.get("skills", ["TypeScript", "Python", "Cloud Architecture"])]
        badge_str = ", ".join(skills[:3]) if skills else "TypeScript, Python, FastAPI"

        # Fetch relevant past lessons learned from mistakes
        lessons = self.get_lessons_for_prompt(f"{company} {role} OUTREACH")
        lesson_block = "\n".join(lessons) if lessons else "No specific past mistakes recorded for this role."

        llm = get_gemini_llm("gemini-3.6-flash")
        draft_result = None

        if llm:
            try:
                prompt = f"""You are the Signal Adaptive Drafting Agent.
Write evidence-backed recruiter outreach for {company} regarding the {role} position.
Candidate's verified skills: {badge_str}.

CRITICAL LESSONS LEARNED FROM PAST MISTAKES & USER FEEDBACK (Do NOT repeat these mistakes):
{lesson_block}

Guidelines:
- Make it authentic, concise, highly specific, and anchored in verified engineering rigor.
- Emphasize architectural decisions, deterministic testing, and system reliability over generic buzzwords."""
                structured_llm = llm.with_structured_output(DraftingSchema)
                res = structured_llm.invoke(prompt)
                if hasattr(res, "model_dump"):
                    draft_result = res.model_dump()
            except Exception as e:
                print(f"[AdaptiveDraftingAgent] LLM fallback note: {e}")

        if not draft_result:
            draft_result = {
                "subject_line": f"Candidate Introduction: {role} @ {company} [Verified Skill Evidence Attached]",
                "cold_email": f"Hi {company} Hiring Team,\n\nI noticed your opening for {role} and wanted to reach out directly. Rather than relying on unverified resume claims, my engineering profile is backed by Signal's deterministic Git forensics—including verified contributions across {badge_str}.\n\nI would love to share my interactive Skill Passport and discuss how I can contribute immediately to {company}.\n\nBest regards,",
                "cover_letter": f"Dear Hiring Manager at {company},\n\nI am writing to express my strong enthusiasm for the {role} opportunity. Throughout my software engineering career, I prioritize architectural rigor, asynchronous system design, and measurable proof of skill.\n\nMy contributions are verified via Signal's MINSKY code forensics engine ({badge_str}), demonstrating consistent commit cadence, peer-reviewed pull requests, and cryptographic integrity. I am eager to apply this engineering rigor to {company}'s technical mission.\n\nThank you for your consideration.\n\nSincerely,\nCandidate",
                "follow_up_message": f"Hi {company} Team, Thank you so much for the conversation regarding the {role}. I have updated my Signal Skill Passport with my latest verified repository benchmarks for your team's review!",
            }

        latency = round((time.time() - t0) * 1000, 2)
        if self.memory:
            self.memory.save_analysis(f"draft_{context.application_id}", {
                "agent_name": self.name,
                "drafted_outreach": draft_result,
                "lessons_applied": lessons,
            })

        return AgentResult(
            agent_name=self.name,
            success=True,
            data={"drafted_outreach": draft_result},
            latency_ms=latency,
            lessons_used=lessons,
        )
