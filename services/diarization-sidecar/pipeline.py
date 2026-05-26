"""
Diarization pipeline wrapper around `diart`.

We expose two surfaces to the rest of the sidecar:

  - `DiarizationPipeline`        — owns the diart pipeline and the rolling
                                   audio source for a single session.
  - `SpeakerLabel`               — the immutable event shape we emit.

The diart API has drifted a couple of times across versions. We isolate the
import + construction here so that if the upstream API moves, only this file
needs to change. See ADR-0002 if there is a deviation from the docs.

Latency target: 500ms rolling buffer @ 16kHz mono → speaker label emitted
within ~550ms of the audio frame (500ms buffer + ~50ms inference on CPU).

This module is pure and synchronous — it does no I/O of its own. The FastAPI
layer in `main.py` is responsible for receiving frames and broadcasting
labels. Keeping the boundary thin makes the pipeline easy to test.
"""

from __future__ import annotations

import logging
import threading
from dataclasses import dataclass
from typing import Callable, Optional

import numpy as np

logger = logging.getLogger(__name__)

SAMPLE_RATE: int = 16_000
ROLLING_BUFFER_SECONDS: float = 2.0
STEP_SECONDS: float = 0.5
LATENCY_SECONDS: float = 0.5


@dataclass(frozen=True)
class SpeakerLabel:
    """Immutable speaker label event emitted by the pipeline.

    Field names match the camelCase JSON shape consumed by the Echo Engine
    speaker-gate. Conversion happens in `to_wire_dict`.
    """

    session_id: str
    t_start: float
    t_end: float
    speaker_id: str
    is_self: bool
    confidence: float

    def to_wire_dict(self) -> dict:
        """Convert to the camelCase JSON shape the Echo Engine expects.

        Must stay in sync with `services/echo-engine/src/speaker-gate.ts`:
        `{ sessionId, tEnd, speakerId, isSelf, confidence }` (plus tStart
        which the gate ignores but the live UI uses).
        """
        return {
            "type": "speaker_label",
            "sessionId": self.session_id,
            "tStart": self.t_start,
            "tEnd": self.t_end,
            "speakerId": self.speaker_id,
            "isSelf": self.is_self,
            "confidence": self.confidence,
        }


LabelCallback = Callable[[SpeakerLabel], None]


class _PushableSource:
    """Streaming audio source that exposes a `push(frame)` method.

    diart consumes audio via a reactive (RxPy) `Subject`. We wrap that
    `Subject` so the FastAPI WebSocket handler can push int16 PCM frames
    in as they arrive, without caring about the reactive plumbing.
    """

    def __init__(self, uri: str) -> None:
        # Lazy import — keeps `import pipeline` cheap and lets the health
        # endpoint respond even if the heavy deps are missing.
        from rx.subject.subject import Subject

        self._subject = Subject()
        self.uri = uri
        self.sample_rate = SAMPLE_RATE

    def push(self, pcm_int16: np.ndarray) -> None:
        """Push a frame of int16 PCM @ 16kHz mono into the pipeline."""
        if pcm_int16.dtype != np.float32:
            audio = pcm_int16.astype(np.float32) / 32768.0
        else:
            audio = pcm_int16
        if audio.ndim == 1:
            audio = audio.reshape(1, -1)
        self._subject.on_next(audio)

    def close(self) -> None:
        try:
            self._subject.on_completed()
        except Exception:  # noqa: BLE001 — closing twice is fine
            pass

    # diart's StreamingInference iterates over the source.
    def __iter__(self):  # pragma: no cover — used by diart internals
        return self._subject.__iter__()


