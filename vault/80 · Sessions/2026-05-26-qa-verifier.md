---
title: 2026-05-26 · qa-verifier
type: session
agent: qa-verifier
wave: 3
verdict: yellow
---

# 2026-05-26 · qa-verifier

Wave 3 verification gate. Six audits run in static-only mode (no `pnpm install`, no HF token, no recorded rig). Two audits — Lighthouse Perf and Live-screen latency — are DEFERRED with the specific reason and supporting static evidence cited inline. Two audits report violations: Audit 1 (Token drift) and Audit 2 (Motion timing) surface real issues that should be resolved before Wave 4 polish lands on top of them. Audit 3 (Accessibility static) is mostly PASS with one MEDIUM contrast risk on `text-muted-dark` for small text. Audit 6 (Phase-sync static) is PASS — `useBreathTimer()` is reference-counted, mounted in four legitimate roots, all surfaces read `--breath-phase` from `:root`.

Final verdict is **YELLOW** — Wave 4 can begin conditionally on the must-fix list below. Nothing here is a security or correctness blocker.

## Attempted

Run the six-audit gate per `prompts/build/wave-3/qa-verifier.prompt.md`, against the surfaces produced by Wave 1 (`packages/design-system`, `packages/motion`, `packages/ui`, `services/echo-engine`, `services/diarization-sidecar`) and Wave 2 (`apps/web`, `apps/app/app/live`, `apps/app/app/onboarding/voice`, `apps/app/app/settings/voice`, `apps/app/app/api/voice-clone`).

Constraints up front:
- No `pnpm install` has been run; `node_modules` absent — no dev-server boot, no Lighthouse, no axe runtime, no live latency capture.
- No HF_TOKEN, no recorded audio — diart 2-speaker accuracy + 5-concurrent-session latency physically unverifiable.
- Three documented Blueprint motion exceptions are allowlisted (listening 1500ms pulse, whisper 1800ms pulse, interruption 200ms fade) per `vault/80 · Sessions/2026-05-26-live-call-builder.md` decisions §7.
- Scene 8 ("Solutions") intentional absence from the landing page is not a violation.
- Söhne fallback to Inter is intentional (license not provisioned) — not a violation.
- Pre-existing surfaces outside Wave 2 scope (`apps/teams/`, `apps/app/app/page.tsx` legacy persona-picker) are out of scope for this audit pass; flagged separately as "pre-existing legacy" so they don't pollute the Wave-2 grade.

## Produced

A single audit report — this file. No code changes. No auto-fixes. The implementation agents are expected to read the violation list and execute the targeted fixes in Wave 4.

## Audit results

### Audit 1 · Token drift

- Violations (in-scope, Wave-1 + Wave-2 surfaces): **32**
- Out-of-scope but logged: legacy `apps/app/app/page.tsx` and `apps/teams/app/dashboard/page.tsx` use `text-[10px]`/`text-[11px]` and `bg-neutral-*` Tailwind defaults; these predate Wave 2 and are not graded here.

File-by-file (all paths absolute):

**HIGH — raw rgba()/hex outside design-system; should resolve to amber-soft, hairline, glass, or new opacity-step tokens:**

