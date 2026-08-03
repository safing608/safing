from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.schemas.risk import RiskClassification


SUPPORTED_TARGET_LANGUAGES = {"ko", "en", "vi", "ne", "km"}


class ChatRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    message: str = Field(..., min_length=1)
    target_language: str = Field(..., alias="targetLanguage")
    session_id: int | None = Field(default=None, alias="sessionId")

    @field_validator("target_language")
    @classmethod
    def validate_target_language(cls, value: str) -> str:
        normalized = value.lower()
        if normalized not in SUPPORTED_TARGET_LANGUAGES:
            allowed = ", ".join(sorted(SUPPORTED_TARGET_LANGUAGES))
            raise ValueError(f"targetLanguage must be one of: {allowed}")
        return normalized


class RetrievedSource(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    source_id: int = Field(..., alias="sourceId")
    chunk_id: int | None = Field(default=None, alias="chunkId")
    document_name: str | None = Field(default=None, alias="documentName")


class RetrievedChunk(BaseModel):
    id: int
    content: str
    score: float
    source: RetrievedSource
    risk_codes: list[str] = Field(default_factory=list)
    parent_risk_codes: list[str] = Field(default_factory=list)
    risk_types: list[str] = Field(default_factory=list)
    parent_risk_types: list[str] = Field(default_factory=list)


class SafetyStep(BaseModel):
    index: int
    text: str


class SafetyChatState(BaseModel):
    message: str
    target_language: str
    session_id: int | None = None
    title: str | None = None
    source_language: str | None = None
    normalized_message: str | None = None
    risk_classification: RiskClassification | None = None
    retrieved_chunks: list[RetrievedChunk] = Field(default_factory=list)
    safety_steps: list[SafetyStep] = Field(default_factory=list)
    final_answer: str | None = None
    translated_answer: str | None = None
    sources: list[RetrievedSource] = Field(default_factory=list)
