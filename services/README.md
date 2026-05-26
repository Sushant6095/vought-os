# services/

Backend services. Each runs as an independent process.

- **`echo-engine/`** — Node.js Speech Engine orchestrator
- **`diarization-sidecar/`** — Python FastAPI + diart streaming diarization

See `vault/30 · Architecture/Echo Engine.md` and `vault/30 · Architecture/Diarization Sidecar.md`.

## Running locally

```bash
# Terminal 1 — Echo Engine
pnpm dev --filter=echo-engine

# Terminal 2 — Diarization Sidecar
cd services/diarization-sidecar
source .venv/bin/activate
uvicorn main:app --port 8000 --reload

# Terminal 3 — ngrok
ngrok http 3001
```
