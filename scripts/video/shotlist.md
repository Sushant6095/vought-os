# Vought · Shot List

Master = 1920×1080, 30fps, H.264, yuv420p. Every shot is normalized to that exact spec before concat.
Durations below are nominal targets; `compose.sh` aligns video shot lengths to the measured VO clip
durations (via `ffprobe`) so the assembled timeline lands 88–92s. drawtext shots use `textfile=` to
avoid escaping issues. Mono numerics use Menlo; display/body text uses Helvetica. Amber `#F5A524` is
reserved for numbers, the latency callsign, and the URL only.

| # | t-start | t-end | type | source | capture / build | overlay |
|---|---------|-------|------|--------|-----------------|---------|
| 1 | 0:00 | 0:05 | type-on-canvas | n/a (ffmpeg) | solid `#0A0A0B`, fade text in | "Every important conversation happens once." |
| 2 | 0:05 | 0:14 | type-on-canvas | n/a (ffmpeg) | solid canvas, second line | "You don't get to rehearse." |
| 3 | 0:14 | 0:34 | screen-capture | `:3002/live/test-session?demo=1` | wait for whisper bloom, record ~22s of bloom + word stream + timeline | none |
| 4 | 0:34 | 0:46 | screen-capture | `:3002/live/test-session?demo=1&variant=teams` | teams variant: confidence + source attribution + `· 412ms` | none |
| 5 | 0:46 | 1:02 | screen-capture | `:3002/onboarding/voice` | accept consent, hold on armed record button + brand passage | "Thirty seconds → your own voice" |
| 6 | 1:02 | 1:08 | screen-capture | `:3000/customers` | hero with `· 412ms` callsign | none |
| 7 | 1:08 | 1:15 | screen-capture | `:3000/customers` | scroll to TripleByte CustomerStory, hold on quote + tiles | none |
| 8 | 1:15 | 1:20 | numbers-on-canvas | n/a (ffmpeg) | mono amber count line | "$1.4M   ·   3×   ·   · 412ms" |
| 9 | 1:20 | 1:30 | outro-card | n/a (ffmpeg) | wordmark + tagline + URL, hold ≥6s | see outro spec |

## Capture notes (verified product state)

- **Live screen (`/live/[sessionId]`)** auto-starts a mic session and only blooms on a real socket
  message. Headless capture has no mic/backend, so it would sit in "calibrating" forever. We added a
  dev-only, `?demo=1`-gated seed effect to the live page that drives the REAL store actions
  (`addSuggestion`, `setAgentState`, `upsertSegment`, `setLastLatencyMs`) — the real components animate
  through their real bloom / word-stream / timeline motion with realistic seeded data. This is not a
  mocked screenshot; only the input event is synthetic. Production never reaches this branch.
- **Onboarding (`/onboarding/voice`)** starts in `consent` phase showing the brand passage and a record
  button (disabled until consent). We click the consent checkbox to arm the button. The animated waveform
  needs a real mic, so we hold on the genuine armed `ready` state — real product UI.
- **Landing (`:3000/`)** ships an "Observe.ai-style" redesign using a lime accent, NOT the canonical
  amber/canvas-dark brand system. To stay on-brand, the video leads product + marketing with the app
  (amber/dark) and the `/customers` page (amber/dark, exact `$1.4M`/`tripled`/`· 412ms` numbers). The
  lime landing hero is omitted from the cut; noted in the session doc.

## Capture mechanics

- Playwright Chromium records **WebM**, one file per page session, into `output/shots/`.
- After each session: `page.video().saveAs(<slug>.webm)` then `page.video().delete()`.
- `compose.sh` converts each WebM → normalized MP4, trims to the aligned duration, then concats.
