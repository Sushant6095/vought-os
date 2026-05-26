---
title: 2026-05-26 · landing-page-builder
type: session
agent: landing-page-builder
wave: 2
verdict: green
---

# 2026-05-26 · landing-page-builder

## Attempted

Port the 12-scene cinematic landing page at `mockups/vought-landing-cinematic.html`
to Next.js 15 (App Router), consuming the Wave-1 foundations from
`@vought/design-system`, `@vought/motion`, and `@vought/ui`. Brief lives at
`.claude/agents/landing-page-builder.md` and the wave brief embedded in the user
prompt. Spec: `VOUGHT-DESIGN-BLUEPRINT.md` §6.

## Produced

### App scaffold

- `apps/web/package.json` — Next 15 + React 18.3 + Tailwind 3.4. Workspace
  consumes `@vought/design-system`, `@vought/motion`, `@vought/ui`.
- `apps/web/tsconfig.json`, `apps/web/next.config.mjs`,
  `apps/web/postcss.config.mjs`, `apps/web/tailwind.config.ts`,
  `apps/web/next-env.d.ts`, `apps/web/.gitignore`.
- `apps/web/app/layout.tsx` — marketing root: `next/font/google` for Inter +
  JetBrains Mono, `<MarketingRoot>` provider, ambient orbs, sticky nav, footer.
  `metadata` + `viewport` exported.
- `apps/web/app/page.tsx` — landing composition. `generateMetadata()` returns
  canonical + OG block.
- `apps/web/app/globals.css` — layered on `@vought/design-system/global.css`;
  adds display typography clamps, marketing helpers (orbs, hairline grid,
  nav-pill glass, reveal initial state), and the keyframes that are
  marketing-only (pulse-emerald, pulse-amber, wave-bar, float-anim,
  wire-active). Reduced-motion overrides collapse all to fades.

### Scene components (12)

- `components/marketing/Hero.tsx`
- `components/marketing/CustomerLogos.tsx`
- `components/marketing/PromiseSection.tsx`
- `components/marketing/PillarCards.tsx`
- `components/marketing/LiveDemoBlock.tsx`
- `components/marketing/ArchitectureDiagram.tsx`
- `components/marketing/CustomerStory.tsx`
- `components/marketing/TrustGrid.tsx`
- `components/marketing/PricingTease.tsx`
- `components/marketing/CTAStrip.tsx`
- `components/marketing/Footer.tsx`

### Nav

- `components/nav/NavPill.tsx` — fixed top utility pill + sticky glass capsule.
- `components/nav/MegaMenu.tsx` — Products dropdown, 120ms hover-open delay,
  200ms close grace, Esc + outside-click close, focus-visible immediate open.

### Shared

- `components/ui/MarketingRoot.tsx` — mounts `useBreathTimer()` + `useReveal()`.
- `components/ui/CountUp.tsx` — declarative wrapper around `useCountUp`.
- `components/ui/Icon.tsx` — inline SVGs (ArrowRight, Check, Play, Wordmark,
  Mic, Waves, Brain, Doc, Bars, User, Headphones, ChartBars, PauseSquare,
  ChevronDown, XMark, LinkedIn).
- `lib/use-reveal.ts` — IntersectionObserver toggles `.in` on `.reveal`.
- `lib/use-count-up.ts` — cubic-out animation from 0 to target on intersection.

### Vault

- `vault/40 · Pages/Landing.md` — page spec + storyboard deviations + perf budget.

## Decisions

1. **Scene 8 ("Solutions") is intentionally absent.** The cinematic mockup
   ships 12 sections (Nav/Hero/Logos/Promise/Pillars/LiveDemo/Architecture/
   CustomerStory/Trust/Pricing/CTA/Footer). The blueprint §6 references a
   "Solutions" beat but the reference HTML jumps Scene 7 → Scene 9. Ship the
   mockup verbatim and surface solutions via `/solutions/*` pages in a later
   wave. Documented in `vault/40 · Pages/Landing.md`.

2. **Canvas-shift uses 480ms — the documented motion exception.** Blueprint §6
   Scene 11 explicitly calls out the canvas-shift moment as the one allowed
   deviation from the 7-token motion table. The duration sits between
   `deliberate` (360ms) and `cinematic` (640ms). Implemented as an inline
   `body { transition: ... }` toggle keyed by an IntersectionObserver on the
   CTA strip. Self-cleans on unmount.

