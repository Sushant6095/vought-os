# Session · Video Director · Wave 7 Submission Video (render + delivery)

**Date:** 2026-05-26 (rendered 2026-05-27)
**Status:** ✅ Rendered, verified, ready to submit (with one documented voice deviation)

This summary covers the *execution* of the Wave 7 video. The video-director agent
authored the full pipeline but its sandbox blocked `node`/`ffmpeg`/`curl`, so no media
was produced by the agent. The render was completed from the main session, which had
execution access. Several real blockers were resolved along the way (below).

---

## Deliverables (all under budget)

| File | Duration | Size | Format |
|---|---|---|---|
| `scripts/video/output/vought-90sec-16x9.mp4` | **89.00s** | 5.0 MB | 1920×1080, H.264, AAC 48kHz |
| `scripts/video/output/vought-60sec-1x1.mp4` | 60.00s | 3.0 MB | 1080×1080 |
| `scripts/video/output/vought-30sec-9x16.mp4` | 30.00s | 2.0 MB | 1080×1920 |
| `scripts/video/output/thumbnail-16x9.png` | — | 168 KB | 1920×1080 |

`ffprobe`-verified master duration: **89.002s** (target 88–92s ✓). All sizes well under
the 25 MB / 10 MB budgets.

---

## Voiceover — DEVIATION (read this)

**The voiceover is NOT the user's cloned voice.** It uses the ElevenLabs **premade** preset
**"Brian — Deep, Resonant and Comforting"** (`nPczCjzI2devNBz1zQrb`), model
`eleven_multilingual_v2`.

Why:
1. The connected ElevenLabs account has **no cloned voice** (verified via the voices API —
   only premade + two professional library voices). The app stores a user's `voiceId` only
   in browser `localStorage`, so it is not retrievable server-side.
2. The account is **free-tier**: library/professional voices ("Ash") return **HTTP 402**
   (`paid_plan_required`) via the API. Only *premade* presets are usable.
3. The user explicitly approved proceeding with a preset.

This violates the hard rule "voiceover in the user's own cloned voice" — the product's core
hook. **Mitigation:** the narration speaks *about* the product, never claims to be the
viewer's cloned voice. To fix later: create a real clone, then set
`VO_VOICE_ID=<id> node scripts/video/voiceover.mjs && node scripts/video/render.mjs`.

---

## Script (verbatim VO — 10 lines, ~45.7s spoken)

1. "Every important conversation in your life happens once. You don't get to rehearse."
2. "Vought changes that."
3. "It listens to your live conversation, separates every speaker, and understands what is happening in the moment."
4. "Then it whispers the next line. Privately. Into your ear."
5. "In under four hundred milliseconds. Built on the ElevenLabs Speech Engine."
6. "And it speaks in a voice you trained yourself. Thirty seconds of recording, and the voice you hear is your own."
7. "On a sales call, a copilot that closes. At the front desk, a receptionist that never misses a call."
8. "TripleByte closed one point four million dollars more last quarter. Suggestion acceptance tripled."
9. "The conversation goes the way it was always supposed to."
10. "Vought. Intelligence for live conversations."

---

## Shots (real product UI, ports corrected to :3000 / :3002)

| Segment | Source URL | Hold |
|---|---|---|
| type1 / type2 cards | rendered (canvas) | 6s / 3s |
| live-bloom (hero) | `localhost:3002/live/test-session?demo=1` | 20s |
| live-teams | `localhost:3002/live/test-session?demo=1&variant=teams` | 9s |
| onboarding-voice | `localhost:3002/onboarding/voice` | 12s |
| customers-hero | `localhost:3000/customers` | 12s |
| customers-story (TripleByte + metrics) | `localhost:3000/customers` | 11.5s |
| numbers card ($1.4M · 3× · · 412ms) | rendered (canvas) | 6s |
| outro card (wordmark/tagline/URL) | rendered (canvas) | 9.5s |

Live hero is seeded via a dev-only, production-guarded `?demo=1` branch that drives the
**real** Zustand store (real components/animations, synthetic input only — never a mocked
screenshot). All shots captured cleanly; **no substitutions**.

## Music

**None.** VO-only. No copyrighted audio was used.

---

## Execution notes / blockers resolved

1. **Ports:** the brief said the app is on `:3001`; it actually serves on **`:3002`**
   (`:3001` is an unrelated process). All scripts corrected.
2. **ffmpeg lacks text filters:** the local homebrew ffmpeg 8.1.1 was built **without
   libfreetype/libass**, so `drawtext` and `subtitles` are unavailable (a `brew reinstall`
   re-pours the same minimal bottle; the full build is the separate `ffmpeg-full` formula).
   **Workaround:** all text — 4 brand cards + 10 caption strips — is rendered as PNGs via
   Playwright/Chromium (real type) and composited with `overlay`/`fade`/`loop` (core filters
   only). New consolidated assembler: `scripts/video/render.mjs`. Higher type quality than
   drawtext would have produced.
3. **VO too thin for 88–92s:** the original 6-line script (~35s) forced `plan.mjs` to pad the
   outro to **45.9s** (dead air). Fixed by expanding to a 10-line, VO-driven script and
   distributing holds across the (ample, ~99s captured) footage, with a 9.5s outro held for
   URL legibility. No padding, no music needed.
4. **SDK resolution:** `voiceover.mjs` was rewritten to call the ElevenLabs REST API via
   `fetch` (the SDK lives in `apps/app/node_modules`, unreachable from `scripts/video/`).
5. **Brand mismatch flagged:** the shipped landing page (`:3000/`) uses a lime / pure-black
   "Observe.ai"-style direction, off the canonical amber / canvas-dark brand. It was omitted
   from the cut; the on-brand app + `/customers` lead instead. **Design owners should
   reconcile the landing page with the brand system.**

## Re-run

```bash
# dev servers up: web :3000, app :3002
node scripts/video/voiceover.mjs   # ElevenLabs VO (set VO_VOICE_ID to swap voice)
node scripts/video/capture.mjs     # Playwright shot capture
node scripts/video/render.mjs      # cards+captions PNG → compose → cuts → thumbnail
```

---

## Recommended social copy (brand voice; ready to paste)

### X / Twitter (≤280)
Vought listens to your live conversation and whispers the next line into your ear — in
under · 412ms, on the @elevenlabsio Speech Engine. TripleByte closed $1.4M more last
quarter. Intelligence for live conversations. #ElevenHacks

### LinkedIn
Most coaching happens after the call. Vought happens during it.

It listens to a live conversation, separates every speaker, understands the moment, and
whispers the next line privately into your ear — in under 412 milliseconds, built on the
ElevenLabs Speech Engine. The voice you hear is one you trained yourself.

On a sales call, it's a copilot that closes. At the front desk, a receptionist that never
misses. TripleByte closed $1.4M more last quarter and tripled suggestion acceptance.

Intelligence for live conversations. Built for the ElevenLabs hackathon. #ElevenHacks

### TikTok / Instagram Reels
The line you wish you'd thought of — whispered in your ear, live. ⚡ Built on
@elevenlabs. #ElevenHacks #AI #voiceai #sales #startup #buildinpublic

---

## Verdict

**READY TO SUBMIT — YES**, with the explicit caveat that the voiceover is a **preset**, not
the user's cloned voice (no clone exists on a free-tier account). Everything else meets the
spec: 89.00s, 1920×1080, on-brand, real product UI, captions on every line, three cuts +
thumbnail, no copyrighted assets.
