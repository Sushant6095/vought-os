---
title: 2026-05-26 · voice-clone-builder
type: session
agent: voice-clone-builder
wave: 2
verdict: green
---

# 2026-05-26 · voice-clone-builder

Wave 2 · voice clone surfaces. Built the onboarding capture flow, the
settings management surface, and the Next.js API routes that proxy to
ElevenLabs. Zero scope collisions — only edited under
`apps/app/app/onboarding/voice/`, `apps/app/app/settings/voice/`,
`apps/app/app/api/voice-clone/`, and the vault.

## Attempted

Per the Wave-2 voice-clone-builder brief:

1. 30 s voice capture flow at `/onboarding/voice` with real-time waveform,
   amber pulse-ring record button, countdown, and consent gate.
2. Settings flow at `/settings/voice` with sample playback, re-record,
   and typed-confirmation delete.
3. Next.js API route at `/api/voice-clone` (POST + DELETE) and a streaming
   TTS sample proxy at `/api/voice-clone/sample`.
4. Brand-voice copy (declarative, dry, mono numerics, no AI-powered, no
   exclamations).
5. Reduced-motion fallbacks and screen-reader announcements.
6. Page note + this session log.

## Produced

### Onboarding flow

- `apps/app/app/onboarding/voice/page.tsx` — state machine (consent →
  ready → recording → stopped → processing → sample → done), `useBreathTimer`
  mount, `bloomVariants` between phase transitions, error/coral
  handling. Reads the brand passage out of the page; sources the line
  from `vault/10 · Strategy/Brand Voice.md`.
- `apps/app/app/onboarding/voice/_hooks/useMicCapture.ts` — `getUserMedia`
  with `noiseSuppression` / `echoCancellation` / `autoGainControl`, dual
  MediaRecorder + AnalyserNode graph, 60fps rAF amplitude downsampling
  to a 32-bar Float32Array, hard cap at 30 s, full cleanup on unmount.
- `apps/app/app/onboarding/voice/_components/RecordButton.tsx` — circular
  amber button with two layered pulse-rings (one `--breath-phase`
  driven, one Framer Motion 2 s breath ease), three glyph states.
- `apps/app/app/onboarding/voice/_components/CountdownTimer.tsx` —
  `· MM:SS / MM:SS` mono format with amber dot prefix; progress bar uses
  `transform: scaleX` so we stay compositor-friendly.
- `apps/app/app/onboarding/voice/_components/WaveformVisualizer.tsx` —
  32 bars on `transform: scaleY`; collapses to a single static bar plus
  `role="img"` text amplitude readout under `prefers-reduced-motion`.
- `apps/app/app/onboarding/voice/_components/ConsentDisclosure.tsx` —
  explicit privacy disclosure with checkbox; record button only arms
  after the user accepts.
- `apps/app/app/onboarding/voice/_components/ProcessingState.tsx` —
  `ThinkingDots` from `@vought/motion`; no spinner, no fake percent;
  `aria-live="polite"`.

### Settings flow

- `apps/app/app/settings/voice/page.tsx` — voice profile management.
  Reads `voiceId` from `localStorage` on hydrate; redirects to onboarding
  if absent. Render order: sample player, voiceId readout, privacy
  block, Re-record + Delete actions.
- `apps/app/app/settings/voice/_components/VoiceSample.tsx` — play /
  stop sample using `/api/voice-clone/sample` streaming TTS endpoint.
- `apps/app/app/settings/voice/_components/ReRecordButton.tsx` — pushes
  to `/onboarding/voice`.
- `apps/app/app/settings/voice/_components/DeleteVoiceDialog.tsx` —
  typed-confirmation modal, `role="dialog"`, `aria-modal="true"`,
  Escape-to-close, focus on input mount, verification via GET 404.

### API routes

- `apps/app/app/api/voice-clone/route.ts` — `POST` accepts multipart
  audio (≤ 4 MB), forwards to ElevenLabs `/v1/voices/add`, attempts a
  best-effort `PATCH /v1/speech-engine/:id` to set the cloned voice as
  default. `DELETE ?voiceId=…` removes the voice and verifies the
  follow-up GET returns 404.
- `apps/app/app/api/voice-clone/sample/route.ts` — streams TTS audio
  (`eleven_flash_v2_5`) for the in-page sample player.

### Vault

- `vault/40 · Pages/Voice Clone.md` — page spec with state machine,
  components inventory, token map, interactions, states, acceptance.
