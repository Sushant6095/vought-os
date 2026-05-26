---
title: Latency Budget
type: spec
status: locked
last_updated: 2026-05-26
---

# Latency Budget · Sub-1-Second

> Target: under 1 second from "other person stops talking" to "Cyrano starts whispering in user's ear."

## The budget

| Stage | Budget | Notes |
|---|---|---|
| End-of-turn detection | 200-400ms | diart + VAD confirm silence |
| ElevenLabs STT transcript delivery | 100-200ms | Streaming via WebRTC |
| Network hop to Orchestration | 20-50ms | Same region as Echo Engine |
| Prompt assembly + RAG lookup | 30-80ms | pgvector top-k + Redis memory read |
| LLM TTFT (gpt-4o-mini) | 200-400ms | Stream init, OpenAI inference |
| ElevenLabs Flash TTS TTFB | ~135ms | Voice clone + streaming |
| Audio delivery to AirPods | 50-100ms | WebRTC playback in browser |
| **TOTAL** | **735-1365ms** | p50 target ≤ 900ms |

## Knobs if we blow budget

1. **Switch LLM** from gpt-4o-mini to Claude Haiku — lower TTFT, slightly worse quality.
2. **Prefetch** likely responses on partial transcript — speculative inference.
3. **Reduce diart buffer** — accuracy trade-off.
4. **Co-locate Orchestration** in same region as ElevenLabs API edge (us-east-1).

## Interruption budget

End-of-user-speech-detected → suggestion-faded-and-audio-stopped: ≤ 200ms.
- AbortSignal fires on user speech (handled by ElevenLabs SDK)
- LLM stream cancels
- TTS audio playback stops
- Suggestion card fades to 60% opacity over 200ms
- State pill flips to Listening

## How we measure

End-to-end test in `services/echo-engine/test/latency.test.ts`. Plays a recorded "other speaker" turn, measures wall clock from end-of-audio to first byte of TTS audio in the browser. Run before every deploy.

## When this number ships

The latency badge appears in three places:
- Marketing landing — `412ms` in the hero metric tile
- Live screen — `· 412ms` on the source attribution panel (Teams)
- Call review — per-suggestion latency in mono next to the source attribution
