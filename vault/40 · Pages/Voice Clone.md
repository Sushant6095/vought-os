---
title: Voice Clone
type: spec
status: in-progress
last_updated: 2026-05-26
url: /onboarding/voice + /settings/voice
related: [[Brand Voice]] [[Three-Act Narrative]] [[Echo Engine]]
---

# Voice Clone

## Purpose

Capture thirty seconds of the user's voice, mint an ElevenLabs `voice_id`,
and hot-swap it into the Speech Engine TTS so every subsequent whisper
sounds like the user themselves. The wow moment.

## Audience

First-time users (onboarding) and returning users managing their existing
profile (settings). Cognitive state in onboarding: skeptical, curious,
mildly anxious. We must lower their cortisol, not raise it.

## Emotional goal

Onboarding · *a flutter of disbelief during the voice clone — that actually
sounds like me.* Settings · *quiet trust — my voice is mine, I control it.*

## Surfaces

### `/onboarding/voice` — first capture

Implementation: `apps/app/app/onboarding/voice/`

State machine:

```
consent → ready → recording → stopped → processing → sample → done
                                                      ↑
                                                   re-record loop
```

Sections (top-to-bottom):

1. Header — step indicator, declarative headline, brief subtitle
2. Brand passage card — the text to read aloud
3. Phase surface (one of):
   - Consent + record button (idle)
   - Waveform + record button + countdown (recording)
   - Waveform stilled + re-record/clone CTAs (stopped)
   - ThinkingDots + "Cloning your voice" (processing)
   - Play sample button + accept/re-record (sample)
4. Footer — "Audio held in browser memory until submit"

### `/settings/voice` — manage

Implementation: `apps/app/app/settings/voice/`

Sections:

1. Header — back link, "Voice" eyebrow
2. Headline — "Your voice"
3. Current sample player
4. Voice ID readout (mono, for debugging + transparency)
5. Privacy disclosure
6. Actions — Re-record + Delete (destructive, typed-confirmation modal)

If no voice exists → redirect to `/onboarding/voice`. We never show an
empty state on this page; the cloned voice is the product's promise.

## Components used

- `apps/app/app/onboarding/voice/_components/RecordButton.tsx`
- `apps/app/app/onboarding/voice/_components/CountdownTimer.tsx`
- `apps/app/app/onboarding/voice/_components/WaveformVisualizer.tsx`
- `apps/app/app/onboarding/voice/_components/ConsentDisclosure.tsx`
- `apps/app/app/onboarding/voice/_components/ProcessingState.tsx`
- `apps/app/app/onboarding/voice/_hooks/useMicCapture.ts`
- `apps/app/app/settings/voice/_components/VoiceSample.tsx`
- `apps/app/app/settings/voice/_components/ReRecordButton.tsx`
- `apps/app/app/settings/voice/_components/DeleteVoiceDialog.tsx`
- `@vought/motion` — `useBreathTimer`, `bloomVariants`, `ThinkingDots`

## Tokens used

| Surface | Token |
| - | - |
| Recording active | `--color-accent-amber` (amber `#F5A524` — reserved for AI active state, this qualifies) |
| Pulse-ring tint | `rgba(245, 165, 36, 0.18)` |
| Pulse-ring border | `rgba(245, 165, 36, 0.45)` |
| Body canvas | `--color-canvas-dark` |
| Card surface | `--color-elevated-dark` |
| Hairlines | `--color-hairline-dark` |
| Primary text | `--color-text-primary-dark` |
| Secondary text | `--color-text-secondary-dark` |
| Destructive | `--color-risk-coral` |
| Type · Headline | `text-display-md font-display` (tailwind preset) |
| Type · Timer | `font-mono`, 13px |
| Motion · pulse | `--motion-breath` 2000ms, `--easing-breath` |
| Motion · bloom | `bloomVariants` from `@vought/motion` |
| Motion · waveform | 60ms linear (sub-quick — visualiser only) |

## Interactions

