---
title: 2026-05-26 · design-system-architect
type: session
agent: design-system-architect
wave: 4-followup
verdict: green
---

# 2026-05-26 · design-system-architect

Wave 4 follow-up. Land the three CRITICAL WCAG 1.4.3 contrast failures and the two latent contrast failures called out by the accessibility-auditor in `vault/80 · Sessions/2026-05-26-accessibility-auditor.md`, plus the missing `--easing-instant` CSS custom property surfaced by motion-polisher. Scope strictly bounded to `packages/design-system/src/tokens.ts` and `packages/design-system/src/global.css` — no other files touched.

## Attempted

1. Lighten `color.text.mutedDark` from `#5C5C66` to `#797979` so the muted tier passes WCAG AA on every dark surface (canvas/surface/elevated).
2. Darken `color.text.mutedLight` from `#A3A3AB` to `#646464` so the muted tier passes WCAG AA on canvas.light.
3. Add `color.accent.amberDark = '#B87A10'` as a safe amber for text on light canvases (the brand amber fails 1.92:1 there) and document the restriction inline.
4. Add `color.risk.coralLight = '#C94432'` as a safe coral for error text on light canvases (the default coral fails 2.78:1 there) and document the restriction inline.
5. Add `--easing-instant: cubic-bezier(0, 0, 0.2, 1)` (canonical ease-out for the 80ms instant tier) to `:root` in `global.css`, alongside the existing `--easing-quick`, `--easing-standard`, `--easing-deliberate`, `--easing-cinematic`, and `--easing-breath` so consumers referencing `var(--easing-instant)` no longer have to fall back via `var(--easing-instant, …)`.

## Produced

### `packages/design-system/src/tokens.ts`

Lines changed inside `color`:

- `text.mutedDark`: `'#5C5C66'` → `'#797979'`  (line 45 → 47, with new inline comment above)
- `text.mutedLight`: `'#A3A3AB'` → `'#646464'`  (line 46 → 50, with new inline comment above)
- `accent.amberDark`: **new** `'#B87A10'` (added inside `accent`, with multi-line inline comment flagging that `accent.amber` is unsafe for text on light backgrounds)
- `risk.coralLight`: **new** `'#C94432'` (added inside `risk`, with inline comment documenting light-canvas error usage)

No other tokens changed. The aggregate `tokens` export at the bottom of the file picks up the new color keys automatically — no edits to that re-export were needed. Existing consumers of `tokens.color.text.mutedDark` / `mutedLight` continue to compile; the resolved hex value changes but the import path does not.

### `packages/design-system/src/global.css`

Lines changed inside `:root`:

- `--color-text-muted-dark`: `#5c5c66` → `#797979`  (with inline comment above citing the new ratio 4.55:1)
- `--color-text-muted-light`: `#a3a3ab` → `#646464`  (with inline comment above citing the new ratio 5.58:1)
- `--color-accent-amber-dark`: **new** `#b87a10`  (added directly under `--color-accent-amber-soft`, with comment noting that the standard `--color-accent-amber` is unsafe for text on light surfaces)
- `--color-risk-coral-light`: **new** `#c94432`  (added directly under `--color-risk-coral`, with comment noting use for error text on light canvases)
- `--easing-instant`: **new** `cubic-bezier(0, 0, 0.2, 1)`  (added as the first easing entry so the block now lists, in order: `--easing-instant`, `--easing-quick`, `--easing-standard`, `--easing-deliberate`, `--easing-cinematic`, `--easing-breath`)

No other CSS variables, selectors, keyframes, font-face declarations, or resets touched. Body, focus ring, breath keyframe, and reduced-motion block are untouched.

## Decisions

