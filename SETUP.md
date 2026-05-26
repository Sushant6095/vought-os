# Setup — go from zero to running in 30 minutes

This is the order you do things. Every step has a "you should see" line so you can confirm you're on track. If a step fails, fix it before moving on — every step depends on the previous one.

## 0. What you need installed

- **Node.js 20+** — `node --version` should print v20 or higher
- **Python 3.11+** — `python3 --version` should print Python 3.11 or higher
- **Redis** — install via `brew install redis` (macOS) or `apt install redis` (Linux)
- **Postgres 15+** with pgvector — `brew install postgresql@15 && brew install pgvector`
- **ngrok** — sign up at ngrok.com, install, run `ngrok config add-authtoken <yours>`
- **A Hugging Face account** with a token — get one at huggingface.co/settings/tokens

## 1. Get an ElevenLabs API key

Go to elevenlabs.io, sign up, click your profile → API Keys → Create. Copy the `sk_...` key. Keep it open in a tab.

You should see: a key that starts with `sk_`.

## 2. Get an OpenAI API key

Go to platform.openai.com, sign up, click your profile → API keys → Create. Copy the `sk-proj-...` key.

You should see: a key that starts with `sk-proj-`.

## 3. Accept the pyannote license

Go to huggingface.co/pyannote/speaker-diarization-3.1 and click "Accept license." This is required for the diarization sidecar to download the model on first run.

You should see: "Gated repo · Access granted" on the page.

## 4. Install the project

Clone or unzip the project, then in three terminals run these once:

**Terminal A — Echo Engine (Node.js backend):**

```bash
cd code/echo-engine
cp .env.example .env
npm install
```

**Terminal B — Diarization Sidecar (Python):**

```bash
cd code/diarization-sidecar
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
huggingface-cli login   # paste your HF token when prompted
```

**Terminal C — Vought Client (Next.js mobile app):**

```bash
cd code/vought-app
cp .env.local.example .env.local
npm install
```

You should see: three folders with `node_modules` (or `.venv`) populated. No red errors.

## 5. Set up Postgres

In a new terminal:

```bash
createdb echo
psql echo -f code/database/schema.sql
```

You should see: a bunch of `CREATE TABLE`, `CREATE INDEX`, and `INSERT` lines. No red errors.

If pgvector is not installed: `brew install pgvector && psql echo -c "CREATE EXTENSION vector;"`.

## 6. Start Redis

```bash
brew services start redis        # macOS
# or:
redis-server                     # Linux
```

You should see: `Ready to accept connections`.

## 7. Fill in `.env` for the Echo Engine

Open `code/echo-engine/.env` and paste your keys:

```
ELEVENLABS_API_KEY=sk_yourkeyhere
OPENAI_API_KEY=sk-proj-yourkeyhere
DATABASE_URL=postgresql://localhost:5432/echo
REDIS_URL=redis://localhost:6379
```

Leave `SPEECH_ENGINE_ID` and `PUBLIC_WS_URL` blank for now — we fill those in next.

## 8. Start ngrok

In a new terminal:

```bash
ngrok http 3001
```

You should see: a `Forwarding` line like `https://abc-123.ngrok-free.app -> http://localhost:3001`.

Copy that URL, replace `https` with `wss`, and append `/ws`. Example:
`wss://abc-123.ngrok-free.app/ws`

Paste it into `code/echo-engine/.env` as `PUBLIC_WS_URL=...`.

**Keep ngrok running.** Closing it kills the tunnel.

## 9. Create the Speech Engine resource

In the echo-engine folder:

```bash
npm run create-engine
```

You should see:

```
✓ Engine created!
    SPEECH_ENGINE_ID=seng_abc123…
```

Copy that line into `code/echo-engine/.env`. Also copy it into `code/vought-app/.env.local`.

You only do this step ONCE per environment. If you destroy and recreate ngrok, you'll need to either update the engine (see ElevenLabs docs) or recreate.

## 10. Start the diarization sidecar

Back in Terminal B (the Python one):

```bash
export HF_TOKEN=hf_yourtokenhere
uvicorn main:app --port 8000
```

You should see: `Uvicorn running on http://0.0.0.0:8000`.

First run downloads the pyannote model (~200MB). Be patient.

## 11. Start the Echo Engine

Terminal A:

```bash
npm run dev
```

You should see:

```
✓ Connected to diarization sidecar

  ╭─────────────────────────────────────────────────╮
  │  Echo Engine listening on port 3001              │
  │  Engine: seng_abc123…                            │
  │  Public WS: wss://abc-123.ngrok-free.app/ws       │
  ╰─────────────────────────────────────────────────╯
```

## 12. Start the Vought client

Terminal C:

```bash
npm run dev
```

You should see: `Local: http://localhost:3000`.

## 13. Try it

1. Open `http://localhost:3000` in your phone's browser (best on mobile Safari/Chrome). If on desktop, use Chrome.
2. Tap a persona — say "First Date" — and tap **Begin**.
3. Grant microphone permission.
4. Watch the state pill at the top: it should go from `Connecting…` → `Listening`.
5. Have a real conversation with someone, or speak both roles yourself. When the *other* person speaks, within ~1 second you should see the suggestion text appear AND hear audio in your AirPods.

If it doesn't work, check these in order:
- Terminal A shows "Session opened"? If no, ngrok URL is wrong.
- Terminal A shows "▶ LLM fire"? If no, diarization sidecar isn't seeing "other" speaker — re-do enrollment.
- Browser DevTools shows WebSocket connected to `/audio/{session_id}`? If no, NEXT_PUBLIC_DIARIZATION_WS_URL is wrong.

## 14. (Optional) Voice clone your own voice

Right now Vought speaks with the default Adam voice. To clone yours:

```bash
cd code/echo-engine
npm run clone-voice
```

Follow the prompts. This will:
1. Record 30 seconds of your voice through your laptop mic
2. Upload to ElevenLabs voice cloning
3. Update the Speech Engine resource to use your voice for TTS

After this, Vought speaks in your own voice.

## 15. You're live

Day 1 of the hackathon is complete. Now read the BLUEPRINT.md sections 12 and 13 for the day-by-day plan toward the demo video.

---

## Common errors

**"Missing required env var: SPEECH_ENGINE_ID"** — you didn't paste the ID into `.env` after running create-engine.

**"WebSocket connection failed"** — ngrok died or the URL changed. Restart ngrok, update both `PUBLIC_WS_URL` in echo-engine and re-run `create-engine` if needed.

**"pyannote model not found"** — you didn't accept the license. Go to huggingface.co/pyannote/speaker-diarization-3.1 and click accept.

**"Redis unavailable, using in-memory fallback"** — this is fine for dev. Conversation memory will reset when the server restarts.

**"No transcript appearing"** — open browser DevTools → Console. Look for ElevenLabs errors. Usually it's a missing or expired token.

**The suggestion arrives but no audio plays** — your AirPods aren't selected as output. Phone: Control Center → Now Playing → choose AirPods. Or your phone's silent switch is on.
