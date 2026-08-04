import argparse
from collections import Counter
from dataclasses import dataclass
from pathlib import Path
import sys

ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from app.rag.index_builder import RagIndexBuilder


@dataclass(frozen=True)
class DocumentPreset:
    file: str
    title: str
    provider: str
    category: str
    language: str = "ko"


DOCUMENT_PRESETS = {
    "manufacturing_manual": DocumentPreset(
        file="app/data/raw/manufacturing_manual/safety_basic_2025_manufacturing.pdf",
        title="2025년 안전보건 교육 기본서(제조업)",
        provider="안전보건공단",
        category="제조업 안전",
        language="ko",
    ),
    "fire_guide": DocumentPreset(
        file="app/data/raw/fire_guide/fire_extinguisher_foreign_worker.pdf",
        title="외국인 근로자를 위한 소화기 사용 안내",
        provider="안전보건공단",
        category="화재 안전",
        language="ko",
    ),
    "pre_entry_education": DocumentPreset(
        file="app/data/raw/pre_entry_education/foreign_worker_safety_ko.pdf",
        title="외국인 근로자 안전보건교육",
        provider="안전보건공단",
        category="외국인 근로자 안전교육",
        language="ko",
    ),
    "emergency_guide": DocumentPreset(
        file="app/data/raw/emergency_guide/emergency_first_aid_en.pdf",
        title="Emergency First Aid Guide",
        provider="안전보건공단",
        category="응급처치",
        language="en",
    ),
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Build SAFING RAG document chunks.")
    parser.add_argument(
        "--preset",
        choices=[*DOCUMENT_PRESETS.keys(), "all"],
        help=(
            "Known document preset to index. Use 'all' to index every public RAG PDF. "
            "Defaults to manufacturing_manual when --file is omitted."
        ),
    )
    parser.add_argument(
        "--file",
        help="Custom PDF path relative to ai/ or an absolute path.",
    )
    parser.add_argument("--title", help="Custom source title. Preset title is used by default.")
    parser.add_argument("--provider", help="Custom provider. Preset provider is used by default.")
    parser.add_argument("--category", help="Custom category. Preset category is used by default.")
    parser.add_argument("--language", help="Custom language. Preset language is used by default.")
    parser.add_argument(
        "--save",
        action="store_true",
        help="Persist chunks to PostgreSQL + pgvector. Default is dry-run.",
    )
    parser.add_argument(
        "--disable-llm",
        action="store_true",
        help="Use only rule-based risk tagging even when OPEN_API_KEY is configured.",
    )
    return parser.parse_args()


def resolve_file_path(value: str) -> Path:
    path = Path(value)
    if path.is_absolute():
        return path
    return ROOT_DIR / path


def resolve_jobs(args: argparse.Namespace) -> list[DocumentPreset]:
    if args.preset == "all":
        if args.file:
            raise ValueError("--file cannot be used with --preset all.")
        return list(DOCUMENT_PRESETS.values())

    base = (
        DocumentPreset(
            file=args.file,
            title=args.title or Path(args.file).stem,
            provider=args.provider or "안전보건공단",
            category=args.category or "산업 안전",
            language=args.language or "ko",
        )
        if args.file
        else DOCUMENT_PRESETS[args.preset or "manufacturing_manual"]
    )

    return [
        DocumentPreset(
            file=base.file,
            title=args.title or base.title,
            provider=args.provider or base.provider,
            category=args.category or base.category,
            language=args.language or base.language,
        )
    ]


def print_result(metadata, chunks, saved_ids: list[int], save: bool) -> tuple[int, int]:
    risk_counter = Counter(risk_code for chunk in chunks for risk_code in chunk.risk_codes)
    parent_risk_counter = Counter(
        risk_code
        for chunk in chunks
        for risk_code in chunk.parent_risk_codes
    )
    tagging_method_counter = Counter(
        chunk.metadata.get("risk_tagging_method", "unknown")
        for chunk in chunks
    )

    print("-" * 80)
    print(f"source: {metadata.source_title}")
    print(f"file: {metadata.source_path}")
    print(f"chunks: {len(chunks)}")
    print(f"risk_codes: {dict(sorted(risk_counter.items()))}")
    print(f"parent_risk_codes: {dict(sorted(parent_risk_counter.items()))}")
    print(f"tagging_methods: {dict(sorted(tagging_method_counter.items()))}")

    if chunks:
        first_chunk = chunks[0]
        print(f"first_chunk_page: {first_chunk.page_start}")
        print(f"first_chunk_risk_codes: {first_chunk.risk_codes}")
        print(f"first_chunk_parent_risk_codes: {first_chunk.parent_risk_codes}")
        print(f"first_chunk_preview: {first_chunk.content[:160]}")

    if save:
        inserted_count = sum(1 for chunk_id in saved_ids if chunk_id != -1)
        skipped_count = sum(1 for chunk_id in saved_ids if chunk_id == -1)
        print(f"inserted_chunks: {inserted_count}")
        print(f"skipped_duplicate_chunks: {skipped_count}")
        return inserted_count, skipped_count

    print("dry_run: true")
    return 0, 0


def main() -> None:
    args = parse_args()
    jobs = resolve_jobs(args)
    index_builder = RagIndexBuilder(
        use_llm_risk_correction=not args.disable_llm,
    )

    total_inserted = 0
    total_skipped = 0
    for job in jobs:
        metadata, chunks, saved_ids = index_builder.build_and_save(
            file_path=resolve_file_path(job.file),
            source_title=job.title,
            provider=job.provider,
            category=job.category,
            language=job.language,
            dry_run=not args.save,
        )
        inserted_count, skipped_count = print_result(
            metadata=metadata,
            chunks=chunks,
            saved_ids=saved_ids,
            save=args.save,
        )
        total_inserted += inserted_count
        total_skipped += skipped_count

    if args.save and len(jobs) > 1:
        print("-" * 80)
        print(f"total_inserted_chunks: {total_inserted}")
        print(f"total_skipped_duplicate_chunks: {total_skipped}")
    else:
        print("-" * 80)


if __name__ == "__main__":
    main()
