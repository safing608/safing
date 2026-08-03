from pydantic import BaseModel, ConfigDict, Field


class SafetyResponseResult(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    safety_steps: list[str] = Field(min_length=1, max_length=6, alias="safetySteps")
    answer: str = Field(min_length=1)
