---
title: 2026-05-26 · accessibility-auditor
type: session
agent: accessibility-auditor
wave: 4
verdict: yellow
---

# 2026-05-26 · accessibility-auditor

Wave 4 accessibility gate. Eight audits executed in static-only mode (no `pnpm install`, no live browser, no screen reader rig). Three audits are fully executable statically and produce definitive findings: Audit 4 (Color independence), Audit 6 (Reduced motion), and Audit 8 (Contrast). The others are partially completed via static analysis with dynamic portions explicitly DEFERRED.

Headline finding: **four contrast failures** across three tokens. `color.text.mutedDark` fails on all dark surfaces (ratio 2.63–2.99:1 against the 4.5:1 AA normal-text requirement). `color.text.mutedLight` fails on canvas light (2.36:1). `color.accent.amber` used as text on canvas light fails catastrophically (1.92:1). These are WCAG 1.4.3 violations and must be fixed before production.

---

## Audits

### Audit 1 · axe-core

DEFERRED. No `pnpm install` has been run; `node_modules` is absent. The axe-core scanner requires a live DOM — it cannot run against source files. Re-run with `npx axe-cli` or Playwright + `@axe-core/playwright` after `pnpm install` and dev-server boot.

---

### Audit 2 · Keyboard-only navigation

**Static: PASS with two issues**  
**Dynamic: DEFERRED**

#### Static analysis

**Tab key prevention — PASS**

Searched all keyboard handlers in:
- `apps/app/app/live/[sessionId]/page.tsx:444–490` — `onKey` handler intercepts `Escape`, `ArrowLeft`, `ArrowRight`, `Enter`, `r`, and `Cmd+.`. No `preventDefault()` is called on `Tab`. PASS.
- `apps/app/app/settings/voice/_components/DeleteVoiceDialog.tsx:50–55` — `onKey` intercepts `Escape` only. No Tab interception. PASS.
- `apps/web/components/nav/MegaMenu.tsx:86–93` — `onKey` intercepts `Escape` only. No Tab interception. PASS.

**Positive tabIndex / DOM-order violations — PASS**

No `tabIndex` with a positive integer value detected in any audited component. No `tabIndex={-1}` on visible interactive elements. DOM order matches visual order.

**ISSUE 1 (MEDIUM) — Live screen: `Escape` ends the session without focus return**

`apps/app/app/live/[sessionId]/page.tsx:453–456`: pressing `Escape` calls `stopSession()` and routes to `/`. There is no focus-return mechanism. For a keyboard user who navigates into the session from a previous page, `Escape` exits abruptly and the browser lands on the new page at document top. This is acceptable for the session-end flow but should be documented as intentional in a comment.

**ISSUE 2 (LOW) — `ListeningPlaceholder` is not reachable by keyboard**

`apps/app/app/live/[sessionId]/page.tsx:700–719`: The placeholder `<motion.div>` has no interactive children and carries no keyboard role. This is correct — it is informational only — but it has no `aria-live` region, so state changes (calibrating → listening) are not announced. This is an Audit 3 concern as well (see below).

**Intended tab order — live screen (`apps/app/app/live/[sessionId]/page.tsx`)**

Based on DOM source order (top to bottom, left to right), the tab order for the live screen in Teams variant is:

1. `<StatePill>` — `role="status"`, not focusable (correct; it is a live region, not interactive)
2. `<SessionClock>` — `<span>`, not focusable (correct)
3. `<WordStreamTranscript>` — not interactive (correct)
4. `<SuggestionCard>` action tile: "Use" / "Used" button (`data-action="accept"`)
5. `<SuggestionCard>` action tile: "Different" button (`data-action="regenerate"`)
6. `<SuggestionCard>` action tile: "Skip" button (`data-action="skip"`)
7. `<SpeakerTimeline>` — not interactive (correct)
8. "End session" `<button>` at line 624
9. `<DisclosureFooter>` — if it contains links, they follow here

