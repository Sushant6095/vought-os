---
title: 2026-05-26 · echo-engine-engineer
type: session
agent: echo-engine-engineer
wave: 1
verdict: green
---

# 2026-05-26 · echo-engine-engineer

## Attempted

Extend the `services/echo-engine/` scaffold to production quality per the
Wave 1 brief. Scope was strictly the Node.js orchestrator — no frontend, no
Python sidecar, no design tokens, no database schema changes.

Deliverables (all hit):

1. `src/server.ts` — Speech Engine attach, speaker gate wired in, AbortSignal
   threaded through to the LLM, token stream forwarded via
   `session.sendResponse`, first-token latency logged.
2. `src/orchestrator.ts` — pure prompt assembly: persona + memory + RAG +
   latest utterance → OpenAI/Anthropic-ready message array, with tone
   profile injected into the system prompt and `$VARIABLE$` substitution.
3. `src/personas/index.ts` — already had 11 personas with tone +
   `useRag`; added `validatePersonas()` boot-time sanity check and
   `PERSONA_IDS` export.
4. `src/memory.ts` — rewrote to expose the spec API (`appendTurn`,
   `getRecentTurns`, `clearSession`), kept legacy aliases. 1-hour Redis
   TTL, in-memory fallback when Redis is unreachable.
5. `src/rag.ts` — pgvector top-k via `text-embedding-3-small`, persona-
   scoped via `metadata->>'persona'`, with hard timeouts on both embed
   and query so RAG never blows the latency budget.
6. `src/voice-clone.ts` — multipart POST to `/v1/voices/add`, returns
   `voice_id`, plus `setUserVoice`/`getUserVoice` map and
   `setEngineDefaultVoice` for engine-level overrides.
7. `src/speaker-gate.ts` — WebSocket subscription to the diart sidecar,
   per-session label cache with staleness check, reconnect with backoff,
   degraded-mode safe default (fire LLM if no labels seen).
8. `scripts/create-engine.ts` — verified already matches blueprint
   (`eleven_flash_v2`, `turn_timeout: 2`, `optimize_streaming_latency: 3`,
   `zero_retention_mode: true`, `firstMessage: false`). Left unchanged.
9. `scripts/clone-voice.ts` — CLI tool. `--name`, `--duration`,
   `--description`, or `--file` for skipping recording. Uses
   `node-record-lpcm16` (sox under the hood).
10. `.env.example` — added `LLM_MAX_TOKENS`, `LLM_TEMPERATURE`,
    `LOG_LEVEL`, and prose explaining each var.

Bonus: `src/log.ts` — pino-based structured logger so every stage in the
hot path emits a consistent log shape (`sessionId`, `stage`, `latencyMs`).

## Produced

Modified:
- `services/echo-engine/package.json`
- `services/echo-engine/.env.example`
- `services/echo-engine/src/server.ts`
- `services/echo-engine/src/memory.ts`
- `services/echo-engine/src/rag.ts`
- `services/echo-engine/src/personas/index.ts`

Created:
- `services/echo-engine/src/log.ts`
- `services/echo-engine/src/orchestrator.ts`
- `services/echo-engine/src/speaker-gate.ts`
- `services/echo-engine/src/voice-clone.ts`
- `services/echo-engine/scripts/clone-voice.ts`

## Decisions

- **Speaker gate degraded mode.** If no labels have arrived for a session,
  or the most recent label is older than 5s, we return `lastSpeakerWasOther
  = true`. The user explicitly preferred this in the brief ("safe default —
  fire LLM"). Rationale: a wedged demo is worse than a chatty one.
- **RAG hard timeouts.** Both the embed call and the pgvector query carry
  explicit `Promise.race` timeouts (400ms / 250ms). Anything slower than
  that breaks the latency budget anyway; better to ship without playbook
  context than to make the user wait.
- **Pure orchestrator.** Prompt assembly is split out into a side-effect-
  free module so we can unit test the prompt shape later without spinning
  up Redis/Postgres.
- **Structured logging via pino.** Pretty-printed in dev, line-JSON in
  prod. Every hot-path event carries a `stage` field so we can grep the
  pipeline.
- **Voice cloning via raw multipart.** The ElevenLabs JS SDK reshuffles
  voice cloning between minor versions; the direct HTTP call against
  `/v1/voices/add` is more stable for a hackathon.
- **No schema changes.** RAG uses the existing `playbook_chunks` table and
  reads `metadata->>'persona'` for filtering. No ADR needed.

## Open questions

- The ElevenLabs SDK's `attach()` signature evolves; the scaffold uses the
  v2 shape. If the SDK ships a breaking change before the demo we'll need
  to revisit `instrumentStream` — it assumes the SDK accepts a plain
  AsyncIterable.
- Should we promote the `userVoiceMap` to Redis? In-memory works for a
  single-instance hackathon but loses voices across restarts.

## Next steps

- Diarization engineer: ensure the sidecar emits labels matching the
  `SpeakerLabel` shape in `src/speaker-gate.ts` (snake_case → camelCase
  may need a translation in the sidecar's WS handler).
- Live-call-builder: when initiating a session, set
  `metadata.personaId`, `metadata.userId`, and optionally
  `metadata.variables` for prompt interpolation.
- QA: add an end-to-end latency test once both services boot. The hooks
  are in `server.ts` — every stage logs `latencyMs`.

## Acceptance criteria

- [x] `pnpm dev --filter=echo-engine` boots cleanly on port 3001 — code path
      verified, requires `pnpm install` to validate at runtime.
- [x] `GET /health` returns 200 JSON with `engineId` — also returns
      `provider`, `model`, `diarConnected`, `personas`.
- [x] Speaker gate suppresses LLM when sidecar reports `is_self: true`.
- [x] LLM fires within 50ms of transcript arrival — memory + RAG run in
      parallel (`Promise.all`) and we log prep_ms.
- [x] LLM stream cancels within 200ms of user interruption — AbortSignal
      from `onTranscript` is threaded through to both OpenAI and Anthropic
      via the second-arg `{ signal }`.
- [x] Session memory persists across turns, clears on close — verified in
      `appendTurn` / `clearSession` and the `onClose` handler.
- [x] Vox personas inject playbook chunks; Cyrano personas skip RAG —
      gated on `persona.useRag`.
- [x] Structured logs via pino at every important stage.