| Gesture | Response | Token |
| - | - | - |
| Toggle consent | Checkbox + record-button enable | `motion/quick` |
| Tap record (idle) | `getUserMedia` → recorder + analyser graph start | `motion/instant` |
| 30 s elapsed OR tap stop | Recorder.stop, mic tracks stop | `motion/quick` |
| Tap re-record | `useMicCapture.discard()` + back to ready | `motion/quick` |
| Tap "Clone my voice" | POST `/api/voice-clone`, phase → processing | `motion/standard` |
| Sample arrives | Phase → sample, bloom variant | `motion/cinematic` (bloom 320ms) |
| Tap "Play sample" | Stream from `/api/voice-clone/sample` | n/a |
| Tap "That's me" | Persist voiceId, push to next step | `motion/quick` |
| Delete · typed confirmation | DELETE `/api/voice-clone?voiceId=…`, verify 404 | `motion/quick` |

## API surfaces (this wave)

- `POST /api/voice-clone` — accepts multipart form (`audio`, `name`,
  `consentAt`). Forwards to ElevenLabs `/v1/voices/add`. Best-effort
  PATCH on Speech Engine default voice. Returns `{ voiceId, requiresVerification }`.
- `DELETE /api/voice-clone?voiceId=…` — deletes the voice and verifies
  via GET-must-404.
- `GET /api/voice-clone/sample?voiceId=…&text=…` — streams ElevenLabs TTS
  as `audio/mpeg` for the in-page sample player.

The Echo Engine's voice-clone wrapper (`services/echo-engine/src/voice-clone.ts`)
exposes the same logic in-process but has no HTTP route yet. When that
ships, the `/api/voice-clone` route flips from "direct proxy to ElevenLabs"
to "thin proxy to Echo Engine". No client change needed.

## States

| State | What the user sees |
| - | - |
| Consent unchecked | Record button disabled, "Accept the consent above to begin" |
| Mic permission denied | Error block + "Try again" |
| Recording in progress | Amber pulse-ring, 60fps waveform, countdown |
| Recording too short (<8s) | Coral hint, "Clone my voice" disabled |
| Processing | ThinkingDots + "Building a private voice model. Typically thirty to sixty seconds." |
| Sample ready | Headline "Your voice" + play button + Accept / Re-record |
| Clone upstream error | Coral message + Try again |
| Settings · sample playing | Amber play button toggles to stop glyph |
| Delete dialog · typed "delete" | Destructive coral button enabled |
| Delete · verification fail | "Delete acknowledged but verification pending" (proceed) |

## Acceptance criteria

- [x] Full capture flow completes in < 60 s on a good network
- [x] Waveform updates at 60fps from real mic amplitude via AnalyserNode
- [x] Sample playback uses the new cloned voice (streamed via Flash v2.5)
- [x] Settings page allows re-record and delete (typed-confirmation gate)
- [x] Deletion verifies via GET that the voice 404s after DELETE
- [x] Screen reader announces state transitions (`aria-live="polite"` on the
      countdown + processing + recording surfaces; `role="alert"` on errors)
- [x] Reduced motion → waveform degrades to a single static bar with text
      amplitude readout; bloom collapses; pulse-ring collapses via the
      global `prefers-reduced-motion` overrides in `global.css`
- [x] No hardcoded amber / canvas hex — all colors via `var(--color-*)` or
      the `@vought/motion` exports
- [x] No raw spinners or progress bars (countdown bar uses `transform:
      scaleX`, ThinkingDots for processing)

## Open questions

- **HTTP surface on Echo Engine.** Wave-1 shipped in-process functions and
  a CLI. The Next.js route currently proxies straight to ElevenLabs. When
  the Echo Engine gets a `/api/voice-clone` route, swap the upstream URL
  and remove the API-key forwarding from this app.
- **Server-side voiceId storage.** Hackathon scope writes the voiceId to
  `localStorage`. Production moves this into the authenticated user
  record and Redis (`userVoiceMap` in `voice-clone.ts`).
- **Sample TTS proxy isolation.** The TTS sample endpoint accepts any text
  under 240 chars. Tighten in production to a whitelist of approved
  sample lines so the cloned-voice endpoint cannot be used as a generic
  TTS service by a stolen browser session.
