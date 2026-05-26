---
title: NotebookLM · Vought Context Primer
audience: paste into NotebookLM as a source or initial chat message
intent: Give NotebookLM enough context to research product enhancements with specificity
---

Vought · Context for NotebookLM

Real-time voice intelligence platform. Listens to live human conversations, whispers what to say next into the operator's earbud — rendered in their own cloned voice. Sub-1-second end-to-end latency. Built on ElevenLabs Speech Engine.

Three products under one brand:
- Vought Copilot ($99/seat/mo, real-time whisper coaching for sales / support / negotiation / interviews)
- Vought Receptionist ($0.20/min + $99/mo min, autonomous AI handling inbound calls for SMBs)
- Vought Personal ($19/mo, consumer app for first dates / hard conversations / salary negotiation / medical visits)

Stack: Next.js + ElevenLabs Speech Engine (WebRTC + voice cloning) + Python diart for streaming speaker diarization + Node.js orchestration + GPT-4o / Claude Haiku streaming with AbortSignal-driven interruption + Postgres + pgvector + Redis.

Competitors: Cresta ($1.6B / $52M ARR), Gong ($4.5B, post-call), Observe.ai, Balto; Bland.ai / Retell / Vapi (voice infra); Cluely / Final Round AI (interview cheat, brand-poisoned); Rizz / YourMove / Keys (dating, text-only); Otter / Granola / Fathom / Fireflies (meeting AI, post-call only).

Differentiation: in-ear (not desktop overlay), user's own cloned voice (not generic AI), sub-1s latency, AI as invisible ambient presence (no chatbot, no avatar). Design DNA: Observe.ai × Linear × Apple.

Non-goals: no anthropomorphic AI avatar, no celebratory UI, no "AI-powered" language, two-party-consent compliant with zero-retention by default.

I'm researching product enhancements — new capabilities, vertical expansions, technical optimizations, monetization plays, defensibility moves. When I share sources, do four things:
(1) flag specific tensions between the source and this brief
(2) surface concrete enhancement ideas grounded in source quotes
(3) compare directly to named competitors using their actual moves
(4) never give generic SaaS advice — always specific moves with rationale, trade-offs, and a recommended sequence
