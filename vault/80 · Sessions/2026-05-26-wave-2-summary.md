---
title: 2026-05-26 · wave-2-summary
type: session
agent: orchestrator
wave: 2
verdict: green
---

# 2026-05-26 · wave-2-summary

Hero-surfaces wave. Three agents dispatched in parallel, each owning a disjoint app/route surface: the marketing landing page, the live call screen, and the voice clone onboarding + settings + API. Zero scope collisions. All three self-reported green against their acceptance checklists.

## Attempted

Spawn wave 2 per `prompts/build/orchestrator-master.prompt.md` and the wave-map in `/vought-spawn-wave`:

1. **landing-page-builder** → `apps/web/`
2. **live-call-builder** → `apps/app/app/live/`
3. **voice-clone-builder** → `apps/app/app/onboarding/voice/`, `apps/app/app/settings/voice/`, `apps/app/app/api/voice-clone/`

Dispatched as three concurrent `Agent` calls in a single response. Each agent was handed the verbatim contents of its `prompts/build/wave-2/*.prompt.md` brief, augmented with a wave-1-context block that catalogued the Wave-1 surfaces it consumes (packages it can import, backend endpoints, Tailwind class-name conventions, known caveats like Söhne fallback).

## Produced

### Landing page (green) — `apps/web/`

Full Next.js 15 (App Router) port of `mockups/vought-landing-cinematic.html`. All 12 scenes present.

- **Scaffold:** `package.json`, `tsconfig.json`, `next.config.mjs`, `postcss.config.mjs`, `tailwind.config.ts` (imports `@vought/design-system/tailwind` preset), `app/layout.tsx`, `app/page.tsx` (with `generateMetadata()` for canonical + OG), `app/globals.css` (layered on `@vought/design-system/global.css`).
- **Scene components (`components/marketing/`):** `Hero`, `CustomerLogos`, `PromiseSection`, `PillarCards` (Receptionist white / Copilot DARK + FLAGSHIP / Insights white), `LiveDemoBlock`, `ArchitectureDiagram`, `CustomerStory`, `TrustGrid`, `PricingTease`, `CTAStrip` (canvas-shift 480ms), `Footer`.
- **Nav (`components/nav/`):** `NavPill` (sticky glass capsule) + `MegaMenu` (120ms hover-open, 200ms close-grace, Esc + outside-click close).
- **Shared:** `MarketingRoot` (mounts `useBreathTimer()` + `useReveal()`), `CountUp`, 16-icon inline-SVG `Icon`, `useReveal`/`useCountUp` hooks.
- **Vault:** `vault/40 · Pages/Landing.md` (page spec + storyboard↔component map + deviations), `vault/80 · Sessions/2026-05-26-landing-page-builder.md`.

### Live call screen (green) — `apps/app/app/live/`

The hero. Full implementation of Blueprint §5, including the turn-timeline state machine from §5.7.

- **Routes:** `app/live/page.tsx` (mints uuid server-side and redirects to `/live/[sessionId]`), `app/live/[sessionId]/{page.tsx, layout.tsx}` (full-bleed layout, `useBreathTimer()` mounted in root).
- **Components (`_components/`):** `StatePill` (5 states with bloom on Whispering entry, ThinkingDots inline), `SuggestionCard` (bloom signature, low-confidence surface flip, action tiles, keyboard hints), `WordStreamTranscript` (wraps `<WordStream>` at 80ms stagger), `SpeakerTimeline` (proportional segments, 60s window), `ConfidenceIndicator`, `DealContextPanel` (Teams left rail), `SourceAttributionPanel` + `LatencyCallsign` (Teams right rail; latency callsign reused everywhere), `DisclosureFooter` (persistent privacy footer).
- **Hook:** `_hooks/useRealtimeSession.ts` — zustand store, all-immutable updates.
- **App workspace wired into the monorepo:** `apps/app/package.json` switched to workspace consumer of `@vought/{design-system,motion,ui}` plus zustand, port 3001; `tailwind.config.ts` + `postcss.config.mjs` + `next.config.mjs` (with `Permissions-Policy: microphone=(self)`) + `tsconfig.json`. `app/globals.css` imports the design-system globals.
- **API:** `app/api/token/route.ts` threads `personaId` + `userId` + `variables` into the Speech Engine `metadata` field the Echo Engine reads.
- **Vault:** `vault/40 · Pages/Live Call Screen.md`, `vault/80 · Sessions/2026-05-26-live-call-builder.md`.

### Voice clone (green) — onboarding + settings + API

