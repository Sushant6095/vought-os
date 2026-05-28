# Contributing · Vought

> This is a hackathon-stage project. Contributions are welcome — discussed before merge, reviewed against the design system, gated by automated checks.

If you are an external contributor, open an issue first describing what you want to build. If you are a team member dispatched by the orchestrator, see [`docs/agents.md`](docs/agents.md) for your agent's mission and scope.

---

## Dev environment

The fastest path is the 5-step Quick start in [`README.md`](README.md). The extended walkthrough with troubleshooting for every step is in [`docs/quick-start.md`](docs/quick-start.md).

Minimum tools:

- Node 20+ (`node --version`)
- pnpm 9.12+ (`pnpm --version`) — the root `package.json` declares `packageManager: pnpm@9.12.0`
- Python 3.11+ (only if you touch the diarization sidecar)
- Docker Desktop (only if you want local Postgres + Redis)
- An ElevenLabs API key (only if you touch the live voice loop)

The marketing site (`apps/web`) builds and runs with zero keys. The product app shell (`apps/app`) builds with zero keys; the live screen needs the keys above.

---

## Branch conventions

Branch names follow `wave-<N>-<surface>` for orchestrated waves or `fix/<topic>` for ad-hoc fixes.

```
wave-7-video
wave-11-readme
fix/blog-rss-route
fix/customers-slug-pages
```

Trunk-based. Branches stay short-lived. Rebase on `main` before opening a PR.

---

## Commit messages

