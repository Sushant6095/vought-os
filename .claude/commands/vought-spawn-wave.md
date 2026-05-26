---
description: Spawn a parallel agent wave from the phased implementation roadmap
argument-hint: "<wave-number> | <wave-name>"
allowed-tools: [Task, Read, TodoWrite]
---

Spawn the agents for **wave $ARGUMENTS** of the Vought implementation roadmap.

## Wave map

| Wave | Agents (parallel) | Dependencies |
|---|---|---|
| 1 · Foundation | `design-system-architect`, `echo-engine-engineer`, `diarization-engineer` | None |
| 2 · Hero surfaces | `landing-page-builder`, `live-call-builder`, `voice-clone-builder` | Wave 1 complete |
| 3 · Verification | `qa-verifier` | Waves 1+2 complete |
| 4 · Polish | `motion-polisher`, `accessibility-auditor` | Wave 3 passing |

## Procedure

1. Read `VOUGHT-DESIGN-BLUEPRINT.md` Phase $ARGUMENTS section for context.
2. Read the relevant agent definitions in `.claude/agents/`.
3. Read recent session logs in `vault/80 · Sessions/` to understand what previous waves produced.
4. Spawn the wave's agents in parallel using the Task tool, one Task call per agent in a single response so they run concurrently.
5. Each agent receives a self-contained prompt that includes:
   - Pointer to its agent definition file
   - Pointer to the relevant blueprint section
   - List of vault notes to read before starting
   - The specific deliverable expected
   - The acceptance criteria from the blueprint
6. After all agents in the wave return, write a session log to vault/80 · Sessions/ summarizing outputs, decisions, and the next wave's dependencies.

## Hard rules

- Never spawn dependent agents in the same wave. Check the dependency graph before spawning.
- Each agent's prompt must be self-contained. Agents do not share context — pass them every file path they need explicitly.
- No prose like "based on your findings, do X." Tell each agent exactly what to produce with file paths and acceptance criteria.
- If any agent fails, do not auto-retry. Surface the failure to the user with the agent's full output.
