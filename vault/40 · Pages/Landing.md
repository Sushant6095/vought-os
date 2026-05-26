---
title: Landing
type: page
status: implemented
last_updated: 2026-05-26
tags: [marketing, page, landing]
---

# Landing (vought.com)

> The most important single artifact in the company. The 12-scene cinematic
> storyboard from `VOUGHT-DESIGN-BLUEPRINT.md` §6, ported to Next.js 15.

## Scaffold

```
apps/web/
├── app/
│   ├── layout.tsx                       ← marketing root: fonts, breath, nav, footer
│   ├── page.tsx                         ← landing (this page)
│   └── globals.css                      ← marketing-only helpers, layered on @vought/design-system/global.css
├── components/
│   ├── marketing/
│   │   ├── Hero.tsx                     ← Scene 1
│   │   ├── CustomerLogos.tsx            ← Scene 2
│   │   ├── PromiseSection.tsx           ← Scene 3
│   │   ├── PillarCards.tsx              ← Scene 4
│   │   ├── LiveDemoBlock.tsx            ← Scene 5
│   │   ├── ArchitectureDiagram.tsx      ← Scene 6
│   │   ├── CustomerStory.tsx            ← Scene 7
│   │   ├── TrustGrid.tsx                ← Scene 9
│   │   ├── PricingTease.tsx             ← Scene 10
│   │   ├── CTAStrip.tsx                 ← Scene 11
│   │   └── Footer.tsx                   ← Scene 12
│   ├── nav/
│   │   ├── NavPill.tsx                  ← sticky floating glass nav + utility pill
│   │   └── MegaMenu.tsx                 ← products dropdown
│   └── ui/
│       ├── CountUp.tsx                  ← metric tile count-up
│       ├── Icon.tsx                     ← inline SVG glyphs
│       └── MarketingRoot.tsx            ← breath + reveal providers
└── lib/
    ├── use-reveal.ts                    ← IntersectionObserver → .in class
    └── use-count-up.ts                  ← eased numeric animation
```

## Scenes (storyboard ↔ component)

| # | Scene | Component | Notes |
|---|-------|-----------|-------|
| 0 | Nav + utility pill | `nav/NavPill`, `nav/MegaMenu` | Hover delay 120ms, close grace 200ms, Esc closes |
| 1 | Hero | `marketing/Hero` | Floating dashboard preview, three metrics with count-up |
| 2 | Customer logos | `marketing/CustomerLogos` | All wordmarks set in type — no logo images |
| 3 | The promise | `marketing/PromiseSection` | Centered, narrow container (720px) |
| 4 | Three pillars | `marketing/PillarCards` | Copilot middle, amber-edged + flagship tag |
| 5 | Live demo | `marketing/LiveDemoBlock` | Autoplays muted loop, "Tap to hear" dismissable overlay |
| 6 | Architecture | `marketing/ArchitectureDiagram` | 5-node wire flow + 3 latency stages |
| 7 | Customer story | `marketing/CustomerStory` | TripleByte · single named customer |
| 8 | (deferred) | — | Scene 8 ("Solutions") not in mockup; deferred to follow-up wave |
| 9 | Trust + security | `marketing/TrustGrid` | SOC 2 · HIPAA · GDPR · Zero retention |
| 10 | Pricing tease | `marketing/PricingTease` | Personal / Teams (flagship) / Enterprise |
| 11 | CTA strip | `marketing/CTAStrip` | Canvas-shift to near-black on intersection (480ms) |
| 12 | Footer | `marketing/Footer` | Five-column grid, dimmed canvas |

## Motion contract

Every reveal-on-scroll uses the `.reveal` → `.in` pattern from `globals.css`.
Per-element timing is set inline via `style={{ transitionDelay: 'Xms' }}`. The
underlying transition (opacity + transform) is 360ms cinematic — matches
Blueprint §6.2 (motion/deliberate).

Signature motions consumed:

- **Breath (Sig. 1)** — mounted once in `MarketingRoot` via `useBreathTimer()`.
- **Whisper bloom (Sig. 2)** — `bloomCss` injected as a `<style>` block inside
  `LiveDemoBlock`. Suggestion cards in Hero + Live Demo use `.bloom`.
