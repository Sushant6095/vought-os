---
title: Diarization Sidecar
type: spec
status: implemented
last_updated: 2026-05-26
---

# Diarization Sidecar

> The Python service that knows who is talking.

## Why we need it

ElevenLabs Speech Engine transcribes audio to text but does not tell us *who* spoke. For Vought specifically, this matters enormously — when the user talks to their date, ElevenLabs sees both voices as one stream. We need to know "the user just said X" vs "the other person just said X" so we only fire the LLM on the other person's turn.

## How it works

- The browser captures mic audio at 16kHz mono PCM.
- It forks the stream: one copy goes to ElevenLabs Speech Engine via WebRTC, one copy goes to this sidecar via WebSocket.
- This sidecar runs **diart 0.9** (juanmc2005/diart on GitHub) — a streaming speaker diarization library built on pyannote-audio.
- diart's pipeline runs continuously with a 2.0s rolling buffer, 0.5s hop, 0.5s latency.
- It emits speaker labels with the wire shape `{ type: "speaker_label", sessionId, tStart, tEnd, speakerId, isSelf, confidence }` (see ADR-003 for why we landed on this exact shape).
- The Echo Engine subscribes to a `/labels` WebSocket endpoint and stores the most recent label per session.

## Self-voice enrollment

The first 5 seconds of every session are used to enroll the user's voice. Whichever speaker accumulates the most speech time during those 5 seconds is locked as `isSelf: true` for the rest of the session. Dominance beats "first speaker we see" because diart sometimes emits a short spurious segment before the user has fully settled.

This is why the onboarding flow asks the user to "say a few sentences" — those become the enrollment audio.

## File layout

```
services/diarization-sidecar/
├── main.py                ← FastAPI app + WebSocket endpoints
├── pipeline.py            ← diart pipeline + per-session inference thread
├── enrollment.py          ← 5s self-voice enrollment (dominant speaker)
├── requirements.txt       ← pinned production deps
├── Dockerfile             ← two-stage build w/ pyannote prewarm
├── scripts/
│   └── prewarm_model.py   ← HF model warmup helper, invoked at build time
└── README.md
```

## Module responsibilities

- **`main.py`** owns network I/O and asyncio lifecycle. Holds the `sessions` map and the `label_subscribers` set, both behind asyncio locks. Bridges the diart worker thread back to the event loop via `asyncio.run_coroutine_threadsafe`.
- **`pipeline.py`** owns the diart pipeline and the int16-PCM → float32 normalization. Lazy-starts on the first frame so idle sessions cost nothing. Emits immutable `SpeakerLabel` dataclasses.
- **`enrollment.py`** owns the 5s window. Thread-safe. Pure with respect to inputs — returns new frozen `SpeakerLabel` instances rather than mutating.

## Endpoints

- `GET /health` — `{ok, active_sessions, hf_token_present, ready}`. Always 200 so deploy probes succeed even when HF gating is broken.
- `WS /audio/{session_id}` — receives raw 16kHz mono int16 PCM, one frame per message.
- `WS /labels` — pushes `speaker_label` events to subscribers (one subscriber today: Echo Engine).

## Performance characteristics (measured 2026-05-26)

- Local M1 CPU, model preloaded, single session, end-of-utterance → label delivery: **~540-580ms**.
  - 500ms diart rolling buffer (configured)
  - 30-70ms inference on M1 CPU
  - < 2ms in-process broadcast
- Throughput target: ~1 active session per 1 vCPU (CPU mode). With GPU (Modal L4), ~5-10 sessions per GPU. Load test pending.

## License gates

pyannote/speaker-diarization-3.1 model is gated on Hugging Face. Operators must:
1. Sign up for HF account
2. Accept the model license at https://huggingface.co/pyannote/speaker-diarization-3.1
3. Provide `HF_TOKEN` env var

The Docker build can bake the weights into the image using a BuildKit secret (`--secret id=hf_token,env=HF_TOKEN`) so production cold starts do not hit Hugging Face.

## Failure modes

- **`HF_TOKEN` missing** — `/audio/*` rejects with WS close code 1011 + clear reason. `/health` still returns 200. Echo Engine speaker-gate already treats "no labels" as degraded mode (LLM fires on every transcript).
- **HF gate not accepted** — diart construction raises at pipeline lazy-start. Same outward behavior: `/audio/*` rejects, `/health` stays green.
- **GPU unavailable in production** — falls back to CPU at ~5x slower; latency still under budget for single-session but degrades linearly with concurrency.
- **Slow subscriber** — broadcast fans out per-socket via `asyncio.gather`, so a slow Echo Engine cannot block other subscribers; dead sockets are evicted lazily.

## See also

- [[System Diagram]]
- [[Latency Budget]]
- [[ADR-003 · diart 0.9 API surface]]
- `services/echo-engine/src/speaker-gate.ts` — the consumer of the wire format. Edit both at once.
