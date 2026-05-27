# Claude Code Project Context · Vought

This file is the **canonical context** Claude Code reads at the start of every session in this repository. It is the briefing every agent receives. Keep it tight, current, and authoritative.

---

## Project identity

**Vought** is a real-time voice intelligence platform. Tagline: *Intelligence for live conversations.* The product listens to live human conversations and whispers what to say next, privately, into the operator's earbud, rendered in their own cloned voice. Sub-second end-to-end latency. Built on ElevenLabs Speech Engine.

Three products under one brand:
- **Vought Personal** ($19/mo) — consumer app for high-stakes moments (first dates, hard conversations, interviews, salary negotiations).
- **Vought Copilot** ($99/seat/mo) — real-time whisper coaching for revenue teams.
- **Vought Receptionist** ($0.20/min + $99/mo min) — autonomous AI handling inbound calls for SMBs.

## Canonical references

When in doubt about a design or product decision, consult these in order:

1. **`VOUGHT-DESIGN-BLUEPRINT.md`** — the cinematic UX + design system spec (v2, 10 deliverables + Texura pipeline + 7-phase implementation roadmap). This is the constitution.
2. **`BLUEPRINT.md`** — the technical architecture spec (services, latency budget, end-to-end flow).
3. **`vault/`** — the Obsidian knowledge base. Search before reinventing.
4. **`SETUP.md`** — environment setup and dev loop.

If a question is not answered by these four, ask before deciding.

## Tech stack (locked)

