---
title: Echo Engine
type: spec
status: in-progress
last_updated: 2026-05-26
---

# Echo Engine

> The Node.js orchestrator. Vought's brain.

## Responsibilities

1. **Attach to ElevenLabs Speech Engine** — register a WebSocket handler that ElevenLabs calls into when transcripts arrive.
2. **Subscribe to diarization sidecar** — maintain an in-memory map of speaker labels per session.
3. **Gate the LLM** — only fire when the most recent speaker label is `is_self: false`.
4. **Assemble the prompt** — persona system prompt + conversation memory (last 20 turns from Redis) + (for Vox) playbook RAG chunks (top-k from pgvector).
5. **Stream the LLM** — OpenAI gpt-4o-mini default, Claude Haiku alternate. Pass `AbortSignal` from Speech Engine into the LLM call so interruptions cancel cleanly.
6. **Forward tokens to ElevenLabs TTS** — via `session.sendResponse(stream)`. ElevenLabs handles voice rendering and playback to the browser.
7. **Manage memory** — write each user turn to Redis after the response completes. TTL the session on close.

## File layout

```
services/echo-engine/
├── package.json
├── tsconfig.json
├── .env.example
├── src/
│   ├── server.ts                ← main entry, attach to Speech Engine
│   ├── orchestrator.ts          ← prompt assembly (pure)
│   ├── personas/index.ts        ← 11-persona registry
│   ├── memory.ts                ← Redis sliding window
│   ├── rag.ts                   ← pgvector top-k search
│   ├── voice-clone.ts           ← ElevenLabs voice cloning wrapper
│   ├── speaker-gate.ts          ← diart sidecar subscription
│   └── speech-engine-setup.ts   ← create/update SE resource
└── scripts/
    ├── create-engine.ts         ← one-time setup
    └── clone-voice.ts           ← CLI voice clone tool
```

## Hot paths

- `POST /api/turn` — receives transcript from Speech Engine, runs the full pipeline, streams text back as Server-Sent Events.
- `POST /api/voice-clone` — accepts 30s audio, calls ElevenLabs cloning API, stores voice_id.
- `WS /labels` (outbound) — Echo Engine connects to diart sidecar's labels endpoint.

## Failure modes

- **ElevenLabs API down** — surface to client via state pill ("Disconnected"), no fallback.
- **OpenAI API down** — automatic failover to Claude Haiku within 200ms.
- **Diarization sidecar down** — Echo Engine fires LLM on every transcript (degraded mode — no speaker gating).
- **Redis down** — falls back to in-memory map (single instance, OK for dev, not for prod).
- **Postgres down** — playbook RAG disabled, persona prompts continue without playbook context.

## Patterns and pitfalls

### Patterns we landed on (Wave 1)

- **Pure orchestrator.** Prompt assembly lives in `src/orchestrator.ts` and
  takes no I/O. Persona + memory + RAG + transcript → `{ system, messages,
  userMessages }`. Easy to unit-test without infra.
- **Parallel pre-LLM I/O.** `getRecentTurns()` and `fetchPlaybookContext()`
  run via `Promise.all` so we don't serialize the two reads that block
  prompt assembly.
- **AbortSignal threading.** Both OpenAI (`{ signal }` second arg) and
  Anthropic (`{ signal }` second arg on `messages.stream`) take the same
  `AbortSignal` the ElevenLabs SDK gives us in `onTranscript`. Interruption
  cancels every downstream call cleanly.
- **Stream proxy for latency logging.** `instrumentStream()` wraps the LLM
  async-iterable, logs the first-token timestamp once, and otherwise yields
  unchanged so the ElevenLabs SDK consumes the same shape.
- **Soft-fail everywhere.** Redis down → in-memory fallback. Postgres down
  → RAG returns null and the persona prompt continues. Diart down → the
  speaker gate returns `true` (fire LLM). No single dependency takes the
  service down.
- **Structured logging via pino.** Every hot-path stage carries `sessionId`,
  `stage`, and where relevant `latencyMs`. Searchable, graphable.
- **Persona `$VARIABLE$` substitution.** Persona prompts can carry
  placeholders like `$TARGET_COMP$` or `$RESUME_HIGHLIGHTS$`. The orchestrator
  substitutes from `session.metadata.variables` at assembly time. Unknown
  placeholders fall back to `(unspecified)` so the LLM never sees raw `$KEY$`.

### Pitfalls to avoid

- **Don't await RAG and memory sequentially.** Even fast pgvector + redis
  queries serially eat 60-100ms; in parallel they're 30-50ms.
- **Don't log inside the iterator's hot loop.** `instrumentStream` only
  logs once on `firstSeen` — every-token logging tanks throughput.
- **Don't cache labels across sessions.** The speaker gate keys by
  `sessionId` and clears on `onClose` — anything else risks a self-voice
  signal leaking into a fresh session.
- **Don't trust stale diart labels.** The gate ignores labels older than
  5s; if the sidecar is wedged we'd rather fire than freeze.
- **Don't pin the ElevenLabs SDK shape for voice cloning.** Use the raw
  HTTP `/v1/voices/add` multipart POST — the SDK reshuffles this between
  minor versions.

## Hot-path observability

Search logs by `stage`:

| Stage | What it means |
|---|---|
| `transcript_received` | Speech Engine pushed a new transcript |
| `speaker_gate_pass` | Other person was last to speak — fire LLM |
| `speaker_gate_skip` | We just spoke — suppress LLM |
| `llm_fire` | LLM call dispatched, carries `prepMs` |
| `llm_first_token` | First token from the LLM, carries `latencyMs` since fire |
| `llm_done` | Full turn finished, carries `totalMs` since transcript_received |
| `llm_abort` | User interrupted, AbortSignal fired |
| `rag_hit` / `rag_miss` | pgvector returned chunks (or didn't) |
| `voice_clone_start` / `voice_clone_done` | Voice cloning lifecycle |

## See also

- [[System Diagram]] — where this fits
- [[Latency Budget]] — what we owe
- [[ADR-002 · Single accent color]] — design constraint affecting the source attribution UI