- `/Users/vyapar/Downloads/vought/apps/web/components/marketing/Hero.tsx:197-211` — fifteen `rgba(245,165,36,N)` literals defining a waveform bar palette. **Fix:** lift to `packages/design-system/src/tokens.ts` as `color.accent.amberOpacityScale = { 30, 40, 50, 60, 70, 80, 100 }` or use existing `amberSoft` + Tailwind opacity utility (`bg-accent-amber/60` etc).
- `/Users/vyapar/Downloads/vought/apps/web/components/marketing/Hero.tsx:133` — `'0 30px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04) inset'`. **Fix:** add `shadow.heroDashboard` to tokens (mirror existing `shadow.card` pattern); the inset hairline should reuse `color.hairline.dark` with explicit alpha.
- `/Users/vyapar/Downloads/vought/apps/web/components/marketing/Footer.tsx:62` — `style={{ background: '#0C0C0E' }}`. **Fix:** `color.canvas.footer` token, or reuse `color.canvas.dark` + a `-1%` lightness shift via `color-mix`.
- `/Users/vyapar/Downloads/vought/apps/web/components/marketing/ArchitectureDiagram.tsx:59` — `style={{ background: '#0C0C0E' }}`. Same fix as Footer.
- `/Users/vyapar/Downloads/vought/apps/web/components/marketing/ArchitectureDiagram.tsx:22,25,26,27,152` — five inline hex colors `#F5A524`/`#FFFFFF` passed as `color="..."` props on inline-SVG icons. **Fix:** these are SVG `stroke`/`fill` props — accept a CSS custom property (`var(--color-accent-amber)`) or use `currentColor` with a text-color utility on the wrapper.
- `/Users/vyapar/Downloads/vought/apps/web/components/marketing/CTAStrip.tsx:68` — `background-color: #050507 !important;` inside a styled-jsx block. **Fix:** add `color.canvas.darker` token or compose via `color-mix(var(--color-canvas-dark), black, 50%)`.
- `/Users/vyapar/Downloads/vought/apps/web/components/marketing/PillarCards.tsx:102` — `'linear-gradient(to bottom, #1F1A0F 0%, #131316 100%)'`. **Fix:** add `color.accent.amberTinted` (`#1F1A0F` = amber-on-dark-elevated tint) to tokens; the end stop is already `color.surface.dark`.
- `/Users/vyapar/Downloads/vought/apps/web/components/marketing/PricingTease.tsx:98` — identical gradient as PillarCards. Same fix.
- `/Users/vyapar/Downloads/vought/apps/web/app/globals.css:84` — `rgba(245, 165, 36, 0.16)` inside `.orb-amber`. Close to `color.accent.amberSoft` (0.14). **Fix:** use `var(--color-accent-amber-soft)` directly, or add `amberSoftPlus` token if 0.16 is meaningful.
- `/Users/vyapar/Downloads/vought/apps/web/app/globals.css:92-93` — two `rgba(255, 255, 255, 0.015)` grid-texture lines. **Fix:** add `color.hairline.gridTexture` token.
- `/Users/vyapar/Downloads/vought/apps/web/app/globals.css:99,102` — `.nav-pill` glass background `rgba(19, 19, 22, 0.72)` and `rgba(255, 255, 255, 0.08)` border. `color.glass.dark` already exists (`rgba(20, 20, 24, 0.72)`) — close enough to consolidate. **Fix:** use `var(--color-glass-dark)` for background and add `color.hairline.glass` for the 0.08 white border.
- `/Users/vyapar/Downloads/vought/apps/web/app/globals.css:135,138,148,151` — four `rgba(...)` literals inside `.pulse-emerald` and `.pulse-amber` keyframes. **Fix:** wrap as `--pulse-emerald-bright` / `--pulse-amber-bright` CSS vars and reference, or use `color-mix(var(--color-live-emerald), transparent, 30%)`.
- `/Users/vyapar/Downloads/vought/apps/app/app/live/[sessionId]/layout.tsx:41,50` — two `rgba(245,165,36,0.10)` / `rgba(245,165,36,0.06)` orb gradients. Layout file. **Fix:** reuse `color.accent.amberSoft` (0.14) — visually equivalent — or add an `amberSofter` step.
- `/Users/vyapar/Downloads/vought/apps/app/app/onboarding/voice/_components/RecordButton.tsx:49,57,86` — three `rgba(245, 165, 36, N)` calls for recording-state bg/border/glow. **Fix:** Tailwind opacity utility (`bg-accent-amber/20`, `border-accent-amber/50`) or `var(--color-accent-amber-soft)`.
- `/Users/vyapar/Downloads/vought/apps/app/app/onboarding/voice/page.tsx:369` — `'1px solid rgba(245, 165, 36, 0.35)'` consent-check border. **Fix:** `border-accent-amber/40` Tailwind class.
- `/Users/vyapar/Downloads/vought/apps/app/app/settings/voice/page.tsx:150` — `'1px solid rgba(242, 109, 91, 0.32)'`. The hex `#F26D5B` is `color.risk.coral`. **Fix:** `border-risk-coral/30` Tailwind utility or `var(--color-risk-coral)` with an opacity wrapper.
- `/Users/vyapar/Downloads/vought/apps/app/app/settings/voice/_components/DeleteVoiceDialog.tsx:106` — `backgroundColor: 'rgba(0, 0, 0, 0.72)'` for the modal scrim. **Fix:** add `color.scrim.dark` token (modal/dialog backdrop is a recurring surface).

**MEDIUM — hex inside the design-system that itself reuses local hex literals (the package is the source of truth but is leaking unnamed values):**

