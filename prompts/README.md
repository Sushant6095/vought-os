# Vought Prompt Library

Curated prompts used by the Vought agent swarm and by humans operating the product.

## Structure

```
prompts/
├── system/           ← system prompts for agent personas (orchestrator, design critic, code reviewer)
├── personas/         ← LLM personas inside the Vought product (First Date, Sales Discovery, etc)
├── research/         ← high-leverage research prompts (NotebookLM, competitor deep-dive)
├── workflows/        ← multi-step orchestration prompts
└── meta/             ← prompt engineering templates and evaluation criteria
```

## Conventions

- Every prompt is a markdown file with frontmatter:
  ```yaml
  ---
  title: <human title>
  audience: <who/what consumes this>
  intent: <one sentence>
  inputs: <expected variables>
  outputs: <expected shape>
  ---
  ```
- Personas are referenced by ID matching `services/echo-engine/src/personas/index.ts`.
- Workflow prompts are step-by-step, numbered, with explicit branch conditions.

## Hard rules

- Never put secrets in prompts (API keys, customer names without consent).
- Personas must never instruct the LLM to lie, manipulate, or harm.
- Research prompts must require citation from the source.
