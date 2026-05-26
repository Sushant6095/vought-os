---
description: Snapshot of Vought project state — phases, pending work, last session
allowed-tools: [Read, Bash, Glob]
---

Print a project status snapshot. Run at the start of every coding session.

## What to gather

1. Phase state (done/partial/pending) for each phase 1-7 from the roadmap.
2. Last session log from vault/80 · Sessions/.
3. Open ADRs from vault/70 · Decisions/.
4. Pending tasks from TodoWrite.
5. Service health: echo-engine, diart-sidecar, redis, postgres.

## Output format

```
VOUGHT STATUS · YYYY-MM-DD HH:MM

PHASES         ✓ done · ~ partial · · pending
LAST SESSION   most recent log summary
SERVICES       up/down per service
OPEN ADRs      list
PENDING TASKS  list
```

## Hard rules

- Be honest about partial completion.
- Never silently fix anything during status check.