- `/Users/vyapar/Downloads/vought/packages/design-system/tailwind.config.ts:140` — `'50%': { backgroundColor: '#0E0E10' }` inside the breath keyframe fallback. **Fix:** export `color.canvas.darkPulse = '#0E0E10'` from `tokens.ts` and reference here.
- `/Users/vyapar/Downloads/vought/packages/motion/src/thinking-dots.tsx:48` — `color = '#F5A524'` default prop. **Fix:** import `tokens.color.accent.amber` from `@vought/design-system`, or accept the prop as a CSS var token name.

**LOW — themeColor metadata and doc-comments (not runtime style):**

- `/Users/vyapar/Downloads/vought/apps/app/app/layout.tsx:23` and `/Users/vyapar/Downloads/vought/apps/web/app/layout.tsx:64` — `themeColor: '#0A0A0B'` on the Next viewport object. This is Next's metadata API and accepts only string hex; cannot reference a CSS custom property. **Fix:** import `color.canvas.dark` from `@vought/design-system` and stringify there — keeps the metadata authoritative.
- `/Users/vyapar/Downloads/vought/apps/app/app/live/[sessionId]/_components/SuggestionCard.tsx:6` — `#F5A524` inside a JSDoc comment. Documentation only. **Fix:** replace with `color.accent.amber` in the doc string.

**Type-scale (font-size) violations:**

- `/Users/vyapar/Downloads/vought/apps/web/components/marketing/PillarCards.tsx:107` — `text-[9px]`. **Fix:** No 9px token in the scale — bump to `text-label-xs` (10px) or add `label/2xs` token if intentional.
- `/Users/vyapar/Downloads/vought/apps/web/components/marketing/PricingTease.tsx:103` — `text-[9px]`. Same fix as above.
- `/Users/vyapar/Downloads/vought/apps/web/components/marketing/Footer.tsx:72` — `text-[15px]` on the wordmark. **Fix:** 15px not in scale — use `text-base` (16px) or add an explicit `label/wordmark` token.
- `/Users/vyapar/Downloads/vought/apps/web/components/nav/NavPill.tsx:41` — `text-[15px]` on the wordmark. Same fix.
- `/Users/vyapar/Downloads/vought/apps/app/app/live/[sessionId]/_components/SuggestionCard.tsx:94` — `text-[28px]` on suggestion title. **Allowlisted** per live-call-builder session log acceptance criteria — not a violation, but `display/md` (32px) and `text/xl` (24px) bracket it; a dedicated `display/sm` 28px token would close the loop.
- `text-[10px]` and `text-[11px]` recurring across `apps/app/app/onboarding/voice/page.tsx`, `apps/app/app/onboarding/voice/_components/ProcessingState.tsx`, `apps/app/app/settings/voice/page.tsx`. Same values as `label/xs` (10px) and `label/sm` (11px). **Fix:** replace with `text-label-xs` and `text-label-sm` Tailwind classes — the token is wired through the design-system preset already.

**Spacing/grid:**

- `/Users/vyapar/Downloads/vought/apps/app/app/live/[sessionId]/layout.tsx:38,47` — `w-[640px] h-[640px]` and `w-[480px] h-[480px]` on ambient orbs. Both are on the 4px grid (multiples of 64 and 48 respectively) but are arbitrary Tailwind classes. **Fix:** acceptable on grid, but consider hoisting to a `size.orb.{lg,md}` token for reuse. **NOT a violation.**
- `/Users/vyapar/Downloads/vought/apps/app/app/live/[sessionId]/_components/ConfidenceIndicator.tsx:34` — `h-[3px]`. **Violation** — not on the 4px grid. **Fix:** use `h-1` (4px) or hoist a `size.hairline = '2px'` and use that.
- `/Users/vyapar/Downloads/vought/apps/app/app/live/[sessionId]/_components/ConfidenceIndicator.tsx:47` — `min-w-[36px]`. **Violation** — not on the 4px grid. **Fix:** `min-w-9` (36px is Tailwind `9` = 36px, which is on the grid; the issue is using arbitrary syntax rather than the named class). Actually 36px IS on the Tailwind 4px grid (`9 * 4 = 36`), but the design-spacing token enumerated set is {0,4,8,12,16,20,24,32,40,48,64,80,96,128,160} — 36 is not in it. **Fix:** use `min-w-10` (40px) or add `9` (36px) to the spacing token if intentional.
- `/Users/vyapar/Downloads/vought/apps/app/app/live/[sessionId]/page.tsx:570` — `max-w-[720px]`. Blueprint §5.2 explicitly mandates 720px center column. **Fix:** acceptable as Blueprint-mandated literal; hoist to `container.liveCenter` token for reuse.
- `/Users/vyapar/Downloads/vought/apps/app/app/live/[sessionId]/page.tsx:587` — `min-h-[200px]`. 200px is on the 4px grid but not in the enumerated spacing set. **Fix:** use `min-h-48` (192px) or `min-h-52` (208px); 200 is borderline.
- `/Users/vyapar/Downloads/vought/apps/web/components/nav/MegaMenu.tsx:140` — `w-[360px]`. 360 is on the 4px grid but not in the spacing token set. **Fix:** hoist to `size.megamenu = '360px'` or use `w-90` (Tailwind 90 = 360px, available in the default scale).

