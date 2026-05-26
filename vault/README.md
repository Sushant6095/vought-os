# Vought Vault · The Reusable Memory

This is an Obsidian-ready knowledge vault. It is the **reusable memory** across all Claude Code agent sessions. Every important decision, every brand standard, every competitor profile, every architectural choice lives here as a single source of truth.

## Open in Obsidian

1. Install Obsidian: https://obsidian.md
2. Open Obsidian → Open vault → select this `vault/` directory
3. The vault opens with graph view, backlinks, search, tags — full Obsidian capability

## Folder structure (PARA-inspired with numerical prefixes)

```
00 · Index/         Maps of Content (MOCs) — start here
10 · Strategy/      Brand, voice, three-act narrative, trust architecture
20 · Design System/ Tokens, motion, components, visual identity
30 · Architecture/  System diagram, latency budget, services
40 · Pages/         Per-page UX specs and implementation notes
50 · Competitors/   Cresta, Observe.ai, Gong, etc — deep dives
60 · Research/      User research, market sizing, technical research
70 · Decisions/     ADRs (Architecture Decision Records)
80 · Sessions/      Agent session logs — date + agent named
99 · Templates/     Note templates for new entries
```

## Conventions

**Wikilinks.** Use `[[Note Title]]` to link between notes. Obsidian renders them as clickable. Agents follow them to traverse context.

**Tags.** Use `#tag` for cross-cutting themes. Recommended core tags:
- `#design-decision` — decisions about the visual or interaction system
- `#tech-debt` — known shortcuts to revisit
- `#open-question` — unresolved decisions
- `#competitor-move` — competitive intel snapshots
- `#brand-voice` — copy and tone references

**Frontmatter.** Every note has YAML frontmatter:
```yaml
---
title: <note title>
type: <decision | reference | spec | research | session>
status: <open | resolved | archived>
last_updated: YYYY-MM-DD
related: [[Other Note]]
---
```

## How agents use this vault

Every agent's first step is: read the relevant vault folder(s). Every agent's last step is: write back what was learned.

When an agent works on a page, it reads `40 · Pages/<page>.md` first.
When an agent makes a non-trivial decision, it writes an ADR to `70 · Decisions/`.
When an agent completes a wave, the orchestrator writes a session log to `80 · Sessions/`.

The vault grows organically. Agents never start from scratch.