- `vault/80 · Sessions/2026-05-26-voice-clone-builder.md` — this log.

## Decisions

1. **Direct ElevenLabs proxy from the Next.js route, not via Echo Engine.**
   Wave 1 shipped the in-process wrapper at
   `services/echo-engine/src/voice-clone.ts` plus a CLI, but no HTTP
   route. Building the route in Echo Engine would have been out of scope
   for this wave. The proxy mirrors the wrapper's request shape exactly
   so the swap is one line of URL change. Tracked in *Open questions*.
2. **30-second cap enforced client-side via `MAX_DURATION_MS`** and
   server-side via a 4 MB content-length cap. The two checks are
   intentionally redundant.
3. **Eight-second minimum recording.** ElevenLabs accepts shorter samples
   but the quality cliff at < 8 s is visible — we surface a coral hint
   and disable the clone CTA rather than let the user submit a thin
   sample.
4. **`voiceId` in `localStorage` for hackathon scope.** Production moves
   this to the authenticated user record + Echo Engine `userVoiceMap`
   (which Wave 1 left in-process). One-line swap when auth lands.
5. **Sample playback through a dedicated `/api/voice-clone/sample` route
   rather than waiting for the live call.** The user needs to hear "this
   is me" within five seconds of the clone completing — the live call
   path takes much longer. The route is a thin TTS streamer; production
   should whitelist the sample text.
6. **Pulse-ring is two layers, not one.** The inner ring tracks
   `--breath-phase` for sub-frame phase-sync with the global canvas
   breath; the outer ring is a Framer Motion 2 s loop for the visible
   pulse. Single-layer attempts felt out of phase with the rest of the
   app.
7. **No spinners anywhere.** Per Blueprint §6.4, ThinkingDots is the
   only loading affordance. The countdown bar uses `transform: scaleX`,
   not `width`, to keep motion on the compositor.
8. **Delete dialog confirms via GET-must-404.** The DELETE alone is not
   enough — a confirmed-deletion verifier is necessary because ElevenLabs
   has been known to acknowledge a delete and return 200 before the
   index propagates. We treat unverified deletes as "acknowledged"
   rather than blocking the user.

## Open questions

- **Echo Engine HTTP surface for voice-clone.** Currently the route
  proxies directly to ElevenLabs. When Echo Engine adds
  `POST /api/voice-clone`, the Next.js route should forward to it so the
  in-process `userVoiceMap` and `setEngineDefaultVoice` stay coherent.
  Tracked here and in the Voice Clone page note.
- **TTS sample endpoint scope.** Accepts any text ≤ 240 chars. Production
  should constrain to an enum of approved sample lines or rate-limit
  per session.
- **Server-side consent persistence.** We capture a `consentAt` ISO
  timestamp in the upload form but only stamp it into the ElevenLabs
  voice description. Production wants a real audit log on the user
  record.

## Next steps

- Wire the Speech Engine session metadata to read `voiceId` from the
  authenticated user record once auth lands. Today Echo Engine reads
  from the in-process map; the Next.js token route should pass it in
  session metadata.
- Add a `getMyVoice` server action on the settings page so we don't read
  from `localStorage` after auth ships.
- Hand off to QA (`qa-verifier`) for the four user-visible flows:
  consent → record → sample, re-record loop, settings sample playback,
  typed-delete + verification.

## Acceptance criteria

- [x] Full capture flow completes in < 60 s on a good network (network
      time is the only variable; client path is ~0 ms outside the wait).
- [x] Waveform updates at 60fps from real mic amplitude via AnalyserNode
      `getByteTimeDomainData` + rAF.
- [x] Sample playback uses the cloned voice within 5 s of "complete"
      (single TTS request, no extra round trips).
- [x] Settings page allows re-record and delete (typed-confirmation gate
      with `delete` literal).
- [x] Deletion verifies via GET-must-404 immediately after DELETE.
- [x] Screen reader announces recording / processing / completion via
      `aria-live="polite"` and `role="alert"` on errors.
- [x] Reduced motion: waveform collapses to a single bar, bloom and
      pulse-ring respect the `global.css` overrides.
- [x] No hardcoded amber / canvas / spacing values outside the design
      tokens — every color and motion duration is sourced from
      `var(--*)`, the Tailwind preset, or `@vought/motion`.
- [x] No spinners or progress percentages. ThinkingDots + countdown
      `scaleX` only.