- **Frontend** — Next.js 15 (App Router) + Tailwind 3 + framer-motion + Inter / JetBrains Mono
- **State** — Zustand for client state, server components for server data, SWR for data fetching
- **Backend** — Node.js + Express + `@elevenlabs/elevenlabs-js` + OpenAI/Anthropic streaming
- **Diarization sidecar** — Python 3.11 + FastAPI + `diart` + pyannote-audio
- **Database** — Postgres 15 + pgvector + Redis (live session state)
- **Auth** — skipped for hackathon, Clerk in production
- **Monorepo** — Turborepo (root) — apps/* + packages/* + services/*
- **Hosting** — Vercel (web), Railway (services), Modal (diart GPU in production)
- **Voice** — ElevenLabs Speech Engine for STT + TTS + WebRTC. Voice cloning via the same.
- **LLM** — OpenAI gpt-4o-mini default, Anthropic Claude Haiku alternate. Streaming with AbortSignal.

## Design system rules (non-negotiable)

- Canvas dark `#0A0A0B` (app) or warm cream `#FAF8F3` (marketing). Never pure black or pure white.
- One accent color: amber `#F5A524`. Reserved for AI active states. Never decorative.
- Live emerald `#10B981` for temporal live states only.
- Type families: Söhne (display, paid) or Inter Display (free fallback); Inter (UI); JetBrains Mono (numerics only).
- Spacing on a 4px grid. Sizes: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 96, 128.
- Motion timings: 80 / 150 / 240 / 360 / 640ms. Plus 2000ms breath and 4000ms wave. No other durations.
- Four signature motions: **the breath**, **the whisper bloom**, **the word stream**, **the thinking dots**. Anything else needs principal designer sign-off.

## Brand voice rules

- Declarative sentences. No "AI-powered." No "supercharge." No "revolutionize." No "10x."
- Numbers in mono. Latency formatted `· 412ms` (amber dot prefix + mono digits + ms suffix). This is a brand callsign.
- No celebratory UI. No confetti. No toast notifications begging attention.
- Trust through restraint and specificity. Single named customer beats ten anonymous logos.
- The AI is invisible. No chatbot avatar. No persistent panel. The AI appears only when it has something to say.

## Forbidden patterns

- Stock photography or stock illustrations
- Emojis in product UI (allowed once or twice in marketing prose)
- Generic spinners or progress bars (use thinking dots / cursor tails / shimmers)
- Drop shadows in dark mode UI (use surface color shift for depth)
- A second accent color beyond amber
- "AI-powered" anywhere in marketing copy
- Scroll-jacking outside the one Copilot pinned section
- 3D-effect charts, pie charts, or exotic data visualizations
- Generic Radix/shadcn base styles without restyling to the token system

## How agents should work in this repo

1. **Read the relevant vault note(s)** before starting any task. Search `vault/` by topic.
2. **Read the relevant section of `VOUGHT-DESIGN-BLUEPRINT.md`** for design or UX decisions.
3. **Use the design tokens** from `packages/design-system/` — never hardcode values.
4. **Use the motion library** from `packages/motion/` — never write a one-off `transition: ... 240ms` outside this library.
5. **When the task is novel**, write the decision back to `vault/70 · Decisions/` as an ADR before moving on.
6. **When the task introduces a new pattern**, write it back to the relevant vault section (Design System, Architecture, etc.).
7. **When the task is complete**, log it to `vault/80 · Sessions/YYYY-MM-DD-agent-name.md` with what was done, what changed, and what's next.

## Agent fleet overview

The swarm lives in `.claude/agents/`. Each agent has a focused mission and a strict tool whitelist.

- **`orchestrator`** — meta-agent. Spawns waves, gates phases, reads vault, writes session logs.
- **`design-system-architect`** — owns tokens, primitives, motion library.
- **`echo-engine-engineer`** — Node.js Speech Engine + LLM streaming.
- **`diarization-engineer`** — Python diart sidecar.
- **`landing-page-builder`** — marketing landing page implementation.
- **`live-call-builder`** — the hero live conversation screen.
- **`voice-clone-builder`** — ElevenLabs voice cloning flow.
- **`qa-verifier`** — accessibility, performance, token drift audit.

Spawn waves in parallel for non-conflicting work. Spawn sequentially for dependent work. See `.claude/agents/README.md` for the dependency graph.

## Slash commands

Custom commands live in `.claude/commands/`. Type `/` in Claude Code to discover them. Key commands:

- `/vought-init` — one-time bootstrap (already done)
- `/vought-spawn-wave <wave-name>` — orchestrate a parallel agent wave
- `/vought-status` — project state, what's done, what's next
- `/vought-verify-tokens` — fail-fast on design-system drift
- `/vought-motion-audit` — fail-fast on motion timing violations
- `/vought-design-handoff <page>` — generate dev handoff spec
- `/vought-scaffold-page <path>` — new page following the design system
- `/vought-component <name>` — new component matching tokens

## Hackathon mode

This repo is currently in **hackathon mode** — 48-hour submission window. Scope is intentionally narrow:

1. Working live call screen with voice cloning
2. Landing page (mockup → live)
3. End-to-end loop: mic → diart → ElevenLabs STT → LLM → ElevenLabs TTS → AirPods
4. 90-second demo video

Everything else is V2 and lives only in `BLUEPRINT.md` for now. When implementing, **stay on the hackathon-critical path**.

---

*Updated by: bootstrap script. Last verified: hackathon Day 1.*

---

## Auto mode (multi-agent unattended execution)

This repo is configured for full auto mode — agents spawned via Task inherit a permissive permission set so the swarm runs without prompting on common operations.

See `.claude/AUTO-MODE.md` for the complete trust model, allow/deny lists, and how to revert.

**Short version:**
- Reads, writes, edits within the project: auto-approved
- Standard CLIs (npm, pnpm, vercel, railway, ffmpeg, playwright, git): auto-approved
- `.env` files and `~/.ssh/`, `~/.aws/`: hard-denied (agents cannot read or write)
- `sudo`, `rm -rf /`, `curl | sh`, `git push --force`, destructive db ops: hard-denied
- Deploy commands (`vercel --prod`, `railway up`): auto-approved — agents can deploy if you're logged in

**Hackathon mode:** leave auto mode on, commit between waves.
