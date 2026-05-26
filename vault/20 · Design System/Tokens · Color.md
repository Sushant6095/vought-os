---
title: Tokens · Color
type: spec
status: locked
last_updated: 2026-05-26
related: [[Tokens · Typography]] [[Motion · Timing Table]]
---

# Color Tokens

> Single accent. Two canvases. Strict role-based assignment.

## Canvas

| Token | Hex | Use |
|---|---|---|
| `canvas/dark` | `#0A0A0B` | App page background. Never pure black. |
| `surface/dark` | `#131316` | Sidebar, top bar, panels. |
| `elevated/dark` | `#1A1A1E` | Cards inside containers, dropdowns, modals. |
| `hairline/dark` | `#25252A` | Border, divider. 1px only. |
| `glass/dark` | `rgba(20,20,24,0.72)` | Floating overlays. 24px backdrop blur. |
| `canvas/light` | `#FAF8F3` | Marketing page background. Warm cream. |
| `surface/light` | `#FFFFFF` | Marketing cards, nav pill. |
| `hairline/light` | `#E8E5DC` | Marketing border. |

## Text

| Token | Hex (on dark) | Hex (on light) | Use |
|---|---|---|---|
| `text/primary` | `#F5F5F7` | `#0A0A0B` | Body, headings |
| `text/secondary` | `#9B9BA3` | `#5C5C66` | Labels, captions |
| `text/muted` | `#5C5C66` | `#A3A3AB` | Disabled, helper |

## Semantic accent

| Token | Hex | Use |
|---|---|---|
| `accent/amber` | `#F5A524` | **The AI state.** Whispering. CTAs inside product. |
| `accent/amber-soft` | `rgba(245,165,36,0.14)` | Active state backgrounds. |
| `live/emerald` | `#10B981` | Live/connected/recording. Temporal only. |
| `risk/coral` | `#F26D5B` | Risk flag, churn signal. Rare. |
| `info/azure` | `#5B8FF9` | Info badge, link on light. |
| `marketing/ink` | `#0A0A0B` | Marketing primary CTA on light canvas. |

## Hard rules

- **One screen, max three of {amber, emerald, coral, azure}.** The eye must follow one signal.
- **Amber is reserved for the AI state.** Never decorative.
- **Emerald is for temporal live states only.** Never "success."
- **Coral is rare.** Dashboard with 30 metrics shows coral on at most 1-2.
- **Pure white and pure black are forbidden.** Use `#F5F5F7` and `#0A0A0B`.
- **Custom hex codes outside tokens.ts are violations.** The exception is icon SVG fills, which inherit from parent.

## Implementation

Tokens live in `packages/design-system/src/tokens.ts` and are exposed to Tailwind via `tailwind.config.ts`. Use `bg-canvas-dark`, `text-text-primary`, `border-hairline-dark` rather than `bg-[#0A0A0B]`.
