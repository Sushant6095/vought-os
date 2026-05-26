---
title: ADR-002 · Single accent color
type: decision
status: accepted
date: 2026-05-26
related: [[Tokens · Color]]
---

# ADR-002 · Single accent color — amber only

## Status

Accepted. 2026-05-26.

## Context

Many SaaS products use 2-3 brand colors (Notion: black + grey, Linear: monochrome + accent, Stripe: purple + blue + pink). We need to decide whether Vought uses one accent or more.

## Decision

**One accent color: amber `#F5A524`.**

Plus three semantic colors used for state, not brand: emerald (live), coral (risk), azure (info). These are NOT brand colors — they communicate state and are constrained to specific use cases.

## Reasoning

1. **Amber must signal AI activity.** When users see amber, they should know the AI is doing something. Using amber decoratively dilutes the signal.
2. **The brand is about restraint.** Multiple accent colors signal a B2B SaaS. We signal precision instrument.
3. **The Cresta comparison.** Cresta uses blue + white. We use amber + dark canvas. The difference is instantly recognizable in side-by-side screenshots.
4. **Color budgeting.** A single screen never shows more than three of {amber, emerald, coral, azure}. The eye follows one signal.

## Consequences

- ✓ Strong, recognizable brand identity from a single hue.
- ✓ Easier accessibility — fewer color-pair contrast tests.
- ✗ Marketing pages can feel "monochrome" — we mitigate via warm cream canvas and high typographic contrast.
- ✗ Some designers will want a second accent. Saying no is the design system's job.

## Reversibility

Low. If we ship and decide later we need a secondary accent, retrofitting it across the product is weeks of work.
