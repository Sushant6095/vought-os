---
title: MOC · Architecture
type: reference
last_updated: 2026-05-26
---

# Architecture MOC

> Every service, every data flow, every latency target. Read [[System Diagram]] first.

## The voice loop (the entire product)

```
mic → ElevenLabs STT → Echo Engine → LLM (stream) → ElevenLabs TTS → AirPods
       ↑                    ↓
       └── diart sidecar ───┘ (speaker labels, gates LLM)
```

## Services

- [[Echo Engine]] — Node.js, owns Speech Engine attach, persona system, RAG, memory
- [[Diarization Sidecar]] — Python FastAPI, owns diart speaker labeling
- ElevenLabs Speech Engine — managed, owns STT + TTS + WebRTC + voice cloning

## Data stores

- Postgres + pgvector — users, voice IDs, personas, playbook chunks
- Redis — live session state, conversation memory window
- S3 — opt-in transcript storage (V2)

## Latency

- [[Latency Budget]] — sub-1-second end-to-end target broken down
- Target p50 end-of-turn → audio-in-ear: ≤ 900ms
- Target p95: ≤ 1400ms
- Interruption cancellation: ≤ 200ms

## Integrations

- ElevenLabs Speech Engine — WebRTC + TTS + STT + voice cloning
- OpenAI gpt-4o-mini (default) — streaming LLM
- Anthropic Claude Haiku (alt) — streaming LLM
- Twilio (V2) — phone bridge for Receptionist + Copilot
- Salesforce / HubSpot (V2) — CRM context fetch + activity log

## Hosting plan

- Vercel — Next.js apps (apps/web, apps/app, apps/teams)
- Railway — Echo Engine (Node.js)
- Modal — Diarization sidecar (Python, needs GPU in prod)
- Supabase / Neon — Postgres + pgvector
- Upstash — Redis

See `BLUEPRINT.md` for full architectural detail.