- **Word stream (Sig. 3)** — `<WordStream>` in `LiveDemoBlock`.
- **Thinking dots (Sig. 4)** — `<ThinkingDots>` in `LiveDemoBlock` between
  transcript and suggestion.

## Storyboard deviations

1. **Scene 8 ("Solutions") is not present.** The mockup at
   `mockups/vought-landing-cinematic.html` jumps directly from Scene 7 (Customer
   Story) to Scene 9 (Trust). The blueprint's §6 references a "Solutions" beat
   but the cinematic reference does not include it. Decision: ship the mockup
   verbatim. Solutions belongs on its own page (`/solutions/*`) once those
   surfaces exist — adding a thin overview row mid-landing would dilute the
   single named customer (TripleByte) that anchors Scene 7. Revisit if the
   sales team needs a vertical-specific entry-point before the customers page
   ships.

2. **No Söhne font.** Söhne is paid and not licensed in this repo. The
   `.display-*` classes resolve to Inter via the `font-family` cascade in
   `globals.css`. When the license is provisioned, drop `.woff2` files into
   `apps/web/public/fonts/sohne/` and the `@font-face` declaration in
   `@vought/design-system/global.css` will pick them up — no code change.

3. **Canvas-shift duration of 480ms.** This sits between the canonical
   `deliberate` (360ms) and `cinematic` (640ms) durations and is the one
   intentional exception to the seven-token motion table. It's called out
   in Blueprint §6 (Scene 11) and is documented in `CTAStrip.tsx`. The
   motion audit allowlist should cover this one occurrence; everything
   else inherits from `@vought/design-system` tokens.

4. **No real social-icon assets.** X and LinkedIn marks are inline SVGs at
   `components/ui/Icon.tsx`. We avoid an icon library to keep bundle size
   below the 150kb gzipped landing budget.

## Accessibility

- Every section has a labelled `aria-labelledby` or descriptive `aria-label`.
- The mega menu opens on hover with 120ms delay and on focus immediately;
  Esc closes; outside-click closes; arrow keys are intentionally not trapped
  so the browser's tab order remains correct.
- All four signature motions degrade to simple fades under
  `prefers-reduced-motion: reduce`. The reveal CSS itself collapses to
  `opacity` only (no translateY) in `globals.css`.
- Focus ring inherits from `@vought/design-system/global.css` — 2px amber
  outline with 2px offset, transitioning over `motion/quick`.

## Performance budget

| Metric | Target | Source |
|--------|--------|--------|
| LCP | < 1.2s on 4G | Blueprint §10 |
| CLS | < 0.1 | Blueprint §10 |
| JS bundle | < 150kb gzipped | rules/web/performance.md |
| Lighthouse | ≥ 95 | acceptance criteria |

Optimization notes:

- Fonts via `next/font/google` — auto-subsetted, preconnected, swap.
- All section components import only what they use; `LiveDemoBlock` is the
  only client component that drives an interval, and its loop pauses
  when not visible (relies on the browser's rAF/setInterval throttling
  in background tabs).
- Ambient orbs are rendered with CSS `filter: blur(60px)` rather than
  images.
- No external image assets on the landing page — all imagery is geometric
  CSS or inline SVG.

## Routes referenced

The landing CTAs link to routes that don't all exist yet. Track them so the
follow-up wave knows the surface:

- `/demo` — book-a-demo flow
- `/tour` — 90s product tour video
- `/copilot`, `/receptionist`, `/insights`, `/personal`, `/platform` — product pages
- `/customers`, `/customers/triplebyte` — customer index + named story
- `/pricing` — full pricing
- `/security` — trust page
- `/docs`, `/changelog`, `/blog`, `/careers`, `/contact`, `/signup`, `/about` — supporting
- `/legal/privacy`, `/legal/terms`, `/legal/dpa` — legal
- `/solutions/{sales,support,smb,healthcare}` — solutions index by vertical

These should be planned in the next wave that builds product pages.
