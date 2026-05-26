---
title: Live Call Screen
type: spec
status: in-progress
last_updated: 2026-05-26
url: /live/[sessionId]
related: [[Echo Engine]] [[Diarization Sidecar]] [[Latency Budget]]
---

# Live Call Screen

## Purpose

The hero surface of the entire product. Every other screen exists to set this one up. The operator is in a live call with another human, has one earbud in, and glances at this screen for help between sentences. Cognitive load is high — every element must be legible in 0.4 seconds.

## Audience

- **Personal users** — high-stakes consumer moments (first dates, hard conversations, interviews). Single-column layout. No deal context, no source attribution.
- **Teams users** — revenue teams on a live sales call. Three-column layout with deal context on the left and source attribution + latency on the right.

## Emotional goal

The screen must feel *alive*, *trusted*, and *quiet*. Alive — the breath animation, the pill state changes, the word stream. Trusted — the disclosure footer, the source attribution, the latency callsign. Quiet — no toast notifications, no chatbot avatar, no decorative motion. The AI shows up only when it has something to say.

## Layout

Three-column grid for Teams (`240px / 720px / 240px`); single 720px column for Personal. Centered within an `app` container (max 1680px, 32px gutters). Full-bleed canvas — no top bar, no sidebar. Per Blueprint §5.2.

```
┌────────────────────────────────────────────────────────────────┐
│   ┌─ DEAL CONTEXT  ─┐ ┌─ HERO COLUMN ─────────┐ ┌─ SOURCE ──┐ │
│   │  (Teams only)   │ │  state pill · clock   │ │ ATTRIB.   │ │
│   │                 │ │  they just said       │ │ playbook  │ │
│   │  Company tile   │ │  SUGGESTION CARD      │ │ metric    │ │
│   │  Last touch     │ │  confidence (Teams)   │ │ latency   │ │
│   │  Buying signals │ │  speaker timeline     │ │           │ │
│   │  Sentiment      │ │  End session          │ │           │ │
│   │                 │ │  disclosure footer    │ │           │ │
│   └─────────────────┘ └───────────────────────┘ └───────────┘ │
└────────────────────────────────────────────────────────────────┘
```

## Components used

All in `apps/app/app/live/[sessionId]/`:

- `page.tsx` — orchestrator
- `layout.tsx` — full-bleed shell, breath timer mount
- `_components/StatePill.tsx`
- `_components/SuggestionCard.tsx`
- `_components/WordStreamTranscript.tsx`
- `_components/SpeakerTimeline.tsx`
- `_components/ConfidenceIndicator.tsx`
- `_components/DealContextPanel.tsx`
- `_components/SourceAttributionPanel.tsx` (includes `LatencyCallsign`)
- `_components/DisclosureFooter.tsx`
- `_hooks/useRealtimeSession.ts`

Library imports:

- `@vought/motion` — `useBreathTimer`, `bloomVariants`, `WordStream`, `ThinkingDots`, `MOTION`
- `@vought/ui` — `Container`
- `@vought/design-system` — tokens via Tailwind preset; CSS custom properties via `global.css`

## Tokens used

- Color · `canvas/dark`, `accent/amber`, `live/emerald`, `info/azure`, `text/primary-dark`, `text/secondary-dark`, `text/muted-dark`, `hairline/dark`
- Type · `label/xs` (10px eyebrows), `label/sm` (11px secondary), `text/xs` (12px), `text/sm` (14px), one literal 28px on the suggestion line (approved per audit scale)
- Spacing · 4-grid throughout; rail width 240px; hero column max 720px; outer container `app` (1680px max)
- Radius · `xl` (20px) for suggestion card and panels — Blueprint §5.3.3
- Motion · `motion/instant` 80ms for hover transitions; `motion/quick` 150ms for focus; `motion/standard` 240ms for segment background changes; `motion/deliberate` 360ms reserved (not currently used here); Bloom is 320ms via `bloomVariants`; **deviations**: 200ms interruption fade, 1500ms listening pulse, 1800ms whisper pulse — all Blueprint-mandated, kept literal

## Interactions

| Gesture | Response | Token |
|---|---|---|
| Page navigation to `/live/[id]` | Mic prompt → token fetch → SE attach + diart sidechannel | n/a |
| Other speaker finishes turn | Pill → Thinking with `<ThinkingDots />` | motion/instant |
| First TTS byte arrives | Pill blooms to Whispering; Suggestion card blooms | bloom (320ms) |
| Suggestion text streams | Word stream renders at 80ms per word | motion/instant |
| User speaks mid-whisper | Suggestion fades to 60% opacity, audio mutes, pill → Listening | 200ms (Blueprint §5.3.8) |
| `←` / `→` | Cycle suggestion alternatives | n/a |
| `R` | Regenerate active suggestion | n/a |
| `⏎` | Mark suggestion Used | n/a |
| `Cmd+.` | Toggle focus mode (hides flanking panels) | n/a |
| `Esc` | End session, route home | n/a |
| Unplug headphones | Pill → Paused (reason: "connect headphones"); banner appears; audio muted | n/a |
| Plug in headphones | Pill → Listening; volume restored | n/a |

## States

| State | Visual |
|---|---|
| Idle | Neutral grey pill dot, no animation, "Idle" label |
| Connecting | Amber pulse dot, "Connecting" label |
| Listening | Emerald pulse dot (1.5s), "Listening · Persona" label, breath active |
| Listening (calibrating) | Same as Listening but placeholder text reads "Vought is calibrating" while the 5s diart enrollment window elapses |
| Thinking | Amber pulse dot + ThinkingDots inline, "Thinking" label |
| Whispering | Amber background pill (bloom on entry), black dot, "Whispering in your ear" label, suggestion card visible |
| Paused | Neutral grey, "Paused · reason" label, audio muted |

Empty: suggestion area shows the "Vought is listening" placeholder.

Error: no explicit UI surface yet — `console.error` for SDK errors, the pill falls back to Idle. Future: surface a thin coral banner with retry.

## Acceptance criteria

- First paint of state pill, suggestion area, speaker timeline < 200ms after navigation (no lazy-loaded subtrees)
- Suggestion bloom: 0.96 → 1.02 → 1.0 scale, 320ms duration, exact `cubic-bezier(0.16, 1, 0.3, 1)` curve — sourced from `@vought/motion`
- Word stream cadence is driven by actual ASR token rate (no fake timing — `<WordStream text={…} />` reads the text we feed it)
- Listening → Thinking transition < 50ms after user-source message arrives
- Thinking → Whispering transition < 100ms after first agent-source token
- Interruption fade fires within 200ms of self-speaker label
- `prefers-reduced-motion` degrades gracefully — bloom collapses to opacity-only via `bloomVariants`'s built-in honoring of the media query; breath rests at phase 0; word stream renders as plain text
- Keyboard navigation tab order: state pill → suggestion → cycle → regenerate → end session
- Lighthouse Performance ≥ 90 (deferred to qa-verifier)
- `/vought-verify-tokens apps/app/app/live/` — zero hex hardcodes, zero off-scale type sizes
- `/vought-motion-audit apps/app/app/live/` — only three documented Blueprint-mandated motion literals (200ms, 1500ms, 1800ms)

## Open questions

- Real waveform amplitude requires tapping the ElevenLabs SDK's audio output graph (`AnalyserNode`). Punted to V2.
- `setVolume({ volume })` API shape on `useConversation` — verify on first integration. Wrapped in try/catch for soft-fail.
- Whisper-end signal — currently a length estimate; replace with SDK callback when available.
