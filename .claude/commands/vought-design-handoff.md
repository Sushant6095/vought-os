---
description: Generate a developer handoff spec for a specific page from the blueprint
argument-hint: "<page-name>"
allowed-tools: [Read, Write, Glob, Skill]
---

Generate a complete developer handoff for the $ARGUMENTS page.

## Procedure

1. Read the canonical section from VOUGHT-DESIGN-BLUEPRINT.md for the page.
2. Read vault/40 · Pages/$ARGUMENTS.md if it exists.
3. Read the design tokens.
4. Invoke design:design-handoff skill on the consolidated context.
5. Write the result to docs/handoff/$ARGUMENTS.md with:
   - Page identity
   - Layout
   - Components
   - Tokens
   - Interactions
   - States
   - Accessibility
   - Performance
   - Acceptance criteria
6. Append a spec-to-implementation map table.

## Hard rules

- Every spec value must be a token reference, never a raw hex/px/ms.
- Every component must include a file path.
- Acceptance criteria must be objectively verifiable.
- If the blueprint is ambiguous, write a Decisions needed section. Do not invent.