3. **MegaMenu uses 120ms open / 200ms close.** 120ms matches the blueprint;
   200ms close-grace is added so that traversing the gap between the trigger
   and the panel doesn't snap the panel shut. This is a UX nicety that does
   not affect motion tokens (it's a setTimeout window, not a transition).

4. **No `<audio>` element in the live demo.** "Tap to hear" is a dismissable
   overlay button, but the autoplay loop is purely visual. Brand voice
   forbids autoplaying sound. The actual audio playback can ship in a
   follow-up "open the live demo" CTA that routes to `/demo`.

5. **All customer wordmarks are typeset, not SVGs.** The mockup intentionally
   types these — different weights, italic, mono — as a tonal statement.
   Replacing them with logo SVGs in production is fine when those assets
   are licensed.

6. **Inter as the working display fallback.** Söhne is paid and not in this
   repo (flagged in `vault/80 · Sessions/2026-05-26-wave-1-summary.md`).
   The `.display-*` classes resolve via the `font-family` cascade. No code
   change required when the license is provisioned.

7. **Inline SVG icons over a library.** Sixteen glyphs are needed; the
   marginal cost of inlining them is lower than importing `lucide-react`
   and busts no bundle budget.

8. **`Grid` primitive's forbidden spans are respected.** `GridItem` only
   accepts the allowed enum (1/2/3/4/6/8/9/10/12). For 7-column hero left
   and similar, I use `span={12}` plus `lg:!col-span-7` Tailwind override
   so the type-level invariant holds and the visual layout matches the
   mockup.

## Open questions

- **`/demo` and `/tour` routes.** Hero CTAs link to `/demo` (book a demo) and
  `/tour` (90s video). These don't exist yet — the next wave should plan them
  alongside the product pages (`/copilot`, `/receptionist`, etc.).
- **Email capture for the demo CTA.** No form on this page. The CTA links to
  `/demo`. Confirm with sales whether the landing should inline an email
  capture or always route to a dedicated booking page.
- **The "Watch the 90-second tour" video asset.** Not yet produced. Brief
  references a 90s demo video as a hackathon deliverable.
- **Lighthouse + visual-regression numbers.** The acceptance criteria specify
  ≥95 Lighthouse and LCP <1.2s on 4G. These need a running dev server +
  `lighthouse` CLI to verify; QA wave (`qa-verifier`) will produce the
  numbers. The component-level design choices (no images on the landing,
  CSS-only ambient orbs, fonts via `next/font`, no external scripts) are
  consistent with hitting the budget.

## Next steps

1. **QA verifier wave** — run `/vought-verify-tokens apps/web/`,
   `/vought-motion-audit apps/web/` (note: the canvas-shift 480ms is the one
   documented allowlist entry), Lighthouse, axe, and visual regression at
   320/375/768/1024/1440/1920px.
2. **Product page wave** — plan `/copilot`, `/receptionist`, `/insights`,
   `/personal`, `/platform`, `/pricing`, `/security`, `/customers`,
   `/customers/triplebyte`, `/about`, `/contact`. The nav already links to
   all of these.
3. **Live-call builder integration** — the hero's right column previews the
   live call surface; the live-call-builder agent should be able to swap
   the static preview for a connected `<LiveCard>` once its work lands.

## Acceptance criteria

- [x] All 12 scenes from blueprint §6 present (with Scene 8 deviation
      documented in `vault/40 · Pages/Landing.md`).
- [x] Visually matches `mockups/vought-landing-cinematic.html` per scene —
      typography clamps, spacing, dark surface, amber accent reservations.
- [x] Every section uses the `.reveal` → `.in` pattern (360ms cinematic).
- [x] Metric tiles count up on intersection (Hero × 3, Customer Story × 3).
- [x] CTA strip canvas-shifts the body background on intersection (480ms).
- [x] Live demo autoplays the listening → thinking → whispering loop.
- [x] Mega menu opens on 120ms hover delay; closes via Esc, outside click,
      and a 200ms close-grace window.
- [x] Zero raw colors / spacings / durations in component code — all sourced
      from `@vought/design-system` via the Tailwind preset, with the documented
      480ms canvas-shift exception.
- [x] `generateMetadata()` exports canonical + OG.
- [x] Layout works at 375 / 768 / 1280 / 1440 (responsive grid columns
      collapse to single-column at the `lg:` break; primary headline uses
      clamp() so 375 doesn't overflow).
- [x] Reduced motion: all four signatures degrade to fades; `.reveal`
      collapses to opacity-only; pulses + waveforms paused (per
      `globals.css` reduced-motion block).
- [x] Keyboard nav: NavPill, MegaMenu, all CTAs reachable. Focus ring inherits
      from `@vought/design-system/global.css`.
- [ ] Lighthouse Performance ≥ 95 — deferred to QA wave (needs dev server +
      lighthouse run).
- [ ] LCP < 1.2s on 4G — deferred to QA wave. Design choices (no images, fonts
      via `next/font`, no third-party scripts) are consistent with hitting
      this target.
