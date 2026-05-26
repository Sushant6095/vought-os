---
title: Vought Prompt Template
audience: prompt authors
intent: A starting template for any new prompt added to the library
---

# Prompt Template

```yaml
---
title: <human-readable title>
audience: <who or what consumes this prompt>
intent: <one-sentence purpose>
inputs: <comma-separated variables this prompt expects, prefixed with $>
outputs: <expected shape of the response>
version: 1
last_reviewed: YYYY-MM-DD
---
```

## Body

State the persona / role explicitly. ("You are a senior X.")

Define the procedure as numbered steps if multi-step.

Define hard rules — what to never do.

Define output format — exact shape.

End with: variables this prompt expects, with example values.

## Evaluation criteria

Every prompt in this library is evaluated quarterly against:
1. Does it produce consistent, on-spec output across 10 invocations?
2. Does it require less than 200 tokens of additional context to be useful?
3. Does it fail gracefully when inputs are missing?
4. Is the brand voice consistent with vault/10 · Strategy/Brand Voice.md?

If a prompt fails any of these, it is rewritten or retired.