- **Onboarding (`apps/app/app/onboarding/voice/`):** `page.tsx` (8-phase state machine: consent → ready → recording → stopped → processing → sample → done + error), `_hooks/useMicCapture.ts` (MediaRecorder + AnalyserNode, 60fps rAF amplitude → 32-bar Float32Array, full track cleanup, Blob never persists past `discard()`), `_components/{RecordButton, CountdownTimer, WaveformVisualizer, ConsentDisclosure, ProcessingState}.tsx`.
- **Settings (`apps/app/app/settings/voice/`):** `page.tsx` (hydrates from localStorage, redirects to onboarding if no voice), `_components/{VoiceSample, ReRecordButton, DeleteVoiceDialog}.tsx` — typed-`delete` confirmation with GET-must-404 verification.
- **API:** `app/api/voice-clone/route.ts` (POST: multipart ≤ 4MB → ElevenLabs `/v1/voices/add` → best-effort Speech Engine PATCH; DELETE with verification), `app/api/voice-clone/sample/route.ts` (streams `eleven_flash_v2_5` TTS for the "Hi, this is your voice" sample).
- **Vault:** `vault/40 · Pages/Voice Clone.md`, `vault/80 · Sessions/2026-05-26-voice-clone-builder.md`.

## Decisions

1. **Scene 8 ("Solutions") intentionally absent from the landing page.** The cinematic mockup jumps Scene 7 → 9; solutions live on `/solutions/*` pages, not inline.
2. **`GridItem` forbidden-span invariant respected via `span={12}` + responsive `lg:!col-span-N`.** Keeps the type-level constraint while supporting 7/5/4/8 layouts.
3. **No autoplaying audio on the live-demo block.** Visuals loop; "Tap to hear" is a dismissable overlay.
4. **Three documented Blueprint motion exceptions in the live screen:** 1500ms Listening pulse, 1800ms Whisper pulse, 200ms interruption fade. All cite Blueprint §5.3 / §5.7 directly. Documented in the live-call session log so the QA token audit allowlists them.
5. **`voice-clone` route proxies directly to ElevenLabs** (not through Echo Engine). Echo Engine Wave 1 shipped in-process voice-clone functions + a CLI but no HTTP surface. Request shape mirrors `services/echo-engine/src/voice-clone.ts` exactly so swap is a one-line URL change when Echo Engine ships the route. **Gap surfaced as a follow-up.**
6. **`voiceId` stored in `localStorage` for hackathon scope.** Production needs an authenticated user record + Echo Engine `userVoiceMap` migration to Redis (also flagged in Wave 1).
7. **Sample playback uses a dedicated `/api/voice-clone/sample` route** so the user hears "that's me" within 5s of clone completion. Production should whitelist sample texts to prevent generic-TTS abuse.
8. **Whisper-end signal is estimated** (`max(2000ms, chars * 55ms)`) rather than from an SDK callback that doesn't exist yet. Replace when SDK exposes it.
9. **Real waveform amplitude in the live screen is deferred to V2.** Would need an `AnalyserNode` tapped onto the ElevenLabs SDK output graph; faking it was rejected.

## Open questions

- **Echo Engine HTTP voice-clone surface.** Wave 1 shipped in-process functions only. The voice-clone API route proxies straight to ElevenLabs as the documented fallback. Decide whether to add the HTTP route to Echo Engine or accept the fallback for the hackathon.
- **Söhne license.** Still not provisioned. Inter is the working display fallback across both apps. Same status as Wave 1.
- **`userVoiceMap` persistence.** Still in-memory in the Echo Engine, `voiceId` in `localStorage` on the client. Both lose state across restarts.
- **AnalyserNode tap into the Speech Engine output graph** to drive a real waveform on the live screen (currently faked).
- **Whisper-end SDK callback** — currently estimated by character count + minimum.

## Acceptance criteria · wave-level

- [x] All three agents reported `verdict: green` in their per-agent session logs.
- [x] Per-agent acceptance checklists are individually green at the code level. Lighthouse / LCP / CLS / token-audit / motion-audit runs are deferred to the QA verifier wave because they require a running dev server (no `pnpm install` in this checkout yet).
- [x] No scope collisions — each agent edited only its assigned routes (plus vault notes called out in their briefs).
- [x] No re-implementations of signature motions in any product code — `bloomVariants`, `<WordStream>`, `<ThinkingDots>`, `useBreathTimer()` all imported from `@vought/motion`.
- [x] Zero raw color/spacing/duration violations reported by any agent against its own code.
- [x] All three session logs are present in `vault/80 · Sessions/` and match the Session Template.

## Next steps

Wave 2 is green. Recommended next command: **`/vought-spawn-wave 3`** — the QA verification wave (single agent: `qa-verifier`). Specifically it will:

- Run `/vought-verify-tokens` across both apps to confirm zero raw token violations.
- Run `/vought-motion-audit` across both apps to confirm only the three documented Blueprint exceptions in the live screen.
- Run Lighthouse against landing + live screen, validating Perf ≥ 95 (landing) / ≥ 90 (live) and LCP < 1.2s / CLS < 0.1.
- Cross-verify the deferred wave-1 diarization items (2-speaker accuracy, 5-concurrent-session latency) if HF token + recorded audio are available.
- Convert the two deferred diart criteria from ⏳ to ✓ or surface the gap.

Before wave 3, optionally:

- `pnpm install` at the repo root so the QA verifier can actually boot the apps.
- Resolve the **Echo Engine HTTP voice-clone surface** question — adding it before QA means the voice-clone route doesn't need the documented fallback caveat.

Do **not** spawn wave 3 from this summary — return to the user.
