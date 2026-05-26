---
title: Tokens · Typography
type: spec
status: locked
---

# Typography Tokens

> Three families. Fourteen scale tokens. Tracking tuned by hand.

## Families

- **Display** — Söhne (paid license) or Inter Display fallback. Set tight at -0.04em.
- **UI** — Inter. Variable, weights 400 / 500 / 600 / 700.
- **Mono** — JetBrains Mono. Numerics only — timings, IDs, code. Never prose.

## Type scale (modular ~1.333)

| Token | Size / line / weight / tracking | Use |
|---|---|---|
| `display/3xl` | 88 / 0.95 / 800 / -0.045em | Landing hero |
| `display/2xl` | 64 / 1.0 / 800 / -0.04em | Section opener |
| `display/xl` | 48 / 1.05 / 700 / -0.03em | Sub-section opener |
| `display/lg` | 40 / 1.1 / 700 / -0.025em | Page title |
| `display/md` | 32 / 1.15 / 700 / -0.02em | Card title |
| `text/xl` | 24 / 1.3 / 500 | Lead paragraph |
| `text/lg` | 20 / 1.4 / 500 | Subhead, suggestion card |
| `text/base` | 16 / 1.5 / 400 | Body |
| `text/sm` | 14 / 1.5 / 400 | Secondary body |
| `text/xs` | 12 / 1.5 / 500 | Captions |
| `label/sm` | 11 / 1.4 / 600 / +0.12em uppercase | Eyebrows |
| `label/xs` | 10 / 1.3 / 700 / +0.15em uppercase | Pills, badges |
| `mono/lg` | 24 / 1.0 / 500 / -0.01em | Metric numbers |
| `mono/sm` | 13 / 1.4 / 400 | Latency, IDs |

## Hard rules

- Body text on dark: 95% white (`#F5F5F7`). Never pure white.
- Mono ONLY for facts (latency, durations, IDs). Never prose.
- Italics in marketing prose at most twice per page. Never in product UI.
- Letter spacing: display compresses (-0.025 to -0.045em), labels expand (+0.12 to +0.15em).