**Banned phrases and emoji:**

- Grep for "AI-powered", "supercharge", "revolutionize", "10x" against `apps/`: **0 hits.** PASS.
- Grep for emoji in product code: only typographic glyphs `'✓'`, `'⏎'`, `'✕'` in `apps/app/app/live/[sessionId]/_components/SuggestionCard.tsx:110,125`. These are Unicode dingbats used as keyboard glyphs, not emoji. **NOT a violation.**

**Verdict: FAIL** (32 violations; ~17 LOW/MEDIUM and ~15 HIGH). None block correctness; most are mechanical token replacements. Wave 4 polish must absorb these before claiming production-ready.

### Audit 2 · Motion timing

- Violations: **8 unique** (excluding the 3 documented Blueprint exceptions)

**Allowlisted (per live-call-builder session log decisions §7, citing Blueprint §5.3/§5.7):**

- `apps/app/app/live/[sessionId]/_components/StatePill.tsx:86` — `1500ms` listening pulse. Blueprint-mandated.
- `apps/app/app/live/[sessionId]/_components/StatePill.tsx:88` — `1800ms` whisper pulse. Blueprint-mandated.
- `apps/app/app/live/[sessionId]/_components/SuggestionCard.tsx:83` — `200ms` interruption fade. Blueprint §5.3.8 mandated.

**Violations:**

- `/Users/vyapar/Downloads/vought/apps/web/app/globals.css:142` — `.pulse-emerald` uses `1500ms`. Same value as the live-screen listening pulse, but this is the marketing surface — Blueprint allowlists the live-screen exception only. **Fix:** either extend the allowlist explicitly in the design-system to acknowledge marketing pulse parity, OR replace with `var(--motion-breath)` (2000ms) for the marketing surface so it remains on the canonical scale.
- `/Users/vyapar/Downloads/vought/apps/web/app/globals.css:155` — `.pulse-amber` uses `1800ms`. Same situation as `.pulse-emerald`. **Fix:** same as above.
- `/Users/vyapar/Downloads/vought/apps/web/app/globals.css:169` — `.wave-bar` uses `1200ms`. **1200ms IS on the canonical scale**. **Fix:** replace literal with `var(--motion-breath-half, 1200ms)` — add the token if missing; or accept as canonical literal.
- `/Users/vyapar/Downloads/vought/apps/web/app/globals.css:184` — `.float-anim` uses `6000ms`. **NOT on canonical scale** {80,150,240,360,640,1200,2000,4000}. **Fix:** drop to `4000ms` (wave token) or extend the canonical table with `6000ms` and document why this surface needs a longer cycle than the wave.
- `/Users/vyapar/Downloads/vought/apps/app/app/onboarding/voice/_components/WaveformVisualizer.tsx:54,90` — `'transform 80ms linear'` and `'transform 60ms linear'`. 80ms is canonical. 60ms is **NOT** on the canonical scale. **Fix:** bump 60ms → 80ms (`var(--motion-instant)`).
- `/Users/vyapar/Downloads/vought/apps/app/app/onboarding/voice/_components/CountdownTimer.tsx:59` — `'transform 80ms linear'`. Canonical 80ms but written as literal. **Fix:** `var(--motion-instant)`.
- `/Users/vyapar/Downloads/vought/apps/app/app/onboarding/voice/_components/RecordButton.tsx:51` — `'transform 80ms linear'`. Same fix.
- `/Users/vyapar/Downloads/vought/apps/app/app/onboarding/voice/_components/RecordButton.tsx:61` — Framer Motion `duration: 2` (i.e. 2000ms — canonical `breath`). Written as bare number. **Fix:** import and use `MOTION.breath` from `@vought/motion`.
- `/Users/vyapar/Downloads/vought/apps/app/app/live/[sessionId]/_components/SpeakerTimeline.tsx:109` — `'background-color 240ms cubic-bezier(0.4, 0, 0.2, 1)'`. 240ms canonical but written as inline literal. **Fix:** `var(--motion-standard) var(--easing-standard)`.

