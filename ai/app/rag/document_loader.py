from pathlib import Path

import fitz

from app.schemas.rag import DocumentPage


def load_pdf_pages(file_path: str | Path) -> list[DocumentPage]:
    file_path = Path(file_path)
    doc = fitz.open(file_path)

    pages: list[DocumentPage] = []

    for page_number, page in enumerate(doc, start=1):
        text = page.get_text("text").strip()

        if not text:
            continue

        pages.append(DocumentPage(page_number=page_number, text=text))

    return pages


def load_pdf_text(file_path: str | Path) -> list[dict[str, object]]:
    return [
        {"page": page.page_number, "text": page.text}
        for page in load_pdf_pages(file_path)
    ]
