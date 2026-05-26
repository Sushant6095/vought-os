---
description: Audit the codebase for design token violations (hardcoded colors, spacing, fonts)
allowed-tools: [Read, Grep, Glob, Bash]
---

Audit $ARGUMENTS (or the entire repo if no path given) for design system token violations.

## Checks

1. **Color violations.** Grep for hex codes in source files. Any color not from `packages/design-system/tokens.ts` is a violation. Exception: SVG path fills inside icon components.

2. **Spacing violations.** Grep for non-grid pixel values in margin/padding/gap. The 4px grid is non-negotiable.

3. **Type-scale violations.** Grep for `text-[NNpx]` or `font-size: NNpx` outside the type-scale tokens (12 / 14 / 16 / 20 / 24 / 28 / 32 / 40 / 48 / 64 / 88).

4. **Motion timing violations.** Grep for `transition-duration`, `animation-duration`, `duration:`, and CSS Nms values. Anything outside {80, 150, 240, 360, 640, 1200, 2000, 4000}ms is a violation.

5. **Forbidden patterns.** Grep for emojis in source files. Grep for "AI-powered", "supercharge", "10x" — banned phrases.

## Output format

Print a structured report listing each violation with file path, line, and suggested fix. Summary at the bottom with total count. If zero violations, print `✓ Token audit clean.` and exit.

## Hard rules

- Do not auto-fix. Report only.
- Treat icon SVG paths and tokens.ts / tailwind.config.ts as exempt.
