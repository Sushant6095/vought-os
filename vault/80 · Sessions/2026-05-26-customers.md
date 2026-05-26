---
date: 2026-05-26
agent: marketing-page-builder
wave: 5
scope: /customers route
---

# Wave 5 · /customers — session log

## What shipped

- `apps/web/app/customers/page.tsx` — the full `/customers` marketing page (six sections, ~1000vh).
- No new components in `apps/web/components/marketing/`. Page reuses existing primitives.

## Section composition (in order)

1. **CustomersHero** — local. Pattern matches `Hero.tsx`: amber overline → `display-3xl` headline → `text-xl` subhead → four mono metric tiles split by hairline dividers. Headline copy is the exact brief: *"Built for the conversations that move revenue."*
2. **LogoWall** — local. Six wordmarks from the landing `CustomerLogos` strip, laid out as a 3×2 grid of 176px-tall tiles. Each tile is a `<Link>` to `/customers/{slug}` with an industry caption that fades in on hover. Tiles are separated by `gap-px` over a `bg-white/[0.02]` shell — surface-color seam, not a literal border.
3. **CustomerStory** — reused from `components/marketing/CustomerStory.tsx`. TripleByte quote + three metric tiles. No prop changes; component already includes the "Read the story" CTA to `/customers/triplebyte`.
4. **CaseStudyGrid** — local. Six cards in a `lg:grid-cols-3` layout. Each card: customer wordmark + industry overline, oversized mono metric, summary paragraph, "Read story →" amber CTA. Five non-TripleByte cards are stubbed with plausible content (Acme, Parallel, Cobalt, Northwind, runway).
5. **OutcomesByIndustry** — local. Four-column metric grid (Sales 73% accept, Support 38% deflect, Real estate 11 min saved, Medical 41% adherence). Uses `Grid`/`GridItem` primitives.
6. **CTAStrip** — reused. Triggers the same canvas-shift on intersection.

## Token + motion discipline

- Every color from Tailwind token classes (`bg-surface-dark`, `bg-canvas-dark`, `border-white/[0.08]`, `text-accent-amber`, `text-live-emerald`). No raw hex anywhere.
- Every animated reveal uses the `.reveal` class with `transitionDelay` on the canonical 80 / 160 / 240 / 360 ms scale. No new keyframes, no custom durations.
- Every numeric value uses `CountUp` (mono numerals with viewport-triggered count-up). Latency badge in the hero uses the brand callsign format: amber `·` prefix + mono `412ms`.
- All transitions use `duration-quick ease-quick` tokens — same as PillarCards / CustomerStory.
- One amber accent. One emerald accent only in TrustGrid-style live contexts (not used on this page). No second accent color introduced.

## Brand voice audit

- Declarative sentences throughout. No "AI-powered", "supercharge", "revolutionize", "10x".
- Concrete numbers everywhere a number could go (`$4.2M`, `1287`, `412ms`, `11 min`, `41%`). No "fast", no "quick", no "soon".
- Named customers, never anonymous. The overline above the logo wall is intentionally *"Six named teams · zero anonymous logos"* — reinforces the brand position from `vault/10 · Strategy/Brand Voice.md`.
- No CTA reads "Learn more". Every CTA uses a specific verb: *Read story, Book your demo, Talk to sales*.

## Responsive

- Hero: single column on mobile, four metric tiles wrap.
- Logo wall: `grid-cols-2 md:grid-cols-3`. Two-up on mobile / phone, three-up from md.
- Case study grid: `md:grid-cols-2 lg:grid-cols-3`. Stacks at 375px.
- Outcomes: `md:!col-span-6 lg:!col-span-3`. Four-up at lg, two-up at md, stacked on mobile.
- All sections share the `Container width="marketing"` 1180px ceiling and 24px gutter from the design-system tokens.

## What I did not touch

- `apps/web/app/page.tsx` — landing.
- `apps/web/components/marketing/*` — every existing component preserved exactly.
- `packages/design-system`, `packages/motion`, `packages/ui` — zero changes.
- `components/nav/NavPill.tsx` — already lists `/customers`.
- `apps/app`, `services/`.

## Verification

- `pnpm tsc --noEmit` from `apps/web` reports zero errors originating in `customers/page.tsx` (the pre-existing primitive errors in `packages/ui` and `packages/design-system` are present on the landing page too and are out of scope for Wave 5).
- All Tailwind class names used here are already in use elsewhere in `components/marketing/` — verified by grep.

## Open follow-ups (not in this wave's scope)

- `/customers/[slug]` long-form case study route — links are stubbed to `#`-equivalent URLs (`/customers/triplebyte` is the only real one; the other five resolve to a not-yet-built route).
- TripleByte avatar in `CustomerStory` is still a placeholder div; replacing with a real portrait is a downstream design-asset task.
- If we ever introduce a `bg-marketing-canvas` Tailwind alias, the LogoWall tile background can switch to it. For now `bg-canvas-dark` matches the existing tokenset exactly.
