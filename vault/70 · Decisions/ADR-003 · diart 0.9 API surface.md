---
title: ADR-003 · diart 0.9 API surface
type: adr
status: accepted
date: 2026-05-26
owner: diarization-engineer
---

# ADR-003 · diart 0.9 API surface

## Context

`vault/30 · Architecture/Diarization Sidecar.md` and several scaffolds
referenced the older diart API (`OnlineSpeakerDiarization`,
`StreamingInference(source=...)`, `RealtimeInference`). diart 0.9
replaced these with:

- `from diart import SpeakerDiarization, SpeakerDiarizationConfig`
- `from diart.inference import StreamingInference`
- `pipeline = SpeakerDiarization(config)`
- `StreamingInference(pipeline=pipeline, source=source, ...)`
- The audio source contract is "anything iterable that yields
  `(1, n)` float32 numpy arrays" plus a `sample_rate` attribute and a
  `uri`. Internally diart consumes via RxPy `Subject`, which is what we
  push into.

## Decision

The sidecar targets **diart 0.9.x** and isolates the import surface
inside `pipeline.py`. Specifically:

1. The pipeline construction (`SpeakerDiarization`,
   `SpeakerDiarizationConfig`, `StreamingInference`) is **lazy** — it
   runs on the first `push_pcm` for a session, not at import time. This
   keeps the `/health` endpoint cheap and lets the service boot even
   with no HF token.
2. The PCM source is a thin `_PushableSource` adapter around
   `rx.subject.Subject`. We push int16 → float32 normalization happens
   in one place.
3. diart's `attach_observers` callback shape is
   `(annotation, waveform)`. We unpack defensively (some versions
   delivered just the annotation) so a minor diart bump does not break
   the broadcast.
4. The `rx` dependency is **pinned explicitly** (`rx==3.2.0`) in
   `requirements.txt` even though diart pulls it transitively, so a
   diart sub-dependency floating to RxPy 4.x cannot silently break us.
5. Confidence is hard-coded at 0.9 because diart 0.9 does not expose a
   per-segment confidence. When upstream surfaces one, plumb it through
   `SpeakerLabel.confidence` and remove this note.

## Consequences

- If diart 1.x lands with a new API, only `pipeline.py` needs to
  change. `main.py`, `enrollment.py`, and the wire format stay stable.
- We carry the lazy-start cost on the first audio frame of each
  session (~2-3s on CPU to load the pyannote model the first time, ~0
  after that thanks to the HF cache).
- If a future diart removes RxPy in favor of asyncio iterators, the
  `_PushableSource` adapter becomes a thin async generator instead;
  the rest of the system is unaffected.

## Alternatives considered

- **Pin to diart 0.7 and ride the older API.** Rejected — diart 0.7
  has a worse memory profile under load and a known race in
  `RealtimeInference`'s observer chain.
- **Run pyannote directly without diart.** Rejected — diart already
  ships the rolling-window streaming wrapper. Reinventing it costs us
  the latency budget.
- **Use a CRDT-style consensus on enrollment instead of dominance.**
  Overkill for 5s of audio. Stick with "dominant speaker wins" until a
  failure mode justifies more.

## See also

- `services/diarization-sidecar/pipeline.py`
- `vault/30 · Architecture/Diarization Sidecar.md`
