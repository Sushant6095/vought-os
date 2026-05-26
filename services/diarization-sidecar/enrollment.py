"""
5-second self-voice enrollment.

The first 5 seconds of every session are treated as the user's own voice.
Whichever speaker label dominates those 5 seconds is *locked* as
`is_self: true` for the rest of the session. Everyone else is `is_self:
false`.

Why dominance instead of "first speaker we see"? diart sometimes emits a
short spurious segment before the user has fully settled — picking the
dominant speaker by total speech time over the window is more robust than
trusting the first label that arrives.

The enrollment state is immutable once locked. Re-enrolling requires a
fresh session.
"""

from __future__ import annotations

import logging
import threading
import time
from collections import defaultdict
from dataclasses import dataclass
from typing import Optional

from pipeline import SpeakerLabel

logger = logging.getLogger(__name__)

ENROLLMENT_WINDOW_SECONDS: float = 5.0


@dataclass(frozen=True)
class EnrollmentResult:
    """Snapshot of enrollment state. Immutable."""

    is_complete: bool
    self_speaker_id: Optional[str]


class SelfVoiceEnrollment:
    """Tracks the 5s enrollment window for a single session.

    Thread-safe. Called from the diart inference thread (for `observe`) and
    from the FastAPI request thread (for `decorate`).
    """

    def __init__(self, window_seconds: float = ENROLLMENT_WINDOW_SECONDS) -> None:
        self._window = window_seconds
        self._lock = threading.Lock()
        self._started_at: Optional[float] = None
        self._self_speaker_id: Optional[str] = None
        # speaker_id → total seconds observed during the window.
        self._speech_seconds: dict[str, float] = defaultdict(float)
        self._complete = False

    # ── observation ──────────────────────────────────────────────────

    def observe(self, label: SpeakerLabel) -> None:
        """Record a label during the enrollment window.

        Called for every label from the pipeline. After the window closes,
        the dominant speaker (most total speech time) is locked as self.
        """
        with self._lock:
            if self._complete:
                return

            now = time.monotonic()
            if self._started_at is None:
                self._started_at = now

            segment_seconds = max(0.0, label.t_end - label.t_start)
            self._speech_seconds[label.speaker_id] += segment_seconds

            if now - self._started_at >= self._window:
                self._lock_in_dominant_speaker_unlocked()

    def _lock_in_dominant_speaker_unlocked(self) -> None:
        """Caller must hold `_lock`."""
        if not self._speech_seconds:
            # No speech detected during enrollment — leave open until we
            # do see at least one segment.
            return
        dominant = max(self._speech_seconds.items(), key=lambda kv: kv[1])
        self._self_speaker_id = dominant[0]
        self._complete = True
        logger.info(
            "Enrollment locked: self_speaker=%s (%.2fs of speech)",
            dominant[0],
            dominant[1],
        )

    # ── decoration ───────────────────────────────────────────────────

    def decorate(self, label: SpeakerLabel) -> SpeakerLabel:
        """Return a new label with `is_self` set according to enrollment.

        Pure function from the caller's perspective — never mutates `label`.
        Before enrollment completes, all labels are `is_self: false` (safe
        default: the Echo Engine will still fire the LLM, which is the
        worse-but-safer error during the first 5 seconds).
        """
        with self._lock:
            if not self._complete or self._self_speaker_id is None:
                is_self = False
            else:
                is_self = label.speaker_id == self._self_speaker_id

        # Build a new immutable label rather than mutating the input.
        return SpeakerLabel(
            session_id=label.session_id,
            t_start=label.t_start,
            t_end=label.t_end,
            speaker_id=label.speaker_id,
            is_self=is_self,
            confidence=label.confidence,
        )

    # ── inspection ───────────────────────────────────────────────────

    def snapshot(self) -> EnrollmentResult:
        with self._lock:
            return EnrollmentResult(
                is_complete=self._complete,
                self_speaker_id=self._self_speaker_id,
            )
