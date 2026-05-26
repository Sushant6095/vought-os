---
description: Generate a new shared component matching the design system
argument-hint: "<ComponentName>"
allowed-tools: [Read, Write, Glob, Grep]
---

Generate the shared component $ARGUMENTS in packages/ui/src/components/.

## Procedure

1. Check if component exists. Abort if yes.
2. Scaffold TypeScript React component with:
   - Variant + size + state props using cva
   - Forwarded ref
   - Composable children
   - Strict TypeScript types
   - Storybook story (.stories.tsx)
   - Visual regression test stub (.test.tsx)
3. File structure:
   packages/ui/src/components/$ARGUMENTS/
     index.ts
     $ARGUMENTS.tsx
     $ARGUMENTS.stories.tsx
     $ARGUMENTS.test.tsx
     $ARGUMENTS.types.ts
4. Export from packages/ui/src/index.ts.
5. Generate stories for every variant + size + state combination.

## Hard rules

- No raw colors, pixel values, or durations.
- No emoji.
- Never use shadcn/Radix base styles unrestyled.
- Press scale 0.96 / 80ms mandatory across every interactive component.
- Forward refs always.
