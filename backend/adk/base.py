"""
Base abstractions and SOLID interfaces for Google ADK (Agent Development Kit).
Adheres to Interface Segregation, Dependency Inversion, and Open/Closed principles.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
from datetime import datetime, timezone


class AgentContext(BaseModel):
    """Execution context passed through the multi-agent graph."""
    application_id: str
    company: str
    role: str
    job_description: Optional[str] = None
    candidate_profile: Dict[str, Any] = Field(default_factory=dict)
    inbound_email: Optional[Dict[str, Any]] = None
    github_token: Optional[str] = None
    github_username: Optional[str] = None
    applied_lessons: List[Dict[str, Any]] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)


class AgentResult(BaseModel):
    """Typed output payload returned by an agent."""
    agent_name: str
    success: bool
    data: Dict[str, Any]
    latency_ms: float = 0.0
    lessons_used: List[str] = Field(default_factory=list)
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class AgentFeedback(BaseModel):
    """User correction or interview outcome feedback for learning."""
    agent_name: str
    application_id: Optional[str] = None
    feedback_type: str # e.g. "TOO_GENERIC", "WRONG_SKILL_EMPHASIS", "REJECTION_RECEIVED", "POSITIVE_OFFER"
    user_correction: str
    desired_behavior: Optional[str] = None
    context_tags: List[str] = Field(default_factory=list)


class AgentLesson(BaseModel):
    """Distilled reusable learning extracted by the Reflection Agent."""
    id: str
    agent_name: str
    trigger_pattern: str
    lesson_text: str
    weight: float = 1.0
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class IMemoryStore(ABC):
    """Interface for persistent episodic & reflective memory."""

    @abstractmethod
    def save_analysis(self, analysis_id: str, data: Dict[str, Any]) -> None:
        pass

    @abstractmethod
    def record_feedback(self, feedback: AgentFeedback) -> str:
        pass

    @abstractmethod
    def save_lesson(self, lesson: AgentLesson) -> None:
        pass

    @abstractmethod
    def retrieve_relevant_lessons(self, agent_name: str, context_query: str) -> List[AgentLesson]:
        pass

    @abstractmethod
    def list_all_lessons(self) -> List[Dict[str, Any]]:
        pass


class IScorecardEngine(ABC):
    """Interface for Greenhouse-style rubric scorecard generation."""

    @abstractmethod
    def generate_scorecard(self, candidate_data: Dict[str, Any], job_desc: str) -> Dict[str, Any]:
        pass


class BaseAgent(ABC):
    """Abstract Base Class for all Signal ADK agents."""

    def __init__(self, name: str, memory_store: Optional[IMemoryStore] = None):
        self.name = name
        self.memory = memory_store

    @abstractmethod
    def process(self, context: AgentContext) -> AgentResult:
        """Core execution logic of the agent."""
        pass

    def get_lessons_for_prompt(self, context_query: str) -> List[str]:
        """Fetch past learned lessons to avoid repeating mistakes."""
        if not self.memory:
            return []
        lessons = self.memory.retrieve_relevant_lessons(self.name, context_query)
        return [f"- [{l.trigger_pattern}]: {l.lesson_text}" for l in lessons]