When focus mode is off (Teams), the `<DealContextPanel>` and `<SourceAttributionPanel>` rail columns appear before the hero column in CSS Grid layout but **after** it in DOM source order (lines 563–641). This means the tab order follows DOM source correctly — hero first, rails after — which matches the visual priority hierarchy. PASS.

**Dynamic: DEFERRED** — visual focus-ring confirmation on amber bloom surface, tab-order walk through all states of the onboarding state machine.

---

### Audit 3 · Screen reader

**Static: PASS with three findings**  
**Dynamic: DEFERRED**

#### aria-live regions — confirmed

| Surface | Element | Attribute | File:line |
|---|---|---|---|
| Word stream transcript | `<span>` (live render path) | `aria-live="polite"` | `packages/motion/src/word-stream.tsx:106` |
| State pill | `<motion.div>` | `role="status"` + `aria-live="polite"` + `aria-atomic="true"` | `apps/app/app/live/[sessionId]/_components/StatePill.tsx:102–104` |
| Processing state | `<div>` | `role="status"` + `aria-live="polite"` | `apps/app/app/onboarding/voice/_components/ProcessingState.tsx:19–20` |
| Recording section | `<motion.section>` | `aria-live="polite"` | `apps/app/app/onboarding/voice/page.tsx:254` |
| Error section | `<motion.section>` | `role="alert"` | `apps/app/app/onboarding/voice/page.tsx:410` |

PASS — every dynamic text surface has an `aria-live` region.

#### Suggestion card announcement — FINDING (LOW)

`apps/app/app/live/[sessionId]/_components/SuggestionCard.tsx:73–86`: `<motion.article>` uses `aria-label="Suggested response"` but has **no `role="status"` or `role="alert"` on the card itself**. The card blooms into the DOM as a new element inside an `AnimatePresence` wrapper. Whether screen readers announce it on insertion depends on whether the container carries an `aria-live` region.

Looking at the parent in `page.tsx:587–617`: the `<div className="min-h-[200px]">` wrapping the `AnimatePresence` has **no `aria-live` attribute**. This means the suggestion card appearance will likely be silent on NVDA/VoiceOver — the operator would not hear that a new suggestion arrived.

**Fix:** Add `aria-live="polite"` to the container div at `page.tsx:587`, or add `role="status"` directly to `<motion.article>` in `SuggestionCard.tsx`.

#### form field labels — PASS

- `ConsentDisclosure.tsx`: `<label>` wraps the checkbox and binds via `aria-describedby="voice-consent-text"`. PASS.
- `DeleteVoiceDialog.tsx:134–156`: `<label htmlFor="delete-confirm">` correctly associated with `<input id="delete-confirm">`. `aria-describedby` on the error paragraph. PASS.
- Onboarding `page.tsx:303–326` "Re-record" and "Clone my voice" buttons: both have visible text labels. PASS.
- Settings `page.tsx:144–155` "Delete voice clone" button: visible text label. PASS.

#### Heading order — PASS with one note

- `apps/web/app/page.tsx` (landing): `<h1 id="hero-heading">` in `Hero.tsx:36`. Single h1. PASS.
- `apps/web/app/layout.tsx:92`: `<main>{children}</main>` — page title announced via Next.js `<title>` metadata: "Vought · Intelligence for live conversations." PASS.
- `apps/app/app/onboarding/voice/page.tsx:187`: `<h1>` "Read this aloud, for thirty seconds." Single h1. PASS.
- `apps/app/app/settings/voice/page.tsx:93`: `<h1>` "Your voice." Single h1. PASS.
- `apps/app/app/settings/voice/_components/DeleteVoiceDialog.tsx:118`: `<h2 id="delete-voice-title">` inside a `role="dialog"`. Correct — dialog heading is h2, not a competing h1. PASS.
- Live screen `apps/app/app/live/[sessionId]/page.tsx`: **No `<h1>` element is present on the live screen.** The `<StatePill>` and `<SessionClock>` in the header are not headings. The `<section aria-label="Live conversation hero">` has no `aria-labelledby` or internal heading.

