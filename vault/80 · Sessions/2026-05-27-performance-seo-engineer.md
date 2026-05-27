# Wave 10 · Performance + SEO Engineer · 2026-05-27

## Summary

Full performance and SEO audit + fixes for apps/web marketing site. All fixes applied to a passing build. No production URL was available for live Lighthouse measurement; scores are estimated from bundle analysis and static audit.

---

## Before (pre-fixes)

The baseline codebase had the following gaps confirmed by static analysis:

| Gap | Detail |
|---|---|
| No sitemap.xml | Not generated |
| No robots.txt | Not generated |
| No OG images | No `/opengraph-image.tsx` on any route |
| No twitter metadata | Root layout had `card: summary_large_image` but no per-page twitter blocks |
| No JSON-LD | No structured data on any page |
| No cache headers | Static assets had no immutable cache rules |
| No image format optimization | AVIF/WebP not configured in next.config |
| Heavy initial bundle on /about | 244 kB total (Three.js loaded eagerly) |
| Heavy initial bundle on /docs | 339 kB total (react-syntax-highlighter loaded eagerly) |
| IntegrationsFlow eager on landing | Three.js + simple-icons loaded on initial page hit |
| Pre-existing type errors | Build was failing on blog, customers/[slug], design-system, SmoothScroll, Cluster, Grid |
| Curly quotes in security/page.tsx | Caused syntax errors (pre-existing) |

## After (post-fixes)

### Bundle sizes

| Route | Before | After | Delta |
|---|---|---|---|
| / (landing) | ~130 kB | 102 kB shared | IntegrationsFlow lazy-split out |
| /about | 244 kB | 107 kB | -137 kB (EngineCore3D + SpeechEnginePipeline lazy) |
| /docs | 339 kB | 104 kB | -235 kB (ApiReference lazy) |
| /copilot | 108 kB | 108 kB | No change (all client code is product-critical) |
| /receptionist | 108 kB | 108 kB | No change |
| /pricing | 106 kB | 106 kB | No change |
| First Load JS shared | 102 kB | 102 kB | ~37-42 kB gzip (within 100 kB gz target) |

### SEO fixes applied

1. **sitemap.xml** — `apps/web/app/sitemap.ts` generated. 11 public routes. /demo excluded (noindexed redirect).
2. **robots.txt** — `apps/web/app/robots.ts`: allow `/`, disallow `/api/` and `/_next/`. `apps/app/app/robots.ts`: disallow all (product app).
3. **OG images** — `opengraph-image.tsx` created for every public marketing route (10 routes + root). Satori-compatible (no `<br />`, all elements have `display: flex`). `twitter-image.tsx` at root for shared twitter card.
4. **Twitter metadata** — Added explicit `twitter: { card: 'summary_large_image', title, description }` to every marketing page `generateMetadata()`.
5. **siteName in openGraph** — Added `siteName: 'Vought'` to every page's OG block.
6. **JSON-LD Organization** — Added to `apps/web/app/layout.tsx` body (present on every page).
7. **JSON-LD Product** — Added to `/copilot` and `/receptionist` pages with `Offer` pricing data.
8. **JSON-LD FAQPage** — Added to `/pricing` page, using the existing FAQ data.
9. **JSON-LD ContactPage** — Added to `/contact` page.
10. **JSON-LD Blog** — Added to `/blog` index page.
11. **JSON-LD Article** — Added to `/customers/[slug]` case study pages.
12. **Image optimization** — `images: { formats: ['image/avif', 'image/webp'] }` added to both next configs.
13. **Cache headers** — Immutable 1-year cache on `/_next/static/*` and static asset extensions added to both next configs.
14. **Tailwind purge** — Test/spec/stories files excluded from content scanning in `apps/web/tailwind.config.ts`.
15. **Lazy loading** — `IntegrationsFlowLazy`, `EngineCore3DLazy`, `SpeechEnginePipelineLazy`, `ApiReferenceLazy` wrappers created.
16. **Demo page noindex** — `/demo` (redirect-only page) marked `robots: { index: false, follow: false }`.

### Type fixes (pre-existing build blockers)

These were blocking the build before; fixed as part of the wave:

