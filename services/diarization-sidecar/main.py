"""
Vought · Diarization Sidecar

FastAPI app fronting a per-session diart pipeline. Receives raw 16kHz mono
PCM from the browser over a WebSocket and broadcasts speaker labels to the
Echo Engine over a second WebSocket.

Endpoints
  GET  /health             — `{ok, active_sessions, hf_token_present, ready}`
  WS   /audio/{session_id} — browser → sidecar, raw int16 PCM frames @ 16kHz
  WS   /labels             — Echo Engine subscribes, receives label JSON

Wire format (matches services/echo-engine/src/speaker-gate.ts):
  { type: "speaker_label", sessionId, tStart, tEnd, speakerId, isSelf,
    confidence }

Graceful degradation
  - HF_TOKEN missing → /audio rejects with 1011 + clear log line; /health
    still serves 200 so deploy probes pass.
  - diart import fails → same: /audio rejects, /health serves 200.

Run
    pip install -r requirements.txt
    huggingface-cli login   # accept the pyannote 3.1 model license
    HF_TOKEN=hf_xxx uvicorn main:app --port 8000 --reload
"""

from __future__ import annotations

import asyncio
import json
import logging
import os
from contextlib import asynccontextmanager
from dataclasses import dataclass
from typing import Dict, Set

import numpy as np
from dotenv import load_dotenv
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse

from enrollment import SelfVoiceEnrollment
from pipeline import DiarizationPipeline, SpeakerLabel

load_dotenv()

logging.basicConfig(
    level=os.environ.get("LOG_LEVEL", "INFO"),
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
)
logger = logging.getLogger("diarization-sidecar")


HF_TOKEN: str | None = os.environ.get("HF_TOKEN")
WS_CLOSE_INTERNAL_ERROR = 1011  # RFC 6455

if not HF_TOKEN:
    logger.warning(
        "HF_TOKEN is not set. Pyannote models will not load. "
        "Get a token at https://huggingface.co/settings/tokens and accept "
        "the license at https://huggingface.co/pyannote/speaker-diarization-3.1"
    )


# ── per-session state ────────────────────────────────────────────────────


@dataclass
class Session:
    """In-memory state for one audio session.

    `pipeline` owns the diart worker thread. `enrollment` owns the 5s lock.
    """

    session_id: str
    pipeline: DiarizationPipeline
    enrollment: SelfVoiceEnrollment


sessions: Dict[str, Session] = {}
sessions_lock = asyncio.Lock()

label_subscribers: Set[WebSocket] = set()
label_subscribers_lock = asyncio.Lock()


# ── FastAPI lifespan ─────────────────────────────────────────────────────


@asynccontextmanager
async def lifespan(_app: FastAPI):
    logger.info(
        "Vought diarization sidecar starting (hf_token_present=%s)",
        bool(HF_TOKEN),
    )
    # Capture the loop so background threads can schedule label broadcasts.
    app.state.loop = asyncio.get_running_loop()
    yield
    # Drain any remaining sessions on shutdown.
    async with sessions_lock:
        for session in list(sessions.values()):
            session.pipeline.close()
        sessions.clear()
    logger.info("Vought diarization sidecar stopped")


app = FastAPI(lifespan=lifespan, title="Vought Diarization Sidecar")


# ── health ───────────────────────────────────────────────────────────────


@app.get("/health")
async def health() -> JSONResponse:
    return JSONResponse(
        {
            "ok": True,
            "active_sessions": len(sessions),
            "hf_token_present": bool(HF_TOKEN),
            # `ready` mirrors `ok` until we wire a real probe — kept for
            # k8s-style readiness/liveness clients.
            "ready": True,
        }
    )


# ── /audio/{session_id} ──────────────────────────────────────────────────


@app.websocket("/audio/{session_id}")
async def audio_ingest(websocket: WebSocket, session_id: str) -> None:
    """Browser-facing audio ingest WebSocket.

    Expects a continuous stream of raw 16-bit little-endian PCM samples at
    16kHz mono, one frame per message. Frame size is flexible — diart
    handles its own rolling buffer.
    """
    await websocket.accept()

    if not HF_TOKEN:
        logger.warning(
            "Refusing /audio/%s — HF_TOKEN missing. Set HF_TOKEN and restart.",
            session_id,
        )
        await websocket.close(
            code=WS_CLOSE_INTERNAL_ERROR,
            reason="HF_TOKEN missing — diarization unavailable",
        )
        return

    session = await _open_session(session_id)
    if session is None:
        await websocket.close(
            code=WS_CLOSE_INTERNAL_ERROR,
            reason="diarization pipeline unavailable",
        )
        return

    logger.info("Audio session opened: %s", session_id)

    try:
        while True:
            data = await websocket.receive_bytes()
            if not data:
                continue
            try:
                pcm = np.frombuffer(data, dtype=np.int16)
            except ValueError as exc:
                logger.warning(
                    "Bad PCM frame on session %s: %s", session_id, exc
                )
                continue
            try:
                session.pipeline.push_pcm(pcm)
            except Exception as exc:  # noqa: BLE001
                logger.exception(
                    "Pipeline push failed for %s: %s", session_id, exc
                )
                break

    except WebSocketDisconnect:
        logger.info("Audio session disconnected: %s", session_id)
    except Exception as exc:  # noqa: BLE001
        logger.exception("Audio session %s errored: %s", session_id, exc)
    finally:
        await _close_session(session_id)


