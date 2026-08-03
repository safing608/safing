from pydantic import BaseModel, Field


class AgentRunRequest(BaseModel):
    task: str = Field(..., min_length=1, examples=["시장 조사 보고서를 작성해줘"])
    context: dict[str, str] = Field(default_factory=dict)


class AgentStepResult(BaseModel):
    agent: str
    output: str


class AgentRunResponse(BaseModel):
    task: str
    final_answer: str
    steps: list[AgentStepResult]

