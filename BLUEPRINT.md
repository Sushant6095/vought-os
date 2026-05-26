# Vought — The Complete Blueprint

*A guide so simple a curious 12-year-old could follow it. Read top to bottom once. Keep it open while you build.*

---

## Table of Contents

1. The Story — why this exists
2. The Two Products in plain English
3. The Shared Engine — one brain, two faces
4. How it actually works (the 30-second version)
5. The Technologies, explained simply
6. The System Architecture
7. End-to-End Data Flow
8. The Latency Budget
9. Vought — User Journey + Features
10. Vought — User Journey + Features
11. The Folder Structure (what file goes where)
12. The 6-Day Build Plan
13. The User Experience (UI walkthrough)
14. The Pitch & Business Case
15. Glossary

---

## 1. The Story — why this exists

Here's a thing that's true about humans. Every important conversation in your life happens *once*. You don't get to rehearse the job interview. You don't get to redo the first date. You don't get to take back what you said to your dying grandfather, or the call where your biggest customer told you they were leaving. These conversations carry enormous weight, and we walk into all of them with the same brain we use to order pizza.

That's the problem. People freeze. They forget the question they wanted to ask. They miss the moment to say the right thing. They walk out of the meeting and immediately think, "I should have said X."

**The solution we're building is an AI that lives in your ear and feeds you the right line at the right moment.** It listens to the conversation, understands what's happening, and whispers a suggestion. In your own voice, so it doesn't sound like a robot — it sounds like you, but faster.

That product is called **Vought**, inspired by the play *Cyrano de Bergerac*, in which a man named Cyrano hides behind a balcony and feeds romantic poetry to a less articulate friend, who repeats it to win the heart of the woman they both love. Same idea. We just turned the man behind the balcony into a language model.

That product is **Vought**. One product, two markets: individuals who buy it on their phone for $19/mo, and revenue teams who buy it for their reps at $99/seat/mo. Same engine underneath, two pricing tiers and two surfaces on top.

---

## 2. The Two Products in plain English

### Vought (the consumer product)
You download Vought on your phone. You record 30 seconds of your voice once, and our system makes a perfect AI copy of how you sound. You pick a "mode" — Date Night, Job Interview, Hard Conversation, Salary Negotiation, Doctor Visit — and put in your AirPods. Then you walk into the conversation. Vought listens. When the other person finishes talking, Vought whispers a suggestion in your ear, in your own voice, so smoothly that you can just repeat it.

Nothing is recorded. Nothing is stored. The whisper is for your ear only.

People pay $19/month.

### Vought (the enterprise product)
A business buys Vought for their sales team or customer support team. Each rep has a small Vought app open during their work calls. The same AI brain listens to the call, but now it's customized — Vought knows the company's sales playbook, the prices, the objection handling scripts. When the customer says "we already use a competitor," Vought whispers the perfect response in the rep's ear. Their manager sees a dashboard showing which reps are growing, what objections are coming up most, and which playbook chapters need rewriting.

Companies pay $99 per rep per month. A 50-person sales team is $60,000 a year.

Both products run on the same underlying engine. The difference is the user interface and the business logic on top.

---

## 3. The Shared Engine — one brain, two faces

Think of it like a kitchen. There's one stove, one oven, one fridge. But sometimes you cook for one person and sometimes you cater a party of 50. Same kitchen, different output.

```
                         ┌────────────────────────┐
                         │      THE ENGINE        │
                         │   (the shared kitchen) │
                         │                        │
                         │  Listens to audio.     │
                         │  Knows who's talking.  │
                         │  Thinks of a response. │
                         │  Says it in your voice.│
                         └───────────┬────────────┘
                                     │
                ┌────────────────────┴────────────────────┐
                │                                         │
        ┌───────▼────────┐                       ┌────────▼────────┐
        │     CYRANO     │                       │       VOX       │
        │  (the consumer │                       │ (the enterprise │
        │     wrapper)   │                       │     wrapper)    │
        │                │                       │                 │
        │  Mobile app    │                       │  Web dashboard  │
        │  AirPods       │                       │  Manager admin  │
        │  Personal      │                       │  Team playbooks │
        │  personas      │                       │  CRM integration│
        └────────────────┘                       └─────────────────┘
```