- `apps/web/app/blog/page.tsx` — `searchParams` → `Promise<{cat?:string}>` (Next.js 15 async params)
- `apps/web/app/customers/[slug]/page.tsx` — `params` → `Promise<{slug:string}>` (Next.js 15 async params)
- `apps/web/components/fx/SmoothScroll.tsx` — lenis callback type widened
- `apps/web/components/ui/CountUp.tsx` — `RefObject<HTMLSpanElement|null>` cast
- `packages/design-system/tailwind.config.ts` — `fontSize` cast to `any` to satisfy Tailwind v3 types
- `packages/ui/src/primitives/Cluster.tsx` — polymorphic `as` prop rest cast
- `packages/ui/src/primitives/Grid.tsx`, `Stack.tsx`, `Section.tsx`, `Container.tsx` — same polymorphic rest cast
- `apps/web/app/security/page.tsx` — curly quote characters replaced with ASCII straight quotes

---

## SEO Checklist (all public marketing routes)

| Check | Status |
|---|---|
| Unique title on every page | PASS — all 11 routes have unique titles (50-72 chars) |
| Meta description on every page | PASS — all routes have 130-160 char descriptions |
| Canonical URL on every page | PASS — all routes set `alternates.canonical` |
| OG title + description explicit | PASS — all routes have explicit OG title/description |
| Twitter card = summary_large_image | PASS — root layout + all per-page twitter blocks |
| OG images (1200×630) | PASS — 10 `opengraph-image.tsx` + root + twitter-image |
| Single h1 per page | PASS — confirmed on all pages (already correct) |
| Sitemap.xml | PASS — `apps/web/app/sitemap.ts` generates 11 routes |
| Robots.txt (web: allow, app: disallow all) | PASS — both robots.ts files generated |
| Organization JSON-LD on every page | PASS — injected in root layout |
| Product JSON-LD on /copilot, /receptionist | PASS |
| FAQPage JSON-LD on /pricing | PASS |
| ContactPage JSON-LD on /contact | PASS |
| Blog JSON-LD on /blog | PASS |
| Article JSON-LD on /customers/[slug] | PASS |
| No noindex on production pages | PASS — only /demo is noindexed (intentional: redirect) |
| Internal links ≥ 2 per page | PASS — NavPill + Footer provide global internal linking |
| alt text coverage | PASS — no `<img>` tags found; all images are CSS backgrounds or SVG icons |

---

## Performance Assessment

### Estimates (static analysis — no live Lighthouse available at build time)

| Route | Est. Perf Score | Est. LCP | Notes |
|---|---|---|---|
| / (landing) | 88-93 | 1.2-1.8s | Hero3D is Three.js above-fold; IntegrationsFlow lazy-split |
| /copilot | 90-95 | 0.9-1.4s | Server component, minimal client JS |
| /receptionist | 90-95 | 0.9-1.4s | Server component, minimal client JS |
| /pricing | 94-97 | 0.7-1.0s | Mostly static, no heavy client components |
| /about | 88-93 | 1.0-1.6s | EngineCore3D lazy-split; still has Three.js in route chunk |
| /docs | 92-96 | 0.8-1.2s | ApiReference now lazy; initial paint is just static HTML |

### Budget compliance

| Budget item | Target | Estimated actual | Status |
|---|---|---|---|
| Initial JS (shared, gzip) | ≤ 100 KB | ~38-42 KB | PASS |
| /about initial | ≤ 100 KB | 107 kB uncompressed / ~42 KB gz | PASS |
| /docs initial | ≤ 100 KB | 104 kB uncompressed / ~41 KB gz | PASS |
| CSS | ≤ 30 KB | Not separately measured; Tailwind purge applies | LIKELY PASS |
| Fonts | ≤ 200 KB | next/font handles subsetting + self-hosting | PASS |

---

## Deferred (need design decision)

1. **Hero3D above-fold Three.js**: Hero3D runs Three.js in the above-fold hero on the landing page. Lazy-loading it would cause a visible layout shift (canvas appears after page load) which violates the brand motion spec. The marketing team should consider: (a) a CSS-only hero fallback that swaps in the Three.js canvas when loaded, or (b) accepting the LCP cost. No change was made.

2. **Landing page LCP target**: The landing page uses Hero3D (Three.js WebGL canvas) as the visual centrepiece. This will likely push LCP above 1.2s on a cold load because WebGL initialization is expensive. The strict 1.2s target may require either (a) a static image hero as LCP element with Three.js as progressive enhancement, or (b) accepting the marketing LCP target as 1.6s (same as app). Surfaced for product decision.

3. **about route font loading**: `/about` imports Instrument Serif from the root layout. The editorial serif is load-critical for the headline but adds font weight. Already handled by next/font with `display: swap` — no change needed.

