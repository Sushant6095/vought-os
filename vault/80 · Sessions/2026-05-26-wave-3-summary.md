---
title: 2026-05-26 · wave-3-summary
type: session
agent: orchestrator
wave: 3
verdict: yellow
---

# 2026-05-26 · wave-3-summary

Verification wave. Single agent (qa-verifier) ran the six-audit gate against waves 1 + 2. Two audits passed, two are honestly deferred for lack of installed dependencies, and two surfaced real (mechanical, fixable) violations. Final verdict: **YELLOW** — Wave 4 polish can begin conditionally on a 9-item must-fix list.

Nothing here is a correctness, security, or architecture blocker. Everything found is design-system fidelity drift that should land in a single token pass before the demo.

## Attempted

Spawn wave 3 per `prompts/build/orchestrator-master.prompt.md` and the wave map in `/vought-spawn-wave`. Single-agent dispatch:

- **qa-verifier** — ran Audits 1–6 from `prompts/build/wave-3/qa-verifier.prompt.md` against `packages/`, `services/`, `apps/web/`, `apps/app/app/{live,onboarding/voice,settings/voice,api/voice-clone}/`.

Constraints up front:
- No `pnpm install`, so Lighthouse, axe, dev-server boots, and live-latency capture are physically unrunnable.
- No HF_TOKEN, no recorded audio rig — diart 2-speaker accuracy and 5-concurrent-session latency cannot run either.
- Three documented Blueprint motion exceptions on the live screen (1500ms Listening pulse, 1800ms Whisper pulse, 200ms interruption fade per Blueprint §5.3/§5.7) were allowlisted per the live-call-builder session log.
- Söhne fallback to Inter and Scene 8 absence not flagged (both intentional).

## Produced

A single audit report: `vault/80 · Sessions/2026-05-26-qa-verifier.md`. No code changes. No auto-fixes. Reports only.

## Audit results — headlines

| Audit | Verdict | Notes |
|---|---|---|
| 1 · Token drift | **FAIL** | 32 in-scope violations. Biggest cluster: 15 `rgba(245,165,36,N)` literals in `Hero.tsx:197-211`. |
| 2 · Motion timing | **FAIL** | 8 unique off-scale violations + ~15 stagger-delay opportunities. Worst offender: `.float-anim` at 6000ms (`apps/web/app/globals.css:184`). |
| 3 · Accessibility (static) | **PASS with 1 MEDIUM** | `aria-live`, `role="dialog"`, MegaMenu Esc + outside-click all confirmed. Contrast: `color.text.mutedDark` (`#5C5C66`) on canvas dark computes ~3.0:1 — fails AA for normal text. |
| 4 · Performance | **DEFERRED** | Static evidence consistent with Perf ≥ 95 / ≥ 90: zero `<img>`/`<video>`, `next/font` with swap, IntersectionObserver reveal, compositor-friendly animation properties only. |
| 5 · Live latency | **DEFERRED** | Wired implementation matches budget (AbortSignal threading, diart latency=0.5, no extra hops). Can't capture without booting services. |
| 6 · Phase-sync (static) | **PASS** | `useBreathTimer()` mounted 4× across legitimate route roots; reference-counted single rAF; all surfaces read `--breath-phase` from `:root`. Visual verification deferred. |

## Decisions

1. **Out-of-scope legacy graded separately.** `apps/teams/` and `apps/app/app/page.tsx` (legacy Cyrano persona-picker) predate Wave 2; their violations are noted but not counted against the Wave-2 grade.
2. **Live-screen 200ms / 1500ms / 1800ms allowlisted exactly as live-call-builder session log specified.** Marketing-surface parity (`.pulse-emerald` 1500ms, `.pulse-amber` 1800ms in `apps/web/app/globals.css`) is *not* allowlisted — the Blueprint exception is for the live screen only. Decision deferred to landing-page-builder + design-system-architect for Wave 4.
3. **Dingbats are not emoji.** `'✓'`, `'⏎'`, `'✕'` in `SuggestionCard.tsx` are keyboard-glyph dingbats, not emoji — not a violation.
4. **YELLOW, not GREEN.** Audits 1 and 2 have real mechanical violations that shouldn't be silently absorbed by Wave 4 polish. A GREEN verdict would imply zero-drift, which Wave 2 didn't hit.

## Must-fix before Wave 4 closes (9 items)

From the QA report's consolidated list:

1. **HIGH** — Tokenize 15 Hero waveform `rgba(245,165,36,N)` literals (`apps/web/components/marketing/Hero.tsx:197-211`) and the recurring amber-soft variants across `apps/app/app/onboarding/voice/`, `apps/app/app/live/[sessionId]/layout.tsx`, `apps/app/app/settings/voice/`.
2. **HIGH** — Lift recurring dark-canvas variants (`#0C0C0E`, `#050507`, `#0E0E10`, `#1F1A0F`) to named `color.canvas.*` tokens.
3. **HIGH** — Resolve `.float-anim` 6000ms motion violation in `apps/web/app/globals.css:184`. Either drop to canonical 4000ms or extend the table.
4. **HIGH** — `text-[9px]` sub-token sizes in `PillarCards.tsx:107` and `PricingTease.tsx:103`. Bump to `text-label-xs` (10px) or add `label/2xs` token.
5. **MEDIUM** — Replace inline `text-[10px]` / `text-[11px]` with `text-label-xs` / `text-label-sm` Tailwind utilities (8+ sites in `apps/app/app/`).
6. **MEDIUM** — Replace inline `200ms cubic-bezier(...)` / `240ms cubic-bezier(...)` literals with `var(--motion-*) var(--easing-*)` references in `SpeakerTimeline.tsx`, onboarding components, and `SuggestionCard.tsx` (the 200ms exception comment stays, but should still reference the CSS variable for the easing curve).
7. **MEDIUM** — `color.text.mutedDark` contrast: lighten to ≥4.5:1 (e.g. `#7A7A82`) or document large-text-only and add a lint rule.
8. **MEDIUM** — Pull `themeColor` hex in both `layout.tsx` files from `tokens.color.canvas.dark` instead of hardcoding `'#0A0A0B'`.
9. **LOW** — Stagger-delay ladders across marketing scenes (Hero, PromiseSection, CustomerStory, CTAStrip, etc.): normalize to canonical {80, 240, 360, 640} or formalize a `tokens.motion.stagger` scale.

## Token gaps that recur in the violation list

Wave 4 should land these in one design-system pass so the must-fix substitutions all resolve to a real exported token:

`color.canvas.darker`, `color.canvas.darkPulse`, `color.canvas.footer`, `color.accent.amberTinted`, `color.accent.amberSofter`, `color.scrim.dark`, `color.hairline.gridTexture`, `color.hairline.glass`, `shadow.heroDashboard`, `display/sm` (28px) type token, `size.megamenu`, `size.orb.{md,lg}`.

## Open questions

- **Marketing pulse durations (1500ms / 1800ms in `globals.css`).** Allowed exception or normalize to canonical? Landing-page-builder + design-system-architect should decide together.
- **`.float-anim` at 6000ms.** Extend canonical table or shorten to `wave` (4000ms)?
- **`color.text.mutedDark` contrast.** Lighten the token or restrict its use? Design-system-architect call.
- **`pnpm install` / service boot.** Until these happen, Audits 4 and 5 stay DEFERRED. The static evidence is strong but not authoritative.

## Acceptance criteria · wave-level

- [x] qa-verifier executed all six audits, allowlist honored, no auto-fixes performed.
- [x] All violations cite absolute file paths and line numbers, with the exact token / motion / pattern to swap in as the fix.
- [x] Two audits cleanly DEFERRED with explicit reasons (no `pnpm install`, no HF token / audio rig). Not silently labeled PASS.
- [x] Three live-screen Blueprint motion exceptions correctly allowlisted; marketing-surface 1500/1800ms pulses correctly NOT allowlisted (decision needed).
- [x] Session log at `vault/80 · Sessions/2026-05-26-qa-verifier.md` matches the Session Template.
- [x] Final verdict is YELLOW (not GREEN) because Audits 1 & 2 surface real, mechanical violations that should not be silently absorbed by Wave 4.

## Next steps

Wave 3 verdict is **YELLOW** with a 9-item must-fix list. Two paths from here:

**Option A — Punt fixes to Wave 4 (recommended).** The Wave 4 wave map already includes `motion-polisher` and `accessibility-auditor`; both are well-suited to absorb the must-fix list. Specifically:

- `motion-polisher` consumes items 3, 6, 9 (motion timing literals + `.float-anim` 6000ms + stagger-delay normalization).
- `accessibility-auditor` consumes item 7 (contrast token lift) and runs dynamic axe/keyboard audits if `pnpm install` lands.
- A focused `design-system-architect` follow-up touch is needed for items 1, 2, 4, 5, 8 plus the "token gaps that recur" list — adding the missing tokens to `packages/design-system/src/tokens.ts` so the substitutions have somewhere to land.

The clean Wave-4 spawn would be three agents in parallel: `design-system-architect` (token additions only — no apps work), `motion-polisher`, `accessibility-auditor`. The first two touch disjoint files; the third is read-only.

**Option B — Run a focused token-fix pass before Wave 4.** Spawn `design-system-architect` alone first to add the missing tokens, then spawn Wave 4. Adds a serial step but lets motion-polisher work against a stable token set.

**Either path, also recommended before final demo:**

- `pnpm install` at the repo root to unblock Lighthouse + axe + service-boot verification.
- Configure HF_TOKEN + a recorded 2-speaker audio rig to convert the deferred diart criteria from ⏳ to ✓.

Recommended next command: **`/vought-spawn-wave 4`** (Option A — let the polish wave absorb the must-fix list in parallel).

Do **not** spawn wave 4 from this summary — return to the user.