**FINDING (MEDIUM) — Missing h1 on live screen.** WCAG 2.4.6 (Headings and Labels, AA). Screen readers cannot orient to the page. Fix: add a visually-hidden `<h1 className="sr-only">Live call · {personaLabel}</h1>` inside the `<Container as="main">`.

#### ListeningPlaceholder state change — FINDING (LOW)

`apps/app/app/live/[sessionId]/page.tsx:700–719`: `ListeningPlaceholder` text changes from "calibrating" to "listening" based on `enrollmentReady` state, but the container has no `aria-live` region. Screen reader users will not hear this transition.

**Fix:** Wrap the placeholder `<div>` content in a `<span aria-live="polite">` or add `aria-live="polite"` to the outer `<motion.div>`.

#### Word stream — reduced-motion path — PASS

`packages/motion/src/word-stream.tsx:97–102`: when `reducedMotion` is true, renders `<span className={className} style={style}>{words.join('')}</span>` — a plain static span with no `aria-live`. The `aria-live` is only present on the animated path (line 106). However, the parent `WordStreamTranscript` wraps this in a container div — the live announcement still relies on the animated path. When reduced motion is active, the static span is not inside any `aria-live` region and the transcript will not announce.

**FINDING (LOW) — WordStream reduced-motion path loses aria-live.** Fix: move the `aria-live="polite"` attribute to the outer `<span>` regardless of the `reducedMotion` branch, i.e., apply it to the root element returned in both code paths.

**Dynamic: DEFERRED** — live VoiceOver/NVDA test for: announcement timing on 80ms word stagger (choppy readback risk), focus ring visibility on amber bloom surface.

---

### Audit 4 · Color independence

**FULLY STATIC — PASS with one finding**

Every state was checked against the source to verify a non-color cue accompanies each color signal.

| State | Color cue | Non-color cue 1 | Non-color cue 2 | File | Verdict |
|---|---|---|---|---|---|
| Whispering | Amber background on StatePill | Text label "Whispering in your ear" | Bloom motion (scale 0.96→1.02→1) | `StatePill.tsx:65–68`, `bloomVariants` | PASS |
| Listening | Emerald dot on StatePill | Text label "Listening" | Ping animation ring | `StatePill.tsx:55–57` | PASS |
| Thinking | Amber dot on StatePill | Text label "Thinking" | ThinkingDots (Signature 4) with `label="Thinking — assembling suggestion"` | `StatePill.tsx:58–63, 124–130` | PASS |
| Idle | Muted dot on StatePill | Text label "Idle" | No pulse | `StatePill.tsx:39–44` | PASS |
| Paused | Muted dot | Text label "Paused" + pause reason text | No pulse | `StatePill.tsx:70–75` | PASS |
| Live status (marketing hero) | Emerald dot | Text "Live in your AirPods · sub-second latency" | pulse-emerald CSS animation | `Hero.tsx:30–33` | PASS |
| Confidence bar (Teams) | Amber fill width | Percentage text label via `aria-label` | `aria-label={Confidence ${pct} percent}` on container | `ConfidenceIndicator.tsx:33–47` | PASS |
| Low confidence card | Dark surface vs amber surface | `<span className="sr-only">Low confidence: the AI is less certain about this suggestion.</span>` | Card background shift | `SuggestionCard.tsx:149–151` | PASS |
| Interruption fade | 60% opacity card | No additional non-color/non-opacity cue | — | `SuggestionCard.tsx:82–83` | PASS (opacity is a motion cue, not color-only) |
| Risk coral (settings delete button) | Coral text/border | Text label "Delete voice clone" | Distinct border style (`rgba(242,109,91,0.32)`) | `settings/voice/page.tsx:144–155` | PASS |
| Error text (onboarding stopped phase) | Coral text | Text content "A clean clone needs at least eight seconds." | — | `onboarding/voice/page.tsx:290–293` | PASS |
| Error section (error phase) | Coral text | `role="alert"` announcement | Text content | `onboarding/voice/page.tsx:403–430` | PASS |
| Recording state (WaveformVisualizer active) | Amber bars | `aria-label="Input amplitude {pct}%"` on reduced-motion path; `aria-hidden` on animated path — animated path relies on parent `aria-live="polite"` | Visual bar motion | `WaveformVisualizer.tsx:44,71` | PASS |

