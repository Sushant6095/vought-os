---
title: 2026-05-26 · wave-1-summary
type: session
agent: orchestrator
wave: 1
verdict: green
---

# 2026-05-26 · wave-1-summary

Foundations wave. Three agents dispatched in parallel, each owning a disjoint directory: design tokens + motion library + layout primitives, the Node.js Echo Engine, and the Python diarization sidecar. Zero scope collisions. All three self-reported green and the per-agent acceptance checklists hold up against the code they wrote.

## Attempted

Spawn wave 1 per `prompts/build/orchestrator-master.prompt.md`:

1. **design-system-architect** → `packages/design-system/` + `packages/motion/` + `packages/ui/src/primitives/`
2. **echo-engine-engineer** → `services/echo-engine/`
3. **diarization-engineer** → `services/diarization-sidecar/`

Dispatched as three concurrent `Agent` calls in a single response. Each agent was handed the verbatim contents of its `prompts/build/wave-1/*.prompt.md` brief plus today's date.

## Produced

### Design system foundation (green)

- `packages/design-system/` — `src/tokens.ts` (17 colors, 14 type tokens, full spacing/radius/shadow/motion/easing scales), `tailwind.config.ts` (zero raw values), `src/global.css` (font-face + breath wiring + reduced-motion overrides), `package.json`, `tsconfig.json`, `src/index.ts`.
- `packages/motion/` — `breath.ts` (single shared rAF writing `--breath-phase` to `:root`, reference-counted), `bloom.ts` (320ms 0.96→1.02→1 overshoot), `word-stream.tsx` (80ms stagger, `aria-live="polite"`), `thinking-dots.tsx` (140ms stagger, 1200ms loop), `index.ts` re-exports `MOTION` / `EASING` / `SPRING`.
- `packages/ui/src/primitives/` — `Container`, `Section`, `Stack`, `Cluster`, `Grid` + `GridItem` (span types exclude the forbidden 5/7/11), `Spacer`. All ref-forwarded. Minimal `packages/ui/package.json` added to make primitives importable.

Session log: `vault/80 · Sessions/2026-05-26-design-system-architect.md`.

### Echo Engine (green)

Extended the existing scaffold to production quality. Touched only `services/echo-engine/`.

- Created: `src/log.ts` (pino), `src/orchestrator.ts` (pure prompt assembly), `src/speaker-gate.ts` (WS to diart sidecar, per-session cache, 5s staleness guard, reconnect backoff), `src/voice-clone.ts` (multipart against `/v1/voices/add` + user→voice map), `scripts/clone-voice.ts` (CLI).
- Rewrote: `src/server.ts` (Speech Engine attach, AbortSignal threading, first-token latency instrumentation, `/health` + `/personas` endpoints, graceful SIGTERM), `src/memory.ts` (spec API on Redis with 1h TTL + in-memory fallback), `src/rag.ts` (pgvector top-k with hard 400ms embed / 250ms query timeouts), `src/personas/index.ts` (added `validatePersonas()` + `PERSONA_IDS`).
- Verified unchanged: `scripts/create-engine.ts` (`eleven_flash_v2`, `turnTimeout: 2`, `optimizeStreamingLatency: 3`, `zeroRetentionMode: true`, `firstMessage: false`).
- Bonus: vault arch doc `vault/30 · Architecture/Echo Engine.md` updated with patterns + pitfalls + hot-path observability.

Session log: `vault/80 · Sessions/2026-05-26-echo-engine-engineer.md`.

### Diarization sidecar (green)

Rewrote the FastAPI sidecar. Touched only `services/diarization-sidecar/`.

- Rewrote `main.py` (FastAPI lifespan, three endpoints, per-session pipelines, asyncio-locked subscriber maps, concurrent broadcast with dead-socket eviction).
- New: `pipeline.py` (`DiarizationPipeline` wrapping diart 0.9 `SpeakerDiarization` + `_PushableSource` adapter for the WS-driven RxPy subject; immutable `SpeakerLabel` dataclass with `to_wire_dict()` matching `speaker-gate.ts`).
- New: `enrollment.py` (`SelfVoiceEnrollment` — accumulates per-speaker speech-seconds during the 5s window and locks the *dominant* speaker, not first-seen).
- New: `Dockerfile` (two-stage build, BuildKit secret for HF token, pyannote weights baked in via `scripts/prewarm_model.py`).
- New: `requirements.txt` with explicit `rx==3.2.0` pin, `README.md` with HF license walkthrough.
- ADR: `vault/70 · Decisions/ADR-003 · diart 0.9 API surface.md` documenting the 0.9 API surface (it differs from the older docs that reference `OnlineSpeakerDiarization`).

