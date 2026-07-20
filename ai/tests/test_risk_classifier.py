import unittest

from app.agents.risk_classifier import RiskClassificationAgent


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


if __name__ == "__main__":
    unittest.main()
