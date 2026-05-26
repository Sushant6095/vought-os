---
description: Verify every animation matches the Vought motion timing table
allowed-tools: [Read, Grep, Glob]
---

Audit $ARGUMENTS for animation timing violations against the Vought motion system.

## The canonical timing table

| Token | Duration | Allowed use |
|---|---|---|
| instant | 80ms | Button press, hover ink |
| quick | 150ms | Hover state, focus ring |
| standard | 240ms | Card, dropdown, panel |
| deliberate | 360ms | Section reveal, modal |
| cinematic | 640ms | Scene change |
| breath | 2000ms | Ambient pulse |
| wave | 4000ms | Slow waveform |

## Checks

1. Find every duration in CSS, framer-motion configs, and Tailwind classes. Compare against the table.

2. Find every easing function. Check against allowed easings.

3. Verify the four signature motions use their canonical implementations from `packages/motion/`:
   - The breath (breath.ts)
   - The whisper bloom (bloom.ts)
   - The word stream (word-stream.tsx)
   - The thinking dots (thinking-dots.tsx)

Any local re-implementation is a violation.

## Hard rules

- The CSS @keyframes inside packages/motion/ are exempt — they DEFINE the signatures.
- Suggest the closest valid timing for each off-table value.
