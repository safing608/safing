import csv
import re
from enum import StrEnum
from functools import lru_cache
from pathlib import Path

from app.schemas.risk import AccidentTypeCode


DEFAULT_ACCIDENT_CODE_PATH = (
    Path(__file__).resolve().parents[1]
    / "data"
    / "raw"
    / "accident_type"
    / "accident_type_code.csv"
)


class AccidentCodeLoader:
    def __init__(self, csv_path: str | Path = DEFAULT_ACCIDENT_CODE_PATH) -> None:
        self.csv_path = Path(csv_path)

    def load_codes(self) -> list[AccidentTypeCode]:
        for encoding in ("utf-8-sig", "cp949"):
            try:
                with self.csv_path.open("r", encoding=encoding, newline="") as file:
                    reader = csv.DictReader(file)
                    return [
                        AccidentTypeCode(
                            code=row["재해발생형태명코드"],
                            name_ko=row["재해발생형태명"],
                            description=row["재해발생분류"],
                            parent_code=row["재해발생분류코드"],
                        )
                        for row in reader
                    ]
            except UnicodeDecodeError:
                continue

        raise UnicodeDecodeError("utf-8-sig", b"", 0, 1, "Unable to decode accident code CSV.")

    def get_by_code(self, code: str) -> AccidentTypeCode | None:
        return get_accident_code_map().get(code)

    def get_code_map(self) -> dict[str, AccidentTypeCode]:
        return get_accident_code_map()

    def get_unclassified_code(self) -> AccidentTypeCode:
        code_map = get_accident_code_map()
        return code_map["Z"]


@lru_cache
def get_accident_codes() -> tuple[AccidentTypeCode, ...]:
    return tuple(AccidentCodeLoader().load_codes())


@lru_cache
def get_accident_code_map() -> dict[str, AccidentTypeCode]:
    return {code.code: code for code in get_accident_codes()}


@lru_cache
def get_accident_code_enum() -> type[StrEnum]:
    enum_members = {
        _to_enum_member_name(code.code): code.code
        for code in get_accident_codes()
    }
    return StrEnum("AccidentRiskCode", enum_members)


def _to_enum_member_name(code: str) -> str:
    normalized = re.sub(r"\W+", "_", code).strip("_").upper()
    return f"CODE_{normalized or 'UNKNOWN'}"
