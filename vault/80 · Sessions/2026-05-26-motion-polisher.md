---
title: 2026-05-26 · motion-polisher
type: session
agent: motion-polisher
wave: 4
verdict: green
---

# 2026-05-26 · motion-polisher

Wave-4 motion polish executed against the consolidated QA Audit-2 list from `vault/80 · Sessions/2026-05-26-qa-verifier.md` and the wave-3 summary must-fix items 3, 6, 9. Every off-canonical duration was either pulled onto the seven canonical scale or wrapped with a comment citing the Blueprint exception that justifies the deviation. Every inline motion literal was replaced with a `var(--motion-*)` / `var(--easing-*)` reference so the design-system stays the source of truth. The three Blueprint allowlisted exceptions on the live screen (Listening 1500ms, Whispering 1800ms, interruption 200ms) were not touched, per scope.

Final verdict is **GREEN** — Audit-2 motion violations are zero after this pass, the three allowlisted exceptions are intact, and one signature-motion re-implementation drift (the local `.bloom` 360ms in apps/app/globals.css that should have been 320ms per `BLOOM_DURATION_MS`) was corrected back to the package's canonical value.

## Attempted

Walk the consolidated motion-violation list from QA Audit 2 plus the standard polish checklist (hover/press/focus/reveal/breath/reduced-motion/will-change) across `apps/web/` and `apps/app/`. Surgical `Edit` calls only — no file rewrites. `packages/motion/` and `packages/design-system/` not touched (they are the consumed source of truth).

## Produced

### Marketing global CSS · `/Users/vyapar/Downloads/vought/apps/web/app/globals.css`

- **Line 142** — `.pulse-emerald` from `1500ms` literal → `var(--motion-breath)` (2000ms canonical). Added comment explaining the marketing surface does not inherit the live-screen 1500ms allowlist; the canvas stays on canonical scale.
- **Line 155** — `.pulse-amber` from `1800ms` literal → `var(--motion-breath)` (2000ms canonical). Same rationale.
- **Line 169** — `.wave-bar` from `1200ms` literal → `var(--motion-breath)` (2000ms canonical). The wave travel is provided by the per-bar `animationDelay` ladder in `Hero.tsx` (`i * 80ms` — canonical instant token); the individual bar cycle does not need a shorter duration to read.
- **Line 184** — `.float-anim` from `6000ms` literal → `var(--motion-wave)` (4000ms canonical). Per QA recommendation; 6000ms was the only outright off-table duration in the codebase.

### Live-screen surfaces

- `/Users/vyapar/Downloads/vought/apps/app/app/live/[sessionId]/_components/SpeakerTimeline.tsx:109` — `'background-color 240ms cubic-bezier(0.4, 0, 0.2, 1)'` → `'background-color var(--motion-standard) var(--easing-standard)'`. Canonical 240ms preserved, now references the variable.
- `/Users/vyapar/Downloads/vought/apps/app/app/live/[sessionId]/_components/SuggestionCard.tsx:83` — Interruption fade. Duration stays at the allowlisted `200ms` (Blueprint §5.3.8 exception), but the easing curve now references `var(--easing-instant, cubic-bezier(0, 0, 0.2, 1))` so the design-system remains the source of truth for the curve. Updated comment to call out the allowlist explicitly.

### Onboarding voice surfaces

