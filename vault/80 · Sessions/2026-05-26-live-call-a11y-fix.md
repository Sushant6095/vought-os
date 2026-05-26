---
title: 2026-05-26 · live-call-builder · a11y fixes
type: session
agent: live-call-builder
wave: 4-followup
verdict: green
---

# 2026-05-26 · live-call-builder · live screen accessibility fixes

Wave 4 follow-up. Four surgical accessibility edits applied to the live screen, addressing findings from `vault/80 · Sessions/2026-05-26-accessibility-auditor.md`. No other code modified. Scope contained to two files. TypeScript-compatible — only attribute and className additions; no imports or types touched.

---

## Edits applied

### 1. `<h1 className="sr-only">` for screen reader orientation

**File:** `/Users/vyapar/Downloads/vought/apps/app/app/live/[sessionId]/page.tsx`
**Location:** Line 553 (inserted as first child of `<Container as="main">` at line 552)
**Change:**

```tsx
<Container as="main" width="app" padX={32} style={{ minHeight: '100vh', paddingBlock: 32 }}>
  <h1 className="sr-only">Live call · {personaLabel}</h1>
  {/* Three-column grid for Teams; single column for Personal. ... */}
```

`personaLabel` is in scope (declared at line 526 via `useMemo`). `sr-only` is the Tailwind default utility (already used in SuggestionCard at lines 153 and 158). Addresses WCAG 2.4.6 (Headings and Labels).

---

### 2. `aria-live="polite"` on SuggestionCard container

**File:** `/Users/vyapar/Downloads/vought/apps/app/app/live/[sessionId]/page.tsx`
**Location:** Line 588 (the `<div className="min-h-[200px]">` wrapping `<AnimatePresence>`)
**Change:**

```tsx
<div className="min-h-[200px]" aria-live="polite">
  <AnimatePresence mode="wait">
    ...
```

Screen readers will now announce the suggestion when the card blooms in. `aria-live="polite"` (not `assertive`) — operator hears the suggestion at the next natural pause without interrupting their own speech.

---

### 3. `aria-live="polite"` on ListeningPlaceholder outer `<motion.div>`

**File:** `/Users/vyapar/Downloads/vought/apps/app/app/live/[sessionId]/page.tsx`
**Location:** Line 708 (the outer `<motion.div>` of `ListeningPlaceholder`, key="placeholder")
**Change:**

```tsx
<motion.div
  key="placeholder"
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.24 }}
  aria-live="polite"
  className="rounded-xl border border-hairline-dark bg-white/[0.02] p-6 text-text-secondary-dark"
>
```

SR users will hear the calibrating → listening state transition when `enrollmentReady` flips.

---

### 4. Touch-target bumps to ≥44px

**File a:** `/Users/vyapar/Downloads/vought/apps/app/app/live/[sessionId]/_components/SuggestionCard.tsx`
**Location:** Line 181 (`ActionTile` `base` className)
**Change:** Added `min-h-[44px]` to the base class:

```tsx
const base =
  'flex flex-col items-center justify-center gap-1 rounded-md py-3 px-2 min-h-[44px] text-label-sm font-medium transition-colors duration-quick ease-quick';
```

**File b:** `/Users/vyapar/Downloads/vought/apps/app/app/live/[sessionId]/page.tsx`
**Location:** Line 627 (end-session `<button>` className)
**Change:** Added `min-h-[44px]` to the className:

```tsx
<button
  type="button"
  onClick={() => void stopSession()}
  className="self-start min-h-[44px] text-text-xs font-medium text-text-secondary-dark hover:text-text-primary-dark transition-colors duration-quick ease-quick"
>
```

Both elements now satisfy WCAG 2.5.5 Target Size (44×44px floor).

---

## Verification notes

- `personaLabel` confirmed in scope at line 526 of `page.tsx` (declared before the return at line 551).
- `sr-only` Tailwind utility confirmed available — already used by `SuggestionCard.tsx:153,158`.
- No imports added or removed in either file.
- No types modified.
- No motion timings changed. Reduced-motion behavior unchanged — the `aria-live` attributes are passive announcements that respect SR settings, not motion.
- `aria-live="polite"` was placed on the container divs (the `<motion.div>` for the placeholder, the wrapping `<div>` for the suggestion area), not on internal text spans — matches the spec.

## Deviations

None. The four edits match the spec exactly.

---

## Acceptance criteria

- [x] `<h1 className="sr-only">` added inside `<Container as="main">` (page.tsx:553)
- [x] `aria-live="polite"` added to SuggestionCard container `<div>` (page.tsx:588)
- [x] `aria-live="polite"` added to `ListeningPlaceholder` outer `<motion.div>` (page.tsx:708)
- [x] `min-h-[44px]` added to `ActionTile` base class (SuggestionCard.tsx:181)
- [x] `min-h-[44px]` added to end-session button (page.tsx:627)
- [x] Only the two scoped files were modified.
- [x] No imports, types, or motion timings changed.
- [x] Reduced-motion behavior preserved.

---

## Next steps

- Re-run accessibility auditor (DEFERRED Audits 1, 2 dynamic, 3 dynamic, 5 dynamic, 7) after `pnpm install` and dev server boot to convert outstanding findings to PASS/FAIL.
- Design-system-architect still owes the four contrast token fixes (`text.mutedDark`, `text.mutedLight`, `accent.amber` light usage, `risk.coral` light usage) — those are out of scope for this run.
- `motion-polisher` still owes the WordStream reduced-motion `aria-live` move.
