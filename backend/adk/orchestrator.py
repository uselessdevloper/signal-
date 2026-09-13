import time
from typing import Dict, Any, Optional
from adk.base import AgentContext, AgentFeedback, AgentLesson
from adk.memory import global_memory_manager
from adk.agents.ingestion import ATSNormalizerAgent
from adk.agents.minsky import MinskyForensicsAgent
from adk.agents.scorecard_agent import GreenhouseScorecardAgent
from adk.agents.tracker import LifecycleTrackerAgent
from adk.agents.drafting import AdaptiveDraftingAgent
from adk.agents.nudge import ScheduledNudgeAgent
from adk.agents.reflection import ReflectionLearningAgent


class SignalADKOrchestrator:
    """Master multi-agent coordinator with episodic memory and continuous self-correction."""

    def __init__(self, memory_manager=None):
        self.memory = memory_manager or global_memory_manager
        self.ingestion_agent = ATSNormalizerAgent(self.memory)
        self.minsky_agent = MinskyForensicsAgent(self.memory)
        self.scorecard_agent = GreenhouseScorecardAgent(self.memory)
        self.tracker_agent = LifecycleTrackerAgent(self.memory)
        self.drafting_agent = AdaptiveDraftingAgent(self.memory)
        self.nudge_agent = ScheduledNudgeAgent(self.memory)
        self.reflection_agent = ReflectionLearningAgent(self.memory)

    def run_pipeline(self, context_dict: Dict[str, Any]) -> Dict[str, Any]:
        """Execute the multi-agent workflow in sequence, enriching context and applying learned lessons."""
        context = AgentContext(
            application_id=context_dict.get("application_id", f"app_{int(time.time() * 1000)}"),
            company=context_dict.get("company", "Google Cloud"),
            role=context_dict.get("job_title", context_dict.get("role", "Software Engineer")),
            job_description=context_dict.get("job_description"),
            candidate_profile=context_dict.get("candidate_profile", {"skills": ["TypeScript", "Python", "React", "Cloud Architecture"]}),
            inbound_email=context_dict.get("inbound_email"),
            github_token=context_dict.get("github_token"),
            github_username=context_dict.get("github_username"),
            metadata=context_dict.get("metadata", {}),
        )

        # 1. Ingestion Agent
        ingestion_res = self.ingestion_agent.process(context)
        context.inbound_email = ingestion_res.data.get("parsed")
        stage = ingestion_res.data.get("parsed", {}).get("stage", "Interview")
        context.metadata["stage"] = stage

        # 2. MINSKY Forensics Agent
        minsky_res = self.minsky_agent.process(context)

        # 3. Greenhouse Scorecard Agent
        scorecard_res = self.scorecard_agent.process(context)

        # 4. Lifecycle Tracker Agent (Firestore Sync)
        tracker_res = self.tracker_agent.process(context)

        # 5. Adaptive Drafting Agent (with Mistake Learning Injection)
        drafting_res = self.drafting_agent.process(context)

        # 6. Scheduled Nudge Agent (Cloud Tasks)
        nudge_res = self.nudge_agent.process(context)

        # 7. Reflection Agent
        reflection_res = self.reflection_agent.process(context)

        return {
            "success": True,
            "pipeline": "Signal Enterprise 7-Agent ADK Workflow",
            "application_id": context.application_id,
            "results": {
                "ingestion": ingestion_res.data,
                "minsky_forensics": minsky_res.data.get("minsky_forensics"),
                "scorecard": scorecard_res.data.get("scorecard"),
                "career_optimization": scorecard_res.data.get("career_optimization"),
                "kanban_state": tracker_res.data.get("kanban_state"),
                "drafted_outreach": drafting_res.data.get("drafted_outreach"),
                "scheduled_nudges": nudge_res.data.get("scheduled_nudges"),
                "reflection_state": reflection_res.data,
            },
            "lessons_applied": drafting_res.lessons_used,
        }

    def submit_feedback_and_learn(
        self,
        agent_name: str,
        user_correction: str,
        feedback_type: str = "USER_CORRECTION",
        application_id: Optional[str] = None,
        desired_behavior: Optional[str] = None,
    ) -> Dict[str, Any]:
        """User or recruiter submits feedback on an output; Reflection Agent distills it into a persistent lesson."""
        feedback = AgentFeedback(
            agent_name=agent_name,
            application_id=application_id,
            feedback_type=feedback_type,
            user_correction=user_correction,
            desired_behavior=desired_behavior,
        )
        lesson = self.reflection_agent.learn_from_feedback(feedback)
        return {
            "success": True,
            "message": "Feedback recorded and distilled into a reusable learning lesson.",
            "lesson": lesson.model_dump(),
        }


import time
# Global singleton orchestrator
global_orchestrator = SignalADKOrchestrator()
