# apps/web

The Vought marketing site (vought.com).

Implements the 12-scene cinematic landing page storyboard from `VOUGHT-DESIGN-BLUEPRINT.md` §6, plus product pages (`/copilot`, `/receptionist`, `/platform`), `/pricing`, `/security`, `/customers`, `/about`, `/blog`, `/changelog`, `/careers`, `/contact`.

Built by the `landing-page-builder` agent (Phase 2 of the implementation roadmap).

## Scaffold status

Landing page (12 scenes) shipped in Wave 2 by `landing-page-builder`.
Product pages (`/copilot`, `/receptionist`, `/platform`, etc.) are
deferred to a follow-up wave.

Reference implementation: `mockups/vought-landing-cinematic.html`.
Page spec + deviations: `vault/40 · Pages/Landing.md`.
Session log: `vault/80 · Sessions/2026-05-26-landing-page-builder.md`.

## Quick start

```bash
pnpm install
pnpm dev --filter=web
# → http://localhost:3000
```
