# Backend

FastAPI backend skeleton for SAFING.

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