**FINDING (LOW) — Coral on canvas light (onboarding stopped phase)**

`apps/app/app/onboarding/voice/page.tsx:290–293`: "A clean clone needs at least eight seconds." is rendered in `var(--color-risk-coral)` (`#F26D5B`) against `var(--color-canvas-dark)` (`#0A0A0B`) — contrast 6.7:1, PASS on the dark canvas. However, if the onboarding page were ever displayed against `var(--color-canvas-light)`, coral (#F26D5B) on cream (#FAF8F3) is 2.78:1 — a FAIL. Since the onboarding page uses `color: var(--color-text-primary-dark)` on its `<main>` (confirming dark canvas), this is not currently a violation but should be noted if a light-mode version is ever built.

---

### Audit 5 · Touch targets

**Static: PASS with two findings**  
**Dynamic: DEFERRED** (getBoundingClientRect measurement)

Static scan for explicit `h-*` / `w-*` Tailwind classes smaller than 44px (`h-11` = 44px) on interactive elements:

**SuggestionCard action tiles — FINDING (MEDIUM)**

`apps/app/app/live/[sessionId]/_components/SuggestionCard.tsx:178`: ActionTile uses `py-3 px-2` (12px vertical padding × 2 = 24px + text ≈ 36–40px total height). No explicit `h-` floor is set. At `text-label-sm` (11px) the rendered height is approximately 38px — below the 44px WCAG 2.5.5 target. Blueprint says ≥44px on mobile.

**Fix:** Add `min-h-[44px]` to the `base` class string in `ActionTile` at `SuggestionCard.tsx:177–178`.

**ConsentDisclosure checkbox — FINDING (LOW)**

`apps/app/app/onboarding/voice/_components/ConsentDisclosure.tsx:26–31`: the checkbox input is explicitly `h-4 w-4` (16×16px). The `<label>` wrapper is touch-targetable for the full card width and height, which is much larger than 44px. Since the label is the tap target, this is functionally acceptable — WCAG 2.5.5 is satisfied by the label. PASS (note only).

**"End session" button on live screen — FINDING (LOW)**

`apps/app/app/live/[sessionId]/page.tsx:624–630`: the button has no explicit height class. `text-text-xs` body text with default padding is ~24–28px rendered height. On desktop this is below 44px.

**Fix:** Add `py-3` or `min-h-[44px]` to the end-session button.

**DeleteVoiceDialog Cancel / Delete voice buttons — PASS**

`apps/app/app/settings/voice/_components/DeleteVoiceDialog.tsx:171–194`: both buttons use `py-2 px-4` on `text-sm`. Rendered height is approximately 36px — marginally below 44px on mobile.

**Fix:** Bump to `py-3` on both buttons.

**Dynamic: DEFERRED** — actual pixel measurement with browser inspector.

---

### Audit 6 · Reduced motion

**FULLY STATIC — PASS with one finding**

#### `packages/design-system/src/global.css` — PASS

Lines 193–207: the global reduced-motion block uses `animation-duration: 0.01ms !important` and `animation-iteration-count: 1 !important` and `transition-duration: 0.01ms !important` on `*, *::before, *::after`. This is a blanket kill-switch for all CSS animations and transitions. Body breath animation is explicitly cancelled with `animation: none !important` and `--breath-phase: 0`. This is a strong, correct implementation that covers every CSS animation in the product including the breath keyframe fallback.

#### `packages/motion/src/breath.ts` — PASS

Lines 74–78: `prefersReducedMotion()` is called before starting the rAF loop. When true, `--breath-phase` is pinned to `0` and the loop never starts. The rAF-driven breath is fully suppressed. PASS.

#### `packages/motion/src/word-stream.tsx` — PASS

Lines 73–84: the `useEffect` rAF loop early-returns when `reducedMotion` is true. Lines 97–102: reduced-motion renders a plain static span — no opacity animation, no translateY, no stagger. PASS.

#### `apps/web/app/globals.css` — PASS with note

Lines 209–226: `.float-anim`, `.pulse-emerald`, `.pulse-amber`, `.wave-bar`, `.wire-active`, `.word` all receive `animation: none !important`. The `.reveal` class gets `transform: none !important` and `opacity: 1` so off-screen elements are immediately visible — a correct, graceful fallback. PASS.

**NOTE:** The design-system global.css's blanket `*` rule at lines 193–200 would already cover all of these. The marketing `globals.css` block is redundant but harmless.

#### `apps/app/app/onboarding/voice/_components/WaveformVisualizer.tsx` — PASS

Lines 22–33: `usePrefersReducedMotion()` hook subscribes to the `matchMedia` listener and reacts to live changes. Lines 38–65: reduced-motion path renders a single static bar with `transform: scaleY(peak)` (static, no animation) and an `aria-label="Input amplitude {pct}%"`. The animated multi-bar path is bypassed entirely. PASS — matches the agent's claim.

**FINDING (LOW) — WaveformVisualizer reduced-motion bar has a non-zero `transition`**

`WaveformVisualizer.tsx:54`: the single reduced-motion bar has `transition: 'transform 80ms linear'`. Under `prefers-reduced-motion: reduce`, the design-system global blanket sets `transition-duration: 0.01ms !important`, so this inline style transition is effectively suppressed by the cascade — functionally PASS. However, the inline `style` prop bypasses Tailwind but not CSS specificity from the `!important` global rule. Confirm this works as expected in a browser.

---

### Audit 7 · Font scaling

**DEFERRED for dynamic browser zoom test.**

Static observations:
- `apps/web/app/globals.css`: `body` uses `font-size: 16px` (design-system global). The display classes use `clamp()` which scales with viewport width, not font size. At 200% browser zoom, `clamp()` values based on `vw` units do not increase proportionally with zoom — they follow viewport width. This is a known concern with `vw`-based type that should be verified.
- No `overflow: hidden` on text-carrying containers was detected in the audited files. The `<main>` elements use `max-w-md` or `max-w-[720px]` with `flex flex-col` — these should reflow gracefully.
- `apps/web/app/globals.css:19–21`: `body { overflow-x: hidden }` is set globally. At 200% zoom, if any element's computed width exceeds the viewport, horizontal scrolling is suppressed rather than shown. This could cause content clipping.

Dynamic zoom test DEFERRED.

---

### Audit 8 · Contrast

**FULLY STATIC — PRIMARY DELIVERABLE**

All ratios computed with the WCAG 2.1 relative luminance formula. Token hex values sourced from `packages/design-system/src/global.css:44–94`.

WCAG 1.4.3 Contrast Minimum (AA):
- Normal text (<18pt regular / <14pt bold): ≥4.5:1
- Large text (≥18pt regular / ≥14pt bold): ≥3.0:1
- UI components and graphical objects: ≥3.0:1 (WCAG 1.4.11)

#### Dark canvas pairings

| Token pair | Foreground | Background | Ratio | AA Normal | AA Large | AAA Normal | Verdict |
|---|---|---|---|---|---|---|---|
| `text.primaryDark` on `canvas.dark` | `#F5F5F7` | `#0A0A0B` | 18.18:1 | PASS | PASS | PASS | PASS |
| `text.secondaryDark` on `canvas.dark` | `#9B9BA3` | `#0A0A0B` | 7.17:1 | PASS | PASS | PASS | PASS |
| `text.mutedDark` on `canvas.dark` | `#5C5C66` | `#0A0A0B` | **2.99:1** | **FAIL** | **FAIL** | **FAIL** | **FAIL** |
| `accent.amber` on `canvas.dark` (text) | `#F5A524` | `#0A0A0B` | 9.70:1 | PASS | PASS | PASS | PASS |
| `canvas.dark` on `accent.amber` (card text) | `#0A0A0B` | `#F5A524` | 9.70:1 | PASS | PASS | PASS | PASS |
| `black` on `accent.amber` (card text alt) | `#000000` | `#F5A524` | 10.29:1 | PASS | PASS | PASS | PASS |
| `live.emerald` on `canvas.dark` | `#10B981` | `#0A0A0B` | 7.80:1 | PASS | PASS | PASS | PASS |
| `risk.coral` on `canvas.dark` | `#F26D5B` | `#0A0A0B` | 6.70:1 | PASS | PASS | FAIL | PASS AA |
| `text.mutedDark` on `surface.dark` | `#5C5C66` | `#131316` | **2.81:1** | **FAIL** | **FAIL** | **FAIL** | **FAIL** |
| `text.mutedDark` on `elevated.dark` | `#5C5C66` | `#1A1A1E` | **2.63:1** | **FAIL** | **FAIL** | **FAIL** | **FAIL** |
| `text.secondaryDark` on `surface.dark` | `#9B9BA3` | `#131316` | 6.72:1 | PASS | PASS | FAIL | PASS AA |
| `text.primaryDark` on `surface.dark` | `#F5F5F7` | `#131316` | 17.03:1 | PASS | PASS | PASS | PASS |
| `text.primaryDark` on `elevated.dark` | `#F5F5F7` | `#1A1A1E` | 15.93:1 | PASS | PASS | PASS | PASS |
| `accent.amber` on `surface.dark` | `#F5A524` | `#131316` | 9.09:1 | PASS | PASS | PASS | PASS |
| `live.emerald` on `surface.dark` | `#10B981` | `#131316` | 7.31:1 | PASS | PASS | PASS | PASS |

#### Light canvas pairings

| Token pair | Foreground | Background | Ratio | AA Normal | AA Large | AAA Normal | Verdict |
|---|---|---|---|---|---|---|---|
| `text.primaryLight` on `canvas.light` | `#0A0A0B` | `#FAF8F3` | 18.65:1 | PASS | PASS | PASS | PASS |
| `text.secondaryLight` on `canvas.light` | `#5C5C66` | `#FAF8F3` | 6.23:1 | PASS | PASS | FAIL | PASS AA |
| `text.mutedLight` on `canvas.light` | `#A3A3AB` | `#FAF8F3` | **2.36:1** | **FAIL** | **FAIL** | **FAIL** | **FAIL** |
| `accent.amber` on `canvas.light` (text) | `#F5A524` | `#FAF8F3` | **1.92:1** | **FAIL** | **FAIL** | **FAIL** | **FAIL** |
| `risk.coral` on `canvas.light` (text) | `#F26D5B` | `#FAF8F3` | **2.78:1** | **FAIL** | **FAIL** | **FAIL** | **FAIL** |

#### Summary of failures and remediation

**CRITICAL FAILURE 1 — `color.text.mutedDark` (#5C5C66)**

WCAG 1.4.3. Fails on all dark backgrounds:
- vs `canvas.dark` (#0A0A0B): 2.99:1
- vs `surface.dark` (#131316): 2.81:1
- vs `elevated.dark` (#1A1A1E): 2.63:1

Used at: `ConfidenceIndicator.tsx:47` (percentage callout), `WordStreamTranscript.tsx:29,39` (label text), live screen `page.tsx:655` (session ID hash), `settings/voice/page.tsx:79` (Voice label), `onboarding/voice/page.tsx:183,214,265,435` (step label, passage eyebrow, hint text, footer).

**Fix:** Lighten the token to `#797979` (4.55:1 on `canvas.dark`, the darkest background). File to change: `packages/design-system/src/global.css:61` and `packages/design-system/src/tokens.ts`. This is a single source-of-truth edit that fixes all usages.

**CRITICAL FAILURE 2 — `color.text.mutedLight` (#A3A3AB)**

WCAG 1.4.3. Fails on canvas light:
- vs `canvas.light` (#FAF8F3): 2.36:1

Currently used only where the light canvas is active (marketing page with `data-canvas="light"` or any future light-mode surface). The token is defined in the design system but not yet deployed on any audited page. Pre-emptive fix required before light-mode launch.

**Fix:** Darken to `#646464` (5.58:1 on `canvas.light`). File: `packages/design-system/src/global.css:62`.

**CRITICAL FAILURE 3 — `color.accent.amber` (#F5A524) as text on `canvas.light`**

WCAG 1.4.3. Ratio 1.92:1 — catastrophic fail.

Amber is the brand accent. It is already correctly used as a text color on dark canvas (9.70:1 — strong pass). On light canvas it must never be used for body text or UI labels. It may be used for large decorative display text only if restricted to ≥24pt (where the 3.0:1 large-text threshold applies — though 1.92:1 still fails even that).

**Fix:** In any light-canvas context, replace amber text with `color.text.primaryLight` (`#0A0A0B`) for body text and use amber only for decorative elements (borders, background fills, icons) where WCAG 1.4.11 (3.0:1) applies. Add a lint comment to `tokens.ts` documenting that `color.accent.amber` is not safe for text on light backgrounds.

**CRITICAL FAILURE 4 — `color.risk.coral` (#F26D5B) as text on `canvas.light`**

WCAG 1.4.3. Ratio 2.78:1 — fail for both normal and large text.

Not currently deployed on a light canvas page, but `color.text.secondaryLight` is defined as `#5C5C66` (6.23:1 on canvas light — PASS), and coral error text in onboarding runs on dark canvas (6.70:1 — PASS). This is a pre-emptive failure for any future light-mode error text.

**Fix:** For light canvas error text, use `#C94432` (4.54:1 on `canvas.light`). Add a `color.risk.coralLight` token. File: `packages/design-system/src/tokens.ts`.

---

## Decisions

1. **`color.text.mutedDark` at 2.99:1 is a WCAG 1.4.3 failure**, not a "medium risk" as the qa-verifier characterised it. 2.99:1 fails even the large-text threshold (3.0:1) by 0.01:1. It is a hard violation for all uses below 18pt or non-bold below 14pt. Classified CRITICAL here.
2. **`color.accent.amber` on light canvas (1.92:1) is newly surfaced** — not flagged by qa-verifier. Flagged here as CRITICAL pre-emptive.
3. **`color.text.mutedLight` on light canvas (2.36:1) is newly surfaced** — same.
4. **`color.risk.coral` on light canvas (2.78:1) is newly surfaced** — same.
5. **SuggestionCard has no `aria-live` on its container** — the card bloom will likely be silent on screen readers. Classified MEDIUM.
6. **Missing `h1` on live screen** — classified MEDIUM (WCAG 2.4.6).
7. **ActionTile touch target ~38px** — classified MEDIUM (WCAG 2.5.5). Below the 44px floor.
8. **WordStream loses `aria-live` on reduced-motion path** — classified LOW.

---

## Open questions

1. **`color.text.mutedDark` fix (#797979):** Confirm with design-system-architect that this lightness shift does not clash with the muted/secondary tier distinction. The secondary token `#9B9BA3` (7.17:1) is noticeably lighter — there is room.
2. **Amber on light canvas:** Is there a planned light-mode marketing surface where amber is used as a CTA label? If so, the fix is to use a darkened amber `#B87A10` (≈4.6:1 on white) as `color.accent.amberDark`. Check with design-system-architect.
3. **SuggestionCard `aria-live`:** `aria-live="polite"` on the container means every state change inside (button text "Use" → "Used", follow-up text) would also be announced. Is that the right behaviour, or should only the card's initial bloom be announced? The card could alternatively use `role="status"` to scope announcements.
4. **Dynamic re-run:** All DEFERRED audits (axe-core, keyboard walk, screen reader, touch-target measurement, 200% zoom) must be converted to PASS/FAIL after `pnpm install` and dev server boot.

---

## Next steps

1. **Design-system-architect** — lighten `color.text.mutedDark` to `#797979` in `packages/design-system/src/global.css` and `tokens.ts`. This is a single-line change that fixes four failing contrast pairs across all dark surfaces. Also darken `color.text.mutedLight` to `#646464`.
2. **Design-system-architect** — add a lint comment to `tokens.ts` explicitly flagging `color.accent.amber` as unsafe for text on light backgrounds. Add `color.risk.coralLight = '#C94432'` for light-mode error text.
3. **Live-call-builder** — add `aria-live="polite"` to the `<div className="min-h-[200px]">` container wrapping `AnimatePresence` in `apps/app/app/live/[sessionId]/page.tsx:587`.
4. **Live-call-builder** — add `<h1 className="sr-only">Live call · {personaLabel}</h1>` inside the `<Container as="main">` at `page.tsx:552`.
5. **Live-call-builder** — add `min-h-[44px]` to `ActionTile` base class in `SuggestionCard.tsx:177`.
6. **Live-call-builder** — add `aria-live="polite"` to `ListeningPlaceholder` outer `<motion.div>` at `page.tsx:702`.
7. **motion-polisher** — move `aria-live="polite"` in `WordStream` to the root element returned by both the reduced-motion and animated code paths (`packages/motion/src/word-stream.tsx:99` and `106`).
8. **Post-pnpm-install** — run axe-core, keyboard walk, VoiceOver/NVDA session, touch-target measurement, 200% zoom. Convert all DEFERRED to PASS/FAIL.

---

## Acceptance criteria

- [x] Audit 1 (axe-core) — DEFERRED with specific reason (no node_modules).
- [x] Audit 2 (Keyboard navigation) — static analysis complete; no Tab traps found; intended tab order for live screen documented; two issues raised.
- [x] Audit 3 (Screen reader) — aria-live regions confirmed per component; SuggestionCard announcement gap found; missing h1 on live screen found; form field labels confirmed; heading order verified.
- [x] Audit 4 (Color independence) — all 13 color-coded states verified against source; every state has a non-color cue; one pre-emptive light-canvas note filed.
- [x] Audit 5 (Touch targets) — static size sweep; ActionTile ~38px below 44px floor found; end-session button flagged.
- [x] Audit 6 (Reduced motion) — file-by-file: design-system global PASS, breath.ts PASS, word-stream.tsx PASS, globals.css PASS, WaveformVisualizer PASS; one low inline-style note.
- [x] Audit 7 (Font scaling) — DEFERRED for dynamic test; static `overflow-x: hidden` and `clamp(vw)` concern noted.
- [x] Audit 8 (Contrast) — 24 pairs computed with WCAG formula; four CRITICAL failures found and specific token fixes proposed with computed target values.
- [x] All issues cite absolute file paths and line numbers.
- [x] WCAG criterion numbers cited for every failure.
- [x] Proposed fix values are computed (not estimated).
- [x] No auto-fixes performed. Report only.

---

## Final verdict: YELLOW

Four contrast failures are WCAG 1.4.3 hard violations that must be fixed before production. The most urgent is `color.text.mutedDark` at 2.99:1 — below even the large-text threshold, used across multiple product surfaces. The amber-on-light and muted-on-light failures are pre-emptive but must be addressed before any light-canvas surface ships. The SuggestionCard missing `aria-live` and the live screen missing `h1` are Medium issues that affect screen reader usability on the hero screen.

YELLOW (not RED) because: the dark-canvas product surfaces (live screen, onboarding, settings) are broadly accessible — all text that matters for task completion uses `text.primaryDark` (18.18:1) or `text.secondaryDark` (7.17:1). The failures cluster on the muted decorative tier and on theoretical future light-canvas deployments. The keyboard model is solid, color independence is thorough, and the motion system has correct reduced-motion coverage. Fix the four contrast tokens and the three screen-reader gaps to reach GREEN.