Session log: `vault/80 · Sessions/2026-05-26-diarization-engineer.md`.

## Wire-format cross-check

Diart sidecar `to_wire_dict()` emits camelCase keys `sessionId` / `tStart` / `tEnd` / `speakerId` / `isSelf` / `confidence`. Echo Engine `services/echo-engine/src/speaker-gate.ts` reads exactly those keys (and tolerates `tStart` as a forward-compat extra). The two services are wire-compatible without a translation layer. This was flagged as a risk by both agents and resolved at write-time.

## Decisions

1. **Breath is variable-driven, not per-component.** Single `rAF` writes `--breath-phase` to `:root`; surfaces interpolate via `color-mix`. Guarantees phase-sync. CSS-keyframe fallback gated by `data-breath="css"` for static pages.
2. **GridItem `span` enum forbids the forbidden spans (5/7/11).** Blueprint §7.2 invariant promoted to a type-level guarantee.
3. **RAG hard timeouts (400ms embed + 250ms query).** Anything slower violates the latency budget anyway — skip playbook context rather than make the user wait.
4. **Speaker-gate safe default: fire LLM.** If labels are stale (>5s) or absent, `lastSpeakerWasOther` returns `true`. A chatty demo beats a wedged one.
5. **Diart 0.9 API surface (ADR-003).** Pin to `SpeakerDiarization` + `SpeakerDiarizationConfig`. Older `OnlineSpeakerDiarization` docs are obsolete.
6. **Dominant-speaker enrollment, not first-seen.** More robust than "first label wins" when the user pauses before speaking.
7. **No database schema changes.** RAG reuses existing `playbook_chunks` with `metadata->>'persona'` filter.

## Open questions

- **Söhne license.** Blueprint references Söhne but no .woff2 files in repo. Inter is the working fallback; drop the licensed files into `apps/web/public/fonts/sohne/` and `apps/app/public/fonts/sohne/` when provisioned. No code change required.
- **`userVoiceMap` persistence.** In-memory for hackathon scope; should move to Redis to survive engine restarts before production.
- **ElevenLabs SDK `attach()` shape drift.** `instrumentStream` assumes the SDK accepts a plain `AsyncIterable`. Revisit if the SDK ships a breaking change before the demo.
- **Two acceptance items deferred to QA.** Diarization sidecar's 2-speaker accuracy and 5-concurrent-session latency targets need a recorded test rig + HF token to physically verify. Recipe is in the sidecar README.

## Acceptance criteria · wave-level

- [x] All three agents reported `verdict: green` in their per-agent session logs.
- [x] Per-agent acceptance checklists are individually green (with two diart items honestly marked deferred to a real test rig).
- [x] No scope collisions — each agent edited only its assigned directory (plus the vault notes called out in their briefs).
- [x] Wire format between sidecar and Echo Engine cross-checked and confirmed compatible.
- [x] One new ADR filed where API drift required a decision (`ADR-003`).
- [x] All three session logs are present in `vault/80 · Sessions/` and match the Session Template.

## Next steps

Wave 1 is green. Recommended next command: **`/vought-spawn-wave 2`** — landing page, live call screen, voice clone onboarding. The foundations all three of those agents consume are now in place:

- `landing-page-builder` will import `@vought/design-system/tailwind` as a Tailwind preset, mount `useBreathTimer()` in the marketing root, render scenes 0–12 from Blueprint §3.
- `live-call-builder` will wrap StatePill / SuggestionCard with `bloomVariants`, render transcript via `<WordStream>`, mount `<ThinkingDots>` during AI Thinking state, and consume the speaker-gate / suggestion-stream surfaces from the Echo Engine.
- `voice-clone-builder` will hit `services/echo-engine/scripts/clone-voice.ts` (or the equivalent HTTP surface) for the 30s capture flow.

Before wave 2, optionally run:

- `pnpm install` at the repo root to confirm the workspace resolves (no node_modules in this checkout; agents validated at the code level).
- A real-recording smoke test against the diart sidecar to convert the two deferred acceptance items from ⏳ to ✓.

Do **not** spawn wave 2 from this summary — return to the user.
