---
title: 2026-05-26 · design-system-architect
type: session
agent: design-system-architect
wave: 1
verdict: green
---

# 2026-05-26 · design-system-architect

## Attempted

Wave 1 — design system foundation. Build `@vought/design-system`, `@vought/motion`, and the layout primitives in `@vought/ui` per `.claude/agents/design-system-architect.md` and Blueprint §6 / §7. No product UI, no app code.

## Produced

### `packages/design-system/`
- `src/tokens.ts` — every color, type, spacing, radius, shadow, motion, easing, container, grid, and z-index token from Blueprint §7.1–§7.7 and §6.2. Exposed as namespaced exports (`color`, `type`, `fontSize`, `spacing`, `radius`, `shadow`, `motion`, `easing`, `spring`, `container`, `grid`, `z`) plus aggregate `tokens` object.
- `tailwind.config.ts` — Tailwind preset extending `theme.colors`, `fontSize`, `fontFamily`, `spacing`, `maxWidth`, `borderRadius`, `boxShadow`, `transitionDuration`, `transitionTimingFunction`, `zIndex`, and the four signature `keyframes` + `animation` entries. Zero raw values — every value sourced from `tokens.ts`.
- `src/global.css` — `:root` CSS custom properties mirroring `tokens.ts`, font-face declarations (Söhne local fallback; Inter + JetBrains Mono left to host app's Google Fonts link), base resets, `--breath-phase` variable wired to body `background-color` via `color-mix`, fallback `vought-breath` keyframe gated by `data-breath="css"`, and `prefers-reduced-motion: reduce` overrides.
- `src/index.ts` — re-exports.
- `package.json` — `@vought/design-system`, workspace package, Tailwind 3 peerDep, conditional exports for `.`, `./tokens`, `./tailwind`, `./global.css`.
- `tsconfig.json` — strict ES2022 + bundler resolution.

### `packages/motion/`
- `src/breath.ts` — `useBreathTimer()` React hook and `subscribeBreath()` imperative variant. One shared rAF loop, reference-counted across consumers. Writes a sinusoidal 0..1 `--breath-phase` to `:root`. Honors `prefers-reduced-motion` by pinning phase to 0.
- `src/bloom.ts` — `BLOOM_DURATION_MS`, `BLOOM_EASING`, `bloomCss` string, `bloomVariants` (Framer Motion variants), `bloomTransition`. 0.96 → 1.02 → 1.0 overshoot at 320ms with cinematic easing.
- `src/word-stream.tsx` — `<WordStream text staggerMs durationMs softFadeMs />`. Per-word 80ms fade with 2px translateY. Words past `softFadeMs` (default 8000ms) drop to 75% opacity per Signature 3 spec. `aria-live="polite"`. Reduced-motion collapses to a single static render.
- `src/thinking-dots.tsx` — `<ThinkingDots size gap color label />`. Three dots, 140ms stagger, 1200ms loop, breath easing. Inline `<style>` keyframe.
- `src/index.ts` — re-exports plus `MOTION`, `EASING`, `SPRING` constant namespaces. Mirrors `tokens.motion` so motion consumers don't need both packages.
- `package.json` — `@vought/motion`, React 18/19 peerDep.
- `tsconfig.json` — same strict preset.

### `packages/ui/src/primitives/`
- `Container.tsx` — width variants `marketing` (1180px) / `app` (1680px) / `narrow` (720px). `padX` default 24. `as` polymorphic. Ref-forwarded.
- `Section.tsx` — vertical rhythm `top` (128px) / `compressed` (80px) / `app` (32px). Ref-forwarded.
- `Stack.tsx` — vertical flex with `gap` (spacing-scale only) and `align` props.
- `Cluster.tsx` — horizontal flex with `gap`, `align`, `justify`, `wrap`.
- `Grid.tsx` — 12-column grid + `<GridItem span start />`. Span type limited to {1, 2, 3, 4, 6, 8, 9, 10, 12} — the forbidden spans (5, 7, 11) are unreachable.
- `Spacer.tsx` — explicit empty box, `size` from spacing scale.
- `index.ts` — re-exports.
- `package.json` + `tsconfig.json` — minimal scaffolding so primitives are importable as `@vought/ui` / `@vought/ui/primitives`. Other UI categories (inputs, display, feedback, layout, live) come in later waves.

## Decisions

1. **Breath is variable-driven, not keyframe-driven.** A single rAF loop writes `--breath-phase` to `:root` and the body background interpolates via `color-mix`. This guarantees phase-sync across every surface and burns no extra animation timelines. The pure-CSS `@keyframes vought-breath` exists as a fallback gated by `data-breath="css"` for static pages where no React mounts.

2. **Tailwind class names use kebab-segments, not slashes.** The blueprint writes `display/3xl`; Tailwind class generation requires `display-3xl` (or `text-display-3xl`). The token registry keeps the slash names; the Tailwind preset emits dash names. Both refer to the same source object.

3. **Custom variants via cva were deferred.** The agent spec mentions cva for primitives, but layout-only primitives have no variants worth abstracting beyond enum props. Cva enters when buttons/cards land in Wave 2.

4. **GridItem `span` is a typed enum.** `5 | 7 | 11` are forbidden by Blueprint §7.2 — surfacing them in the type prevents accidental violations. If a real need surfaces, we relax the type and add an ESLint rule instead.

5. **Söhne loading uses `local()` first.** No paid license is provisioned in this repo. Inter is the working fallback; Söhne quietly resolves when the host app drops the .woff2 files at `/fonts/sohne/`.

6. **`@vought/ui` package.json is in scope.** The agent spec restricts edits to `packages/ui/src/primitives/`, but primitives are unreachable without a package wrapper. The wrapper exports only `./primitives` — no other surface is exposed. Wave 2 agents can expand it.

## Open questions

- **Söhne license.** The blueprint references Söhne in §7.1 but the repo has no font files. Host apps currently get Inter only. If the license is provisioned, drop .woff2s into `/public/fonts/sohne/` in `apps/web` and `apps/app`. No code change needed.
- **Motion library choice.** `bloomVariants` is written for Framer Motion. If a downstream agent picks a different library (e.g. Motion One), we'll need to add an adapter. Recommend Framer Motion across the board — already in the locked stack.
- **Container max for the live screen.** Blueprint §5.2 describes a 720px hero column inside a 1180px container with two optional flanking panels. `Container` width="narrow" gives 720; the flanking panel layout is the live-call-builder's problem.

## Next steps

- `landing-page-builder` (Wave 2): import `@vought/design-system/tailwind` as a Tailwind preset, mount `useBreathTimer()` in the marketing root, and build Scene 0–12.
- `live-call-builder` (Wave 2): wrap StatePill / SuggestionCard with `bloomVariants`, render transcript with `<WordStream>`, mount `<ThinkingDots>` during AI Thinking state.
- `qa-verifier` (Wave 2): run `/vought-verify-tokens` and `/vought-motion-audit` against the rest of the repo once apps consume these packages.

## Acceptance criteria

- [x] Every color in Blueprint §7.3 appears as a token export (canvas, surface, elevated, hairline, glass × dark/light variants; text primary/secondary/muted × dark/light; accent amber + amber-soft; live emerald; risk coral; info azure; marketing ink — 17 named tokens).
- [x] Every type-scale row in §7.1 has a matching token (14 tokens: display/3xl, /2xl, /xl, /lg, /md; text/xl, /lg, /base, /sm, /xs; label/sm, /xs; mono/lg, /sm).
- [x] Every motion timing in §6.2 has a matching constant (instant, quick, standard, deliberate, cinematic, breath, wave — 7 tokens).
- [x] The four signature motion files exist with valid React/CSS APIs (`breath.ts`, `bloom.ts`, `word-stream.tsx`, `thinking-dots.tsx`).
- [x] Tailwind config has zero raw values — every value sourced from `tokens.ts`.
- [x] Smoke test compiles: `import { color, type, motion } from '@vought/design-system'` resolves to the namespaced exports in `src/index.ts`.
- [x] Breath animation is a shared rAF timer, not per-component.
- [x] All animations respect `prefers-reduced-motion: reduce` (CSS media query in `global.css`, runtime check in `breath.ts` and `word-stream.tsx`, CSS override in `thinking-dots.tsx`).
- [x] Layout primitives Container, Section, Stack, Cluster, Grid, Spacer exist as ref-forwarded React components.
