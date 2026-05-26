---
title: 2026-05-26 · wave-4-summary
type: session
agent: orchestrator
wave: 4
verdict: yellow
---

# 2026-05-26 · wave-4-summary

Polish wave. Two agents in parallel: `motion-polisher` (write-mode, fixes inline) and `accessibility-auditor` (read-only, comprehensive contrast + semantic audit). No file conflicts — motion-polisher edited apps; accessibility-auditor was read-only.

**Motion-polisher returned GREEN** on its Audit-2 fix list. **Accessibility-auditor returned YELLOW** with three CRITICAL design-system contrast issues plus a 9-item must-fix list. Net wave verdict: **YELLOW**.

The wave is "done" in the sense that all work in scope completed cleanly, but three contrast tokens in `packages/design-system/` fail WCAG 1.4.3 by measurement (not estimate). Those must be fixed in `packages/design-system/src/global.css` + `tokens.ts` before the demo. They're a single-file token edit, not architecture.

## Attempted

Spawn wave 4 per `prompts/build/orchestrator-master.prompt.md` and the wave map:

1. **motion-polisher** → in-place edits across `apps/web/` and `apps/app/`, absorbing QA Audit-2 violations (items 3, 6, 9 from wave-3 summary) + standard polish checklist (hover/press/focus/reveal/breath/reduced-motion/GPU hints).
2. **accessibility-auditor** → read-only static audit (no `pnpm install`, so axe/keyboard-walk/SR/touch/zoom are DEFERRED). Primary deliverable: exhaustive WCAG 1.4.3 contrast pass.

Both pre-flight checks were clean — Wave 3 was YELLOW (above the RED stop threshold for both agents).

## Produced

### Motion polisher (GREEN on Audit 2)

**Files edited: 16.** All surgical, no rewrites. `packages/motion/` and `packages/design-system/` untouched per scope.

**Marketing CSS (`apps/web/app/globals.css`):**
- `.pulse-emerald` 1500ms → `var(--motion-breath)` (2000ms canonical)
- `.pulse-amber` 1800ms → `var(--motion-breath)`
- `.wave-bar` 1200ms → `var(--motion-breath)`
- `.float-anim` **6000ms → `var(--motion-wave)`** (4000ms — was the only outright off-table duration; QA Audit-2 headline offender resolved)

**Live screen (`apps/app/app/live/[sessionId]/`):**
- `SpeakerTimeline.tsx:109` inline 240ms literal → `var(--motion-standard) var(--easing-standard)`
- `SuggestionCard.tsx:83` — allowlisted 200ms duration kept, easing now references `var(--easing-instant, …)` with fallback
- `page.tsx:627` — added `ease-quick` for hover transition consistency

**Onboarding voice:**
- `WaveformVisualizer.tsx` — both 80ms and off-canonical 60ms transitions → `var(--motion-instant)`
- `CountdownTimer.tsx:59` and `RecordButton.tsx:51` — 80ms literals → `var(--motion-instant)`
- `RecordButton.tsx:61` — Framer `duration: 2` → `BREATH_SECONDS` derived from `MOTION.breath`
- `page.tsx` — Framer `duration: 0.15` → `QUICK_SECONDS` derived from `MOTION.quick`

**Marketing stagger ladders (normalized to canonical {0, 80, 240, 360, 640}):**
- `Hero.tsx`, `PromiseSection.tsx`, `CustomerStory.tsx`, `CTAStrip.tsx`, `CustomerLogos.tsx`, `LiveDemoBlock.tsx`, `ArchitectureDiagram.tsx` (including `wireDelayMs i*200 → i*240`), `TrustGrid.tsx`, `PricingTease.tsx`, `PillarCards.tsx`
- `NavPill.tsx` (5 nav-link sites) and `MegaMenu.tsx:125` — added explicit `duration-quick ease-quick`

**Signature-motion drift caught:**
- `apps/app/app/globals.css` — local `.bloom` was using `var(--motion-deliberate, 320ms)` (resolved to 360ms at runtime, NOT the canonical `BLOOM_DURATION_MS = 320ms` from `@vought/motion`). Replaced with literal `320ms` + comment citing `@vought/motion` as source of truth. Bloom is now consistent across CSS-class and Framer-variant paths.

**Three Blueprint allowlisted exceptions preserved untouched**: Listening 1500ms pulse, Whispering 1800ms pulse, interruption 200ms fade.

Session log: `vault/80 · Sessions/2026-05-26-motion-polisher.md`.

### Accessibility auditor (YELLOW — three CRITICAL contrast issues)