The engine is the same code. Vought and Vought are two different apps that talk to the engine. This is the secret to shipping both products without doubling the work.

---

## 4. How it actually works (the 30-second version)

Imagine the conversation has just started. Here's what happens, step by step, when the other person says something:

1. **The mic hears it.** The mic on your phone (or your laptop, for Vought) picks up the audio. It's a stream of zeros and ones.
2. **Two services receive the audio at the same time.** One is ElevenLabs (a company that's amazing at understanding speech and generating voices). The other is a small Python program we run, which figures out *who* is talking — you or the other person.
3. **ElevenLabs writes down what was said.** It transcribes the audio into text and sends that text to our server.
4. **Our server checks who said it.** It looks at the speaker label from the Python program. If it was you talking — do nothing. If it was the *other person* talking — wake up the AI.
5. **The AI thinks.** Our server sends the text to a large language model (GPT-4 or Claude), along with your current persona ("you are a first-date assistant, witty and warm, suggest the next thing to say"). The model writes a one-sentence response.
6. **Your voice speaks it.** The response is sent back to ElevenLabs, which converts the text into spoken audio — using your own cloned voice. So when you hear it, it sounds exactly like you.
7. **The whisper plays in your AirPods.** Only your ear hears it. The other person sees you pause for half a second, then say something brilliant.

The whole loop takes less than a second.

---

## 5. The Technologies, explained simply

### ElevenLabs Speech Engine
ElevenLabs is a company that builds the best AI voices in the world. Their "Speech Engine" is a service that does three things for you:
- It listens to a microphone and writes down what was said (speech-to-text).
- It generates spoken audio from text (text-to-speech), using any voice you want including a cloned one.
- It manages the back-and-forth of a conversation — knowing when someone is done talking, handling interruptions.

You don't have to build any of that yourself. You connect to ElevenLabs over a WebSocket (a kind of two-way internet pipe) and they handle the audio.

### Speaker Diarization
"Diarization" is a fancy word for "figuring out who said what." If you record a conversation between two people and play it back, a diarization system labels each piece of audio with which speaker it came from — Speaker 1, Speaker 2. We use this so our AI knows to only respond when the *other* person is talking, not when you are.

We use an open-source library called **diart** for this. It runs in a small Python program we call the "sidecar."

### Large Language Model (LLM)
An LLM is the kind of AI that can read text and write text. ChatGPT is the most famous one. We use GPT-4o (from OpenAI) or Claude (from Anthropic) to generate the actual suggestions. We give the LLM a "system prompt" that says something like: "You are a coach helping someone on a first date. Suggest the next thing they should say to keep the conversation interesting." Then we feed it what the date just said, and the LLM writes a one-sentence suggestion.

### Voice Cloning
ElevenLabs can take a 30-second sample of someone's voice and produce a digital model that can speak any text in that voice. So when Vought whispers a suggestion to you, it sounds like *you* speaking, not a stranger or a robot. This makes a huge difference — you can parrot it without sounding fake.

### WebSocket
A WebSocket is like a phone line between two computers that stays open. Normal websites use HTTP, where you ask a question and get an answer, then hang up. WebSockets stay connected so data can flow both ways continuously. Perfect for real-time audio.

### WebRTC
WebRTC is a special technology built into browsers that allows them to send and receive audio with very low latency — under 100 milliseconds. We use it for the connection between the user's browser and ElevenLabs. It's why video calls work smoothly.

---

## 6. The System Architecture

Here's the real picture of what's running and how the pieces connect:

```
                     ┌─────────────────────────────────────┐
                     │           USER'S DEVICE             │
                     │                                     │
                     │  ┌──────────┐    ┌───────────────┐  │
                     │  │ AirPods  │    │  Mobile app   │  │
                     │  │ /Headset │◄──►│  or web app   │  │
                     │  └──────────┘    └───────┬───────┘  │
                     └──────────────────────────┼──────────┘
                                                │
                            ┌───────────────────┴────────────────────┐
                            │                                        │
                            │  audio out               audio in       │
                            │  (WebRTC)                (WebRTC)       │
                            │                                        │
                            ▼                                        ▼
                ┌─────────────────────────────────────────────────────────┐
                │                  ELEVENLABS                             │
                │  ┌─────────────┐    ┌────────────┐    ┌──────────────┐  │
                │  │ Speech-     │    │ Text-      │    │ Voice clone  │  │
                │  │ to-text     │    │ to-speech  │    │ library      │  │
                │  └─────────────┘    └────────────┘    └──────────────┘  │
                └──────────────────────────┬──────────────────────────────┘
                                           │
                                           │  WebSocket
                                           │  transcripts ↕ text response
                                           ▼
                ┌─────────────────────────────────────────────────────────┐
                │             OUR SPEECH ENGINE SERVER                    │
                │             (Node.js, runs in cloud)                    │
                │                                                         │
                │   - Receives transcripts from ElevenLabs                │
                │   - Asks the Orchestration Service what to say          │
                │   - Streams response back to ElevenLabs                 │
                └────────────┬──────────────────────────┬─────────────────┘
                             │                          │
                             │ HTTP/SSE                 │ WebSocket
                             ▼                          ▼
        ┌────────────────────────────┐    ┌────────────────────────────┐
        │   ORCHESTRATION SERVICE    │    │   DIARIZATION SIDECAR      │
        │   (Node.js)                │    │   (Python, runs with GPU)  │
        │                            │    │                            │
        │   - Persona selection      │    │   - Receives audio PCM     │
        │   - Conversation memory    │    │   - 5s enrollment          │
        │   - Playbook RAG lookup    │    │   - Streaming diarization  │
        │   - LLM streaming          │    │   - Pushes speaker labels  │
        │   - Returns text tokens    │    │                            │
        └─────┬──────────────┬───────┘    └─────────────┬──────────────┘
              │              │                          │
              ▼              ▼                          ▼
       ┌──────────┐   ┌──────────┐               ┌──────────┐
       │  LLM     │   │ Postgres │               │   Redis  │
       │ (OpenAI/ │   │ + vector │               │ session  │
       │ Claude)  │   │  DB      │               │  state   │
       └──────────┘   └──────────┘               └──────────┘
```

That's the whole system. Six moving parts, three databases. We'll explain each box now.

### The user's device
A phone (Vought) or a laptop (Vought). It runs a web app (built in Next.js, a popular React framework) that captures the microphone, plays audio back, and shows the UI overlay with the latest suggestion.

### ElevenLabs
ElevenLabs is a service we use. We don't run it. They handle the heavy audio work. Their Speech Engine creates a "resource" (think of it as a config profile) that knows our server's WebSocket URL. When ElevenLabs hears a complete utterance, it calls our server with the transcript.

### Speech Engine Server (Node.js)
The thinnest layer. Receives ElevenLabs callbacks. Asks Orchestration what to say. Streams the response back. Doesn't store state.

### Orchestration Service (Node.js)
The brain of the operation. This is where the persona prompts live, where conversation memory is kept, where the LLM is called, where playbook RAG happens. It receives transcripts from the Speech Engine Server and speaker labels from the Diarization Sidecar, and decides whether to fire the LLM.

### Diarization Sidecar (Python)
A separate Python program (FastAPI) running diart. It receives raw audio from the user's browser in parallel to ElevenLabs. It labels each chunk with a speaker ID. When the user opens a session, the first 5 seconds are used to "enroll" their voice — diart learns what *you* sound like. After that, every chunk is labeled "is_self: true" or "is_self: false." We use this to gate the LLM.

### LLM
OpenAI GPT-4o or Anthropic Claude. We call their API with a streaming request, get tokens back as they're generated, and forward them to ElevenLabs.

### Postgres + pgvector
A regular SQL database with a vector extension. Stores users, voice IDs, personas, saved transcripts (opt-in), and playbook chunk embeddings for Vought.

### Redis
Holds the live session state — conversation memory, current persona, speaker enrollment data. Cleared when the session ends.

---

## 7. End-to-End Data Flow (one conversation turn)

Walk through what happens when the other person finishes saying "How did you get into this business?":

**Step 1.** Audio frames flow from the user's mic over WebRTC to ElevenLabs *and* over WebSocket to the Diarization Sidecar. Both receive the same bytes.

**Step 2.** ElevenLabs detects end-of-turn (silence > 1 second), transcribes the audio to "How did you get into this business?", and pushes it to the Speech Engine Server with the full conversation history.

**Step 3.** Diarization Sidecar emits a speaker label: `{speaker: "other", is_self: false, t_start: 12.3, t_end: 14.8, confidence: 0.96}` to the Orchestration Service.

**Step 4.** The Speech Engine Server's `onTranscript` handler fires. It posts to Orchestration's `/api/turn` endpoint with the transcript.

**Step 5.** Orchestration checks: did the most recent speaker label say `is_self: false`? Yes. So the LLM should fire.

**Step 6.** Orchestration assembles the prompt: persona system prompt + last 20 turns of memory + (for Vought) top-k playbook chunks from the vector DB + the new utterance. Sends it to OpenAI with `stream: true`.

**Step 7.** OpenAI streams back tokens: "I ", "stumbled ", "into ", "it ", "honestly ", "—", " I ", "was ", "trying ", "to ", "solve ", "a ", "problem ", "for ", "myself."

**Step 8.** Orchestration forwards each token to Speech Engine Server as Server-Sent Events.

**Step 9.** Speech Engine Server calls `session.sendResponse(stream)` — the ElevenLabs SDK passes tokens to ElevenLabs' TTS.

**Step 10.** ElevenLabs TTS streams audio chunks (in the user's cloned voice) back to the browser over WebRTC. Audio starts playing 135ms after the first token.

**Step 11.** The user hears their own voice say "I stumbled into it honestly — I was trying to solve a problem for myself" in their AirPod. They pause for a beat, then repeat it.

**Step 12.** If the user starts talking before the whisper finishes, ElevenLabs detects it, fires an `AbortSignal`, cancels the LLM stream, and stops audio playback immediately.

---

## 8. The Latency Budget

We want under 1 second from "other person stops talking" to "Vought starts whispering." Here's how that second is spent:

| Stage | Time |
|---|---|
| Diart + VAD confirm end of turn | 200-400ms |
| ElevenLabs STT transcript ready | 100-200ms |
| Network hop to Orchestration | 20-50ms |
| Prompt assembly + RAG lookup | 30-80ms |
| LLM first token (gpt-4o or Claude Haiku) | 200-400ms |
| ElevenLabs Flash TTS first audio byte | 135ms |
| Audio arrives at user's AirPod | 50-100ms |
| **TOTAL** | **735-1365ms** |

If you blow the budget, the knobs are: faster LLM (Claude Haiku < gpt-4o for first-token latency), shorter prompt, lower diart accuracy in exchange for speed, or co-locating servers in the same region as ElevenLabs' API edge.

---

## 9. Vought — User Journey + Features

### First-time user journey
1. User downloads Vought (or opens the web app on their phone).
2. They sign up with email or Apple.
3. They record a 30-second voice sample reading a paragraph we provide.
4. ElevenLabs clones their voice. (5 minutes processing time, runs in the background.)
5. They land on a home screen showing personas as a horizontal card deck.

### Active session
1. User taps a persona — say, "First Date."
2. They pop in AirPods. The screen shows a single big "Begin" button and a disclosure: *Live coaching. No audio recorded.*
3. They tap Begin. The screen becomes a translucent overlay with the latest suggestion in the middle.
4. They start talking with the other person.
5. When the other person finishes speaking, Vought whispers a suggestion in their ear within 1 second.
6. If they don't like it, swipe left to cycle to a different suggestion. Long press to ask for warmer / sharper / shorter.
7. When the conversation ends, they tap End. By default, nothing is saved.

### Vought feature list (V1)

**Voice & Audio**
- 30-second voice clone onboarding
- Re-record voice from settings
- Cloned voice as whisper output
- AirPods-only audio routing (never speaker)
- Volume control independent of phone master volume
- Auto audio-duck when other person resumes speaking

**Personas**
- 8 built-in personas: First Date, Second Date, Job Interview, Sales Discovery, Hard Conversation, Salary Negotiation, Medical Visit, Parent-Teacher Conference
- Each persona has its own tone profile (warmth, formality, length)
- Tone sliders: warmer ↔ sharper, terse ↔ chatty

**Live Mode**
- Translucent suggestion overlay
- Big-typography current suggestion
- Swipe to cycle alternatives
- Long-press for tone variant
- AirPods squeeze-to-summon (V1.1)
- Watch widget showing latest suggestion (V1.2)

**Privacy**
- Default: no audio retention, no transcript storage
- Opt-in: save transcripts for review
- Per-session toggle for privacy mode
- Disclosure banner shown on every session start
- One-tap delete-all-memory in settings

**Review Mode (opt-in)**
- Post-conversation transcript with speaker labels
- Vought's commentary as margin annotations
- "Best moment / Missed opportunity / One thing to practice" cards
- Audio playback with waveform scrubbing

**Settings**
- Persona library
- Privacy toggles
- Voice re-record
- Language (English, Spanish at launch)
- Sign in / out

### Vought feature roadmap

**V2** — practice mode (Vought roleplays the other person), wake-word activation, Apple Watch HUD widget.

**V3** — confidence scoring (Vought stays quiet when uncertain), intonation analysis (flag nervous voice in your speech), multi-language.

**Premium** — HIPAA mode for medical, encrypted retention.

---

## 10. Vought — User Journey + Features

### Vought is three products in a trench coat

Vought copies the Cresta playbook: one platform, three pillars.

**Pillar 1: AI Receptionist** — fully autonomous AI that answers inbound calls 24/7 for SMBs (dentists, salons, lawyers). No human in the loop. Books appointments, answers FAQs, routes urgents.

**Pillar 2: Agent Assist (the wedge)** — Vought for call-center reps. Real-time whisper coaching during live calls. This is where the in-ear differentiation matters most.

**Pillar 3: Conversation Intelligence** — analytics, coaching, QA over recorded calls. Auto-summaries, deal risk flags, talk-ratio reports, manager dashboards.

### Vought user journey (Agent Assist pillar)

1. Sales rep logs into Vought web app on their work laptop.
2. They have Vought running in a small floating window while they take calls (via Zoom Phone, Aircall, RingCentral, or a Twilio bridge).
3. The customer says: "We already use Salesforce, why would we switch?"
4. Vought listens. Looks up the company's objection-handling playbook (uploaded by their manager). Finds the chunk about competing against Salesforce.
5. Within 1 second, Vought whispers in the rep's ear: "Acknowledge them — 'I hear you, Salesforce is solid.' Then pivot to their pain point we know about: 'How are your reps spending their time?'"
6. Rep speaks the line. Customer engages. Deal continues.
7. After the call, Vought automatically generates a summary, logs it to Salesforce, and flags any objections that were handled poorly so the manager can coach later.

### Vought feature list (V1)

**Reps**
- Real-time whisper coaching (with the rep's own cloned voice — or the manager's voice, optionally)
- Live transcript visible during call
- Playbook context shown alongside suggestions
- Post-call auto-summary + auto-CRM-log
- Personal call history with searchable transcripts

**Managers**
- Team dashboard: rep activity, suggestion acceptance rate, talk ratios, win/loss flags
- Playbook library: upload PDFs / Notion exports, version control, A/B test variants
- Coaching workflows: assign drills based on patterns in calls
- Real-time team view: see who's on a call right now, listen in (with consent)

**Admins**
- SSO (Okta, Google Workspace, Azure AD)
- Role-based access control
- Audit log of every suggestion served, every transcript accessed
- Data retention controls

**Integrations**
- Salesforce: lead context fetch, post-call activity log
- HubSpot: same
- Zendesk: ticket context for support reps
- Zoom Phone, Aircall, RingCentral, Twilio: audio bridge
- Slack: in-call alerts to the rep, post-call summary to channel
- Calendar: pre-call brief based on attendees

**AI Receptionist (Pillar 1)**
- Phone number provisioning per business
- Custom greeting + business info
- Appointment booking integrated with Google Calendar / Calendly
- FAQ knowledge base from website crawl
- Emergency routing to a human

**Conversation Intelligence (Pillar 3)**
- Auto-summary of every call
- Topics, objections, action items extracted
- Sentiment trend per customer
- Win/loss pattern analysis
- AI Analyst: natural language queries over the call corpus ("show me every objection about pricing from enterprise leads this quarter")

### Vought enterprise add-ons

- SCIM provisioning
- SOC 2 Type II
- Data residency (US, EU, India)
- White-label deployment
- SLA-backed sub-700ms latency
- Custom LLM (bring your own, or on-prem deployment)

---

## 11. The Folder Structure (what file goes where)

```
vought-platform/
│
├── BLUEPRINT.md                    ← this file
├── SETUP.md                        ← step-by-step setup
├── README.md                       ← quick overview
│
├── echo-engine/                    ← shared backend
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   ├── src/
│   │   ├── server.ts               ← main entry, Express + Speech Engine
│   │   ├── orchestrator.ts         ← prompt assembly, LLM streaming
│   │   ├── personas/               ← persona prompt templates
│   │   │   ├── first-date.ts
│   │   │   ├── interview.ts
│   │   │   ├── sales-discovery.ts
│   │   │   └── ...
│   │   ├── memory.ts               ← conversation memory (Redis)
│   │   ├── rag.ts                  ← playbook retrieval (Vought)
│   │   ├── voice-clone.ts          ← ElevenLabs voice cloning helper
│   │   └── speech-engine-setup.ts  ← creates SE resource on boot
│   └── scripts/
│       └── create-engine.ts        ← one-time, creates SE resource
│
├── diarization-sidecar/            ← Python service
│   ├── requirements.txt
│   ├── main.py                     ← FastAPI + diart pipeline
│   └── enrollment.py               ← 5s self-voice enrollment
│
├── vought-app/                  ← mobile / web client
│   ├── package.json
│   ├── next.config.js
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                ← home / persona picker
│   │   ├── onboarding/
│   │   │   └── voice.tsx           ← 30s voice clone
│   │   ├── live/
│   │   │   └── page.tsx            ← live conversation overlay
│   │   └── review/
│   │       └── page.tsx            ← post-session review
│   └── components/
│       ├── PersonaCard.tsx
│       ├── LiveOverlay.tsx
│       └── DisclosureBanner.tsx
│
├── vought-teams/                     ← desktop / web client
│   ├── package.json
│   ├── next.config.js
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx      ← manager dashboard
│   │   ├── call/page.tsx           ← live call coaching view
│   │   ├── playbooks/page.tsx      ← playbook library
│   │   └── analytics/page.tsx      ← conversation intelligence
│   └── components/
│       ├── RepRow.tsx
│       ├── PlaybookUploader.tsx
│       ├── LiveTranscript.tsx
│       └── SuggestionCard.tsx
│
├── database/
│   ├── schema.sql                  ← Postgres tables
│   └── migrations/
│
└── infra/
    ├── docker-compose.yml          ← local dev
    └── ngrok.example.yaml          ← tunneling for dev
```

---

## 12. The 6-Day Build Plan

### Day 1 — Saturday — Get the audio loop closed
- Create ElevenLabs API key, set up `.env`
- Run `scripts/create-engine.ts` to create a Speech Engine resource
- Run ngrok to expose your local server
- Start the Speech Engine Server with a stub LLM that echoes
- Open the Vought client in a browser, grant mic access, hear yourself echo back
- **Definition of done**: you talk into the mic, you hear ElevenLabs say back what you said

### Day 2 — Sunday — Speaker diarization
- Start the diarization sidecar
- Wire client to stream PCM to both ElevenLabs AND the sidecar in parallel
- Build the 5-second enrollment screen
- Hook the sidecar's speaker labels into Orchestration
- **Definition of done**: when you talk, no LLM fires. When a friend talks, the LLM fires.

### Day 3 — Monday — Real LLM + personas
- Replace the echo stub with OpenAI gpt-4o streaming
- Wire AbortSignal through so interruptions cancel the LLM call
- Build three personas as system prompts: First Date, Sales Discovery, Job Interview
- Implement conversation memory in Redis (last 20 turns)
- **Definition of done**: pick a persona, have a conversation, get real LLM-generated suggestions

### Day 4 — Tuesday — Voice cloning
- Add the 30-second voice capture screen to the client
- Call ElevenLabs voice cloning API on submission
- Store the returned `voice_id` per user
- Update the Speech Engine resource to use the user's voice for TTS
- **Definition of done**: Vought speaks in your own voice in your AirPods

### Day 5 — Wednesday — UI polish + Vought stub
- Polish the Vought live overlay (translucent card, big typography, swipe-to-cycle)
- Add the persona picker (horizontal card deck)
- Add the disclosure banner
- Build the Vought manager dashboard as a static page with mock data (8 reps, metrics)
- Build the playbook upload screen for Vought (visual only)
- **Definition of done**: Vought feels like a real product; Vought dashboard is screenshottable

### Day 6 — Thursday — Film the video, submit
- Storyboard the video first (don't film blind)
- Shot 1: real first date or simulated one — AirPods visible, phone face-down, smooth line
- Shot 2: reveal — phone screen showing the overlay
- Shot 3: sales call — rep walking around, hearing their own voice closing the deal
- Shot 4: tight cuts of Vought dashboard ("the same engine, for sales teams")
- Edit under 90 seconds
- Post on X, LinkedIn, TikTok with @elevenlabsio + #ElevenHacks
- Submit on hacks.elevenlabs.io

---

## 13. The User Experience (UI walkthrough)

Open the mockup files in your browser to see the actual UI:

- **`mockups/vought-app.html`** — the mobile experience: voice onboarding, persona picker, live overlay, settings
- **`mockups/vought-dashboard.html`** — the desktop experience: manager dashboard, live call coaching, playbook library

Brand direction is **Raycast meets Pi**. Near-black canvas or warm off-white. Inter / SF Pro typography. Hairline borders. One saturated accent color (a soft amber) reserved for the "speaking" state. No emoji. Generous whitespace. The brand says *precision instrument for important moments*, not *wingman lol*.

---

## 14. The Pitch & Business Case

### One-sentence pitch
Vought puts an AI coach in your AirPods that speaks in your own voice and tells you exactly what to say during the conversations that matter most.

### One-paragraph pitch
We built the voice intelligence platform for the modern world. Vought is the consumer product: an AI in your AirPods that listens to your live conversations — interviews, first dates, hard talks, salary negotiations — and whispers the next line in your own cloned voice. Vought is the enterprise version: the same engine deployed to call-center reps and sales teams, with playbook RAG, CRM integration, and manager dashboards. One core, two go-to-markets. The consumer product is the brand and the data flywheel. The enterprise product is the ARR. Loom's playbook applied to voice AI.

### Why this wins
- The technical moat — sub-1-second turn time with diarization and voice cloning is genuinely hard right now and ElevenLabs Speech Engine is the only stack that makes it possible.
- The viral moat — the consumer demo (first date, hard conversation) is the most shareable AI product video category right now.
- The enterprise moat — Cresta is doing this for $52M ARR with desktop overlays and robot voices. We do it in AirPods with the rep's own voice.
- The window — Apple shipped Live Translation on AirPods in Sept 2025. The category is opening up and Apple will not build "Sales Coach" mode for brand reasons. 18-month founding window.

### The numbers
- Vought consumer: $19/mo. Target 10K paying users in year 1 = $2.3M ARR.
- Vought enterprise: $99/seat/mo. Target 200 seats sold in year 1 = $240K ARR (small but high-margin, lays the rail for Series A).
- Combined target: $2.5M ARR exit of year 1, pitch a Seed of $3-5M.

### The competition
- **Cresta** ($1.6B valuation, $52M ARR) — closest analog. Desktop overlay, no in-ear, no voice cloning. We win on form factor and authenticity of voice.
- **Cluely** ($20.3M raised, ARR controversy) — closest viral analog. Screen overlay for video interviews only. Brand poisoned. We win on positioning and use-case breadth.
- **Apple** — long-term threat. They shipped Live Translation in AirPods. They will not ship in-ear sales coaching for brand reasons. We need to win the category before they build a horizontal API.

---

## 15. Glossary

**ASR (Automatic Speech Recognition)** — the technology that converts spoken audio into text. Same as STT.

**Diart** — the open-source library we use for real-time speaker diarization. Built on pyannote.

**Diarization** — figuring out who said what in an audio stream.

**ElevenLabs Speech Engine** — ElevenLabs' product that handles STT + TTS + turn-taking, leaving you to bring your own LLM.

**Enrollment** — the brief moment when the user records a sample so the diarization system can learn their voice. We do 5 seconds.

**Latency** — the delay between something happening and the system responding. We target under 1 second end-to-end.

**LLM (Large Language Model)** — the AI that reads text and writes text. GPT-4o, Claude, Gemini.

**Persona** — a system prompt that tells the LLM what mode to be in: First Date, Sales Call, Hard Conversation, etc.

**Playbook** — for Vought, a document (PDF, Notion export) containing the company's sales scripts, objection handling, FAQ answers. Chunked and embedded into the vector DB for RAG.

**RAG (Retrieval Augmented Generation)** — looking up relevant context from a database and including it in the LLM prompt. Used for Vought playbooks.

**Speech Engine Resource** — a saved configuration on ElevenLabs that points to your server's WebSocket and bundles voice, ASR, and TTS settings.

**STT (Speech to Text)** — same as ASR.

**TTS (Text to Speech)** — generating spoken audio from text.

**TTFB (Time To First Byte)** — for TTS, how long until the first audio byte arrives after you send the text.

**TTFT (Time To First Token)** — for LLMs, how long until the first text token arrives after you send the prompt.

**VAD (Voice Activity Detection)** — detecting when someone is speaking vs silent. We use Silero.

**Voice Clone** — a digital model of someone's voice generated from a sample. ElevenLabs creates one from 30 seconds.

**WebRTC** — browser technology for real-time audio/video with low latency.

**WebSocket** — a two-way always-open internet pipe between two computers.

---

*End of Blueprint. Next: open `mockups/vought-app.html` and `mockups/vought-dashboard.html` in your browser to see the UI. Then read `SETUP.md` and follow it line by line on Day 1.*