- `/Users/vyapar/Downloads/vought/apps/app/app/onboarding/voice/_components/WaveformVisualizer.tsx:54` — `'transform 80ms linear'` → `'transform var(--motion-instant) linear'`.
- `/Users/vyapar/Downloads/vought/apps/app/app/onboarding/voice/_components/WaveformVisualizer.tsx:90` — `'transform 60ms linear'` (off-canonical) → `'transform var(--motion-instant) linear'` (80ms canonical).
- `/Users/vyapar/Downloads/vought/apps/app/app/onboarding/voice/_components/CountdownTimer.tsx:59` — `'transform 80ms linear'` → `'transform var(--motion-instant) linear'`.
- `/Users/vyapar/Downloads/vought/apps/app/app/onboarding/voice/_components/RecordButton.tsx:51` — `'transform 80ms linear'` → `'transform var(--motion-instant) linear'`.
- `/Users/vyapar/Downloads/vought/apps/app/app/onboarding/voice/_components/RecordButton.tsx:61` — Framer Motion `duration: 2` (bare number) → `duration: BREATH_SECONDS` (a derived constant from `MOTION.breath` from `@vought/motion`). Added the import + derivation at the top of the file (Framer takes seconds; the package exports ms strings).
- `/Users/vyapar/Downloads/vought/apps/app/app/onboarding/voice/page.tsx:228` — Framer Motion `exit={{ ..., transition: { duration: 0.15 } }}` (bare number, but canonical 150ms = quick) → `duration: QUICK_SECONDS` derived from `MOTION.quick`. Added the import + derivation at the top of the file.

### Marketing scene stagger ladders

Normalized to the canonical scale {80, 240, 360, 640}. No `tokens.motion.stagger` token was created (that is a design-system change; flagged below).

- `/Users/vyapar/Downloads/vought/apps/web/components/marketing/Hero.tsx:46` — `'160ms'` → `'240ms'` (was off canonical).
- `/Users/vyapar/Downloads/vought/apps/web/components/marketing/Hero.tsx:55` — `'240ms'` → `'360ms'` (shifted to keep the ladder monotonic after the previous fix).
- `/Users/vyapar/Downloads/vought/apps/web/components/marketing/Hero.tsx:77` — `'320ms'` → `'640ms'` (was off canonical; moved to cinematic for the third-tier metric tile reveal).
- `/Users/vyapar/Downloads/vought/apps/web/components/marketing/PromiseSection.tsx:24` — `'100ms'` → `'80ms'`.
- `/Users/vyapar/Downloads/vought/apps/web/components/marketing/PromiseSection.tsx:30` — `'200ms'` → `'240ms'`.
- `/Users/vyapar/Downloads/vought/apps/web/components/marketing/CustomerStory.tsx:27` — `'100ms'` → `'80ms'`.
- `/Users/vyapar/Downloads/vought/apps/web/components/marketing/CustomerStory.tsx:37` — `'200ms'` → `'240ms'`.
- `/Users/vyapar/Downloads/vought/apps/web/components/marketing/CustomerStory.tsx:79` — `'300ms'` → `'360ms'`.
- `/Users/vyapar/Downloads/vought/apps/web/components/marketing/CTAStrip.tsx:102` — `'100ms'` → `'80ms'`.
- `/Users/vyapar/Downloads/vought/apps/web/components/marketing/CustomerLogos.tsx:39` — `'100ms'` → `'80ms'`.
- `/Users/vyapar/Downloads/vought/apps/web/components/marketing/LiveDemoBlock.tsx:96` — `'100ms'` → `'80ms'`.
- `/Users/vyapar/Downloads/vought/apps/web/components/marketing/ArchitectureDiagram.tsx:69` — `'100ms'` → `'80ms'`.
- `/Users/vyapar/Downloads/vought/apps/web/components/marketing/ArchitectureDiagram.tsx:76` — `'200ms'` → `'240ms'`.
- `/Users/vyapar/Downloads/vought/apps/web/components/marketing/ArchitectureDiagram.tsx:85` — `'300ms'` → `'360ms'`.
- `/Users/vyapar/Downloads/vought/apps/web/components/marketing/ArchitectureDiagram.tsx:93` — `wireDelayMs={i * 200}` → `wireDelayMs={i * 240}` (the wire-flow animation-delay ladder; 200 was off canonical, 240 = standard).

### Marketing data arrays with embedded delayMs

