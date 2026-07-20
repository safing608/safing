import re
from dataclasses import dataclass

from app.rag.accident_code_loader import AccidentCodeLoader
from app.schemas.chat import SafetyChatState
from app.schemas.risk import AccidentTypeCode, ParentRiskCandidate, RiskCandidate, RiskClassification
from app.services.llm_risk_corrector import LlmRiskCorrector


@dataclass(frozen=True)
class KeywordProfile:
    code: str
    keywords: tuple[str, ...]


class RiskClassificationAgent:
    name = "risk_classifier"
    ignored_keyword_tokens = {"기타", "상세정보부족"}
    manual_keywords = {
        "0102": ("사다리", "계단", "발판", "추락", "떨어"),
        "0105": ("지붕", "옥상", "채광창"),
        "0106": ("비계", "작업대", "가설"),
        "0203": ("미끄러", "미끄럼", "바닥", "넘어"),
        "0302": ("깔림", "깔렸", "쓰러진", "전도"),
        "0406": ("차량", "지게차", "트럭", "부딪", "충돌"),
        "0502": ("맞았", "낙하물", "떨어진물체", "물체가떨어"),
        "0603": ("무너", "붕괴", "적재물"),
        "0701": ("끼임", "끼었", "끼였", "말려", "감김", "협착"),
        "0801": ("베임", "베였", "절단", "찔림", "칼날", "회전날"),
        "0901": ("감전", "전기", "누전", "전류", "아크"),
        "1001": ("폭발", "파열", "터짐"),
        "1101": ("화재", "불", "연기", "소화기"),
        "1402": ("누출", "가스", "화학물질", "약품", "용제"),
        "1403": ("화상", "접촉", "피부", "눈에", "흡입"),
        "1501": ("산소결핍", "질식", "밀폐공간"),
        "1601": ("익사", "빠짐", "물에"),
    }

    def __init__(
        self,
        accident_code_loader: AccidentCodeLoader | None = None,
        llm_risk_corrector: LlmRiskCorrector | None = None,
    ) -> None:
        self.accident_code_loader = accident_code_loader or AccidentCodeLoader()
        self.code_map = self.accident_code_loader.get_code_map()
        self.keyword_profiles = self._build_keyword_profiles()
        self.parent_candidates = self._build_parent_candidates()
        self.llm_risk_corrector = llm_risk_corrector or LlmRiskCorrector()

    async def run(self, state: SafetyChatState) -> SafetyChatState:
        message = state.normalized_message or state.message
        state.risk_classification = self.classify(message)
        return state

    def classify(self, message: str, use_llm: bool = True) -> RiskClassification:
        candidates = self.find_candidates(message)

        if not candidates:
            if not use_llm:
                return self._unclassified()
            return self._classify_with_parent_expansion(message)

        rule_based_result = self._classification_from_code(
            candidates[0].risk_code,
            confidence=self._confidence(candidates[0].score),
            method="rule_based",
        )

        if not use_llm:
            return rule_based_result

        if candidates[0].risk_code == "Z":
            expanded_result = self._classify_with_parent_expansion(message)
            if expanded_result.risk_code != "Z":
                return expanded_result

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

    def _classify_with_parent_expansion(self, message: str) -> RiskClassification:
        parent_correction = self.llm_risk_corrector.correct_parent(
            message,
            self.parent_candidates,
        )
        if parent_correction is None or parent_correction.parent_risk_code == "Z":
            return self._unclassified_with_reason(
                "No rule-based candidates and parent risk LLM correction failed or returned Z."
            )

        detail_candidates = self._detail_candidates_by_parent(parent_correction.parent_risk_code)
        detail_correction = self.llm_risk_corrector.correct(message, detail_candidates)
        if detail_correction is None:
            fallback_candidate = self._default_detail_candidate(parent_correction.parent_risk_code)
            if fallback_candidate is None:
                return self._unclassified_with_reason(
                    "Parent risk was selected but no detail risk candidate was available."
                )
            return self._classification_from_code(
                fallback_candidate.risk_code,
                confidence=parent_correction.confidence,
                method="fallback",
                reason="Detail LLM correction failed; used the parent default detail risk code.",
            )

        return self._classification_from_code(
            detail_correction.risk_code,
            confidence=detail_correction.confidence,
            method="llm_corrected",
            reason=detail_correction.reason or parent_correction.reason,
        )

    def _score_candidates(self, normalized_message: str) -> dict[str, int]:
        scores: dict[str, int] = {}

        explicit_code = self._find_explicit_code(normalized_message)
        if explicit_code is not None:
            scores[explicit_code] = 10

        for profile in self.keyword_profiles:
            score = sum(4 for keyword in profile.keywords if keyword in normalized_message)
            if score:
                scores[profile.code] = max(scores.get(profile.code, 0), score)

        for code, keywords in self.manual_keywords.items():
            if code not in self.code_map:
                continue
            score = sum(8 for keyword in keywords if self._normalize(keyword) in normalized_message)
            if score:
                scores[code] = max(scores.get(code, 0), score)

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
        tokens -= self.ignored_keyword_tokens
        return sum(2 for token in tokens if token and token in normalized_message)

    def _detail_candidates_by_parent(self, parent_risk_code: str) -> list[RiskCandidate]:
        candidates = [
            self._candidate_from_code(code.code, score=0)
            for code in self.code_map.values()
            if self._public_risk_code(code) == parent_risk_code
        ]
        return sorted(candidates, key=lambda candidate: candidate.risk_code)

    def _default_detail_candidate(self, parent_risk_code: str) -> RiskCandidate | None:
        candidates = self._detail_candidates_by_parent(parent_risk_code)
        if not candidates:
            return None

        detail_prefix = f"{parent_risk_code}01"
        for candidate in candidates:
            if candidate.risk_code == detail_prefix:
                return candidate

        return candidates[0]

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

    def _unclassified_with_reason(self, reason: str) -> RiskClassification:
        return self._unclassified().model_copy(update={"reason": reason})

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
        profiles: list[KeywordProfile] = []
        for code in self.code_map.values():
            keywords = set(self._keywords_from_code(code))
            keywords.update(self._normalize(keyword) for keyword in self.manual_keywords.get(code.code, ()))
            keywords.discard("")
            profiles.append(KeywordProfile(code.code, tuple(sorted(keywords))))
        return tuple(profiles)

    def _build_parent_candidates(self) -> list[ParentRiskCandidate]:
        parents: dict[str, str] = {}
        for code in self.code_map.values():
            parent_code = self._public_risk_code(code)
            parents.setdefault(parent_code, self._public_risk_type(code, parent_code))

        return [
            ParentRiskCandidate(parent_risk_code=parent_code, parent_risk_type=parent_type)
            for parent_code, parent_type in sorted(parents.items())
        ]

    def _keywords_from_code(self, code: AccidentTypeCode) -> tuple[str, ...]:
        searchable_text = f"{code.name_ko} {code.description or ''}"
        tokens = {
            self._normalize(token)
            for token in re.split(r"[\s,()·.\-/]+", searchable_text)
            if len(token.strip()) >= 2
        }
        tokens -= self.ignored_keyword_tokens
        tokens.add(self._normalize(code.name_ko))
        if code.description:
            parent_type = code.description.split("(", 1)[0]
            tokens.add(self._normalize(parent_type))
        return tuple(token for token in tokens if token)

    def _normalize(self, value: str) -> str:
        return re.sub(r"\s+", "", value).lower()
