# Cyrano — Architecture, System Design, and Feature Specification

An AI assistant that lives in your AirPods and whispers what to say during live human conversations. Speaks in your own cloned voice so you don't sound like you're parroting a robot. Built on ElevenLabs Speech Engine for sub-second voice loop.

This document is the build-time reference. Read top to bottom once, then keep it open while you code.

---

## 1. Product Surface

A user opens the Cyrano app, picks a persona (Sales Call, First Date, Job Interview, Hard Conversation, Negotiation), grants mic + AirPods permission, and starts a conversation. Cyrano listens to both sides of the conversation through the user's mic, identifies who is speaking, and at the end of the *other* person's turn streams a one-line suggestion back into the user's AirPods in the user's own cloned voice. The user can squeeze the AirPod stem to summon a suggestion on demand, or let Cyrano fire proactively. Nothing is recorded by default. After the conversation, the user can optionally review a transcript with Cyrano's commentary.

---

## 2. High-Level Architecture

```
                       +----------------------------------+
                       |        AirPods / Headset         |
                       +-----------------+----------------+
                                         |
                                         | audio in/out
                                         v
+--------------------------+    +--------+--------+    +-----------------------+
|  Client (iOS / Web app)  |<-->|  ElevenLabs     |<-->|  Speech Engine Server |
|  - Mic capture           |    |  Speech Engine  |    |  (your Node/Python)   |
|  - Overlay UI            |    |  - STT + TTS    |    |  - onTranscript hook  |
|  - Persona picker        |    |  - WebRTC       |    |  - sendResponse       |
|  - AirPods routing       |    |  - Voice clone  |    +-----------+-----------+
+------------+-------------+    +-----------------+                |
             |                                                     |
             | parallel raw PCM (WSS)                              |
             v                                                     |
+------------+-------------+                          +------------v-------------+
|  Diarization Sidecar     |  speaker labels (WS)     |  Orchestration Service   |
|  (Python + diart)        +-------------------------->  - Turn detector         |
|  - Enroll "me" voice     |                          |  - Persona / playbook    |
|  - Stream speaker ids    |                          |  - LLM client (stream)   |
+--------------------------+                          |  - Memory window         |
                                                      +-----+--------+-----------+
                                                            |        |
                                                  +---------v--+  +--v-----------+
                                                  |  LLM       |  |  Vector DB   |
                                                  |  OpenAI /  |  |  (playbook   |
                                                  |  Anthropic |  |   RAG)       |
                                                  +------------+  +--------------+

                +--------------+   +--------------+   +---------------------+
                |  Postgres    |   |  Redis       |   |  Object store (S3)  |
                |  users,      |   |  live session|   |  saved transcripts, |
                |  voices,     |   |  state +     |   |  voice samples      |
                |  personas    |   |  mem cache   |   |                     |
                +--------------+   +--------------+   +---------------------+
```

The trick of the architecture is that the mic stream is forked. ElevenLabs gets one copy for transcription and TTS playback. The diarization sidecar gets a parallel copy of the same PCM for speaker labeling. Both streams converge in the orchestration service, which only fires the LLM when the *other* speaker has just finished a turn.

---

## 3. Components

### 3.1 Client (iOS native or React web)
Owns the user-facing surface, the mic, and the AirPods.

Responsibilities:
- `getUserMedia` (web) or `AVAudioSession` (iOS) for mic capture at 16 kHz mono PCM
- WebRTC connection to ElevenLabs via `@elevenlabs/react` `useConversation`
- Parallel WebSocket to the diarization sidecar streaming the same PCM (16 kHz, 20ms frames)
- Live overlay UI showing latest suggestion (Cluely-style translucent card)
- Persona switcher, settings, session controls
- Audio routing: TTS plays only through AirPods, never speaker
- AirPods stem-squeeze handler to summon a suggestion manually

Tech: Next.js 15 + `@elevenlabs/react` for the hackathon. Migrate to Swift + `elevenlabs-swift-sdk` for V2.

### 3.2 ElevenLabs Speech Engine
ElevenLabs-managed. You don't run this; you connect to it.

