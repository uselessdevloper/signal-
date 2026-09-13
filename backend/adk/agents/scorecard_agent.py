"""
Agent 3: GreenhouseScorecardAgent — Candidate rubric scoring & ATS alignment matching enterprise standards.
"""

import time
from typing import Dict, Any, Optional

from adk.base import BaseAgent, AgentContext, AgentResult, IMemoryStore
from adk.scorecard import GreenhouseScorecardEngine


class GreenhouseScorecardAgent(BaseAgent):
    """Evaluates candidate against target job requirements using standardized Greenhouse ATS rubrics."""

    def __init__(self, memory_store: Optional[IMemoryStore] = None):
        super().__init__(name="GreenhouseScorecardAgent", memory_store=memory_store)
        self.engine = GreenhouseScorecardEngine()

    def process(self, context: AgentContext) -> AgentResult:
        t0 = time.time()
        job_desc = context.job_description or f"Senior Software Engineer specializing in scalable cloud systems, real-time databases, and TypeScript/Python backends at {context.company}."
        skills = [s.get("name") if isinstance(s, dict) else s for s in context.candidate_profile.get("skills", ["TypeScript", "Python", "React", "Cloud Architecture"])]

        lessons = self.get_lessons_for_prompt(f"{context.company} {context.role} GREENHOUSE_RUBRIC")

        scorecard = self.engine.generate_scorecard(
            candidate_data={
                "name": context.candidate_profile.get("name", "Candidate"),
                "company": context.company,
                "role": context.role,
                "skills": skills,
            },
            job_desc=job_desc,
            verified_skills=skills,
            physics_proof_score=95,
        )

        latency = round((time.time() - t0) * 1000, 2)
        if self.memory:
            self.memory.save_analysis(f"scorecard_{context.application_id}", {
                "agent_name": self.name,
                "scorecard": scorecard,
            })

        return AgentResult(
            agent_name=self.name,
            success=True,
            data={"scorecard": scorecard, "career_optimization": scorecard},
            latency_ms=latency,
            lessons_used=lessons,
        )
