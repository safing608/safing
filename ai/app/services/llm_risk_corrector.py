import json
from typing import Any

import httpx
from pydantic import BaseModel, Field, ValidationError

from app.config.settings import settings
from app.schemas.risk import ParentRiskCandidate, RiskCandidate


class LlmRiskCorrection(BaseModel):
    risk_code: str = Field(..., alias="riskCode")
    confidence: float = Field(ge=0.0, le=1.0)
    reason: str | None = None


class LlmParentRiskCorrection(BaseModel):
    parent_risk_code: str = Field(..., alias="parentRiskCode")
    confidence: float = Field(ge=0.0, le=1.0)
    reason: str | None = None


class LlmRiskCorrector:
    def __init__(
        self,
        api_key: str | None = None,
        model: str | None = None,
        base_url: str | None = None,
        timeout_seconds: float | None = None,
    ) -> None:
        self.api_key = api_key if api_key is not None else settings.open_api_key
        self.model = model or settings.openai_risk_model
        self.base_url = (base_url or settings.openai_api_base_url).rstrip("/")
        self.timeout_seconds = timeout_seconds or settings.openai_timeout_seconds

    def correct(
        self,
        text: str,
        candidates: list[RiskCandidate],
    ) -> LlmRiskCorrection | None:
        if not self.api_key or not candidates:
            return None

        try:
            response = self._request(text, candidates)
            correction = LlmRiskCorrection.model_validate_json(response)
        except (httpx.HTTPError, json.JSONDecodeError, ValidationError, ValueError):
            return None

        valid_codes = {candidate.risk_code for candidate in candidates} | {"Z"}
        if correction.risk_code not in valid_codes:
            return None

        return correction

    def correct_parent(
        self,
        text: str,
        candidates: list[ParentRiskCandidate],
    ) -> LlmParentRiskCorrection | None:
        if not self.api_key or not candidates:
            return None

        try:
            response = self._request_parent(text, candidates)
            correction = LlmParentRiskCorrection.model_validate_json(response)
        except (httpx.HTTPError, json.JSONDecodeError, ValidationError, ValueError):
            return None

        valid_codes = {candidate.parent_risk_code for candidate in candidates} | {"Z"}
        if correction.parent_risk_code not in valid_codes:
            return None

        return correction

    def _request(self, text: str, candidates: list[RiskCandidate]) -> str:
        payload = {
            "model": self.model,
            "input": [
                {
                    "role": "system",
                    "content": (
                        "You classify industrial accident risk codes for SAFING. "
                        "Choose exactly one riskCode from the provided candidate list. "
                        "Use Z only when none of the candidates fit the text. "
                        "Do not invent a code."
                    ),
                },
                {
                    "role": "user",
                    "content": json.dumps(
                        {
                            "text": text[:4000],
                            "candidates": [
                                {
                                    "riskCode": candidate.risk_code,
                                    "riskType": candidate.risk_type,
                                    "parentRiskCode": candidate.parent_risk_code,
                                    "parentRiskType": candidate.parent_risk_type,
                                    "score": candidate.score,
                                }
                                for candidate in candidates
                            ],
                        },
                        ensure_ascii=False,
                    ),
                },
            ],
            "text": {
                "format": {
                    "type": "json_schema",
                    "name": "risk_code_selection",
                    "strict": True,
                    "schema": {
                        "type": "object",
                        "additionalProperties": False,
                        "properties": {
                            "riskCode": {"type": "string"},
                            "confidence": {
                                "type": "number",
                                "minimum": 0,
                                "maximum": 1,
                            },
                            "reason": {"type": ["string", "null"]},
                        },
                        "required": ["riskCode", "confidence", "reason"],
                    },
                }
            },
            "max_output_tokens": 200,
        }
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        with httpx.Client(timeout=self.timeout_seconds) as client:
            response = client.post(
                f"{self.base_url}/responses",
                headers=headers,
                json=payload,
            )
            response.raise_for_status()

        return self._extract_output_text(response.json())

    def _request_parent(self, text: str, candidates: list[ParentRiskCandidate]) -> str:
        payload = {
            "model": self.model,
            "input": [
                {
                    "role": "system",
                    "content": (
                        "You classify industrial accident parent risk codes for SAFING. "
                        "Choose exactly one parentRiskCode from the provided parent risk list. "
                        "Use Z only when none of the parent risks fit the text. "
                        "Do not invent a code."
                    ),
                },
                {
                    "role": "user",
                    "content": json.dumps(
                        {
                            "text": text[:4000],
                            "parentCandidates": [
                                {
                                    "parentRiskCode": candidate.parent_risk_code,
                                    "parentRiskType": candidate.parent_risk_type,
                                }
                                for candidate in candidates
                            ],
                        },
                        ensure_ascii=False,
                    ),
                },
            ],
            "text": {
                "format": {
                    "type": "json_schema",
                    "name": "parent_risk_code_selection",
                    "strict": True,
                    "schema": {
                        "type": "object",
                        "additionalProperties": False,
                        "properties": {
                            "parentRiskCode": {"type": "string"},
                            "confidence": {
                                "type": "number",
                                "minimum": 0,
                                "maximum": 1,
                            },
                            "reason": {"type": ["string", "null"]},
                        },
                        "required": ["parentRiskCode", "confidence", "reason"],
                    },
                }
            },
            "max_output_tokens": 200,
        }
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        with httpx.Client(timeout=self.timeout_seconds) as client:
            response = client.post(
                f"{self.base_url}/responses",
                headers=headers,
                json=payload,
            )
            response.raise_for_status()

        return self._extract_output_text(response.json())

    def _extract_output_text(self, data: dict[str, Any]) -> str:
        output_text = data.get("output_text")
        if isinstance(output_text, str) and output_text.strip():
            return output_text

        for item in data.get("output", []):
            for content in item.get("content", []):
                text = content.get("text")
                if isinstance(text, str) and text.strip():
                    return text

        raise ValueError("OpenAI response did not contain output text.")