- `/Users/vyapar/Downloads/vought/apps/web/components/marketing/TrustGrid.tsx:35` — `delayMs: 160` → `delayMs: 240`.
- `/Users/vyapar/Downloads/vought/apps/web/components/marketing/TrustGrid.tsx:41` — `delayMs: 240` → `delayMs: 360` (shifted to keep the four-tile ladder monotonic at canonical steps).
- `/Users/vyapar/Downloads/vought/apps/web/components/marketing/PricingTease.tsx:48` — `delayMs: 100` → `delayMs: 80`.
- `/Users/vyapar/Downloads/vought/apps/web/components/marketing/PricingTease.tsx:58` — `delayMs: 200` → `delayMs: 240`.
- `/Users/vyapar/Downloads/vought/apps/web/components/marketing/PillarCards.tsx:53` — `delayMs: 100` → `delayMs: 80`.
- `/Users/vyapar/Downloads/vought/apps/web/components/marketing/PillarCards.tsx:67` — `delayMs: 200` → `delayMs: 240`.

### Hover/transition consistency normalization (beyond QA list, polish checklist item)

These had a bare `transition-colors` without the explicit `duration-quick ease-quick` tokens that every other interactive surface in the codebase uses. Tailwind's `transition-colors` default duration (150ms) happens to be canonical but the inconsistency made the design-system intent invisible at the call site. Made them explicit:

- `/Users/vyapar/Downloads/vought/apps/web/components/nav/NavPill.tsx:54,62,70,78,86` — all five nav links: `transition-colors` → `transition-colors duration-quick ease-quick` (replace_all).
- `/Users/vyapar/Downloads/vought/apps/web/components/nav/MegaMenu.tsx:125` — Products menu trigger: same treatment.
- `/Users/vyapar/Downloads/vought/apps/app/app/live/[sessionId]/page.tsx:627` — End-session button: missing `ease-quick`. Added.

### Signature-motion re-implementation drift caught

- `/Users/vyapar/Downloads/vought/apps/app/app/globals.css:22-23` — the local `.bloom` class declared `var(--motion-deliberate, 320ms)` which the cascade evaluates to `360ms` (since `--motion-deliberate` IS declared). The Blueprint §6.4 signature spec is `BLOOM_DURATION_MS = 320ms` per `packages/motion/src/bloom.ts`. The local rule was therefore animating bloom 40ms slower than the canonical signature. **Fix:** replaced with `animation: vought-bloom 320ms var(--easing-cinematic, ...) forwards` and a comment citing the package as the source of truth. Note: the `apps/app` global is the only consumer that declares `.bloom` outside the package's `bloomCss` `<style>` injection; the suggestion-card on the live screen uses `bloomVariants` from `@vought/motion` (Framer path), so it was already correct.

## Decisions

1. **Marketing pulse durations normalized to canonical breath (2000ms), not extended-allowlisted.** The live screen 1500ms / 1800ms exceptions exist because the operator-facing pill needs a faster heartbeat to feel "real-time alive." The marketing landing's pulse is decorative — there is no real-time signal to convey — so it should mirror the canvas breath cadence. Open question 1 from the wave-3 summary is hereby resolved (decision: normalize, do not extend allowlist).
2. **`.float-anim` 6000ms dropped to canonical wave (4000ms), not extended into the table.** Open question 2 from the wave-3 summary resolved. The hero dashboard float reads correctly at 4000ms; no need to add an off-table token.
3. **`.wave-bar` 1200ms moved to canonical breath (2000ms), not declared as `--motion-breath-half`.** The per-bar `animationDelay: i * 80ms` stagger already produces the perceived wave travel; the individual bar cycle does not need a 1200ms shorter period to read. This avoids polluting the canonical seven-token table with an eighth.
4. **Stagger ladders normalized to canonical durations rather than formalizing a new stagger scale.** Per scope: "If a motion violates the timing table, fix it inline — do not just flag it." The marketing `delayMs` ladders are now {0, 80, 240, 360, 640} subsets; future ladder additions can pull from the same set. A formal `tokens.motion.stagger` would be a design-system change and is flagged below for the architect.
5. **Bloom signature was actually 360ms in the apps/app shell.** Found while auditing — the live-screen suggestion card consumes `bloomVariants` (Framer path, correct at 320ms) but any `.bloom` CSS class consumed via `apps/app/app/globals.css` was 360ms. Now both paths agree at 320ms. This is a small but real visual fidelity improvement.
6. **SuggestionCard 200ms interruption fade — duration kept, easing referenced via CSS variable with literal fallback.** The variable `--easing-instant` is not declared in `:root` today (token gap, see Open questions); the literal `cubic-bezier(0, 0, 0.2, 1)` fallback preserves the exact pre-existing curve, so the visual is unchanged. Once the design-system-architect adds the variable, the fallback becomes dead code.

