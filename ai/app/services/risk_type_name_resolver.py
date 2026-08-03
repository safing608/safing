from sqlalchemy.orm import Session

from app.db.repositories.risk_type_repository import RiskTypeRepository
from app.db.session import SessionLocal


class RiskTypeNameResolver:
    def __init__(self, session: Session | None = None) -> None:
        self.session = session
        self._owns_session = session is None

    def resolve(self, risk_type_code: str | None, language: str) -> str | None:
        if not risk_type_code:
            return None

        session = self.session or SessionLocal()
        try:
            return RiskTypeRepository(session).find_name_by_code_and_language(
                risk_type_code=risk_type_code,
                language=language,
            )
        except Exception:
            return None
        finally:
            if self._owns_session:
                session.close()