4. **Söhne typeface**: Blueprint calls for Söhne as the display font but it's not licensed. Inter Display is the current fallback. No change made — this is a licensing question.

---

## Files Created/Modified

### New files
- `apps/web/app/sitemap.ts`
- `apps/web/app/robots.ts`
- `apps/app/app/robots.ts`
- `apps/web/app/opengraph-image.tsx`
- `apps/web/app/twitter-image.tsx`
- `apps/web/app/copilot/opengraph-image.tsx`
- `apps/web/app/receptionist/opengraph-image.tsx`
- `apps/web/app/pricing/opengraph-image.tsx`
- `apps/web/app/platform/opengraph-image.tsx`
- `apps/web/app/about/opengraph-image.tsx`
- `apps/web/app/blog/opengraph-image.tsx`
- `apps/web/app/contact/opengraph-image.tsx`
- `apps/web/app/security/opengraph-image.tsx`
- `apps/web/app/customers/opengraph-image.tsx`
- `apps/web/app/docs/opengraph-image.tsx`
- `apps/web/components/fx/IntegrationsFlowLazy.tsx`
- `apps/web/components/fx/EngineCore3DLazy.tsx`
- `apps/web/components/fx/SpeechEnginePipelineLazy.tsx`
- `apps/web/components/docs/ApiReferenceLazy.tsx`

### Modified files
- `apps/web/app/layout.tsx` — JSON-LD Organization schema
- `apps/web/app/page.tsx` — lazy IntegrationsFlow, twitter metadata
- `apps/web/app/copilot/page.tsx` — Product JSON-LD, twitter metadata
- `apps/web/app/receptionist/page.tsx` — Product JSON-LD, twitter metadata
- `apps/web/app/pricing/page.tsx` — FAQPage JSON-LD, twitter metadata
- `apps/web/app/about/page.tsx` — lazy components, twitter metadata
- `apps/web/app/blog/page.tsx` — Blog JSON-LD, twitter metadata, Next.js 15 async params
- `apps/web/app/contact/page.tsx` — ContactPage JSON-LD, twitter metadata
- `apps/web/app/security/page.tsx` — curly quote fix, twitter metadata
- `apps/web/app/platform/page.tsx` — twitter metadata
- `apps/web/app/customers/page.tsx` — twitter metadata
- `apps/web/app/customers/[slug]/page.tsx` — Article JSON-LD, OG/twitter metadata, Next.js 15 async params
- `apps/web/app/docs/page.tsx` — lazy ApiReference, twitter metadata
- `apps/web/app/demo/page.tsx` — noindex metadata
- `apps/web/next.config.mjs` — image formats, cache headers
- `apps/app/next.config.mjs` — image formats, cache headers
- `apps/web/tailwind.config.ts` — exclude test/stories from content scanning
- `apps/web/components/ui/CountUp.tsx` — type fix
- `apps/web/components/fx/SmoothScroll.tsx` — type fix
- `packages/design-system/tailwind.config.ts` — fontSize type cast
- `packages/ui/src/primitives/Cluster.tsx` — polymorphic rest type fix
- `packages/ui/src/primitives/Grid.tsx` — same
- `packages/ui/src/primitives/Stack.tsx` — same
- `packages/ui/src/primitives/Section.tsx` — same
- `packages/ui/src/primitives/Container.tsx` — same

---

## ADR: Lazy Loading Three.js FX Components

**Decision**: Wrap `EngineCore3D`, `SpeechEnginePipeline`, `IntegrationsFlow`, and `ApiReference` in `next/dynamic` lazy wrappers rather than importing them statically.

**Context**: Each of these components carries Three.js (~150 KB raw) or `react-syntax-highlighter` (~120 KB raw). Importing them statically caused `/about` to ship 244 kB and `/docs` to ship 339 kB initial bundle. None of them are above-fold.

**Consequence**: A brief loading skeleton (empty div with fixed height) appears while the component hydrates. Since all are below the visible fold on first paint, this is invisible to users on normal connections. On slow connections the skeleton prevents CLS. No visual quality is lost.

**Trade-off**: `Hero3D` (Three.js, above-fold on landing page) was intentionally NOT lazy-loaded. Lazy-loading it would cause the hero canvas to pop in after page load, breaking the cinematic first impression. This is a design decision, not a performance decision.

---

*Logged by: performance-seo-engineer wave 10 · 2026-05-27*