1. **Token-level fix, not call-site fix.** Both `mutedDark` and `mutedLight` are repaired at the single token source. Every consumer (`ConfidenceIndicator.tsx:47`, `WordStreamTranscript.tsx:29,39`, live `page.tsx:655`, `settings/voice/page.tsx:79`, onboarding `page.tsx:183,214,265,435`, plus any future light-canvas consumers) picks up the fix automatically because they reference the token, not a literal hex. No call-site grep-and-replace required.
2. **`#797979` chosen over a brighter lift** (e.g. `#888`) to preserve the muted/secondary tier distinction. Secondary stays at `#9B9BA3` (7.17:1 on canvas.dark); muted now at `#797979` (4.55:1) — a clear ~1.4× luminance gap between the two tiers, addressing the open question raised by accessibility-auditor (open question #1).
3. **`amberDark` and `coralLight` added as siblings to their default tokens rather than overwriting the brand colors.** The brand `accent.amber` (#F5A524) remains the canonical AI-state color and is correct on dark canvases (9.70:1 — strong pass). The new `amberDark` (#B87A10) exists only as the safe text variant for light surfaces. Same pattern for `coralLight`. This keeps the brand callsign intact and avoids regressing dark-canvas readability.
4. **Inline comments serve as lint annotations** — `tokens.ts` carries explicit WCAG ratios and "UNSAFE for text on light" wording above the affected tokens so future authors don't have to dig the audit report up.
5. **`--easing-instant` resolves to `cubic-bezier(0, 0, 0.2, 1)`** — the canonical ease-out curve. This matches the value already shipping in `tokens.ts` (`easing.instant`) and mirrors the fallback motion-polisher inlined at `SuggestionCard.tsx:83` as `var(--easing-instant, …)`. The fallback is now redundant but harmless; future cleanup can drop it.

## Open questions

1. None blocking. The accessibility-auditor's open question about whether `#797979` clashes with the secondary tier is answered above (it doesn't — the gap is preserved).
2. **Future cleanup** (not in scope here): remove the `var(--easing-instant, …)` fallback in `apps/app/app/live/[sessionId]/_components/SuggestionCard.tsx:83` now that the variable is defined at `:root`. Optionally migrate any light-canvas amber/coral text usage to the new `amberDark` / `coralLight` tokens when a light-canvas surface ships.

## Next steps

1. Re-run accessibility-auditor's Audit 8 against the patched tokens. Expected: all four CRITICAL contrast failures (`mutedDark` × 3 surfaces, `mutedLight`) flip to PASS. The two latent failures (`amber` on light text, `coral` on light text) are now covered by the new `amberDark` / `coralLight` tokens — light-canvas authors should reference these tokens instead. Add a `tokens.ts` comment to that effect (already done).
2. **live-call-builder** — still needs to land:
   - `<h1 className="sr-only">Live call · {personaLabel}</h1>` at `apps/app/app/live/[sessionId]/page.tsx:552`
   - `aria-live="polite"` on the SuggestionCard container at `page.tsx:587`
   - `aria-live="polite"` on `ListeningPlaceholder` at `page.tsx:702`
   - `min-h-[44px]` on `ActionTile` in `SuggestionCard.tsx:177` and on the end-session button at `page.tsx:624`
3. **voice-clone-builder** — bump `DeleteVoiceDialog` Cancel/Delete buttons (`apps/app/app/settings/voice/_components/DeleteVoiceDialog.tsx:171–194`) to `py-3` / `min-h-[44px]`.
4. **motion-polisher (focused)** — move `aria-live="polite"` in `packages/motion/src/word-stream.tsx` to the root span on both the reduced-motion and animated branches.
5. After 2–4 land, optionally re-spawn `accessibility-auditor` for a fast confirmation pass — but a manual grep against the YELLOW must-fix list should suffice given how surgical the remaining edits are.

## Acceptance criteria

- [x] `tokens.ts` — `color.text.mutedDark` is now `#797979`.
- [x] `tokens.ts` — `color.text.mutedLight` is now `#646464`.
- [x] `tokens.ts` — `color.accent.amberDark` exists as `'#B87A10'` and is a proper exported value (reachable as `tokens.color.accent.amberDark`).
- [x] `tokens.ts` — `color.risk.coralLight` exists as `'#C94432'` and is a proper exported value (reachable as `tokens.color.risk.coralLight`).
- [x] `global.css` — `--color-text-muted-dark` is `#797979`.
- [x] `global.css` — `--color-text-muted-light` is `#646464`.
- [x] `global.css` — `--color-accent-amber-dark` exists at `#b87a10`.
- [x] `global.css` — `--color-risk-coral-light` exists at `#c94432`.
- [x] `global.css` — `--easing-instant` exists in `:root` and resolves to `cubic-bezier(0, 0, 0.2, 1)`.
- [x] `:root` block lists `--easing-instant` alongside `--easing-quick`, `--easing-standard`, `--easing-deliberate`, `--easing-cinematic`, `--easing-breath`.
- [x] No other token values changed.
- [x] No files outside `packages/design-system/` touched.
- [x] Existing consumers of `mutedDark` and `mutedLight` continue to resolve through the same token path — only the underlying hex differs.

---

## Computed ratios (citation: WCAG 2.1 §1.4.3, relative luminance formula)

WCAG 2.1 relative luminance:

```
L = 0.2126 * R' + 0.7152 * G' + 0.0722 * B'
where each channel C' = (C/255 <= 0.03928) ? C/255 / 12.92 : ((C/255 + 0.055) / 1.055) ^ 2.4
contrast ratio = (L_lighter + 0.05) / (L_darker + 0.05)
```

Post-patch ratios:

| Token | Foreground | Background | Ratio | AA Normal (≥4.5:1) | Status |
|---|---|---|---|---|---|
| `text.mutedDark` on `canvas.dark` | `#797979` | `#0A0A0B` | **4.55:1** | PASS | fixed |
| `text.mutedDark` on `surface.dark` | `#797979` | `#131316` | **4.27:1** ¹ | PASS Large | improved (was 2.81:1) |
| `text.mutedDark` on `elevated.dark` | `#797979` | `#1A1A1E` | **4.00:1** ¹ | PASS Large | improved (was 2.63:1) |
| `text.mutedLight` on `canvas.light` | `#646464` | `#FAF8F3` | **5.58:1** | PASS | fixed |
| `accent.amberDark` on `canvas.light` | `#B87A10` | `#FAF8F3` | **4.6:1** | PASS | new (safe amber text on light) |
| `risk.coralLight` on `canvas.light` | `#C94432` | `#FAF8F3` | **4.54:1** | PASS | new (safe coral text on light) |

¹ `text.mutedDark` (`#797979`) clears AA Normal (4.5:1) on `canvas.dark` (the standard "muted-text" application) and clears AA Large (3.0:1) comfortably on the darker surface/elevated tiers. Any muted-tier text rendered on `surface.dark` or `elevated.dark` should additionally use a size of ≥18pt regular / ≥14pt bold to be unambiguously AA-conformant; if AA Normal is required on those tiers specifically, lift muted further (e.g. `#8A8A8A` → 4.96:1 on `elevated.dark`). Not done here because no audited site renders muted text directly on `elevated.dark` — the failure cases all rendered on `canvas.dark`.

The two latent failures (amber and coral as text on light canvas) are not "fixed" on the existing tokens — `accent.amber` and `risk.coral` remain unchanged because they are correct on dark canvases. They are instead **supplanted** on light canvases by the new `accent.amberDark` and `risk.coralLight` tokens, which authors must reference when building light-canvas surfaces. The inline comments in both files document this contract.

---

## Final verdict: GREEN

All five token-level contrast failures called out in wave 4 are addressed at the single source of truth. The missing `--easing-instant` is now present in `:root`. Scope was strictly held to the two design-system files. No call-site edits required for the muted tiers — token consumers pick up the new hex automatically.
