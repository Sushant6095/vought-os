---
title: Page Build Workflow
audience: orchestrator subagent
inputs: page_path, blueprint_section
intent: Build a full Next.js page from blueprint to acceptance, in one orchestrated workflow
---

# Page Build Workflow · $page_path

## Phase 1 · Spec
1. Read VOUGHT-DESIGN-BLUEPRINT.md $blueprint_section
2. Read any existing vault note at vault/40 · Pages/$page_path.md
3. Invoke /vought-design-handoff $page_path → writes docs/handoff/$page_path.md
4. Review the handoff for ambiguity. If found, write decisions-needed questions; STOP and surface.

## Phase 2 · Scaffold
5. Invoke /vought-scaffold-page $page_path
6. Verify token compliance immediately via /vought-verify-tokens $page_path

## Phase 3 · Implement
7. Spawn `live-call-builder` or `landing-page-builder` (depending on page) with:
   - The handoff doc as context
   - The scaffold file paths
   - Explicit acceptance criteria from the handoff
8. Wait for completion. Read the agent's output.

## Phase 4 · Verify
9. Invoke /vought-verify-tokens $page_path
10. Invoke /vought-motion-audit $page_path
11. Spawn `qa-verifier` for accessibility + Lighthouse

## Phase 5 · Polish
12. If yellow verdict from qa-verifier, spawn `motion-polisher` and `accessibility-auditor`
13. Re-run /vought-verify-tokens and /vought-motion-audit until green

## Phase 6 · Log
14. Write session log to vault/80 · Sessions/YYYY-MM-DD-page-$page_path.md
15. Update vault/40 · Pages/$page_path.md with implementation notes

## Branch conditions
- If at step 4 the handoff has ambiguity, STOP and surface.
- If at step 11 verification is RED, STOP and surface, do not auto-fix.
- If at step 12 the motion polisher introduces a new motion, STOP and require design-system-architect.