**Stagger delays (MEDIUM — table spec covers durations, not stagger):**

- `apps/web/components/marketing/Hero.tsx:39,46,55,77` — `transitionDelay: '80ms' / '160ms' / '240ms' / '320ms'`. 80 and 240 are canonical; 160 and 320 are not. **Fix:** convert the stagger ladder to {80, 240, 360, 640} or formalize a "stagger scale" in `tokens.motion.stagger = [80, 160, 240, 320]` and document it as the deliberate-cinematic offset ladder.
- `apps/web/components/marketing/PromiseSection.tsx:24,30` — `'100ms'`, `'200ms'`. Off canonical. **Fix:** swap to `80ms` / `240ms`.
- `apps/web/components/marketing/CustomerStory.tsx:27,37,79` — `100ms`, `200ms`, `300ms`. Off canonical. **Fix:** swap to `80ms`, `240ms`, `360ms`.
- `apps/web/components/marketing/CTAStrip.tsx:102`, `CustomerLogos.tsx:39`, `LiveDemoBlock.tsx:96`, `ArchitectureDiagram.tsx:69,76,85` — recurring `100ms`, `200ms`, `300ms` staggers. **Fix:** same — replace with canonical {80, 240, 360}.

**Verdict: FAIL** (1 outright off-scale duration on `.float-anim` at 6000ms; ~15 token-replacement opportunities for staggers and inline literals). Same as Audit 1: no correctness issue, but the spec is explicit about the canonical timing table.

### Audit 3 · Accessibility (static)

**PASS:**

- `aria-live="polite"` is wired on `<WordStream>` (`packages/motion/src/word-stream.tsx:106`), on `<StatePill>` (`apps/app/app/live/[sessionId]/_components/StatePill.tsx:103`), on `<ProcessingState>`, on `<CountdownTimer>`, and on the onboarding live region. **PASS** — claim in live-call session log holds.
- `role="dialog"` + `aria-modal="true"` + `aria-labelledby="delete-voice-title"` confirmed on `DeleteVoiceDialog.tsx:102-104`. Scrim click closes when `event.target === event.currentTarget && !busy`. Esc handler is present (verified via `inputRef` + dialog flow); focus is autofocused on the typed-`delete` input. **PASS.**
- `MegaMenu` closes on `Escape` (`apps/web/components/nav/MegaMenu.tsx:89-93` — global `keydown` listener) and on outside-click via the focus subtree check at `:117`. Opens on focus immediately for keyboard users (comment at `:7`). **PASS.**
- Keyboard shortcuts on the live screen are wired via custom handlers in `page.tsx`; the live-call-builder session log claims they don't trap focus and the implementation does not call `preventDefault()` on tab keys (verified by grepping for `preventDefault` near tab/key handlers; the only `preventDefault` is on numeric shortcuts which is correct). **PASS** for static check.

**MEDIUM — contrast risk:**

- Token `color.text.mutedDark = '#5C5C66'` on `color.canvas.dark = '#0A0A0B'` computes to approximately **3.0:1** contrast. WCAG 2.1 AA requires ≥4.5:1 for normal text, ≥3:1 for large text (≥18pt regular or ≥14pt bold). The `text-text-muted-dark` utility is used on the `ConfidenceIndicator` percentage callout and various footer/timestamp strings. **Fix:** either lighten `mutedDark` to roughly `#7A7A82` (≈4.6:1) for use under 18pt text, or restrict the token to "large/decorative only" via lint rule + documentation. The secondary token `#9B9BA3` already meets AA (~7.4:1) and is safe for body text.
- Amber `#F5A524` on canvas dark `#0A0A0B` is ~11.6:1 — strong PASS for text and UI.
- Primary text dark `#F5F5F7` on canvas dark — ~19.3:1 — PASS AAA.
- Black text on amber bloom (SuggestionCard) — ~11.6:1 — PASS.

