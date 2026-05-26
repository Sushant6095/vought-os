---
title: 2026-05-26 · wave-6-design-upgrade-summary
type: session
agent: orchestrator
wave: 6
verdict: red
---

# 2026-05-26 · wave-6-design-upgrade-summary

**Wave 6 did not start.** Task 1 (landing upgrade) was dispatched per the user's sequencing rule (Task 1 alone, then Task 2 after Task 1 green). Task 1's agent returned after only 18 tool calls — every tool call was a Read; zero Edits, zero Writes, no session log. The agent's last visible message was *"Layout already has nav + footer + orbs. Now let me check nav and supporting components"* — an investigatory continuation that never resumed.

Task 2 was **not dispatched** because Task 1 did not return green, per the explicit user instruction: *"Task 1 MUST land first because Task 2 reads the upgraded landing as its quality benchmark."*

Verdict: **RED** — wave halted. No code changes. Landing page state is unchanged from Wave 5.

## Attempted

Dispatch wave 6 per `prompts/build/wave-6-design-upgrade/00-DISPATCH-DESIGN-UPGRADE.md`. The dispatch file as written specifies parallel dispatch of both tasks, but the user's most recent instruction overrode that with strict sequencing:

> Task 1 MUST land first because Task 2 reads the upgraded landing as its quality benchmark. Spawn Task 1 alone. When it returns green, then spawn Task 2.

Followed the user's instruction. Task 1 was dispatched in isolation with the full contents of `prompts/build/wave-6-design-upgrade/01-landing-upgrade.prompt.md` plus orchestrator context about the wave-5 `breath.ts` `'use client'` fix.

## What actually happened

| Check | Result |
|---|---|
| Task 1 agent ID | `abc43d46a3c353df2` |
| Tool uses | 18 |
| Duration | 91s |
| Files modified | **0** — no Writes, no Edits |
| Session log `2026-05-26-landing-upgrade.md` | **MISSING** |
| `apps/web/app/page.tsx` | unchanged (still 54 lines) |
| `apps/web/app/globals.css` | unchanged (249 lines) |
| `apps/web/app/layout.tsx` | unchanged (98 lines) |
| `apps/web/components/marketing/*.tsx` | unchanged (mtime > 30 min) |
| `localhost:3000/` smoke | still serves the pre-upgrade landing |

The agent's final transcript-visible message was:

> Layout already has nav + footer + orbs. Now let me check nav and supporting components.

This is identical to the failure shape seen on `/platform` and `/pricing` in wave 5 (`Now let me look at the Icon component…` / `Let me check the Container component and FAQ patterns…`). Pattern: large-scope tasks with extensive required reading get truncated during investigation, before any write tools fire.

## Task 2 status

**Not dispatched.** The user's sequencing rule is explicit. Auto-dispatching Task 2 without an upgraded landing would mean Task 2 reads the same under-delivered landing it's supposed to use as the quality benchmark — defeating the purpose.

## Decisions

1. **No auto-retry on Task 1.** Per the orchestrator hard rule: *"If any agent fails, do not auto-retry. Surface the failure to the user with the agent's full output."*
2. **No Task 2 dispatch.** Per the user's wave-6 sequencing rule, Task 2 is contingent on Task 1 green.
3. **Wave summary written even though no work landed** — the user expects status visibility, and a RED verdict is a real status worth recording.

## Root cause hypothesis

Three agents have now bailed mid-investigation under similar conditions (`/platform`, `/pricing`, landing-upgrade). The common pattern:

- Heavy required-reading list (the wave-6 landing-upgrade prompt asks the agent to read the full `mockups/vought-landing-cinematic.html` end-to-end, plus 11 marketing components, plus `globals.css`, plus the design-system tokens — easily 3000+ lines before any work begins).
- A long, detailed deliverable spec (the prompt enumerates ~80 non-negotiable signature elements).
- The agent burns its working budget on reading and never reaches the writing phase.

This is a prompt-shape issue, not a code-quality issue. The same agent type successfully shipped `/copilot`, `/customers`, `/about`, etc. when the prompt fit comfortably in budget.

## Recommended next steps

The user has three viable paths:

**Path A — Re-dispatch with a slimmer prompt (recommended).** Trim the required reading to: (1) the HTML mockup, (2) `apps/web/app/page.tsx`, (3) the existing `components/marketing/Hero.tsx` only. Make the agent infer the rest from the running dev server (`localhost:3000` is already serving the current state). Drop the "read every marketing component" demand — let the agent decide what to upgrade in place. This is the lowest-risk fix.

**Path B — Split Task 1 into two smaller sub-tasks.** First sub-task: hero + nav + ambient layer only. Second sub-task: everything below the fold (pillars, demo, architecture, customer story, trust, pricing, CTA, footer). Two smaller scopes both fit within budget, and the second reads what the first did to the hero as its quality bar.

**Path C — Do it manually with targeted Edit calls.** The orchestrator (this loop) can apply the upgrades file-by-file with focused edits, since the visual gap items in the prompt are concrete enough to execute directly. Risk: pollutes the orchestrator context with implementation work.

After Task 1 lands green via any of these paths, dispatch Task 2 (nine-page propagation) as originally planned.

## Acceptance criteria · wave-level

- [ ] Task 1 (landing upgrade) returns green — **FAIL.** Agent returned mid-investigation with 0 writes.
- [ ] Task 2 (nine-page propagation) dispatched — **NOT ATTEMPTED** per user sequencing rule.
- [x] User sequencing rule honored (Task 2 not dispatched without Task 1 green).
- [x] No auto-retry attempted.
- [x] Wave summary present at the canonical path.

## Notes on /platform and /pricing (still outstanding from wave 5)

Tangential to this wave's failure, but worth flagging: the wave-5 follow-up to re-dispatch `/platform` and `/pricing` was never run. Those routes still 404. If the user proceeds with Path B (split Task 1 into two), the same dispatch session is a natural moment to also re-dispatch the wave-5 stragglers — they all need the same kind of slimmer prompt treatment.

Do **not** retry from this summary — return to the user with the RED verdict and let them choose a path.
