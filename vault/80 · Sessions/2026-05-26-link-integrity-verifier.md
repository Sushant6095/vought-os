---
title: 2026-05-26 · link-integrity-verifier
type: session
agent: link-integrity-verifier
target: local (web :3000, app :3002)
verdict: RED
---

## Verdict: RED

Crawler raw output reports 34 critical / 1 high. After de-duplication and noise
interpretation, the true picture is **13 distinct critical issues** (10 broken
internal routes + 1 dead CTA + 2 broken external links). The remaining "critical"
entries are double-counts (each genuine 404 is logged twice: once as BROKEN, once
as a console JS ERROR) plus font-404 console noise on healthy pages.

## Targets crawled
- web: http://localhost:3000 — 26 pages crawled
- app: http://localhost:3002 — 1 page crawled (root only; app root has 0 internal
  `<a>` links so BFS could not discover the other routes — see note below)

## Port note
APP_BASE was corrected to **:3002** (the Next product app). :3001 is the
echo-engine JSON backend and was NOT crawled. Web :3000 + app :3002 both 200 on
pre-flight.

## Critical issues (RED — block submission)

### 1. Broken `/customers/<slug>` detail pages (7× 404)
- Symptom: Every customer logo/card links to `/customers/<slug>` which 404s.
  Affected: acme, parallel, cobalt, northwind, triplebyte, runway, lakeshore-dental.
- Location: `apps/web/app/customers/page.tsx:184` and `:355` build
  `href={\`/customers/${slug}\`}` but there is no
  `apps/web/app/customers/[slug]/page.tsx` route.
- Owner: `landing-page-builder` (or wave-5-marketing retry).
- Suggested prompt: "Create `apps/web/app/customers/[slug]/page.tsx` as a dynamic
  case-study route covering acme/parallel/cobalt/northwind/triplebyte/runway/
  lakeshore-dental, OR remove the detail links from customers/page.tsx and make the
  cards non-navigational. The cards currently dead-link."

### 2. Broken `/tour` route (404)
- Symptom: "Watch the tour" / tour CTAs lead to a 404.
- Location: linked from `apps/web/components/marketing/Hero.tsx:65` and
  `apps/web/app/copilot/page.tsx:180` (`href="/tour"`). No `/tour/page.tsx` exists.
- Owner: `landing-page-builder`.
- Suggested prompt: "Either build `apps/web/app/tour/page.tsx` or repoint the two
  `href=\"/tour\"` links (Hero.tsx:65, copilot/page.tsx:180) to an existing route."

### 3. Dead CTA on /docs — "▶ Try it"
- Symptom: `<button>` "▶ Try it" on /docs has no onClick and no anchor wrapper —
  clicking does nothing.
- Location: `apps/web/app/docs/page.tsx` (docs interactive snippet component).
- Owner: `landing-page-builder` / docs author.
- Suggested prompt: "Wire the '▶ Try it' button on /docs to a handler or link
  (e.g. open the live demo / onboarding), or remove it if non-functional."

### 4. Broken static assets (2× 404)
- `/blog/rss.xml` 404 — linked from `apps/web/app/blog/page.tsx`. Add a real RSS
  route/file or drop the link.
- `/security/vought-security-one-pager.pdf` 404 — linked from
  `apps/web/app/security/page.tsx`. Add the PDF to `public/` or drop the link.
- Owner: `landing-page-builder`.

### 5. Broken external links (2)
- `https://hackerone.com/vought` → 404. Source: `apps/web/app/security/page.tsx:761`.
- `https://trust.vought.com/` → fetch failed (DNS / unregistered). Source:
  `apps/web/app/security/page.tsx:768`.
- Owner: `landing-page-builder`. Suggested: point to real URLs or mark as
  placeholder / coming-soon for the demo.

## Expected noise (NOT real failures — do not count as critical)
- **Söhne font 404** (`/fonts/sohne/Söhne-Variable.woff2`): every page logs a
  console 404 for the paid Söhne webfont. CLAUDE.md specifies Inter Display as the
  free fallback, so this is by design. 11 healthy 200 pages were flagged "JS ERROR"
  solely because of this. Zero of these have actual `pageErrors` (no exceptions,
  no hydration failures). Fix optionally by removing the Söhne `@font-face` or
  shipping the licensed font.
- **`/demo` "dead end"**: `/demo` is a 307 → `localhost:3002/onboarding/voice`
  cross-app handoff (confirmed). The crawler followed the redirect, rendered the
  onboarding page, and flagged 0 internal links. This is an intentional funnel
  page, not a dead end.
- **App routes undiscovered**: the app root (:3002/) renders fine (200, h1 "What
  kind of conversation?") but exposes 0 internal `<a>` links, so BFS never reached
  `/live`, `/onboarding/voice`, `/settings/voice`. Direct curl confirms all are
  healthy: `/` 200, `/live` 307, `/onboarding/voice` 200, `/settings/voice` 200.
  These are reached via client-side router pushes, not anchors — not broken.
- **Realtime `/live/<id>` timeout**: not encountered this run because BFS never
  reached app sub-routes. If crawled directly, the open ElevenLabs WebSocket makes
  `networkidle` time out (~30s) → expect a crawl-crash log there. That is expected
  for realtime pages.

## High issues (YELLOW — fix if time)
- DEAD END flag on `/demo` — false positive (intentional handoff page, see noise).

## Sitemap snapshot (web :3000)
- / — 200, 30 links
- /customers — 200, 41 links
- /docs — 200 (dead CTA)
- /about, /contact, /copilot, /pricing, /receptionist, /platform, /blog,
  /security — all 200
- /customers/{acme,parallel,cobalt,northwind,triplebyte,runway,lakeshore-dental}
  — 404
- /tour — 404
- /blog/rss.xml — 404
- /security/vought-security-one-pager.pdf — 404
- /blog?cat={engineering,customer-stories,voice-ai,company} — 200 (query variants)
App :3002
- / — 200 (0 anchor links; sub-routes reached via router push, healthy on curl)

## Screenshots
21 PNGs in `scripts/checks/link-integrity/screenshots/` — 10 of genuine broken
routes, 11 of healthy 200 pages captured only due to the Söhne font 404.

## Recommended next step
RED. Dispatch `landing-page-builder` (with possible `wave-5-marketing` retry) to
fix, in priority order:
1. `/customers/[slug]` dynamic route (7 dead links) — highest user-visible impact.
2. `/tour` route or repoint Hero + copilot CTAs.
3. `/docs` "▶ Try it" dead button.
4. Missing static assets (RSS, security PDF) + 2 external links.
Then re-run `WEB_BASE=http://localhost:3000 APP_BASE=http://localhost:3002 node
scripts/checks/link-integrity/crawler.mjs` and watch the verdict converge.
