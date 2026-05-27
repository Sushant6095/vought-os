# Vought · Intelligence for live conversations

> Real-time voice intelligence platform. Listens to live human conversations and whispers what to say next — privately, in your own cloned voice. Sub-second latency. Built on ElevenLabs Speech Engine.

This repository is the canonical workspace for Vought. It contains the design blueprint, the implementation scaffold, the multi-agent orchestration setup, an Obsidian knowledge vault, and a curated prompt library.

---

## Quick orientation

```
vought/
├── README.md                       ← you are here
├── CLAUDE.md                       ← project context for Claude Code agents
├── BLUEPRINT.md                    ← technical architecture spec
├── VOUGHT-DESIGN-BLUEPRINT.md      ← cinematic UX + design system v2
├── SETUP.md                        ← 30-minute getting-started guide
│
├── .claude/                        ← Claude Code config
│   ├── commands/                   ←   custom slash commands (/vought-*)
│   ├── agents/                     ←   subagent definitions (the swarm)
│   ├── skills/                     ←   custom skills (vought:*)
│   ├── hooks/                      ←   pre/post-event hooks
│   └── settings.json
│
├── prompts/                        ← advanced prompt library
│   ├── system/                     ←   system prompts for agent personas
│   ├── personas/                   ←   product personas (First Date, Sales, etc)
│   ├── research/                   ←   research prompts (NotebookLM, etc)
│   ├── workflows/                  ←   multi-step orchestration prompts
│   └── meta/                       ←   prompt engineering templates
│
├── vault/                          ← Obsidian vault — reusable agent memory
│   ├── 00 · Index/                 ←   MOCs (Maps of Content)
│   ├── 10 · Strategy/              ←   brand, voice, narrative
│   ├── 20 · Design System/         ←   tokens, motion, components
│   ├── 30 · Architecture/          ←   system, latency, services
│   ├── 40 · Pages/                 ←   per-page UX specs
│   ├── 50 · Competitors/           ←   competitor intel
│   ├── 60 · Research/              ←   user, market, technical
│   ├── 70 · Decisions/             ←   ADRs (Architecture Decision Records)
│   ├── 80 · Sessions/              ←   agent session logs
│   └── 99 · Templates/             ←   note templates
│
├── apps/                           ← Next.js apps
│   ├── web/                        ←   marketing site (vought.com)
│   ├── app/                        ←   product app (app.vought.com) — has /live
│   └── teams/                      ←   manager dashboard (legacy split)
│
├── packages/                       ← shared workspace packages
│   ├── design-system/              ←   tokens, primitives, types
│   ├── motion/                     ←   shared motion library
│   ├── ui/                         ←   shared React components
│   └── types/                      ←   shared TS types
│
├── services/                       ← backend services
│   ├── echo-engine/                ←   Node.js Speech Engine orchestrator
│   └── diarization-sidecar/        ←   Python diart streaming diarization
│
├── database/                       ← Postgres schema + migrations
├── mockups/                        ← high-fidelity HTML mockups (Figma-style)
├── docs/                           ← public + internal docs
├── infra/                          ← deploy + docker-compose
└── scripts/                        ← build + bootstrap scripts
```

## Run it locally

Monorepo is **pnpm + Turborepo**. Node 20+, pnpm 9.

```bash
pnpm install
```

### Surfaces & ports

| Surface | Command | Port |
|---|---|---|
| Marketing site (`apps/web`) | `pnpm --filter=web dev` | http://localhost:3000 |
| Product app (`apps/app`) | `pnpm --filter=app dev` | http://localhost:3002 |
| Echo Engine (`services/echo-engine`) | `pnpm --filter=echo-engine dev` | http://localhost:3001 |
| Diarization sidecar (`services/diarization-sidecar`) | `uvicorn main:app --port 8000` | http://localhost:8000 |

The **marketing site runs with no keys**. The **live voice loop** needs the steps below.

### Live voice loop (the product)

1. **Env** — fill `services/echo-engine/.env` and `apps/app/.env.local`:
   - `ELEVENLABS_API_KEY` (required) — elevenlabs.io → API keys
   - `OPENAI_API_KEY` **or** `ANTHROPIC_API_KEY` (one required) — generates the whisper
2. **Public tunnel** — ElevenLabs must reach the engine:
   ```bash
   ngrok http 3001
   # paste the wss form into echo-engine/.env: PUBLIC_WS_URL=wss://<id>.ngrok-free.app/ws
   ```
