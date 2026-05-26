---
title: Motion · Timing Table
type: spec
status: locked
related: [[Motion · Signatures]]
---

# Motion Timing Table

> Seven canonical durations. Everything else is a violation.

## The table

| Token | Duration | Easing | Use |
|---|---|---|---|
| `instant` | 80ms | ease-out | Button press, hover ink, toggle |
| `quick` | 150ms | cubic-bezier(0.4, 0, 0.2, 1) | Hover state, focus ring |
| `standard` | 240ms | cubic-bezier(0.4, 0, 0.2, 1) | Card, dropdown, panel expand |
| `deliberate` | 360ms | cubic-bezier(0.32, 0.72, 0, 1) | Section reveal, modal open |
| `cinematic` | 640ms | cubic-bezier(0.16, 1, 0.3, 1) | Scene change, dashboard ↔ marketing |
| `breath` | 2000ms | cubic-bezier(0.45, 0.05, 0.55, 0.95) | Ambient canvas pulse |
| `wave` | 4000ms | cubic-bezier(0.45, 0.05, 0.55, 0.95) | Slow idle waveform |

## Hard rules

- Default duration: 240ms (`standard`).
- Maximum allowed without principal designer sign-off: 640ms.
- The only exceptions are `breath` (2000ms) and `wave` (4000ms).
- Springs allowed only for drag-and-drop. Default: stiffness 400, damping 30.
- Every animation respects `prefers-reduced-motion: reduce` — replace with simple fade.

## Springs

Used selectively for:
- Persona card carousel snap
- Playbook reorder drag
- Suggestion card swipe (mobile)

Spring config: `{ stiffness: 400, damping: 30 }`.

## See also

- [[Motion · Signatures]] — the four signature motions