Provides:
- Browser-side WebRTC ingestion at sub-100ms
- Streaming STT — transcripts arrive at your server with full conversation history each turn
- Streaming TTS — your text chunks come back as audio, ~135ms TTFB on Flash voices
- Voice cloning for the user's own whisper voice
- Connection lifecycle, turn detection, and interruption handling out of the box

### 3.3 Speech Engine Server (Node.js)
One WebSocket per conversation. ElevenLabs calls into this server via `onTranscript` whenever the user (or the person they're talking to) finishes speaking.

Responsibilities:
- Verify ElevenLabs request signature
- Forward transcripts + the current `signal` to the Orchestration Service
- Stream Orchestration's text response back via `session.sendResponse(stream)`
- Pass through the `AbortSignal` so interruptions cancel mid-stream LLM calls

This is the thinnest layer. It is intentionally stateless. All state lives in the Orchestration Service.

### 3.4 Diarization Sidecar (Python + diart)
The hardest technical piece. Single mic, two voices, need to know who's who in real time.

Responsibilities:
- Accept raw PCM over WebSocket from the client
- 5-second enrollment phase on session start: user says "test test test, this is my voice" — capture and label this cluster as `speaker_self`
- Use diart's rolling 500ms buffer to emit `{timestamp, speaker_id, is_self}` events
- Push speaker label events to Orchestration Service over its own WebSocket

Why a sidecar and not inline: diart needs GPU or a beefy CPU. Keeping it separate lets you scale it independently and swap it later (e.g., for NVIDIA Sortformer when streaming support matures).

### 3.5 Orchestration Service
The brain. Combines transcript + speaker labels, decides when to fire the LLM, manages persona and memory.

Responsibilities:
- Subscribe to two streams per session: ElevenLabs transcripts (via Speech Engine Server) and speaker labels (via Diarization Sidecar)
- Turn detector: when `speaker != self` finishes an utterance (silence > 600ms confirmed by VAD + diart), trigger LLM
- Load persona system prompt + relevant playbook chunks from vector DB
- Build the prompt: persona + recent N turns + playbook RAG hits + last utterance
- Stream the LLM response
- Forward tokens to Speech Engine Server for TTS
- Maintain rolling conversation memory: last 20 turns verbatim + summarized older context
- Honor interruption: if `signal.aborted` fires, cancel the LLM stream cleanly

Tech: Node.js + `ai` SDK for streaming, or Python + FastAPI + OpenAI/Anthropic streaming clients. Node is faster to wire up against the ElevenLabs JS SDK.

### 3.6 Voice Clone Service
Wraps ElevenLabs' voice cloning API.

Responsibilities:
- One-time onboarding: capture 30s of the user's voice via the client, run through ElevenLabs' consented voice cloning flow
- Store `voice_id` against `user_id` in Postgres
- Inject the `voice_id` into the Speech Engine resource so TTS renders in the user's own voice
- Allow voice re-record from settings

### 3.7 Persona / Playbook Service
Where personalities and domain knowledge live.

Responsibilities:
- Built-in personas: First Date, Job Interview, Sales Discovery, Sales Objection Handling, Hard Conversation, Salary Negotiation, Medical Appointment, Parent-Teacher Conference
- Each persona is a versioned system prompt + tone profile (terse vs. warm, formal vs. casual)
- Custom playbooks (V2): user uploads PDFs (sales objection handling, interview prep notes, dating advice). Chunked + embedded into vector DB (Pinecone or pgvector).
- At query time, top-k retrieval against the current utterance to inject relevant chunks into the LLM context

### 3.8 Session Store
- **Postgres**: users, voice_ids, personas, playbooks, saved transcripts (opt-in)
- **Redis**: live session state (conversation memory, speaker enrollment), short-lived (cleared on session end)
- **Pinecone / pgvector**: playbook chunk embeddings for RAG
- **S3**: optional voice samples for re-cloning, optional saved transcripts

### 3.9 Auth and Billing
- Clerk or Auth0 for auth (faster than rolling your own)
- Stripe for subscriptions ($29/mo prosumer, $99/mo pro, $499/seat enterprise)
- Usage metering: count minutes of active session per user, gate on plan limits

---

## 4. End-to-End Sequence (single conversation turn)

```
USER (speaks first)
  -> mic captures PCM
     -> ElevenLabs WebRTC: STT, identifies end of turn, sends transcript to Speech Engine Server
     -> Diart sidecar: labels speaker as "self"
  Orchestration sees self utterance, updates memory, does NOT fire LLM

OTHER PERSON (speaks)
  -> mic captures PCM
     -> ElevenLabs WebRTC: STT, sends transcript to Speech Engine Server
     -> Diart sidecar: labels speaker as "other"
  Orchestration:
    - on transcript event with speaker=other and end-of-turn confirmed:
        - build prompt = persona + memory + playbook RAG + latest utterance
        - stream LLM with AbortSignal from Speech Engine
        - forward tokens to Speech Engine Server.sendResponse(stream)

ELEVENLABS TTS
  -> streams audio to client at ~135ms TTFB
  -> client routes audio to AirPods only

IF USER STARTS SPEAKING MID-WHISPER
  -> ElevenLabs detects user speech, fires AbortSignal
  -> LLM stream cancels
  -> Client cancels audio playback
  -> Orchestration discards in-flight response
```

---

## 5. Latency Budget

Target: under 1 second from "other person stops talking" to "Cyrano starts whispering in user's ear."

| Stage | Budget |
|---|---|
| End-of-turn detection (diart + VAD) | 200-400ms |
| ElevenLabs STT transcript delivery | 100-200ms |
| Network hop to Orchestration | 20-50ms |
| RAG lookup + prompt assembly | 30-80ms |
| LLM time-to-first-token (gpt-4o or Claude Haiku) | 200-400ms |
| ElevenLabs Flash TTS TTFB | 135ms |
| Audio delivery to AirPods | 50-100ms |
| **Total** | **735-1365ms** |

Knobs to pull if you blow the budget:
- Switch LLM from gpt-4o to Claude Haiku or Gemini Flash (lower TTFT)
- Prefetch likely responses based on partial transcript (speculative inference)
- Reduce diart buffer at the cost of accuracy
- Co-locate Orchestration in same region as ElevenLabs API edge

---

## 6. API and Message Contracts

### 6.1 Client to ElevenLabs (WebRTC)
Managed by `@elevenlabs/react`. No custom protocol.

### 6.2 ElevenLabs to Speech Engine Server (WebSocket)
Handled by the SDK. Your code receives:

```ts
onTranscript(
  transcript: TranscriptMessage[],   // full conversation history
  signal: AbortSignal,                // fires on user interruption
  session: SpeechEngineSession
)

interface TranscriptMessage {
  role: "user" | "agent";
  content: string;
}
```

### 6.3 Client to Diarization Sidecar (WebSocket)
Custom protocol.

Client -> Sidecar:
```json
{ "type": "enroll_start", "session_id": "..." }
{ "type": "audio", "session_id": "...", "pcm": "<base64 16kHz mono>" }
{ "type": "enroll_complete", "session_id": "..." }
{ "type": "end", "session_id": "..." }
```

Sidecar -> Orchestration (push):
```json
{
  "type": "speaker_label",
  "session_id": "...",
  "t_start": 12.345,
  "t_end": 13.890,
  "speaker_id": "spk_0",
  "is_self": true,
  "confidence": 0.94
}
```

### 6.4 Speech Engine Server to Orchestration (HTTP + SSE)

Speech Engine Server -> Orchestration:
```
POST /api/turn
{
  "session_id": "...",
  "transcript": [...],          // full history from ElevenLabs
  "persona": "first_date"
}

Response: text/event-stream
data: { "type": "token", "text": "Have " }
data: { "type": "token", "text": "you " }
data: { "type": "token", "text": "tried " }
data: { "type": "done" }
```

The Speech Engine Server pipes the SSE stream directly into `session.sendResponse(asyncIterable)`.

### 6.5 REST API (out of band)

```
POST   /api/sessions                    create session, returns session_id, token
GET    /api/sessions/:id                fetch session metadata
POST   /api/sessions/:id/end            end session

POST   /api/voices                      upload sample, returns voice_id (calls ElevenLabs)
GET    /api/voices/me                   current user's voice_id

GET    /api/personas                    list built-in personas
POST   /api/personas                    create custom persona
GET    /api/personas/:id                fetch persona detail

POST   /api/playbooks                   upload playbook PDF, chunks + embeds async
GET    /api/playbooks                   list user's playbooks

GET    /api/transcripts                 list saved transcripts (opt-in only)
GET    /api/transcripts/:id             fetch with Cyrano commentary
```

---

## 7. Database Schema (Postgres, sketched)

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  voice_id TEXT,                 -- ElevenLabs voice_id
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE personas (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),    -- NULL for built-in
  name TEXT NOT NULL,
  system_prompt TEXT NOT NULL,
  tone JSONB,                           -- {warmth: 0.4, length: 0.2, formality: 0.7}
  built_in BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE playbooks (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name TEXT,
  source_pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE playbook_chunks (
  id UUID PRIMARY KEY,
  playbook_id UUID REFERENCES playbooks(id),
  content TEXT,
  embedding VECTOR(1536),              -- pgvector
  metadata JSONB
);

CREATE TABLE sessions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  persona_id UUID REFERENCES personas(id),
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  retained BOOLEAN DEFAULT FALSE,      -- if false, no transcript stored
  duration_seconds INTEGER
);

CREATE TABLE transcripts (
  id UUID PRIMARY KEY,
  session_id UUID REFERENCES sessions(id),
  turns JSONB,                          -- [{role, speaker, content, timestamp}]
  commentary JSONB                      -- Cyrano's post-hoc notes per turn
);
```

---

## 8. Feature Ladder

### 8.1 MVP — what ships for the hackathon (6 days)
1. Real-time mic capture in a Next.js client
2. ElevenLabs Speech Engine round-trip working with a streaming LLM
3. Diart sidecar for streaming speaker diarization with 5-second self-enrollment
4. Turn detector that fires LLM only when "other" speaker finishes
5. Voice cloning of the user's own voice, used for TTS whisper
6. Audio routes only to AirPods (mono left ear, or full stereo when AirPods detected)
7. Three personas at launch: First Date, Sales Discovery, Job Interview
8. Cluely-style translucent overlay showing the latest suggestion
9. Push-to-summon mode (button on screen, AirPods squeeze in V2)
10. Audio-duck: if the other person resumes speaking, Cyrano shuts up immediately
11. Disclosure banner ("Live coaching, no audio recorded")
12. Session start / stop with ephemeral memory cleared on stop

### 8.2 V1 — first real release (weeks 2-4 after hackathon)
13. Native iOS app with AirPods stem-squeeze shortcut
14. Eight personas (add Hard Conversation, Negotiation, Medical Visit, Parent-Teacher, Salary Negotiation)
15. Post-conversation review mode (Granola-style transcript with Cyrano's commentary)
16. Opt-in transcript retention
17. Tone sliders: warmth, sharpness, length
18. Wake-word activation ("Hey Cyrano") via Picovoice Porcupine
19. Settings: language, response speed, voice persona selection
20. Multi-language support (start with English + Spanish, ElevenLabs handles voice)
21. Apple Watch glance widget showing latest suggestion

### 8.3 V2 — enterprise wedge (months 2-4)
22. Custom playbook upload (PDF / DOCX / Notion export), chunked into vector DB
23. RAG injection of playbook chunks into prompt at runtime
24. CRM integrations: Salesforce, HubSpot for sales personas — pull lead context before the call
25. Team accounts: shared playbooks, team personas, role-based access
26. Manager dashboard: rep performance, calls coached, suggestion acceptance rate
27. Conversation analytics: talk ratio, sentiment, objection patterns
28. SCIM / SSO for enterprise auth
29. SOC 2 Type II
30. Audit log of every suggestion served per session

### 8.4 V3 — moat features
31. Confidence scoring on suggestions (Cyrano stays silent when uncertain)
32. Voice intonation analysis on the user — flag rising pitch (nervousness) into the suggestion
33. "Practice mode" — Cyrano roleplays as the other person so user can rehearse
34. Bring-your-own LLM (fine-tuned models, on-prem inference)
35. Real-time fact lookup (other person mentions a company, Cyrano injects two key facts mid-response)
36. Multi-party calls: handle 3+ speakers with diart speaker clustering
37. Smart glasses HUD (Meta Ray-Ban Display, Apple Vision Pro)
38. Sales: post-call CRM auto-update from the transcript

### 8.5 Premium / Regulated
39. HIPAA compliance for medical / therapy verticals
40. End-to-end encryption with user-held keys
41. Regional data residency (EU, India)
42. Custom voice persona (manager clones their voice as the whisper for new reps)
43. SLA-backed sub-700ms latency tier
44. White-label deployment for enterprise

---

## 9. Tech Stack Decisions

| Layer | Choice | Why |
|---|---|---|
| Client (hackathon) | Next.js 15 + @elevenlabs/react | Fastest path, official SDK |
| Client (V1) | Swift + elevenlabs-swift-sdk | AirPods + AVAudioSession control |
| Speech Engine Server | Node.js + @elevenlabs/elevenlabs-js | Same language as client, tight SDK fit |
| Orchestration | Node.js + Vercel AI SDK | Streaming LLM ergonomics |
| Diarization Sidecar | Python + diart | Only streaming OSS diarization that works |
| LLM | OpenAI gpt-4o for quality, Claude Haiku for speed | A/B at runtime |
| Vector DB | pgvector inside Postgres | One less service for hackathon |
| Cache / live state | Redis | Standard |
| Auth | Clerk | Fastest |
| Billing | Stripe | Industry default |
| Hosting | Railway (server) + Vercel (client) | Cheap, fast deploy |
| Observability | Axiom + Sentry | Logs + errors |

---

## 10. Security and Privacy

The product's credibility hinges on this. Three layers of protection.

**Audio never persists by default.** Mic PCM is streamed and discarded. Transcripts are held in Redis for the session lifetime and TTL'd to zero on session end. Saved sessions require explicit opt-in via the settings screen and a per-session toggle.

**No third-party voice cloning without consent.** Cyrano only clones the user's own voice, via ElevenLabs' consented flow (verified statement from the voice owner). The product never attempts to clone the other party.

**Two-party consent posture.** In recording-restricted states (CA, FL, IL, PA, WA and others), Cyrano operates in "no recording" mode by default. The UI shows a disclosure banner at session start: "Live coaching active. No audio recorded." When transcript retention is enabled, an additional consent flow fires.

**Transport.** All client connections over TLS 1.3. WebRTC encrypted via DTLS-SRTP. Internal service mesh over mTLS.

**Auth.** Short-lived JWTs for client sessions (15 min, refresh via Clerk). Each session token is scoped to one Speech Engine session and one diarization session.

**Voice clone protection.** ElevenLabs voice_ids stored encrypted at rest. Re-clone requires re-authentication + ElevenLabs' consent capture.

---

## 11. Scaling Plan

The orchestration service is stateless and scales horizontally behind a load balancer. Session state lives in Redis with sticky routing via consistent hashing on `session_id`.

Diarization sidecars are the bottleneck. Each session pins one diart worker. Options:
- Run diart on GPU instances (Modal, RunPod) with autoscaling
- Quantize the embedding model to run on CPU with degraded quality
- Migrate to a lighter model (Sortformer-streaming when available, or proprietary)

ElevenLabs handles its own scale; you only pay per minute.

LLM costs are the second budget concern. A typical Cyrano session is 10 minutes with ~15-30 turns at ~500 input tokens, ~50 output tokens per turn — roughly $0.05-0.10 per session on gpt-4o. Claude Haiku brings this to ~$0.01. Plan pricing should leave 4-6x margin.

---

## 12. Risk Register

| Risk | Likelihood | Severity | Mitigation |
|---|---|---|---|
| Apple ships "Sales Coach" mode on AirPods | Medium (24-36mo) | Existential | Move fast, win enterprise GTM before consumer category dies |
| Cresta / Gong bundle ElevenLabs in-ear | High (12-18mo) | High | Lead with the consumer viral demo to define the brand, then sell enterprise |
| Cluely-style backlash poisons "AI coaching" category | Medium | Medium | Position as "live coaching, no recording, no cheating" — never use the word "cheat" in marketing |
| Two-party consent class action | Low | High | Default no-recording mode, explicit disclosures, employer-disclosure pattern for enterprise |
| Diart maintenance dies | Medium | Medium | Architecture isolates diarization in a sidecar; swap for NeMo or proprietary when needed |
| Voice clone abuse | Low | High | Lock voice_id to user_id, no cross-user voice access, ElevenLabs consent flow |
| ElevenLabs raises prices or changes terms | Medium | Medium | Abstract STT/TTS behind an interface; could swap to Deepgram + Cartesia if needed |

---

## 13. 6-Day Hackathon Build Plan

**Day 1 (Saturday) — get the loop closed**
- Fork `elevenlabs/elevenlabs-examples` Next.js conversational-ai example
- Create ElevenLabs API key, ngrok tunnel, Speech Engine resource with `wsUrl: wss://<ngrok>/ws`
- Wire up Speech Engine server with a hardcoded LLM that echoes "I hear you saying X"
- Confirm full audio loop: speak into mic, hear echo in AirPods

**Day 2 (Sunday) — speaker diarization**
- Stand up Python sidecar with `diart` + WebSocket server
- Browser sends PCM in parallel to the sidecar
- Implement 5-second enrollment screen
- Sidecar emits speaker labels to Orchestration over WebSocket
- Confirm: when you speak, no LLM fires; when a friend speaks, LLM fires

**Day 3 (Monday) — real LLM + persona system**
- Replace echo LLM with gpt-4o streaming via Vercel AI SDK
- Pass `AbortSignal` through so interruptions cancel the stream
- Implement three personas as system prompts: First Date, Sales Discovery, Job Interview
- Memory window: last 20 turns in Redis

**Day 4 (Tuesday) — voice cloning**
- Build the 30-second voice capture screen
- Run user's audio through ElevenLabs voice cloning API
- Store `voice_id`, inject into the Speech Engine resource
- Test: Cyrano speaks in your own voice in your AirPods

**Day 5 (Wednesday) — UI polish**
- Cluely-style translucent overlay on the live screen
- Persona picker (horizontal card deck)
- Settings screen with privacy toggle
- Disclosure banner
- Audio-duck behavior on detected interruption
- Landing page at `/` with a sub-30-second hero loop

**Day 6 (Thursday) — film the video**
- Storyboard before filming
- Shot 1: real first date in a coffee shop, AirPods visible, phone face-down
- Shot 2: real sales call, the user closes a deal with their own cloned voice
- Shot 3: tight UI cuts of the overlay
- Edit under 90 seconds. Post to X tagging @elevenlabsio with #ElevenHacks
- Submit by 17:00 Thursday

---

## 14. Demo Video — What Has To Be In It

The video is the submission. The judges watch it before they touch the demo. Six elements in order:

1. Cold open: user on a real first date, looks awkward, glances at phone, smooth line comes out of their mouth, date laughs
2. Reveal: cut to phone showing the Cyrano overlay with the line being whispered
3. Cut to AirPods squeeze, "what do I say next?"
4. Cut to sales call: rep walking, phone in pocket, hears their own voice coaching them through an objection
5. Hero shot: "It's not a robot. It's you, faster."
6. Tag line + ElevenLabs + URL

Spend at least one full day on this. The hackathon judges said exactly that.

---

## 15. Open Source Building Blocks to Clone

| Repo | License | Use |
|---|---|---|
| `elevenlabs/elevenlabs-examples` | MIT | Fork the Next.js client and Speech Engine server example |
| `juanmc2005/diart` | MIT | Real-time streaming diarization sidecar |
| `KoljaB/RealtimeVoiceChat` | MIT | Architecture reference for the orchestration loop |
| `BasedHardware/omi` | MIT | Conversation memory + sliding-window summarization |
| `pickle-com/glass` | GPL-3.0 | UX reference only — do not paste code |
| `snakers4/silero-vad` | MIT | VAD for turn detection |

---

## 16. The One-Sentence Pitch

Cyrano is an AI assistant that lives in your AirPods and whispers what to say during the conversations that matter — in your own voice, so it's never a robot, just a faster you.
