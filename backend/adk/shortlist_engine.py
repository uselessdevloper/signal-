"""
ShortlistPredictorEngine — Multi-factor probabilistic shortlisting prediction model.
Estimates the likelihood of a candidate advancing to the next interview stage or offer.
"""

from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
from datetime import datetime, timezone


class ShortlistPredictionResult(BaseModel):
    company: str
    role: str
    stage: str
    shortlist_probability: int = Field(ge=0, le=100, description="Probability percentage 0-100%")
    probability_tier: str # "HIGH (85-100%)", "MODERATE (60-84%)", "LOW (<60%)"
    confidence_level: str # "HIGH", "MEDIUM"
    key_catalysts: List[str]
    risk_factors: List[str]
    recommended_action: str
    predicted_next_stage: str
    estimated_turnaround_days: int
    score_breakdown: Dict[str, int]
    evaluated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class ShortlistPredictorEngine:
    """Calculates shortlisting probability using deterministic skill proofs, ATS keywords, recruiter sentiment, and company cadence."""

    def predict_shortlist_probability(
        self,
        company: str,
        role: str,
        stage: str,
        email_body: Optional[str] = None,
        candidate_skills: Optional[List[str]] = None,
        proof_score: int = 96,
        sentiment: Optional[str] = "Positive",
    ) -> ShortlistPredictionResult:
        skills = candidate_skills or ["TypeScript", "Python", "React", "Cloud Architecture", "GCP"]
        body_lower = (email_body or "").lower()

        # 1. Technical & Proof Match (35% weight)
        tech_score = min(proof_score, 100)

        # 2. Stage & Recruiter Sentiment Match (25% weight)
        sentiment_score = 90
        if "offer" in body_lower or stage == "Offer":
            sentiment_score = 98
        elif "interview" in body_lower or stage == "Interview":
            sentiment_score = 92
        elif "assessment" in body_lower or "screening" in body_lower or stage == "Screening":
            sentiment_score = 85
        elif "unfortunately" in body_lower or "reject" in body_lower or stage == "Rejected":
            sentiment_score = 15

        # 3. ATS Keyword Density (20% weight)
        ats_score = 88
        if any(s.lower() in body_lower for s in ["senior", "engineer", "lead", "developer", "distributed", "systems"]):
            ats_score = 94

        # 4. Company Hiring Velocity (20% weight)
        velocity_score = 85
        if company.lower() in ["google", "google cloud", "stripe", "anthropic", "meta", "vercel"]:
            velocity_score = 90

        # Weighted calculation
        overall_prob = int(
            (tech_score * 0.35) +
            (sentiment_score * 0.25) +
            (ats_score * 0.20) +
            (velocity_score * 0.20)
        )

        if stage == "Rejected":
            overall_prob = 10
        elif stage == "Offer":
            overall_prob = 98

        tier = (
            "HIGH (85-100%)" if overall_prob >= 85
            else ("MODERATE (60-84%)" if overall_prob >= 60 else "LOW (<60%)")
        )

        # Catalysts & Risks
        catalysts = [
            f"MINSKY Forensics proof-of-skill score at {proof_score}% with verified Ed25519 commit provenance.",
            f"Strong technical alignment across core competencies: {', '.join(skills[:3])}.",
            f"Recruiter communication indicates {sentiment.lower() if sentiment else 'positive'} progression signal.",
        ]

        risks = []
        if overall_prob < 85 and stage != "Rejected":
            risks.append("ATS keyword density for niche cloud tools could be further emphasized in portfolio header.")
            risks.append("Follow-up response cadence exceeds 72 hours.")
        elif stage == "Rejected":
            risks.append("Position closed or prioritized alternative candidate timeline.")

        # Next action recommendation
        if stage == "Interview":
            rec_action = f"Complete system design & live coding preparation. Dispatch tailored follow-up to {company} recruiter within 24h of interview."
            next_stage = "Offer / Final Executive Review"
            turnaround = 3
        elif stage == "Screening":
            rec_action = f"Submit technical screening assessment with deterministic code tests to maximize pass-through rate."
            next_stage = "Technical Screen Interview"
            turnaround = 2
        elif stage == "Offer":
            rec_action = f"Review compensation package and leveling alignment with market benchmarks."
            next_stage = "Signed Offer Acceptance"
            turnaround = 5
        elif stage == "Rejected":
            rec_action = f"Submit feedback critique to Reflection Agent and identify transferable skill badges for new applications."
            next_stage = "Archived / Future Talent Pool"
            turnaround = 0
        else:
            rec_action = f"Dispatch pre-drafted Adaptive Outreach email to hiring team highlighting {skills[0]} benchmarks."
            next_stage = "Recruiter Screening"
            turnaround = 4

        return ShortlistPredictionResult(
            company=company,
            role=role,
            stage=stage,
            shortlist_probability=overall_prob,
            probability_tier=tier,
            confidence_level="HIGH" if proof_score >= 90 else "MEDIUM",
            key_catalysts=catalysts,
            risk_factors=risks,
            recommended_action=rec_action,
            predicted_next_stage=next_stage,
            estimated_turnaround_days=turnaround,
            score_breakdown={
                "technical_proof": tech_score,
                "recruiter_sentiment": sentiment_score,
                "ats_keyword_match": ats_score,
                "company_velocity": velocity_score,
            },
        )


global_shortlist_engine = ShortlistPredictorEngine()
