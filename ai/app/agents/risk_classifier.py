import re
from dataclasses import dataclass

from app.rag.accident_code_loader import AccidentCodeLoader
from app.schemas.chat import SafetyChatState
from app.schemas.risk import AccidentTypeCode, RiskCandidate, RiskClassification
from app.services.llm_risk_corrector import LlmRiskCorrector


@dataclass(frozen=True)
class KeywordProfile:
    code: str
    keywords: tuple[str, ...]


class RiskClassificationAgent:
    name = "risk_classifier"

    def __init__(
        self,
        accident_code_loader: AccidentCodeLoader | None = None,
        llm_risk_corrector: LlmRiskCorrector | None = None,
    ) -> None:
        self.accident_code_loader = accident_code_loader or AccidentCodeLoader()
        self.code_map = self.accident_code_loader.get_code_map()
        self.keyword_profiles = self._build_keyword_profiles()
        self.llm_risk_corrector = llm_risk_corrector or LlmRiskCorrector()

    async def run(self, state: SafetyChatState) -> SafetyChatState:
        message = state.normalized_message or state.message
        state.risk_classification = self.classify(message)
        return state

    def classify(self, message: str, use_llm: bool = True) -> RiskClassification:
        candidates = self.find_candidates(message)

        if not candidates:
            return self._unclassified()

        rule_based_result = self._classification_from_code(
            candidates[0].risk_code,
            confidence=self._confidence(candidates[0].score),
            method="rule_based",
        )

        if not use_llm:
            return rule_based_result

        correction = self.llm_risk_corrector.correct(message, candidates)
        if correction is None:
            if self.llm_risk_corrector.api_key:
                return rule_based_result.model_copy(
                    update={
                        "method": "fallback",
                        "reason": "LLM correction failed; used the highest scoring rule-based candidate.",
                    }
                )
            return rule_based_result

        return self._classification_from_code(
            correction.risk_code,
            confidence=correction.confidence,
            method="llm_corrected",
            reason=correction.reason,
        )

    def find_candidates(self, message: str, top_k: int = 8) -> list[RiskCandidate]:
        normalized_message = self._normalize(message)
        candidate_scores = self._score_candidates(normalized_message)

        if not candidate_scores:
            return []

        ranked_scores = sorted(
            candidate_scores.items(),
            key=lambda item: item[1],
            reverse=True,
        )
        return [
            self._candidate_from_code(code, score)
            for code, score in ranked_scores[:top_k]
        ]

    def _score_candidates(self, normalized_message: str) -> dict[str, int]:
        scores: dict[str, int] = {}

        explicit_code = self._find_explicit_code(normalized_message)
        if explicit_code is not None:
            scores[explicit_code] = 10

        for profile in self.keyword_profiles:
            score = sum(4 for keyword in profile.keywords if keyword in normalized_message)
            if score:
                scores[profile.code] = max(scores.get(profile.code, 0), score)

        for code in self.code_map.values():
            score = self._catalog_score(code, normalized_message)
            if score:
                scores[code.code] = max(scores.get(code.code, 0), score)

        return scores

    def _find_explicit_code(self, normalized_message: str) -> str | None:
        for match in re.findall(r"\b[a-z]?\d{1,4}\b", normalized_message):
            code = match.upper()
            if code in self.code_map:
                return code
        return None

    def _catalog_score(self, code: AccidentTypeCode, normalized_message: str) -> int:
        searchable_text = f"{code.name_ko} {code.description or ''}"
        tokens = {
            self._normalize(token)
            for token in re.split(r"[\s,()·.\-/]+", searchable_text)
            if len(token.strip()) >= 2
        }
        return sum(2 for token in tokens if token and token in normalized_message)

    def _public_risk_code(self, code: AccidentTypeCode) -> str:
        if code.code == "Z":
            return "Z"
        return code.parent_code or code.code[:2]

    def _public_risk_type(self, detail_code: AccidentTypeCode, parent_code: str) -> str:
        if parent_code == "Z":
            return "분류불능"
        description = detail_code.description or detail_code.name_ko
        return description.split("(", 1)[0]

    def _unclassified(self) -> RiskClassification:
        unclassified = self.accident_code_loader.get_unclassified_code()
        return RiskClassification(
            risk_code=unclassified.code,
            risk_type=unclassified.name_ko,
            parent_risk_code=unclassified.code,
            parent_risk_type=unclassified.name_ko,
            severity="unknown",
            confidence=0.0,
            method="fallback",
        )

    def _classification_from_code(
        self,
        code: str,
        confidence: float,
        method: str,
        reason: str | None = None,
    ) -> RiskClassification:
        accident_code = self.code_map.get(code)
        if accident_code is None:
            return self._unclassified()

        parent_code = self._public_risk_code(accident_code)
        return RiskClassification(
            risk_code=accident_code.code,
            risk_type=accident_code.name_ko,
            parent_risk_code=parent_code,
            parent_risk_type=self._public_risk_type(accident_code, parent_code),
            severity=self._severity_for(accident_code),
            confidence=confidence,
            method=method,
            reason=reason,
        )

    def _candidate_from_code(self, code: str, score: int) -> RiskCandidate:
        accident_code = self.code_map[code]
        parent_code = self._public_risk_code(accident_code)
        return RiskCandidate(
            risk_code=accident_code.code,
            risk_type=accident_code.name_ko,
            parent_risk_code=parent_code,
            parent_risk_type=self._public_risk_type(accident_code, parent_code),
            score=score,
        )

    def _severity_for(self, code: AccidentTypeCode) -> str:
        high_risk_parent_codes = {"01", "07", "09", "10", "11", "14", "15", "16"}
        medium_risk_parent_codes = {"02", "03", "04", "05", "06", "08", "12", "13", "31", "32", "33"}

        if code.parent_code in high_risk_parent_codes:
            return "high"
        if code.parent_code in medium_risk_parent_codes:
            return "medium"
        if code.code == "Z":
            return "unknown"
        return "low"

    def _confidence(self, score: int) -> float:
        return min(0.95, round(0.35 + (score * 0.1), 2))

    def _build_keyword_profiles(self) -> tuple[KeywordProfile, ...]:
        profiles = (
            KeywordProfile("0102", ("사다리", "계단", "발판", "추락", "떨어")),
            KeywordProfile("0105", ("지붕", "옥상", "채광창")),
            KeywordProfile("0106", ("비계", "작업대", "가설")),
            KeywordProfile("0203", ("미끄러", "미끄럼", "바닥", "넘어")),
            KeywordProfile("0302", ("깔림", "깔렸", "쓰러진", "전도")),
            KeywordProfile("0406", ("차량", "지게차", "트럭", "부딪", "충돌")),
            KeywordProfile("0502", ("맞았", "낙하물", "떨어진물체", "물체가떨어")),
            KeywordProfile("0603", ("무너", "붕괴", "적재물")),
            KeywordProfile("0701", ("끼임", "끼었", "끼였", "말려", "감김", "협착")),
            KeywordProfile("0801", ("베임", "베였", "절단", "찔림", "칼날", "회전날")),
            KeywordProfile("0901", ("감전", "전기", "누전", "전류", "아크")),
            KeywordProfile("1001", ("폭발", "파열", "터짐")),
            KeywordProfile("1101", ("화재", "불", "연기", "소화기")),
            KeywordProfile("1402", ("누출", "가스", "화학물질", "약품", "용제")),
            KeywordProfile("1403", ("화상", "접촉", "피부", "눈에", "흡입")),
            KeywordProfile("1501", ("산소결핍", "질식", "밀폐공간")),
            KeywordProfile("1601", ("익사", "빠짐", "물에")),
        )
        return tuple(profile for profile in profiles if profile.code in self.code_map)

    def _normalize(self, value: str) -> str:
        return re.sub(r"\s+", "", value).lower()
