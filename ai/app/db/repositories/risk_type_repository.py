from sqlalchemy import text
from sqlalchemy.orm import Session


class RiskTypeRepository:
    supported_languages = {"ko", "en", "ne", "km", "vi"}

    def __init__(self, session: Session) -> None:
        self.session = session

    def find_name_by_code_and_language(self, risk_type_code: str, language: str) -> str | None:
        if language not in self.supported_languages:
            language = "ko"

        column_name = f"risk_type_name_{language}"
        result = self.session.execute(
            text(
                f"""
                SELECT {column_name} AS risk_type_name
                FROM risk_types
                WHERE risk_type_code = :risk_type_code
                """
            ),
            {"risk_type_code": risk_type_code},
        )
        row = result.first()
        if row is None:
            return None
        return str(row.risk_type_name)
