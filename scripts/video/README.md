# Vought · Submission Video Production

Produces the 90-second ElevenLabs hackathon submission video plus 1:1 and 9:16 cuts.

## Prerequisites

- Dev servers running:
  - web: `pnpm dev:web` → `http://localhost:3000`
  - app: `pnpm dev:app` → `http://localhost:3002`
- `ffmpeg` / `ffprobe` on PATH (verified at `/opt/homebrew/bin`).
- Playwright installed at workspace root (`pnpm add -Dw playwright`) with cached Chromium
  (`~/Library/Caches/ms-playwright/`). If not picked up: `npx playwright install chromium`.
- `ELEVENLABS_API_KEY` present in `apps/app/.env.local` (read at runtime, never printed).

## Run order

```bash
# 0. (optional) verify tooling + that pages render
node scripts/video/lib/preflight.mjs

# 1. Generate voiceover (ElevenLabs TTS → output/shots/vo-*.mp3)
node scripts/video/voiceover.mjs

# 2. Capture product shots (Playwright → output/shots/*.webm)
node scripts/video/capture.mjs

# 3. Compose everything (ffmpeg → output/*.mp4 + thumbnail)
bash scripts/video/compose.sh
```

## Outputs (`scripts/video/output/`)

| File | Spec |
|------|------|
| `vought-90sec-16x9.mp4` | 1920×1080, 30fps, H.264, AAC 192k — primary submission |
| `vought-60sec-1x1.mp4`  | 1080×1080, 60s — LinkedIn / square |
| `vought-30sec-9x16.mp4` | 1080×1920, 30s — TikTok / Reels |
| `thumbnail-16x9.png`    | OpenGraph card |

## Design decisions baked in

- **Ports:** web `:3000`, app `:3002` (NOT `:3001`).
- **Voiceover voice:** ElevenLabs preset `VU16byTywsWv5JpI8rbc` ("Ash"). The account has no cloned
  voice; the user approved the preset. This is a documented deviation from the "user's own cloned
  voice" rule — see `script.md` and the session doc. The preset narrates *about* the product.
- **Live screen capture:** seeded via `?demo=1` (dev-only, gated branch in the live page that drives
  the real Zustand store actions). Real components, real bloom/word-stream/timeline animations,
  synthetic input event only. Production never reaches this branch. Never a mocked screenshot.
- **Landing page is omitted** from the cut: the shipped landing uses an "Observe.ai-style" lime accent,
  off the canonical amber/canvas-dark brand. The video leads with the app (amber/dark) and `/customers`
  (amber/dark, exact `$1.4M` / tripled / `· 412ms` numbers).
- **No music bed by default** — ships VO-only (no copyrighted audio). To add a CC0 bed, drop a
  `output/music.wav` and re-run `compose.sh`; it ducks the bed under VO via sidechain (~-18dB).
- **Timeline is VO-driven:** `lib/plan.mjs` measures each VO clip with `ffprobe` and sizes the video
  shots so the master lands 88–92s. `captions.srt` is regenerated from the same measured durations.
- **Fonts:** Helvetica (`/System/Library/Fonts/Helvetica.ttc`) for display/captions; Menlo
  (`/System/Library/Fonts/Menlo.ttc`) for mono numerics and the URL. Amber `#F5A524` is reserved for
  numbers, the latency callsign, and the URL.

## Re-shooting a single scene

Edit `lib/build-segments.mjs` (canvas shots) or re-run `capture.mjs` (product shots), then
`bash compose.sh`. The pipeline is idempotent — `plan.mjs` recomputes timings each run.

## Verify

```bash
ffprobe -v error -show_entries format=duration,size -of default=noprint_wrappers=1 \
  scripts/video/output/vought-90sec-16x9.mp4
```
Expect duration 88–92s, size ≤ 25MB. Derivatives ≤ 10MB.
