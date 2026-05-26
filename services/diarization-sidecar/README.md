# Vought · Diarization Sidecar

> The Python service that knows who is talking.

A FastAPI app that runs streaming speaker diarization on raw mic audio and
broadcasts speaker labels to the Echo Engine. Built on
[diart](https://github.com/juanmc2005/diart) + pyannote-audio. Designed for
sub-600ms label delivery on CPU at single-session load.

```
browser ──PCM WS──▶ /audio/{session_id}                   (this service)
                              │
                              ▼
                       diart pipeline
                              │
                              ▼   speaker labels (JSON)
              /labels ◀──── broadcast ────▶ Echo Engine
```

---

## Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET    | `/health` | `{ok, active_sessions, hf_token_present, ready}` |
| WS     | `/audio/{session_id}` | Browser pushes raw 16kHz mono PCM, one frame per message |
| WS     | `/labels` | Echo Engine subscribes, receives `speaker_label` JSON events |

### Wire format (must stay in sync with `services/echo-engine/src/speaker-gate.ts`)

```json
{
  "type": "speaker_label",
  "sessionId": "abc-123",
  "tStart": 12.30,
  "tEnd": 14.80,
  "speakerId": "speaker_0",
  "isSelf": false,
  "confidence": 0.9
}
```

---

## Prerequisites

1. **Python 3.11** (3.10+ works, 3.12 not yet tested with diart 0.9).
2. **A Hugging Face account.** Sign up at https://huggingface.co.
3. **Accept the pyannote 3.1 license**, otherwise the model download will
   fail with a 401:
   https://huggingface.co/pyannote/speaker-diarization-3.1
4. **An HF access token** with read scope:
   https://huggingface.co/settings/tokens
5. **System libraries** (macOS):
   ```bash
   brew install ffmpeg libsndfile
   ```
   On Debian / Ubuntu:
   ```bash
   sudo apt-get install ffmpeg libsndfile1
   ```

---

## Local dev

```bash
cd services/diarization-sidecar

python3.11 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# Provide the HF token. Either via .env or shell env.
echo "HF_TOKEN=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" > .env

# One-time, on the first machine you run this:
huggingface-cli login

uvicorn main:app --port 8000 --reload
```

Verify:

```bash
curl http://localhost:8000/health
# {"ok": true, "active_sessions": 0, "hf_token_present": true, "ready": true}
```

If `hf_token_present` is `false`, set `HF_TOKEN` and restart. The service
will still boot without it (so deploy probes succeed) but `/audio/*` will
refuse with a clear close reason.

---

## Manual end-to-end smoke test

In one terminal, subscribe to labels:

```bash
# any small ws client works — wscat, websocat, etc.
websocat ws://localhost:8000/labels
```

In another, push raw PCM from a wav file. Audio must be 16kHz mono
little-endian int16.

```python
# pip install websockets
import asyncio, websockets, wave

async def main():
    async with websockets.connect("ws://localhost:8000/audio/test-1") as ws:
        wf = wave.open("two-speaker.wav", "rb")
        assert wf.getframerate() == 16000 and wf.getnchannels() == 1
        frame_ms = 100
        n = int(16000 * frame_ms / 1000)
        while True:
            buf = wf.readframes(n)
            if not buf:
                break
            await ws.send(buf)
            await asyncio.sleep(frame_ms / 1000)

asyncio.run(main())
```

You should see labels arrive on the `/labels` subscriber within ~600ms.

The first speaker that dominates the first 5 seconds is locked as
`isSelf: true` for the duration of the session.

---

## Docker

The repo ships a two-stage Dockerfile that pre-downloads the pyannote
model at build time using a build secret, so cold starts on Modal /
Railway do not hit Hugging Face.

```bash
# from the repo root
export HF_TOKEN=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

docker build \
  --secret id=hf_token,env=HF_TOKEN \
  -t vought/diarization-sidecar:latest \
  services/diarization-sidecar

docker run --rm -p 8000:8000 \
  -e HF_TOKEN=$HF_TOKEN \
  vought/diarization-sidecar:latest
```

For GPU on Modal, swap the base in the `Dockerfile` to the matching CUDA
runtime image and reinstall torch with the CUDA wheel. CPU mode handles
~1 active session per vCPU; GPU mode handles ~5-10 per L4.

---

## Environment variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `HF_TOKEN` | _(required)_ | Hugging Face token with access to pyannote 3.1 |
| `PORT` | `8000` | uvicorn bind port |
| `LOG_LEVEL` | `INFO` | Python logging level |

`.env` in this directory is loaded automatically via `python-dotenv`.

---

## Configuration knobs

Hard-coded in `pipeline.py`:

| Constant | Value | Why |
|----------|-------|-----|
| `SAMPLE_RATE` | 16000 | Matches diart + browser mic capture |
| `ROLLING_BUFFER_SECONDS` | 2.0 | diart sliding window |
| `STEP_SECONDS` | 0.5 | 500ms hop |
| `LATENCY_SECONDS` | 0.5 | diart's own latency knob |
| Enrollment window | 5.0s | First 5s of every session lock `isSelf` |

If you change the buffer / step / latency triplet, re-measure latency
end-to-end before claiming the 600ms budget.

---

## Failure modes

- **`HF_TOKEN` missing** — `/audio/*` rejects with WS close 1011 + a clear
  log line. `/health` still returns 200 so platform deploy probes succeed.
  Echo Engine speaker-gate falls into degraded mode (always fires LLM).
- **HF gate not accepted** — diart fails to load the pyannote pipeline.
  Same behavior: `/audio/*` rejects, `/health` stays green.
- **GPU absent in production** — diart falls back to CPU. Single-session
  latency holds; concurrent sessions degrade linearly.
- **Subscriber slow** — `_broadcast_label` fans out concurrently per
  socket, so a slow Echo Engine cannot block other subscribers; dead
  sockets are evicted lazily.

---

## File layout

```
services/diarization-sidecar/
├── main.py            ← FastAPI app, WebSocket endpoints, broadcast
├── pipeline.py        ← diart pipeline + per-session inference thread
├── enrollment.py      ← 5s self-voice enrollment lock
├── requirements.txt   ← pinned production deps
├── Dockerfile         ← two-stage build with model pre-warm
└── README.md          ← you are here
```

---

## See also

- `BLUEPRINT.md` §6, §7, §8 — architecture + latency budget
- `vault/30 · Architecture/Diarization Sidecar.md` — spec + ADRs
- `services/echo-engine/src/speaker-gate.ts` — the consumer side of the
  wire format. Edit both at the same time.
