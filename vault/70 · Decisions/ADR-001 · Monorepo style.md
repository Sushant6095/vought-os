---
title: ADR-001 · Monorepo style
type: decision
status: accepted
date: 2026-05-26
---

# ADR-001 · Monorepo Style — Turborepo with apps + packages + services

## Status

Accepted. 2026-05-26.

## Context

We have three Next.js surfaces (marketing, app, teams), two backend services (Node + Python), shared packages (design system, motion, UI), and a database schema. We need a structure that:
- Lets agents work in parallel on isolated surfaces
- Shares the design system and motion library across all Next.js apps
- Doesn't impose a build system on the Python service
- Deploys each surface independently

## Options considered

1. **Single Next.js app with route groups** — `app/(marketing)/` and `app/(app)/` in one project.
   - Pro: Simplest. One deploy. Faster local dev.
   - Con: Marketing perf affected by app bundle. Hard to split deploy targets.

2. **Turborepo with apps + packages + services** — chosen.
   - Pro: Clean isolation. Independent deploy per app. Shared packages via workspace protocol.
   - Con: More setup. Initial scaffolding takes longer.

3. **Nx monorepo** — alternative to Turbo.
   - Pro: More features. Better caching.
   - Con: Steeper learning curve. Less idiomatic for Next.js.

4. **Separate repos** — `vought-web`, `vought-app`, `vought-echo`, `vought-diart`.
   - Pro: Maximum isolation.
   - Con: Cross-repo design system updates require coordinated PRs. Friction.

## Decision

**Option 2: Turborepo with apps + packages + services.**

Structure:
```
apps/web         (marketing site)
apps/app         (product app — has /live)
apps/teams       (manager dashboard)
packages/design-system
packages/motion
packages/ui
packages/types
services/echo-engine
services/diarization-sidecar
```

The Python service lives in `services/` outside the JavaScript workspace; it has its own venv and Dockerfile.

## Consequences

- ✓ Agents can work on `apps/web` without touching `apps/app`.
- ✓ Design system changes propagate to all apps via workspace protocol.
- ✓ Each app deploys independently to Vercel.
- ✗ Initial scaffold takes 1-2 hours longer than Option 1.
- ✗ Turbo caching needs CI setup for full benefit.

## Reversibility

Easy. Can collapse to Option 1 in a few hours if Turborepo becomes friction.
