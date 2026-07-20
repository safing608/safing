from pydantic import BaseModel, Field


class AccidentTypeCode(BaseModel):
    code: str
    name_ko: str
    description: str | None = None
    parent_code: str | None = None


class RiskClassification(BaseModel):
    risk_code: str
    risk_type: str
    parent_risk_code: str
    parent_risk_type: str
    severity: str
    confidence: float
    method: str = "rule_based"
    reason: str | None = None


class RiskCandidate(BaseModel):
    risk_code: str
    risk_type: str
    parent_risk_code: str
    parent_risk_type: str
    score: int = Field(ge=0)