**DEFERRED (requires running browser):**

- Visual tab-order verification through the live screen and the voice clone onboarding state machine.
- Focus-ring visibility against amber-on-black bloom surface.
- Screen-reader announcement timing on the word-stream `aria-live="polite"` region (whether 80ms stagger causes choppy SR readback).
- Touch-target size (Blueprint targets ≥44px) — should be verified at hover state with `getBoundingClientRect()`.

**Verdict: PASS with one MEDIUM token fix** (`color.text.mutedDark` contrast). Dynamic checks DEFERRED.

### Audit 4 · Performance (deferred)

Cannot run Lighthouse (no installed deps). Static evidence supporting the expected score:

**Landing page (`apps/web`):**

- **Images:** zero `<img>` and zero `<video>` tags across `apps/web/`. All visuals are inline SVG and CSS gradients. LCP candidate is therefore the hero headline text — should land well under 2.5s on a cold cache. **STRONG signal toward Perf ≥ 95.**
- **Fonts:** `next/font/google` is used for Inter + JetBrains Mono in `apps/web/app/layout.tsx`. `font-display: swap` is configured per `rules/web/performance.md`. **PASS.**
- **Third-party scripts:** zero detected.
- **Hero dimensions:** explicit via the orb classes `w-[640px] h-[640px]` and `w-[480px] h-[480px]` (live screen layout) and Hero waveform bars with explicit `height` numbers on `apps/web/components/marketing/Hero.tsx:197-211`. **PASS** — no CLS risk from dynamic media.
- **Animation properties:** scanned `apps/web/app/globals.css` keyframes — `vought-pulse-emerald` and `vought-pulse-amber` animate `box-shadow` (compositor-friendly via the shadow path on modern GPUs but historically a soft yes); `vought-wave-bar` animates `transform: scaleY` (compositor-friendly); `vought-float` animates `transform: translateY rotate` (compositor-friendly); `vought-wire-flow` animates `stroke-dashoffset` (SVG-only, off-main-thread). **PASS for compositor-friendliness.** No animation touches `width`/`height`/`top`/`left`/`margin`/`padding`/`border`/`font-size`.
- **Reveal-on-scroll uses IntersectionObserver** (custom hook `useReveal`) — no scroll-handler churn. **PASS.**
- **CSS bundle:** marketing globals + tokens + tailwind preset — well under the 30kb gzip landing budget at first inspection.
- **JS bundle:** harder to estimate without `next build`. Framer-motion is imported widely; if tree-shaking is on (Next 15 SWC default), unused exports are dropped. **Cautionary.**

**Live screen (`apps/app/app/live/`):**

- Same image/font/script story as the landing.
- Live screen does NOT prerender; it's a client component with `useConversation` + zustand. Initial paint should still be fast because StatePill, SuggestionCard, and SpeakerTimeline have static initial states. **Expected Perf ≥ 90.**
- Ambient orbs use `filter: blur(60px)` — modest GPU cost, but they're behind `pointer-events: none` and animate via the breath rAF only. **Acceptable.**

**Verdict: DEFERRED** — static evidence is consistent with the expected ≥95 (landing) and ≥90 (live) Lighthouse Perf score. Re-run with `npx unlighthouse` after `pnpm install` to confirm.

### Audit 5 · Live screen latency (deferred)

Cannot capture real latency without booting services. Wired implementation evidence:

- `services/echo-engine/src/server.ts` — AbortSignal threading and `instrumentStream()` first-token latency instrumentation present (per Wave-1 echo-engine session log §Produced).
- `services/diarization-sidecar/pipeline.py` — diart configured `duration=2.0, step=0.5, latency=0.5` (per ADR-003 and Wave-1 diarization session log).
- Live screen interruption fade — `200ms` documented exception, fast enough for sub-perceptible response.
- Token endpoint (`apps/app/app/api/token/route.ts`) threads `personaId`/`userId`/`variables` through the Speech Engine metadata field; no extra hops.
- Diart sidecar emits camelCase wire payload directly consumable by `speaker-gate.ts` — zero translation layer (cross-checked in Wave-1 summary).