**Audit 4 (Color independence) PASS** — every color-coded state has a non-color cue (text label, icon, motion). One note: coral on light canvas is 2.78:1 but not currently deployed on any light-canvas page.

**Audit 6 (Reduced motion) PASS** — coverage verified across `packages/design-system/src/global.css`, `packages/motion/src/breath.ts`, `packages/motion/src/word-stream.tsx`, `apps/web/app/globals.css`, and `apps/app/app/onboarding/voice/_components/WaveformVisualizer.tsx`.

**Audit 8 (Contrast) FAIL** — primary deliverable. Three CRITICAL contrast failures measured against WCAG 2.1 luminance formula:

| Token | Used on | Ratio | WCAG | Status |
|---|---|---|---|---|
| `color.text.mutedDark` (`#5C5C66`) | `canvas.dark` (`#0A0A0B`) | **2.99:1** | 1.4.3 AA Normal needs 4.5:1 | **FAIL** |
| `color.text.mutedDark` | `surface.dark` (`#131316`) | **2.81:1** | 1.4.3 | **FAIL** |
| `color.text.mutedDark` | `elevated.dark` (`#1A1A1E`) | **2.63:1** | 1.4.3 | **FAIL** |
| `color.text.mutedLight` (`#A3A3AB`) | `canvas.light` (`#FAF8F3`) | **2.36:1** | 1.4.3 | **FAIL** |
| `color.accent.amber` (`#F5A524`) | `canvas.light` (`#FAF8F3`) | **1.92:1** | 1.4.3 | **FAIL** (latent — not currently deployed on light text, but token carries no restriction) |
| `color.risk.coral` (`#F26D5B`) | `canvas.light` | **2.78:1** | 1.4.3 | **FAIL** (latent) |

Token fixes (single-file edits in `packages/design-system/src/global.css` + `tokens.ts`):
1. `--color-text-muted-dark`: `#5C5C66` → `#797979` (4.55:1)
2. `--color-text-muted-light`: `#A3A3AB` → `#646464` (5.58:1)
3. Add `color.accent.amberDark = '#B87A10'` (~4.6:1 on white) for light-canvas amber text
4. Add `color.risk.coralLight = '#C94432'` (4.54:1 on light canvas) for light-mode error text

**Audit 3 (Screen reader, static) PASS with 3 findings:**
- **MEDIUM** — SuggestionCard bloom is silent on screen readers. Add `aria-live="polite"` to the container `<div>` at `apps/app/app/live/[sessionId]/page.tsx:587`.
- **MEDIUM** — No `<h1>` on the live screen (WCAG 2.4.6). Add `<h1 className="sr-only">Live call · {personaLabel}</h1>` inside `<Container as="main">` at `page.tsx:552`.
- **LOW** — `WordStream` loses `aria-live` on the reduced-motion path (`packages/motion/src/word-stream.tsx:99` vs `:106`). Move `aria-live="polite"` to the root element returned by both branches.

**Audit 2 (Keyboard, static) PASS with 2 issues:**
- **MEDIUM** — `Escape` ends session and pushes to `/` with no focus-return; should be documented as intentional.
- **LOW** — `ListeningPlaceholder` (`page.tsx:702`) text changes are invisible to screen readers; add `aria-live`.

**Audit 5 (Touch targets, static) PASS with 2 findings:**
- **MEDIUM** — `ActionTile` in `SuggestionCard.tsx:177` computes to ~38px height (`py-3 px-2` + `text-label-sm`). Below WCAG 2.5.5 44px target. Add `min-h-[44px]`.
- **LOW** — End-session button and DeleteVoiceDialog action buttons are ~28-36px. Bump to `py-3` / `min-h-[44px]`.

**Audits 1, 2-dynamic, 3-live, 5-dynamic, 7 DEFERRED** — require `pnpm install` + dev server + browser. Static substitutes performed where possible.

Session log: `vault/80 · Sessions/2026-05-26-accessibility-auditor.md`.

## Decisions

1. **Motion-polisher dropped `.float-anim` from 6000ms to 4000ms** rather than extending the canonical table. Recommendation per QA was either; 4000ms (canonical `wave`) reads as the calmer choice and stays on-spec.
2. **Marketing pulse durations resolved by collapsing to `var(--motion-breath)` (2000ms).** Removes the "marketing parity exception" decision entirely — pulses now sit on the canonical scale, not on the live-screen exception.
3. **Bloom drift in `apps/app/app/globals.css` caught and fixed** — was running at 360ms instead of 320ms because the `var(--motion-deliberate, 320ms)` resolved to the existing `--motion-deliberate` (360ms). Replaced with literal `320ms` + comment.
4. **Contrast must-fix is a `packages/design-system/` edit** — motion-polisher is explicitly scoped out of that package. Accessibility-auditor is read-only. **No agent in this wave can land the contrast fix.** Surfaces back to the user / design-system-architect.
5. **`<h1>` and SuggestionCard `aria-live` are 2-line edits** in `apps/app/app/live/[sessionId]/page.tsx`. Accessibility-auditor is read-only; live-call-builder owns that file. Surfaces back.

