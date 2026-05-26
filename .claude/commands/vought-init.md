---
description: One-time bootstrap of the Vought project workspace
allowed-tools: [Bash, Write, Read]
---

Run the one-time bootstrap for a fresh checkout.

## Procedure

1. Verify Node 20+, Python 3.11+, Postgres 15+ with pgvector, Redis.
2. Install dependencies (pnpm + Python venv).
3. Copy .env.example files and prompt for keys.
4. Boot infrastructure (postgres, redis), create vought db, run schema.sql.
5. Hugging Face login for pyannote/diart.
6. Offer to open vault/ in Obsidian.
7. Print next steps.

## Hard rules

- Never overwrite existing .env. Prompt first.
- If a prerequisite check fails, halt with brew/apt install command.
- Bootstrap must be idempotent.