[Conventional Commits](https://www.conventionalcommits.org/). Types in use: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`, `ci`. Recent examples from this repo:

```
fix(web): never send /demo to localhost in production
fix: framer-motion easing types, TS5.7 Uint8Array, SDK onError signature
chore(apps): shared app configuration
feat(web): add /platform deep dive
```

No Claude Code or AI attribution lines in commit messages — global setting at `~/.claude/settings.json` keeps them out. See [`CLAUDE.md`](CLAUDE.md) for the project context every agent reads at session start.

---

## Design system rules (non-negotiable)

These are enforced by the QA verifier. PRs that violate them are blocked at review.

- **No raw colors.** Use tokens from [`packages/design-system/src/tokens.ts`](packages/design-system/src/tokens.ts) or the Tailwind preset utilities.
- **No raw spacing.** The grid is 4px; sizes are `{4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 96, 128}`.
- **No raw motion durations.** Timing scale is `{80, 150, 240, 360, 640}ms` plus the ambient `2000` and `4000`. Three documented exceptions on the live screen — see [`vault/80 · Sessions/2026-05-26-wave-3-summary.md`](<vault/80 · Sessions/2026-05-26-wave-3-summary.md>).
- **No second accent color.** Amber `#F5A524` is the only brand accent. Semantic colors (emerald for live, coral for risk, azure for info) are state, not brand. See [ADR-002](<vault/70 · Decisions/ADR-002 · Single accent color.md>).
- **No "AI-powered", "supercharge", "10x", "revolutionize", "game-changer", "unlock", "blazing fast"** in any user-facing copy. Brand voice rules at [`vault/10 · Strategy/Brand Voice.md`](<vault/10 · Strategy/Brand Voice.md>).
- **No emoji in product UI.** Allowed sparingly in marketing prose.
- **No drop shadows in dark mode.** Use surface color shift for depth.
- **No 3D-effect charts, pie charts, exotic data viz.** Numbers in JetBrains Mono, formatted `· 412ms`.
- **No scroll-jacking** outside the one pinned section on `/copilot`.

The `/vought-verify-tokens` and `/vought-motion-audit` slash commands fail-fast on drift.

---

## Code style

Web rules at `~/.claude/rules/web/coding-style.md` apply. TypeScript and Python rules where relevant. Highlights:

- **Files focused, < 800 lines.** Many small files beat few large files.
- **Functions focused, < 50 lines.** Split aggressively.
- **No deep nesting** beyond 4 levels. Use early returns.
- **Immutability.** Always create new objects; never mutate.
- **Error handling everywhere.** No silent swallows. User-friendly messages in UI; structured Pino logs server-side.
- **No hardcoded secrets.** Environment variables only. The `.env.example` files document every required key.

The Echo Engine carries patterns documented in [`vault/30 · Architecture/Echo Engine.md`](<vault/30 · Architecture/Echo Engine.md>) §"Patterns we landed on" — read before touching the orchestrator.

---

## Tests

Coverage target: 80% minimum across unit, integration, and E2E. The hackathon build is below this — closing the gap is in scope for the next milestone.

- **Unit tests** — utilities, prompt assembly, speaker gate, memory window
- **Integration tests** — Echo Engine endpoints, voice-clone API, diart wire format
- **E2E** — Playwright against the marketing site (`apps/web`) and product app (`apps/app`)

End-to-end voice loop latency has a planned dedicated test at `services/echo-engine/test/latency.test.ts` — see Known gaps in [`README.md`](README.md). Capture method is documented at [`vault/30 · Architecture/Latency Budget.md`](<vault/30 · Architecture/Latency Budget.md>) §"How we measure".

---

## PR workflow

1. Open a PR against `main` with a description that links the relevant vault note and (if dispatched) the session log.
2. CI runs `pnpm lint`, `pnpm type-check`, `pnpm build`, and (if touched) `pnpm test`.
3. Three review gates before merge:
   - **qa-verifier** — token drift, motion audit, accessibility (axe, contrast), performance budget. Read-only audit; surfaces a YELLOW/RED if violations exist.
   - **link-integrity-verifier** — crawls every page and validates every link, every CTA, every external href.
   - **performance-seo-engineer** — Lighthouse + SEO check on touched routes.
4. PR description follows the template (see the GitHub PR form). Test plan as a markdown checklist.
5. Squash-merge to `main`. Rebase if conflicts.

The reviewer is the orchestrator for agent-dispatched waves, or a team member for ad-hoc fixes.

---

## Spawning an agent wave

If you are extending the build with a new wave:

1. **Draft the wave prompts** in `prompts/build/wave-<N>-<name>/` — one prompt per agent dispatched in the wave.
2. **Pre-flight** — read the three most recent session logs in `vault/80 · Sessions/` to understand the current project state.
3. **Spawn via the orchestrator** — `/vought-spawn-wave <wave-name>` in Claude Code. The orchestrator reads the wave's dispatch file and fires the agents in parallel.
4. **Collect outputs** — each agent writes a session log to `vault/80 · Sessions/YYYY-MM-DD-<agent>.md` per the template at [`vault/99 · Templates/Session Template.md`](<vault/99 · Templates/Session Template.md>).
5. **Write the wave summary** at `vault/80 · Sessions/YYYY-MM-DD-wave-<N>-summary.md`. Include the wave verdict (GREEN / YELLOW / RED), per-agent state, decisions, open questions, and recommended next steps.
6. **Gate the next wave.** Do not spawn wave N+1 if wave N is not GREEN, except for targeted follow-ups that close the YELLOW gap.

Hard rule: **do not auto-retry failed agents** with the same prompt. Diagnose the failure (typically prompt-shape: too much required reading, scope too wide) and re-dispatch with a slimmer brief.

---

## Vault discipline

The Obsidian vault at `vault/` is the project's reusable memory. Discipline:

- **Strategy decisions** → `vault/10 · Strategy/` — brand voice, three-act narrative, trust architecture
- **Design system specs** → `vault/20 · Design System/` — tokens, motion timing tables
- **Architecture specs** → `vault/30 · Architecture/` — system diagram, latency budget, per-service notes
- **Page specs** → `vault/40 · Pages/` — one note per page; updated as the page evolves
- **Competitor intel** → `vault/50 · Competitors/` — Cresta, Observe.ai, Gong
- **Research** → `vault/60 · Research/`
- **Architecture Decision Records** → `vault/70 · Decisions/` — one ADR per consequential decision
- **Session logs** → `vault/80 · Sessions/` — one log per agent invocation
- **Templates** → `vault/99 · Templates/` — the Session Template

When you make a novel decision, write it as an ADR before moving on. When you introduce a new pattern, write it to the relevant vault section. When you complete a task, log it to a session note. The vault is how the next agent (and the next teammate) avoids re-learning what you already learned.

---

## Code of conduct

Be specific. Be kind. Disagree on the substance, not the person. Credit the prior work — almost everything in this repo stands on someone else's shoulders, and the README's "Built on" section is non-negotiable.

When you push, you accept that the work becomes part of the project. When you review, you bring the same care you bring to your own code.

---

## See also

- [`README.md`](README.md) — project entry point
- [`docs/quick-start.md`](docs/quick-start.md) — extended setup walkthrough
- [`docs/agents.md`](docs/agents.md) — the 16-agent fleet
- [`ARCHITECTURE.md`](ARCHITECTURE.md) — deeper technical doc
- [`CLAUDE.md`](CLAUDE.md) — project context every agent reads