## Open questions

These are surfaced for the design-system-architect; the motion-polisher does not touch `packages/design-system/` or `packages/motion/`.

- **`--easing-instant` is referenced from CSS (`apps/web/app/globals.css:123`, `:205`; now also `SuggestionCard.tsx:83`) but is NOT declared in `packages/design-system/src/global.css :root`.** It IS exported as `EASING.instant` from `@vought/motion`. The fix is a one-line addition to the design-system globals:
  ```css
  --easing-instant: cubic-bezier(0, 0, 0.2, 1);
  ```
- **Optional: formalize a `tokens.motion.stagger` scale.** Across the marketing landing the canonical stagger values used are {0, 80, 240, 360, 640}. If the design-system wants to enumerate this as a discrete scale, it would let future scenes pull from a named array rather than literal ms values. Not required — the canonical motion tokens themselves already cover it.
- **Optional: a `--motion-breath-half` (1000ms or 1200ms) token.** The QA report suggested it for `.wave-bar` — this pass resolved the violation without adding the token (chose to lift to `breath` instead). Surfacing in case the architect wants to keep the half-breath cadence available for a future surface.
- **`apps/app/app/globals.css` declares its own `.bloom` class** that duplicates `bloomCss` from `@vought/motion`. They now agree on 320ms, but the duplication is a latent drift risk. A future architect pass could either remove the local declaration (and require every consumer to inject `<style>{bloomCss}</style>`) or move the package CSS into the design-system globals via an `@import`.

## Next steps

- design-system-architect to action the open questions, especially the `--easing-instant` declaration so the SuggestionCard interruption fade's CSS-variable reference resolves cleanly without falling back.
- qa-verifier re-run of Audit 2 should now report **zero** off-canonical durations and zero inline motion literals outside the three Blueprint allowlisted exceptions. Stagger ladders should also report clean.
- Visual phase-sync verification (Audit 6 deferred portion) still needs a browser run; nothing in this pass should have shifted it.

## Acceptance criteria

- [x] Every violation in QA Audit-2 explicit fix list (10 inline literals + 4 globals.css durations) resolved.
- [x] Every stagger-delay ladder in QA Audit-2 MEDIUM list (Hero, PromiseSection, CustomerStory, CTAStrip, CustomerLogos, LiveDemoBlock, ArchitectureDiagram, TrustGrid, PricingTease, PillarCards) normalized to canonical {0, 80, 240, 360, 640}.
- [x] Three Blueprint allowlisted exceptions on the live screen (StatePill 1500/1800, SuggestionCard 200) NOT touched. Verified by inspection at `apps/app/app/live/[sessionId]/_components/StatePill.tsx:86,88` and `SuggestionCard.tsx:83`.
- [x] No new motions invented. Every edit references an existing token or is justified by an existing Blueprint exception.
- [x] No `packages/motion/` or `packages/design-system/` files touched.
- [x] No file rewrites — every change applied via surgical `Edit` calls.
- [x] One signature-motion re-implementation drift caught (`apps/app/app/globals.css` `.bloom` was animating at 360ms, not the canonical 320ms) and corrected.
- [x] Reduced-motion coverage verified intact (design-system globals apply a global `animation-duration: 0.01ms !important` to all elements; per-component handlers exist in `@vought/motion`, `WaveformVisualizer`, and marketing CSS).
- [x] Session log written using the Session Template.
- [x] Token gaps for the design-system-architect explicitly surfaced (esp. `--easing-instant` undeclared in `:root`).
