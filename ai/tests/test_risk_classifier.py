import unittest

from app.agents.risk_classifier import RiskClassificationAgent
from app.services.llm_risk_corrector import LlmParentRiskCorrection, LlmRiskCorrection


class FakeLlmRiskCorrector:
    api_key = "test-key"

    def correct(self, text, candidates):
        for candidate in candidates:
            if candidate.risk_code == "0701":
                return LlmRiskCorrection(riskCode="0701", confidence=0.88, reason="matched detail")
        return None

    def correct_parent(self, text, candidates):
        return LlmParentRiskCorrection(parentRiskCode="07", confidence=0.8, reason="matched parent")


class RaisingLlmRiskCorrector:
    api_key = "test-key"

    def correct(self, text, candidates):
        raise AssertionError("LLM detail correction should not be called.")

    def correct_parent(self, text, candidates):
        raise AssertionError("LLM parent correction should not be called.")


class RiskClassificationAgentTest(unittest.TestCase):
    def setUp(self) -> None:
        self.agent = RiskClassificationAgent()

    def test_classifies_caught_in_machine_as_detail_and_parent_code(self) -> None:
        result = self.agent.classify("기계에 손이 끼었어요", use_llm=False)

        self.assertEqual(result.risk_code, "0701")
        self.assertEqual(result.risk_type, "상세정보부족 끼임·감김")
        self.assertEqual(result.parent_risk_code, "07")
        self.assertEqual(result.parent_risk_type, "끼임")
        self.assertEqual(result.severity, "high")

    def test_classifies_electric_shock_as_detail_and_parent_code(self) -> None:
        result = self.agent.classify("전기선에 감전된 것 같아요", use_llm=False)

        self.assertEqual(result.risk_code, "0901")
        self.assertEqual(result.risk_type, "상세정보부족 감전")
        self.assertEqual(result.parent_risk_code, "09")
        self.assertEqual(result.parent_risk_type, "감전")
        self.assertEqual(result.severity, "high")

    def test_classifies_fall_from_ladder_as_detail_and_parent_code(self) -> None:
        result = self.agent.classify("사다리에서 떨어졌어요", use_llm=False)

        self.assertEqual(result.risk_code, "0102")
        self.assertEqual(result.risk_type, "계단, 사다리에서 떨어짐")
        self.assertEqual(result.parent_risk_code, "01")
        self.assertEqual(result.parent_risk_type, "떨어짐")
        self.assertEqual(result.severity, "high")

    def test_returns_unclassified_when_unclear(self) -> None:
        result = self.agent.classify("무슨 상황인지 모르겠어요", use_llm=False)

        self.assertEqual(result.risk_code, "Z")
        self.assertEqual(result.risk_type, "분류불능")
        self.assertEqual(result.parent_risk_code, "Z")
        self.assertEqual(result.parent_risk_type, "분류불능")
        self.assertEqual(result.severity, "unknown")
        self.assertEqual(result.confidence, 0.0)

    def test_has_keyword_profile_for_every_accident_code(self) -> None:
        self.assertEqual(
            set(self.agent.code_map),
            {profile.code for profile in self.agent.keyword_profiles},
        )

    def test_expands_from_parent_to_detail_when_rule_based_candidates_are_missing(self) -> None:
        agent = RiskClassificationAgent(llm_risk_corrector=FakeLlmRiskCorrector())

        result = agent.classify("이 문장은 규칙 후보가 없는 테스트 문장입니다.")

        self.assertEqual(result.risk_code, "0701")
        self.assertEqual(result.parent_risk_code, "07")
        self.assertEqual(result.method, "llm_corrected")

    def test_does_not_call_llm_when_disabled_and_candidates_are_missing(self) -> None:
        agent = RiskClassificationAgent(llm_risk_corrector=RaisingLlmRiskCorrector())

        result = agent.classify("이 문장은 규칙 후보가 없는 테스트 문장입니다.", use_llm=False)

        self.assertEqual(result.risk_code, "Z")
        self.assertEqual(result.parent_risk_code, "Z")


if __name__ == "__main__":
    unittest.main()
