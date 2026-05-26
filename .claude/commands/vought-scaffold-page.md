---
description: Scaffold a new Next.js page matching the Vought design system
argument-hint: "<path>"
allowed-tools: [Read, Write, Glob]
---

Scaffold a new page at $ARGUMENTS following the design system.

## Procedure

1. Determine marketing (apps/web/) vs app (apps/app/).
2. Read VOUGHT-DESIGN-BLUEPRINT.md §4 for the page spec.
3. Generate: page.tsx (server component), metadata.ts, optional layout.tsx.
4. Default contents must:
   - Import from @vought/design-system for tokens
   - Import primitives from @vought/ui
   - Use the reveal motion pattern for section entries
   - Include placeholder copy in the brand voice
   - Set generateMetadata
   - Include DisclosureBanner for live screen
5. Run /vought-verify-tokens on the new file.
6. Write stub vault note at vault/40 · Pages/.

## Hard rules

- Do not invent components. Reference only existing components.
- Do not write raw hex/pixel values.
- Brand voice — read vault/10 · Strategy/Brand Voice.md first.
- Respect prefers-reduced-motion.
