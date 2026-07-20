import argparse
from collections import Counter
from pathlib import Path
import sys

ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from app.rag.index_builder import RagIndexBuilder


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Build SAFING RAG document chunks.")
    parser.add_argument(
        "--file",
        default="app/data/raw/manufacturing_manual/safety_basic_2025_manufacturing.pdf",
        help="PDF path relative to ai/ or an absolute path.",
    )
    parser.add_argument("--title", default="2025년 안전보건 교육 기본서(제조업)")
    parser.add_argument("--provider", default="안전보건공단")
    parser.add_argument("--category", default="제조업 안전")
    parser.add_argument("--language", default="ko")
    parser.add_argument(
        "--save",
        action="store_true",
        help="Persist chunks to PostgreSQL + pgvector. Default is dry-run.",
    )
    return parser.parse_args()


def resolve_file_path(value: str) -> Path:
    path = Path(value)
    if path.is_absolute():
        return path
    return ROOT_DIR / path


def main() -> None:
    args = parse_args()
    file_path = resolve_file_path(args.file)

    metadata, chunks, saved_ids = RagIndexBuilder().build_and_save(
        file_path=file_path,
        source_title=args.title,
        provider=args.provider,
        category=args.category,
        language=args.language,
        dry_run=not args.save,
    )

    risk_counter = Counter(
        risk_code
        for chunk in chunks
        for risk_code in chunk.risk_codes
    )

    print(f"source: {metadata.source_title}")
    print(f"file: {metadata.source_path}")
    print(f"chunks: {len(chunks)}")
    print(f"risk_codes: {dict(sorted(risk_counter.items()))}")

    if chunks:
        first_chunk = chunks[0]
        print(f"first_chunk_page: {first_chunk.page_start}")
        print(f"first_chunk_risk_codes: {first_chunk.risk_codes}")
        print(f"first_chunk_preview: {first_chunk.content[:160]}")

    if args.save:
        inserted_count = sum(1 for chunk_id in saved_ids if chunk_id != -1)
        skipped_count = sum(1 for chunk_id in saved_ids if chunk_id == -1)
        print(f"inserted_chunks: {inserted_count}")
        print(f"skipped_duplicate_chunks: {skipped_count}")
    else:
        print("dry_run: true")


if __name__ == "__main__":
    main()