## Open questions

- **Contrast token fixes (3 CRITICAL).** These need `design-system-architect` to edit `packages/design-system/src/global.css` + `tokens.ts`. Not in any current wave's scope.
- **Live-screen semantic fixes** (`<h1 sr-only>` + SuggestionCard `aria-live="polite"`). These need `live-call-builder` to touch `apps/app/app/live/[sessionId]/page.tsx`. Not in any current wave's scope.
- **`WordStream` reduced-motion `aria-live`** (1-line move). `packages/motion/src/word-stream.tsx`. `design-system-architect`-adjacent or a focused `motion-polisher` follow-up if the scope were relaxed.
- **Touch-target bumps** (`ActionTile`, end-session, DeleteVoiceDialog buttons). Spread across `live-call-builder` and `voice-clone-builder` territories.
- **Token gaps surfaced by motion-polisher:** `--easing-instant` is referenced in CSS but missing from `:root` in `packages/design-system/src/global.css` (one-line addition). Optional: formalize a `tokens.motion.stagger` scale or add `--motion-breath-half`. Latent drift risk: `.bloom` declared both in `apps/app/app/globals.css` and `packages/motion/src/bloom.ts` (`bloomCss`) — could be deduplicated.
- **`pnpm install` / dev server / HF token / recorded audio rig** — until these land, six accessibility audits stay DEFERRED.

## Acceptance criteria · wave-level

- [x] motion-polisher: Audit-2 fix list fully absorbed; bloom drift caught and fixed; allowlisted exceptions preserved; surgical Edit-only changes.
- [x] motion-polisher: no `packages/motion/` or `packages/design-system/` edits (token gaps flagged, not introduced).
- [x] accessibility-auditor: exhaustive static contrast pass against the full token set; three CRITICAL failures measured (not estimated).
- [x] accessibility-auditor: read-only — no code edits attempted.
- [x] Both session logs match the Session Template.
- [x] No file conflicts between the two agents.
- [ ] **GREEN gate NOT met.** Three CRITICAL contrast failures + the deferred dynamic audits block a clean GREEN. Verdict is YELLOW.

## Next steps

Wave 4 is **YELLOW**. The remaining must-fix list is no longer architectural — it's a small set of targeted edits across packages and apps owned by agents from prior waves. There's no Wave 5 in the canonical wave map; this work should be dispatched as a focused follow-up.

**Recommended next: spawn three small focused tasks in parallel** (all touch disjoint files, all under ~10 lines each):

1. **design-system-architect** — token contrast fixes. Edit `packages/design-system/src/global.css` and `packages/design-system/src/tokens.ts`:
   - `--color-text-muted-dark`: `#5C5C66` → `#797979`
   - `--color-text-muted-light`: `#A3A3AB` → `#646464`
   - Add `color.accent.amberDark = '#B87A10'` and `color.risk.coralLight = '#C94432'`
   - Add missing `--easing-instant` to `:root`
   - Optionally also: `--motion-breath-half`, document `tokens.motion.stagger` scale, deduplicate `.bloom` CSS.

2. **live-call-builder** — live-screen semantic + touch-target fixes. Edit `apps/app/app/live/[sessionId]/`:
   - Add `<h1 className="sr-only">` to `page.tsx:552`
   - Add `aria-live="polite"` to SuggestionCard container at `page.tsx:587`
   - Add `aria-live` to `ListeningPlaceholder` at `page.tsx:702`
   - Bump `ActionTile` and end-session button to `min-h-[44px]`

3. **voice-clone-builder** — touch-target bumps in `apps/app/app/settings/voice/_components/DeleteVoiceDialog.tsx:171-194` (action buttons to `py-3` / `min-h-[44px]`).

After those land, optionally re-run `qa-verifier` and `accessibility-auditor` (briefly) to confirm GREEN — but the changes are so small that a manual re-grep against the YELLOW must-fix list should suffice.

**Also before final demo (still recommended):**
- `pnpm install` at the repo root.
- HF_TOKEN + 2-speaker recorded audio rig for the deferred diart criteria.
- Boot the stack and run Lighthouse + axe + the 3 latency captures.

Do **not** spawn the focused follow-up from this summary — return to the user.
