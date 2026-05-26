---
title: System Diagram
type: spec
status: locked
last_updated: 2026-05-26
---

# System Diagram

> The whole stack on one page. Refer back to this when wiring anything new.

## Macro view

```
       ┌──────────────────────────────────────────────────────┐
       │                  USER'S DEVICE                       │
       │                                                      │
       │   AirPods  ◄────────►   Next.js client (apps/app)   │
       │                              │                       │
       └──────────────────────────────┼───────────────────────┘
                                      │ WebRTC (audio)
                                      ▼
                ┌─────────────────────────────────────┐
                │   ELEVENLABS SPEECH ENGINE          │
                │   - STT (streaming)                 │
                │   - TTS (Flash v2, cloned voice)    │
                │   - Turn detection                  │
                │   - Interruption handling           │
                └─────────────────────────────────────┘
                                      │ WebSocket (transcripts)
                                      ▼
            ┌────────────────────────────────────────┐
            │   ECHO ENGINE (services/echo-engine)   │
            │   Node.js · port 3001                  │
            │   - onTranscript handler               │
            │   - Speaker gate (gates LLM)           │
            │   - Persona prompt assembly            │
            │   - Memory window (Redis)              │
            │   - Playbook RAG (pgvector)            │
            │   - LLM streaming (OpenAI/Anthropic)   │
            │   - Forward to TTS via sendResponse    │
            └──────────┬────────┬────────┬───────────┘
                       │        │        │
              ┌────────▼─┐ ┌────▼──┐ ┌──▼──────────┐
              │  REDIS   │ │ PG    │ │   LLM       │
              │  session │ │ +pgv  │ │  (stream)   │
              │  memory  │ │       │ │             │
              └──────────┘ └───────┘ └─────────────┘

       Meanwhile, in parallel:

       ┌──────────────────────────────────────────────────────┐
       │   Same Next.js client streams raw PCM via WebSocket │
       │   to the diarization sidecar (parallel to ElevenLabs)│
       └──────────────────────────────────────────────────────┘
                                      │
                                      ▼
            ┌────────────────────────────────────────┐
            │   DIARIZATION SIDECAR                  │
            │   (services/diarization-sidecar)       │
            │   Python FastAPI · port 8000           │
            │   - diart speaker labeling             │
            │   - 5s self-voice enrollment           │
            │   - WebSocket label broadcast          │
            └──────────┬─────────────────────────────┘
                       │ WebSocket /labels
                       ▼
                Echo Engine subscribes to labels,
                gates LLM firing on is_self == false
```

## Why this shape

The voice loop is fast because ElevenLabs handles the heavy parts (audio capture, STT, TTS, WebRTC) and we own the brain. The diarization sidecar runs in parallel — we don't wait on it for STT, we use its labels to gate the LLM.

The split between Echo Engine and diart sidecar is intentional: diart needs Python + pyannote-audio + maybe GPU. Echo Engine is Node.js with the LLM streaming. Separate processes, separate scaling profiles, deployable independently.

## See also

- [[Latency Budget]] — sub-1-second target by stage
- [[Echo Engine]] — Node.js orchestrator detail
- [[Diarization Sidecar]] — Python service detail
