# SAFING AI

FastAPI AI service for SAFING safety chat and RAG-based answer generation.

## Structure

```text
ai/
  app/
    main.py
    config/
      settings.py
    routers/
      health.py
      agents.py
    schemas/
      agent.py
    services/
      orchestrator.py
      agents/
        base.py
        planner.py
        researcher.py
        writer.py
```

## Run

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Then open:

- `GET /health`
- `POST /agents/run`

## Build RAG Index

Start PostgreSQL with pgvector first, then run the index builder from the `ai/`
directory.

```powershell
cd C:\safing\ai
python scripts/build_rag_index.py --save --preset all --disable-llm
```

Use `--disable-llm` for the public PDF seed documents. It indexes faster and
uses rule-based risk tagging. Without it, each chunk calls the LLM for risk
correction and large PDFs can take a long time.

Available presets:

```text
manufacturing_manual
fire_guide
pre_entry_education
emergency_guide
all
```

Index a single document:

```powershell
python scripts/build_rag_index.py --save --preset fire_guide --disable-llm
python scripts/build_rag_index.py --save --preset pre_entry_education --disable-llm
python scripts/build_rag_index.py --save --preset emergency_guide --disable-llm
```

Dry-run without saving:

```powershell
python scripts/build_rag_index.py --preset all --disable-llm
```

Check indexed sources:

```sql
SELECT
    ds.id,
    ds.source_title,
    ds.category,
    ds.language,
    COUNT(dc.id) AS chunk_count
FROM document_sources ds
LEFT JOIN document_chunks dc
    ON dc.source_id = ds.id
GROUP BY
    ds.id,
    ds.source_title,
    ds.category,
    ds.language
ORDER BY ds.id;
```