async def _open_session(session_id: str) -> Session | None:
    """Create or replace the per-session pipeline. Returns None on failure."""

    async with sessions_lock:
        existing = sessions.pop(session_id, None)
        if existing is not None:
            logger.info("Replacing existing session %s", session_id)
            existing.pipeline.close()

        enrollment = SelfVoiceEnrollment()
        loop = app.state.loop

        def on_label(raw_label: SpeakerLabel) -> None:
            # Runs on the diart worker thread. Decorate with enrollment
            # state, then bounce to the asyncio loop for broadcast.
            enrollment.observe(raw_label)
            decorated = enrollment.decorate(raw_label)
            asyncio.run_coroutine_threadsafe(
                _broadcast_label(decorated.to_wire_dict()), loop
            )

        try:
            pipeline = DiarizationPipeline(
                session_id=session_id,
                on_label=on_label,
                hf_token=HF_TOKEN,
            )
        except Exception as exc:  # noqa: BLE001
            logger.exception(
                "Could not build pipeline for %s: %s", session_id, exc
            )
            return None

        session = Session(
            session_id=session_id,
            pipeline=pipeline,
            enrollment=enrollment,
        )
        sessions[session_id] = session
        return session


async def _close_session(session_id: str) -> None:
    async with sessions_lock:
        session = sessions.pop(session_id, None)
    if session is not None:
        # Closing the pipeline can block briefly — do it off the event loop.
        await asyncio.get_running_loop().run_in_executor(
            None, session.pipeline.close
        )
        logger.info("Audio session closed: %s", session_id)


# ── /labels ──────────────────────────────────────────────────────────────


@app.websocket("/labels")
async def labels_out(websocket: WebSocket) -> None:
    """Echo Engine subscribes here. We push, the subscriber listens.

    We send a periodic JSON `{type: "ping"}` so idle connections do not get
    eaten by proxies. The Echo Engine speaker-gate tolerates unknown types.
    """
    await websocket.accept()
    async with label_subscribers_lock:
        label_subscribers.add(websocket)
        subscriber_count = len(label_subscribers)
    logger.info("Label subscriber connected (%d total)", subscriber_count)

    try:
        while True:
            await asyncio.sleep(30)
            try:
                await websocket.send_text(json.dumps({"type": "ping"}))
            except Exception:  # noqa: BLE001 — surfaced on next recv anyway
                break
    except WebSocketDisconnect:
        pass
    except Exception as exc:  # noqa: BLE001
        logger.warning("Label subscriber errored: %s", exc)
    finally:
        async with label_subscribers_lock:
            label_subscribers.discard(websocket)
            remaining = len(label_subscribers)
        logger.info(
            "Label subscriber disconnected (%d remaining)", remaining
        )


async def _broadcast_label(payload: dict) -> None:
    """Send a label JSON to every connected subscriber.

    Dead sockets are evicted lazily. Sending happens concurrently per
    subscriber so a slow consumer cannot block fast ones.
    """
    async with label_subscribers_lock:
        subscribers = list(label_subscribers)

    if not subscribers:
        return

    encoded = json.dumps(payload)

    async def _send(ws: WebSocket) -> WebSocket | None:
        try:
            await ws.send_text(encoded)
            return None
        except Exception:  # noqa: BLE001
            return ws

    results = await asyncio.gather(
        *(_send(ws) for ws in subscribers), return_exceptions=False
    )

    dead = [ws for ws in results if ws is not None]
    if dead:
        async with label_subscribers_lock:
            for ws in dead:
                label_subscribers.discard(ws)


# ── entrypoint ───────────────────────────────────────────────────────────


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",  # noqa: S104 — sidecar binds to 0.0.0.0 by design
        port=int(os.environ.get("PORT", "8000")),
        log_level=os.environ.get("LOG_LEVEL", "info").lower(),
    )
