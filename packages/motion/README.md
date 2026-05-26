# @vought/motion

Shared motion library. The four signature motions live here. Nowhere else.

## Exports

- `breath.ts` — 2000ms canvas brightness shift, shared `:root` timer
- `bloom.ts` — 320ms suggestion-card overshoot
- `word-stream.tsx` — word-by-word transcript renderer
- `thinking-dots.tsx` — three-dot loading pulse
- `index.ts` — timing constants (`MOTION.instant`, `.quick`, `.standard`, `.deliberate`, `.cinematic`, `.breath`, `.wave`)

## Rule

If you find yourself writing a `transition: ... 240ms` outside this package, stop. Import from here.

Audit via `/vought-motion-audit`.