class DiarizationPipeline:
    """One diart pipeline per session.

    Holds the diart `SpeakerDiarization` model, a pushable audio source, and
    a background thread running `StreamingInference`. Emits `SpeakerLabel`
    events via the `on_label` callback.

    The pipeline is started lazily on the first `push_pcm` call so that
    sessions which never receive audio do not eat GPU memory.
    """

    def __init__(
        self,
        session_id: str,
        on_label: LabelCallback,
        hf_token: Optional[str] = None,
    ) -> None:
        self._session_id = session_id
        self._on_label = on_label
        self._hf_token = hf_token

        self._source: Optional[_PushableSource] = None
        self._inference = None
        self._thread: Optional[threading.Thread] = None
        self._started = False
        self._closed = False
        self._lock = threading.Lock()

    # ── lifecycle ────────────────────────────────────────────────────

    def _ensure_started(self) -> None:
        """Construct the diart pipeline and start inference in a thread.

        Done lazily so we only pay the model-load cost when audio actually
        arrives. The first call blocks for ~3-5s on CPU.
        """
        with self._lock:
            if self._started or self._closed:
                return

            # Lazy import — heavy deps live behind here.
            try:
                from diart import (  # type: ignore[import-not-found]
                    SpeakerDiarization,
                    SpeakerDiarizationConfig,
                )
                from diart.inference import (  # type: ignore[import-not-found]
                    StreamingInference,
                )
            except Exception as exc:  # noqa: BLE001
                logger.error(
                    "Failed to import diart — diarization disabled: %s", exc
                )
                self._closed = True
                raise

            config = SpeakerDiarizationConfig(
                duration=ROLLING_BUFFER_SECONDS,
                step=STEP_SECONDS,
                latency=LATENCY_SECONDS,
                tau_active=0.5,
                rho_update=0.1,
                delta_new=1.0,
            )

            try:
                pipeline = SpeakerDiarization(config)
            except Exception as exc:  # noqa: BLE001
                # Most common failure: HF gate / missing model. Log loudly.
                logger.error(
                    "diart pipeline construction failed (HF gate? %s): %s",
                    "no" if self._hf_token else "yes — HF_TOKEN missing",
                    exc,
                )
                self._closed = True
                raise

            source = _PushableSource(uri=f"vought-session-{self._session_id}")
            inference = StreamingInference(
                pipeline=pipeline,
                source=source,
                do_profile=False,
                show_progress=False,
            )
            inference.attach_observers(self._handle_prediction)

            self._source = source
            self._inference = inference
            self._thread = threading.Thread(
                target=inference,
                name=f"diart-{self._session_id}",
                daemon=True,
            )
            self._thread.start()
            self._started = True
            logger.info(
                "Diart pipeline started for session %s", self._session_id
            )

    def close(self) -> None:
        with self._lock:
            if self._closed:
                return
            self._closed = True
            if self._source is not None:
                self._source.close()
        # join outside the lock so the worker thread can drain.
        if self._thread is not None:
            self._thread.join(timeout=2.0)
        logger.info(
            "Diart pipeline closed for session %s", self._session_id
        )

    # ── audio in ─────────────────────────────────────────────────────

    def push_pcm(self, pcm_int16: np.ndarray) -> None:
        """Push a raw int16 PCM frame into the pipeline."""
        if self._closed:
            return
        if not self._started:
            self._ensure_started()
        if self._source is not None:
            self._source.push(pcm_int16)

    # ── label out ────────────────────────────────────────────────────

    def _handle_prediction(self, value) -> None:
        """diart observer callback. Runs on the inference thread."""
        try:
            annotation, _waveform = value
        except (TypeError, ValueError):
            # Some diart versions deliver just the annotation.
            annotation = value

        if annotation is None:
            return

        try:
            tracks = annotation.itertracks(yield_label=True)
        except Exception as exc:  # noqa: BLE001
            logger.warning("Bad annotation from diart: %s", exc)
            return

        for segment, _track, speaker_id in tracks:
            label = SpeakerLabel(
                session_id=self._session_id,
                t_start=float(segment.start),
                t_end=float(segment.end),
                speaker_id=str(speaker_id),
                # is_self is decided by the enrollment layer, not here.
                is_self=False,
                # diart does not expose a per-segment confidence; the
                # constant matches the field the Echo Engine reads. If a
                # future diart version exposes one, swap it in here.
                confidence=0.9,
            )
            try:
                self._on_label(label)
            except Exception as exc:  # noqa: BLE001
                logger.exception("Label callback raised: %s", exc)
