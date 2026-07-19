import json
from typing import Literal

from pydantic import BaseModel, Field

from app.schemas.chat import RetrievedSource


SseEventName = Literal[
    "risk_classification",
    "safety_step",
    "final_answer",
    "done",
    "error",
]


class RiskClassificationEvent(BaseModel):
    risk_code: str = Field(..., alias="riskCode")


class SafetyStepEvent(BaseModel):
    index: int
    text: str


class FinalAnswerEvent(BaseModel):
    title: str
    answer: str
    sources: list[RetrievedSource] = Field(default_factory=list)


class DoneEvent(BaseModel):
    status: str = "completed"


class ErrorEvent(BaseModel):
    code: str
    message: str


def format_sse(event: SseEventName, data: BaseModel | dict[str, object]) -> str:
    if isinstance(data, BaseModel):
        payload = data.model_dump(by_alias=True)
    else:
        payload = data

    json_payload = json.dumps(payload, ensure_ascii=False, separators=(",", ":"))
    return f"event: {event}\ndata: {json_payload}\n\n"
