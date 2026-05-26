# 2026-05-26 · voice-clone-builder · DeleteVoiceDialog touch targets

Wave 4 follow-up. Fixed WCAG 2.5.5 violation flagged in Audit 5 (Touch Targets) of the accessibility audit.

## Edits

File: `apps/app/app/settings/voice/_components/DeleteVoiceDialog.tsx`

- **Line 175** — Cancel button: `rounded-xl px-4 py-2 ...` → `min-h-[44px] rounded-xl px-4 py-3 ...`
- **Line 187** — Delete voice button: `rounded-xl px-4 py-2 ...` → `min-h-[44px] rounded-xl px-4 py-3 ...`

## Result

Both action buttons now meet the 44px minimum touch target requirement. Visual styling, colors, and the typed-confirmation gating logic are unchanged. No other files touched.
