# The Vought Agent Swarm

This folder contains the subagent definitions Claude Code uses to build Vought. Each agent is a focused specialist with a strict tool whitelist and a clear deliverable.

## Roster

| Agent | Specialty | Phase | Spawned by |
|---|---|---|---|
| `orchestrator` | meta-agent that spawns waves, gates phases, writes session logs | * | `/vought-spawn-wave` or direct invocation |
| `design-system-architect` | design tokens, layout primitives, motion library foundation | 1 | wave 1 |
| `echo-engine-engineer` | Node.js Speech Engine server, LLM orchestration, persona system | 1 | wave 1 |
| `diarization-engineer` | Python FastAPI + diart streaming speaker diarization sidecar | 1 | wave 1 |
| `landing-page-builder` | marketing landing page implementation per cinematic storyboard | 2 | wave 2 |
| `live-call-builder` | the hero live conversation screen with state pill, suggestion bloom, word stream | 2 | wave 2 |
| `voice-clone-builder` | 30s voice capture flow + ElevenLabs cloning API + voice_id swap into TTS | 2 | wave 2 |
| `qa-verifier` | accessibility (axe), performance (Lighthouse), token drift, motion audit | 3 | wave 3 |
| `motion-polisher` | final pass on the four signature motions; phase-sync verification | 4 | wave 4 |
| `accessibility-auditor` | WCAG 2.1 AA pass; screen reader test; keyboard nav verification | 4 | wave 4 |

## Dependency graph

```
                    ┌─ design-system-architect ─┐
                    │                            │
       (wave 1)     ├─ echo-engine-engineer ────┤    no deps
                    │                            │
                    └─ diarization-engineer ────┘
                                  │
                                  ▼
                    ┌─ landing-page-builder ────┐
                    │                            │
       (wave 2)     ├─ live-call-builder ───────┤    requires wave 1
                    │                            │
                    └─ voice-clone-builder ─────┘
                                  │
                                  ▼
       (wave 3)         qa-verifier                 requires waves 1+2
                                  │
                                  ▼
                    ┌─ motion-polisher ──────────┐
       (wave 4)     │                            │   requires wave 3 green
                    └─ accessibility-auditor ────┘
```

## Spawning rules

1. Agents within a wave run in parallel. Use one Task call per agent inside a single response.
2. Never spawn an agent whose dependencies are not green.
3. Each agent prompt must be self-contained: pass every file path explicitly. Agents do not share working context.
4. The orchestrator agent is the only one that may spawn other agents.
5. On agent failure: do not auto-retry. Surface the full failure output.

## Reading order before invoking an agent

1. `CLAUDE.md` (top-level project context)
2. `VOUGHT-DESIGN-BLUEPRINT.md` (the constitution)
3. The agent's own definition file (this folder)
4. The vault notes the agent's definition lists as required reading

## Session logging

Every agent invocation should produce a session log entry in `vault/80 · Sessions/YYYY-MM-DD-<agent>.md` capturing:
- What was attempted
- What was produced (file paths)
- Decisions made (link to ADRs if novel)
- Open questions for the orchestrator
- Next-step recommendations