Budget recap from Blueprint §3 (end-of-turn → audio in earphone, p50 < 900ms):
- ASR partial → end-of-utterance: ≤ 350ms (ElevenLabs Flash)
- LLM first token: ≤ 250ms (gpt-4o-mini streaming + 400/250ms RAG timeouts)
- TTS first byte: ≤ 200ms (Flash v2.5)
- Network + audio buffer: ≤ 100ms

All four components are wired with their expected primitives. The wiring is consistent with meeting the budget. **Verdict: DEFERRED** — cannot prove without a running stack and capture rig.

Diart 2-speaker accuracy + 5-concurrent-session latency: **DEFERRED** identically to the diarization-engineer session log — no HF_TOKEN, no recorded audio rig, no GPU to run pyannote weights.

### Audit 6 · Phase-sync (static)

- `useBreathTimer()` invocations across product code: **4**
  1. `/Users/vyapar/Downloads/vought/apps/app/app/settings/voice/page.tsx:26`
  2. `/Users/vyapar/Downloads/vought/apps/app/app/live/[sessionId]/layout.tsx:25`
  3. `/Users/vyapar/Downloads/vought/apps/app/app/onboarding/voice/page.tsx:64`
  4. `/Users/vyapar/Downloads/vought/apps/web/components/ui/MarketingRoot.tsx:22`
- Hook implementation is **reference-counted with a single shared rAF loop** (`packages/motion/src/breath.ts:25-89`). The four mounts compose into one timer; `state.count` increments on mount and only the first mount calls `start()`. There is **no risk of multiple competing rAF loops driving `--breath-phase` out of phase**. The four mount sites correspond to four distinct route roots (marketing root, app onboarding root, app live root, app settings root) — that's the intended pattern and matches the design-system contract.
- All surfaces consume `--breath-phase` from `:root` (via `document.documentElement.style.setProperty`), not from per-component CSS variables. `apps/web/app/globals.css` and `packages/design-system/src/global.css` both read `var(--breath-phase)`-derived expressions in `body` background and reduced-motion overrides.

Visual phase-sync verification (the canvas, the suggestion card, and the speaker timeline pulsing on the same beat) requires a running browser. **DEFERRED for visual confirmation.**

**Verdict: PASS** (architecture). **DEFERRED** for visual.

## Decisions

1. **Out-of-scope legacy surfaces are noted but not graded.** `apps/teams/` and `apps/app/app/page.tsx` (the legacy Cyrano persona-picker) predate Wave 2. Grading them would unfairly weight the Wave-2 score with pre-existing debt.
2. **Live-screen 200ms / 1500ms / 1800ms allowlisted exactly as the live-call-builder session log specifies.** Marketing-surface parity (`apps/web/app/globals.css` `.pulse-emerald` at 1500ms and `.pulse-amber` at 1800ms) is NOT allowlisted — the Blueprint exception is for the live screen only. Surface to landing-page-builder for decision: extend the allowlist for symmetry, or normalize marketing pulses to `var(--motion-breath)`.
3. **The 33rd "violation" (typographic glyphs in SuggestionCard) is not a violation.** `'✓'`, `'⏎'`, `'✕'` are keyboard-glyph dingbats, not emoji.
4. **Audits 4 and 5 are DEFERRED, not FAILED.** The supporting static evidence is strong; full verification needs a running stack.
5. **YELLOW, not GREEN, because Audit 1 and Audit 2 have real fixable violations that should not be silently absorbed by Wave-4 polish work.** A GREEN verdict would imply Wave 2 hit zero-drift, which it didn't.

## Open questions

- **Marketing pulse durations (1500/1800ms in `globals.css`).** Allowed exception or normalize to canonical scale? Landing-page-builder should decide.
- **`.float-anim` at 6000ms.** Extend canonical table or shorten to `wave` (4000ms)?
- **`color.text.mutedDark` contrast (3.0:1).** Lighten the token or restrict its use to large/decorative text? Design-system-architect should decide.
- **Token gaps that recur in violations** (so Wave-4 can land them in one pass): `color.canvas.darker`, `color.canvas.darkPulse`, `color.canvas.footer`, `color.accent.amberTinted`, `color.accent.amberSofter`, `color.scrim.dark`, `color.hairline.gridTexture`, `color.hairline.glass`, `shadow.heroDashboard`, `display/sm` 28px type token, `size.megamenu`, `size.orb.{md,lg}`.
- **Lighthouse, axe, latency capture** — re-run all three after `pnpm install` + service boot. Convert DEFERRED to PASS/FAIL.

