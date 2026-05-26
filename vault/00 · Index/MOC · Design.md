---
title: MOC · Design
type: reference
last_updated: 2026-05-26
---

# Design MOC

> Every token, every motion, every brand standard. The design system is the constitution.

## Brand identity

- [[Brand Voice]] — the writing voice
- [[Three-Act Narrative]] — the product story
- [[Trust Architecture]] — credibility surfaces

## Tokens

- [[Tokens · Color]] — single accent (amber), canvas dark + cream light
- [[Tokens · Typography]] — Söhne / Inter / JetBrains Mono; 14-token scale
- [[Tokens · Spacing]] — 4px grid, no exceptions
- [[Tokens · Motion]] — 7 timing constants

## Motion

- [[Motion · Timing Table]] — instant / quick / standard / deliberate / cinematic / breath / wave
- [[Motion · Signatures]] — the breath, the bloom, the word stream, the thinking dots

## Reference benchmarks

We learn from: Observe.ai, Cresta, Linear, Cursor, Granola, Stripe, Vercel.
We do NOT clone any of them. We learn the *register* and apply our own identity.

## Forbidden

- Second accent color beyond amber
- Pure white text on dark (use #F5F5F7)
- Pure black backgrounds (use #0A0A0B)
- Drop shadows in dark mode UI
- Stock illustrations
- Emojis in product UI
- "AI-powered" or "supercharge" in marketing
- Drop shadows for elevation (use surface color shift)

## Reference implementation

The cinematic landing HTML at `mockups/vought-landing-cinematic.html` is the canonical token-in-use reference. When implementing a marketing page, mirror its visual treatment exactly.