3. **Mint the Speech Engine** (needs the key + PUBLIC_WS_URL above):
   ```bash
   pnpm --filter=echo-engine create-engine
   # set SPEECH_ENGINE_ID=seng_… in BOTH env files
   ```
4. **Boot** the engine + app:
   ```bash
   pnpm --filter=echo-engine dev      # :3001
   pnpm --filter=app dev              # :3002
   ```
5. Open **http://localhost:3002/onboarding/voice** to clone your voice, then the live screen.

### Optional infra

- **Memory + playbook RAG** — `docker compose up -d` (Redis + Postgres/pgvector), then uncomment `REDIS_URL` + `DATABASE_URL` in `echo-engine/.env`. Without them the engine uses an in-memory fallback and disables RAG.
- **Real diarization** — the diart sidecar needs **Python 3.11** + `HF_TOKEN` (Hugging Face, accept the pyannote licence). Without it the engine degrades to "always whisper" (no speaker gating).

## API reference

The full developer reference lives at **`/docs`** on the marketing site (`apps/web/app/docs`) — Sessions, streaming events, voice cloning, and speaker diarization, all on the ElevenLabs Speech Engine. The whisper loop:

```
mic → ElevenLabs STT (end-of-turn) → diarization → Echo Engine
    → streaming LLM → ElevenLabs TTS (Flash v2, cloned voice) → earbud
```

Median end-to-end latency target: **· 412ms**.

## The multi-agent swarm

Vought is built by a curated fleet of Claude Code subagents, each owning a specific surface. The agents live in `.claude/agents/` and are invoked via the Task tool or by the orchestrator command `/vought-spawn-wave`.

| Agent | Owns | Phase |
|---|---|---|
| `design-system-architect` | tokens, primitives, motion library | 1 |
| `echo-engine-engineer` | Node.js Speech Engine server | 1 |
| `diarization-engineer` | Python diart sidecar | 1 |
| `landing-page-builder` | marketing landing implementation | 2 |
| `live-call-builder` | the hero live conversation screen | 2 |
| `voice-clone-builder` | ElevenLabs voice cloning flow | 2 |
| `qa-verifier` | accessibility + perf + token drift audit | 3 |
| `orchestrator` | meta-agent: spawns waves, gates phases | * |

See `.claude/agents/README.md` for the full fleet.

## The custom slash commands

Created in `.claude/commands/`. Each is a markdown file with frontmatter + body that Claude Code reads when you type `/`.

- `/vought-init` — one-time bootstrap (you ran this to create this repo)
- `/vought-scaffold-page <name>` — generate a page conforming to design system
- `/vought-component <name>` — generate a component matching tokens
- `/vought-verify-tokens` — fail on hard-coded colors / spacing / type
- `/vought-motion-audit` — fail on animation durations outside the timing table
- `/vought-spawn-wave <wave>` — spawn a parallel agent wave
- `/vought-status` — project status overview
- `/vought-design-handoff <page>` — generate dev handoff spec from blueprint

## The Obsidian vault

`vault/` is an Obsidian-ready knowledge base. Open it in Obsidian directly (Open vault → select `vault/`). Notes use wikilinks `[[Like This]]`, tags `#tag`, and PARA-style numerical prefixes (00-99). The vault is the **reusable memory** across agent sessions — every important decision, every brand standard, every competitor profile lives there as a single source of truth.

When an agent works on a task, its first step is to scan the relevant vault folders. When a task completes, the agent writes back what it learned. The vault grows organically. The agents never "forget."

## The prompt library

`prompts/` is the curated set of prompts used by the swarm:

- **`system/`** — system prompts that define agent personas (master orchestrator, design critic, code reviewer)
- **`personas/`** — the product's own LLM personas (First Date, Job Interview, Sales Discovery, etc) — these are what end users select inside the Vought product
- **`research/`** — high-leverage research prompts (NotebookLM context primer, competitor deep-dive)
- **`workflows/`** — multi-step orchestration scripts (full page build, full PR review)
- **`meta/`** — prompt engineering templates and evaluation criteria

## Read in this order

1. **`BLUEPRINT.md`** — what we're building and why
2. **`VOUGHT-DESIGN-BLUEPRINT.md`** — the cinematic UX spec
3. **`SETUP.md`** — get the project running locally
4. **`.claude/agents/README.md`** — meet the swarm
5. **`vault/00 · Index/MOC · Master.md`** — explore the knowledge base

## License

Proprietary. © 2026 Vought Inc.
