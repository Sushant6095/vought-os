# Quick Start · Vought

> Get the full Vought stack running locally — marketing site, product app, Echo Engine, and diart sidecar — in under 30 minutes. Every step has a verification line and a troubleshooting block.

The condensed five-step version lives in [`README.md`](../README.md) §"Quick start". This is the extended walkthrough with the failure modes that bite people in practice.

---

## Prerequisites

Version pins below are the versions this build was verified against. Newer should work; older may not.

| Tool | Version | Install |
|---|---|---|
| Node.js | 20.x | `brew install node@20` (macOS) |
| pnpm | 9.12+ | `corepack enable && corepack prepare pnpm@9.12.0 --activate` |
| Python | 3.11+ | `brew install python@3.11` (macOS) |
| Docker Desktop | latest | docker.com — optional, only if you want local Postgres + Redis |
| ngrok | latest | `brew install ngrok` then `ngrok config add-authtoken <yours>` |
| ffmpeg | 8.x | `brew install ffmpeg` — only if you'll run the video pipeline |

You also need accounts and tokens for:

- **ElevenLabs** — `sk_…` API key from [elevenlabs.io/app/settings/api-keys](https://elevenlabs.io/app/settings/api-keys)
- **OpenAI** OR **Anthropic** — at least one LLM provider key
- **Hugging Face** — token from [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens), AND accept the pyannote license at [huggingface.co/pyannote/speaker-diarization-3.1](https://huggingface.co/pyannote/speaker-diarization-3.1) (only if you'll run the diart sidecar)

---

## Step 1 · Clone and install

```bash
git clone git@github.com:sushant-vyapar/vought.git
cd vought
pnpm install
```

You should see `node_modules` populate at the repo root, in each `apps/*`, `packages/*`, and `services/echo-engine`.

**Troubleshooting**

- *`EBADENGINE` warning about Node version* — upgrade to Node 20. `nvm install 20 && nvm use 20`.
- *`pnpm` not found* — `corepack enable` activates the pnpm shim bundled with Node 20.
- *Workspace resolution errors (`Cannot find module '@vought/design-system'`)* — install ran but the workspace did not link. Try `pnpm install --force` from the repo root.

---

## Step 2 · Install the Python sidecar (optional but recommended)

If you skip this, the Echo Engine runs in degraded mode and whispers on every transcript regardless of speaker. Fine for a smoke test, not what the demo shows.

```bash
cd services/diarization-sidecar
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
huggingface-cli login   # paste your HF token when prompted
cd ../..
```

You should see `Login successful` from the HF CLI and a `.venv/` directory.

**Troubleshooting**

- *`pip install` fails on `pyannote-audio` or `torch`* — pyannote pulls in PyTorch which can take 5-10 minutes on first install. Be patient. If it errors out, try `pip install --upgrade pip setuptools wheel` first.
- *`pyannote model not found` at runtime* — you did not accept the license. Go to [huggingface.co/pyannote/speaker-diarization-3.1](https://huggingface.co/pyannote/speaker-diarization-3.1) and click "Accept license". Status must show "Gated repo · Access granted".
- *Apple Silicon, no GPU* — diart runs on CPU; expect ~580ms label latency per turn. Fine for one or two sessions.

---

## Step 3 · Environment variables

```bash
cp services/echo-engine/.env.example services/echo-engine/.env
```

Open `services/echo-engine/.env` and fill in:

```bash
ELEVENLABS_API_KEY=sk_…             # from elevenlabs.io
OPENAI_API_KEY=sk-proj-…            # or set ANTHROPIC_API_KEY instead
LLM_PROVIDER=openai                 # or "anthropic"
HF_TOKEN=hf_…                       # only if diart sidecar is running
```

Leave `SPEECH_ENGINE_ID` and `PUBLIC_WS_URL` blank for now — they get filled in Steps 5 and 6.

For `apps/app`:

```bash
cp apps/app/.env.local.example apps/app/.env.local
```

Open and set `NEXT_PUBLIC_DIARIZATION_WS_URL=ws://localhost:8000/labels` and (after Step 6) `SPEECH_ENGINE_ID=…`.

The full env contract is documented in [`services/echo-engine/.env.example`](../services/echo-engine/.env.example).

**Troubleshooting**

- *`Missing required env var: SPEECH_ENGINE_ID` at boot* — you skipped Step 6. Come back after running `pnpm --filter=echo-engine create-engine`.
- *`Missing required env var: ELEVENLABS_API_KEY`* — the `.env` file did not load. Check the path; it must be `services/echo-engine/.env`, not the repo root.

---

## Step 4 · Start local datastores (optional)

The Echo Engine soft-fails to in-memory when Redis is down and disables RAG when Postgres is down — so this step is optional for a smoke test. Run it if you want the production wiring.

```bash
docker compose up -d
```

You should see Postgres and Redis containers running on `:5432` and `:6379`. Verify:

```bash
docker compose ps
```

Load the schema:

```bash
psql postgresql://postgres:postgres@localhost:5432/echo -f database/schema.sql
```

You should see a sequence of `CREATE TABLE`, `CREATE INDEX`, `CREATE EXTENSION`, and `INSERT` lines. Seven personas seeded.

**Troubleshooting**

- *Port `5432` already in use* — a system Postgres is running. Stop it (`brew services stop postgresql`) or change the port in `docker-compose.yml`.
- *`CREATE EXTENSION vector` fails* — your Postgres lacks pgvector. The bundled docker-compose image includes it; if you use a system Postgres, install pgvector first: `brew install pgvector && psql echo -c "CREATE EXTENSION vector;"`.
- *Redis "Ready to accept connections" never appears* — check `docker logs vought-redis-1`.

---

## Step 5 · Expose the Echo Engine to ElevenLabs

ElevenLabs needs to call into your Echo Engine over the public internet. In dev, that's ngrok.

```bash
ngrok http 3001
```

Keep this terminal open. Copy the `Forwarding` URL — looks like `https://abc-123.ngrok-free.app -> http://localhost:3001`.

Convert it to the WSS form with `/ws` appended: `wss://abc-123.ngrok-free.app/ws`. Paste it into `services/echo-engine/.env`:

```bash
PUBLIC_WS_URL=wss://abc-123.ngrok-free.app/ws
```

**Troubleshooting**

- *`ERR_NGROK_4018` "you must be authenticated"* — run `ngrok config add-authtoken <yours>` first. The token is at [dashboard.ngrok.com/get-started/your-authtoken](https://dashboard.ngrok.com/get-started/your-authtoken).
- *ngrok URL keeps changing on restart* — free tier rotates URLs every reconnect. Either pay for a reserved domain or be prepared to update `PUBLIC_WS_URL` and re-run Step 6 each time.
- *"Failed to complete tunnel connection"* — port `3001` is in use. `lsof -i :3001` to find the offender.

---

## Step 6 · Mint the Speech Engine resource

One-time per `PUBLIC_WS_URL`. This calls ElevenLabs and registers your engine so it knows where to send transcripts.

```bash
pnpm --filter=echo-engine create-engine
```

You should see:

```
✓ Engine created
    SPEECH_ENGINE_ID=seng_abc123…
```

Copy the `seng_…` ID into both env files:
- `services/echo-engine/.env` → `SPEECH_ENGINE_ID=seng_…`
- `apps/app/.env.local` → `SPEECH_ENGINE_ID=seng_…`

**Troubleshooting**

- *`401 Unauthorized` from ElevenLabs* — `ELEVENLABS_API_KEY` is wrong. Check `services/echo-engine/.env`.
- *`PUBLIC_WS_URL is required`* — Step 5 was skipped or the env did not reload. Restart the script.
- *ngrok URL changed and the engine is pointing at the old one* — either update the engine via the ElevenLabs API or simply re-run `pnpm --filter=echo-engine create-engine` to mint a fresh resource.

---

## Step 7 · Boot the stack

You need four terminals. (Or `tmux`, or `pnpm dev` at the root if you trust Turbo to manage all of them.)

**Terminal 1 — Echo Engine** (Node.js, :3001)

```bash
pnpm --filter=echo-engine dev
```

You should see:

```
✓ Connected to diarization sidecar
  Echo Engine listening on port 3001
  Engine: seng_abc123…
  Public WS: wss://abc-123.ngrok-free.app/ws
```

**Terminal 2 — Diarization sidecar** (Python, :8000)

```bash
cd services/diarization-sidecar
source .venv/bin/activate
uvicorn main:app --port 8000
```

You should see `Uvicorn running on http://0.0.0.0:8000`. First run downloads the pyannote model (~200MB) — be patient.

**Terminal 3 — Product app** (Next.js, :3002)

```bash
pnpm --filter=app dev
```

You should see `Local: http://localhost:3002`.

**Terminal 4 — Marketing site** (Next.js, :3000)

```bash
pnpm --filter=web dev
```

You should see `Local: http://localhost:3000`.

**Troubleshooting**

- *Port `:3001` / `:3002` already in use* — another process is bound. `lsof -i :3001` to find it. Common culprits: a stale Next.js dev server, the Vercel CLI in another terminal.
- *`Connected to diarization sidecar` never appears* — the sidecar is not running on `:8000`, or `NEXT_PUBLIC_DIARIZATION_WS_URL` is wrong. The Echo Engine still boots without the sidecar but logs `degraded mode`.
- *`Module not found: '@vought/design-system'`* — workspace did not resolve. Re-run `pnpm install` from the repo root.
- *Marketing site shows a 500 on every page* — known issue from Wave 5 if you're checking out an old commit. `packages/motion/src/breath.ts` needs `'use client'` on line 1. Already fixed on `main`.

---

## Step 8 · First successful live call

1. Open **http://localhost:3002/onboarding/voice** in Chrome (Safari works on mobile only).
2. Grant microphone permission.
3. Read the 30-second passage. Tap "I'm done" when finished.
4. Wait for processing (~5-15 seconds). The sample plays back when ready — "Hi, this is your voice".
5. Tap Accept.
6. Navigate to **http://localhost:3002/live/test-session**.
7. Put in AirPods. (Or any earbuds. The product is designed for in-ear, but speakers also work for testing.)
8. Wait for the state pill to flip from `Connecting…` to `Listening`.
9. Speak. Watch the speaker timeline animate. After ~1 second of your speech, the diart sidecar enrolls you as `isSelf: true`.
10. Have someone else speak (or speak in a different voice to spoof a second speaker). When the "other" speaker stops, within ~1 second:
    - The state pill flips to `Thinking…` then `Whispering`.
    - The suggestion card blooms in.
    - The word stream renders the suggestion text at speech cadence.
    - Audio plays in your AirPods in your cloned voice.

If you hear yourself say something brilliant before you say it, the loop works.

**Troubleshooting the live call**

- *State pill stuck on `Connecting…`* — Echo Engine cannot reach ElevenLabs, or ElevenLabs cannot reach the engine. Check ngrok is still running. Check the Echo Engine terminal for errors.
- *State pill flips to `Listening` but no suggestion ever fires* — the speaker gate thinks you're the only speaker. Either enrollment failed (re-do onboarding) or diart never got the second speaker. Check the Echo Engine logs: `stage: speaker_gate_skip` on every transcript means it always thinks you're talking. `stage: speaker_gate_pass` means it's firing the LLM.
- *Suggestion text appears but no audio plays* — AirPods are not the active output. Phone: Control Center → Now Playing → choose AirPods. Or your silent switch is on.
- *Audio plays but in someone else's voice* — `voice_id` is wrong. Check `apps/app/app/api/voice-clone/route.ts` set the voice on the Speech Engine resource. Try re-doing voice clone.
- *Suggestion arrives but feels too slow (> 2s)* — open the Echo Engine logs. Watch for `llm_first_token` carrying `latencyMs`. If it's > 500ms consistently, switch `LLM_PROVIDER=anthropic` for lower TTFT.
- *The voice on the suggestion sounds glitchy / robotic* — clone quality is poor. Re-record with a quieter room and closer to the mic. ElevenLabs handles low-effort clones, but the quality compounds at TTS time.

---

## Step 9 · Inspect the logs

The Echo Engine ships structured logs via Pino. Search by `stage`:

```bash
pnpm --filter=echo-engine dev | grep stage
```

Expected stages on a healthy turn:

```
transcript_received   sessionId=… textLen=42
speaker_gate_pass     sessionId=… isSelf=false
llm_fire              sessionId=… prepMs=63
llm_first_token       sessionId=… latencyMs=287
llm_done              sessionId=… totalMs=1124
```

Source: [`vault/30 · Architecture/Echo Engine.md`](<../vault/30 · Architecture/Echo Engine.md>) §"Hot-path observability".

---

## Step 10 · You're live

Day 1 done. Useful next reads:

- [`ARCHITECTURE.md`](../ARCHITECTURE.md) — the deeper view
- [`docs/agents.md`](agents.md) — the multi-agent build system
- [`CONTRIBUTING.md`](../CONTRIBUTING.md) — code style and PR workflow
- [`vault/40 · Pages/Live Call Screen.md`](<../vault/40 · Pages/Live Call Screen.md>) — the hero screen's spec

---

## Common errors quick-reference

| Symptom | Fix |
|---|---|
| `Missing required env var: SPEECH_ENGINE_ID` | Run Step 6. Copy `seng_…` into both env files. |
| `WebSocket connection failed` | ngrok died. Restart Step 5, re-run Step 6 if `PUBLIC_WS_URL` changed. |
| `pyannote model not found` | Accept the license at huggingface.co/pyannote/speaker-diarization-3.1. |
| `Redis unavailable, using in-memory fallback` | Fine for dev. Run Step 4 for prod wiring. |
| `Postgres connection refused` | Step 4 not run, or container stopped. `docker compose up -d`. |
| `No transcript appearing` in the live screen | Check browser DevTools console for ElevenLabs errors. Usually a missing or expired token. |
| Suggestion appears, no audio plays | AirPods not the active output device. Switch in Control Center. |
| Wrong voice on the suggestion | `voice_id` mismatch. Re-do voice clone, verify Speech Engine resource updated. |
| Marketing site 500 on every page | Old commit; `packages/motion/src/breath.ts` needs `'use client'`. Fixed on `main`. |
| Build fails with `Cannot find module '@vought/*'` | You ran a build command from the wrong directory. Run from the app dir or repo root. |
| Vercel deploy fails: wrong package manager | Root `package.json` should declare `packageManager: pnpm@9.12.0`. |

If a failure is not covered here, check the session logs in `vault/80 · Sessions/` — someone has likely hit it before and written down the fix.
