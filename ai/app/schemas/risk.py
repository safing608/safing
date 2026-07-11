from pydantic import BaseModel


class AccidentTypeCode(BaseModel):
    code: str
    name_ko: str
    description: str | None = None
    parent_code: str | None = None


class RiskClassification(BaseModel):
    risk_code: str
    risk_type: str
    severity: str
    confidence: float