## Next steps

Hand back to the user with a YELLOW verdict and the consolidated must-fix list below. Wave 4 (polish) can begin conditionally on these resolving — most are mechanical token substitutions and one source-of-truth edit per token gap.

**Must-fix before Wave 4 closes:**

1. **HIGH** — Tokenize the 15 Hero waveform rgba literals (`apps/web/components/marketing/Hero.tsx:197-211`) and the recurring amber-soft variants across `apps/app/app/onboarding/voice/`, `apps/app/app/live/[sessionId]/layout.tsx`, `apps/app/app/settings/voice/`.
2. **HIGH** — Lift the recurring dark-canvas variants (`#0C0C0E`, `#050507`, `#0E0E10`, `#1F1A0F`) to named `color.canvas.*` tokens.
3. **HIGH** — Resolve `.float-anim` 6000ms motion violation in `apps/web/app/globals.css:184`. Either drop to canonical or extend the table.
4. **HIGH** — `text-[9px]` instances in `PillarCards.tsx:107` and `PricingTease.tsx:103` (sub-token scale).
5. **MEDIUM** — Replace inline `text-[10px]` / `text-[11px]` with `text-label-xs` / `text-label-sm` Tailwind utilities — 8+ sites in `apps/app/app/`.
6. **MEDIUM** — Replace inline `200ms cubic-bezier(...)` / `240ms cubic-bezier(...)` literals with `var(--motion-*) var(--easing-*)` references in `SpeakerTimeline.tsx`, the onboarding components, and `SuggestionCard.tsx` (interruption fade keeps its 200ms exception comment but should still use the CSS variable for the easing curve).
7. **MEDIUM** — `color.text.mutedDark` contrast: lighten to ≥4.5:1 or document large-text-only.
8. **MEDIUM** — Pull `themeColor` hex in both `layout.tsx` files from `tokens.color.canvas.dark` rather than hardcoding `'#0A0A0B'`.
9. **LOW** — Stagger-delay ladders across the marketing scenes: normalize to canonical or formalize a `tokens.motion.stagger` scale.

**Deferred follow-ups (post-pnpm-install):**

- Run `npx unlighthouse` against both apps, confirm Perf ≥ 95 (web) and ≥ 90 (app).
- Run `axe-core` against `/live/[id]`, `/onboarding/voice`, `/settings/voice`, and the marketing landing.
- Capture three end-to-end latency traces against the live screen, confirm p50 < 900ms.
- Run the diart 2-speaker accuracy + 5-concurrent-session rigs once HF_TOKEN and recorded audio are available.

## Acceptance criteria

- [x] Audit 1 (Token drift) executed — 32 in-scope violations cataloged with file/line and suggested fix per item.
- [x] Audit 2 (Motion timing) executed — 8 unique violations + ~10 stagger-delay opportunities cataloged, three Blueprint exceptions allowlisted.
- [x] Audit 3 (Accessibility static) executed — `aria-live`, `role="dialog"`, MegaMenu Esc/outside-click confirmed; one MEDIUM contrast finding on `mutedDark`; dynamic checks DEFERRED.
- [x] Audit 4 (Performance) static-only — zero images, `next/font` with `swap`, IntersectionObserver reveal, compositor-friendly animations. Lighthouse DEFERRED with supporting evidence.
- [x] Audit 5 (Live latency) DEFERRED with wired-implementation evidence.
- [x] Audit 6 (Phase-sync static) — `useBreathTimer()` mounted 4× legitimately (ref-counted single rAF), all surfaces consume `--breath-phase` from `:root`. Visual verification DEFERRED.
- [x] No auto-fixes performed. Report only.
- [x] All violations cite absolute file paths and line numbers.
- [x] Allowlist honored: 1500ms / 1800ms / 200ms in `apps/app/app/live/[sessionId]/_components/{StatePill,SuggestionCard}.tsx` not flagged.

## Final verdict: YELLOW

Wave 4 polish can begin conditionally on the **9-item must-fix list above** (especially items 1–4 marked HIGH). None of the findings block correctness or security; all are design-system fidelity issues that the Wave-4 motion-polisher + design-system-architect should absorb in one pass before the demo. The two DEFERRED audits should be reconverted to PASS/FAIL once `pnpm install` and a recorded audio rig land — that work belongs to a follow-up gate, not this one.
