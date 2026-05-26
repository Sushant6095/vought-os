---
title: Component Build Workflow
audience: orchestrator subagent
inputs: component_name, design_spec
intent: Build a shared UI component from spec to acceptance
---

# Component Build Workflow · $component_name

1. Invoke /vought-component $component_name (scaffolds the file structure)
2. Read VOUGHT-DESIGN-BLUEPRINT.md §7 (Visual System) for any related spec
3. Read packages/ui/src/components/ for existing patterns to inherit
4. Implement the component per $design_spec — variants, sizes, states
5. Generate Storybook stories for every (variant × size × state) combination
6. Invoke /vought-verify-tokens packages/ui/src/components/$component_name
7. Invoke /vought-motion-audit packages/ui/src/components/$component_name
8. Run pnpm test --filter=ui $component_name
9. Visual regression: capture screenshots in Storybook, commit baseline images
10. Update packages/ui/src/index.ts with the new export
11. Update vault/20 · Design System/Components.md with the new component entry
12. Write session log
