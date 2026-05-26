# Vought · Execution Runbook

> The exact order to run everything. Don't skip steps. Don't mix waves. Read each section before executing it.

---

## The Five Golden Rules

Read these once. Reread them whenever you feel lost.

1. **One wave at a time.** Never start Wave N+1 before Wave N is green. The verification gate is non-negotiable.
2. **Commit between waves.** `git commit -am "Wave N · <agent names>"` after every successful wave. Save points.
3. **Always read the session log** in `vault/80 · Sessions/` after each agent finishes. It tells you what changed, what's broken, what's next.
4. **One tool, end-to-end.** Pick Claude Code OR three browser tabs. Don't mix mid-build. Mixing tools = mixing context.
5. **No parallel writes to the same directory.** Each agent owns one directory (see scope in their prompt file). If two agents want the same file, one waits.

---

## Pre-flight (30 minutes, do this once)

Before you spawn any agent, get your environment ready.

### Step 0.1 · Verify prerequisites

In Terminal:

```bash
node --version          # Must be v20+
python3 --version       # Must be 3.11+
pnpm --version          # If missing: npm install -g pnpm@9
psql --version          # If missing: brew install postgresql@15
redis-cli ping          # If missing: brew install redis
ngrok version           # If missing: brew install ngrok
```

If any of these are missing, install them now. Stop and fix.

### Step 0.2 · Get API keys

Open these tabs and grab the keys:

- **ElevenLabs API key** — https://elevenlabs.io → Profile → API Keys → Create. Starts with `sk_`.
- **OpenAI API key** — https://platform.openai.com → API keys → Create. Starts with `sk-proj-`.
- **Hugging Face token** — https://huggingface.co/settings/tokens → New token (Read access). Starts with `hf_`.
- **Accept the pyannote license** — https://huggingface.co/pyannote/speaker-diarization-3.1 → click Accept.

Save all four in a temporary text file. You'll paste them into `.env` files in Step 0.4.

### Step 0.3 · Run the bootstrap

In Terminal at the project root:

```bash
cd ~/Downloads/vought       # or wherever the folder lives
bash scripts/bootstrap.sh
```

Bootstrap checks prerequisites, installs pnpm workspaces, sets up the Python venv for diart, and copies `.env.example` files. It is idempotent — safe to rerun.

**If it fails**: read the error, fix the dependency, rerun. Don't proceed until bootstrap is green.

### Step 0.4 · Fill in `.env` files

```bash
# Edit the Echo Engine env
nano services/echo-engine/.env
```

Paste the keys you grabbed in Step 0.2. Save. Repeat for any other `.env` files.

### Step 0.5 · Start infra

```bash
docker-compose -f infra/docker-compose.yml up -d
```

This starts Postgres (with pgvector) and Redis. Verify:

```bash
docker ps                          # both containers running
psql -h localhost -U vought -d vought -c "SELECT 1;"   # Postgres reachable
redis-cli ping                     # Redis responds PONG
```

### Step 0.6 · Hugging Face login

```bash
huggingface-cli login              # paste your HF token when prompted
```

### Step 0.7 · Open the right tools

- **Claude Code** — open the `vought/` directory: `claude` in the terminal at the project root
- **Obsidian** — open vault: `open -a Obsidian vault`
- **One terminal window** — keep open at the project root for status checks
- **One Finder window** — at the project root, so you can see files appear

### Step 0.8 · Initial git commit

```bash
git init
git add .
git commit -m "Initial vought scaffold"
```

This is your fallback. If everything breaks, `git reset --hard HEAD` returns you here.

**Pre-flight done.** Take a 5-minute break. Come back fresh.

---

## Wave 0 · Speech Engine resource (15 minutes, do this once)

The Speech Engine resource ID is required by every Wave 1+2 agent. Create it once before spawning agents.

### Step 1.1 · Start ngrok

In a dedicated terminal window (keep it open the entire session):

```bash
ngrok http 3001
```

Copy the `Forwarding` URL (looks like `https://abc-123.ngrok-free.app`). Convert `https` to `wss` and append `/ws`:

```
wss://abc-123.ngrok-free.app/ws
```

### Step 1.2 · Paste the WSS URL into env

```bash
nano services/echo-engine/.env
# add or update:
# PUBLIC_WS_URL=wss://abc-123.ngrok-free.app/ws
```

### Step 1.3 · Create the engine

```bash
cd services/echo-engine
pnpm install                       # if not already
pnpm create-engine
```

You'll see output ending with:

```
✓ Engine created!
    SPEECH_ENGINE_ID=seng_abc123…
```

Copy the `SPEECH_ENGINE_ID` and paste it into:
- `services/echo-engine/.env`
- `apps/app/.env.local` (create if missing)

### Step 1.4 · Verify

```bash
pnpm dev                           # boot the echo engine
# in another terminal:
curl http://localhost:3001/health
```

Should return `{"ok":true,"engineId":"seng_..."}`. If yes, you're ready for agents. Kill `pnpm dev` for now (the agents will manage processes themselves).

**Save point**: `git commit -am "Wave 0 · Speech Engine resource created"`

---

## Wave 1 · Foundation (3-5 hours wall-clock)

Three agents in parallel: design-system-architect, echo-engine-engineer, diarization-engineer.

### Pick your path

**Path A · Auto-orchestrated (recommended for first run)**

1. In Claude Code (the one you opened at `vought/`), type:
   ```
   /vought-spawn-wave 1
   ```
2. The orchestrator agent reads the wave-1 prompts, reads the agent definitions, then spawns all three subagents in parallel via the Task tool.
3. Wait. Claude Code shows progress per subagent. Typical wall-clock: 30-90 minutes.
4. When all three return, the orchestrator writes a wave-1 summary log to `vault/80 · Sessions/`.

**Path B · Manual parallel (three browser windows)**

If `/vought-spawn-wave` isn't responding or you prefer real parallelism:

1. Open three separate Claude Code windows (each pointing at the same `vought/` folder).
2. In window 1: open the file `prompts/build/wave-1/design-system-architect.prompt.md`, copy the contents, paste into chat.
3. In window 2: same with `echo-engine-engineer.prompt.md`.
4. In window 3: same with `diarization-engineer.prompt.md`.
5. Hit send in all three. They work in parallel on different directories — no conflicts.

### After Wave 1 finishes

**Do not start Wave 2 yet.** Run these checks first:

```bash
# 1. Smoke test the design system
ls packages/design-system/src/tokens.ts packages/motion/src/breath.ts packages/ui/src/primitives/Container.tsx
# All three files must exist.

# 2. Smoke test the Echo Engine
cd services/echo-engine && pnpm dev &
sleep 5
curl http://localhost:3001/health
# Must return 200 with engineId. Kill the server: kill %1

# 3. Smoke test the diarization sidecar
cd services/diarization-sidecar
source .venv/bin/activate
uvicorn main:app --port 8000 &
sleep 5
curl http://localhost:8000/health
# Must return 200. Kill: kill %1
deactivate
```

If any smoke test fails:
- Read the session log for the relevant agent in `vault/80 · Sessions/`
- Open the agent's prompt file in `prompts/build/wave-1/`
- Re-run that one agent with corrective context (e.g., "Earlier you produced X but the smoke test failed because Y. Fix Y.")

### Save point

```bash
git add .
git commit -m "Wave 1 · design system + echo engine + diarization sidecar"
```

You have just locked in the foundation. From here, you can always `git reset` back if Wave 2 goes sideways.

---

## Wave 2 · Hero surfaces (4-8 hours wall-clock)

Three agents in parallel: landing-page-builder, live-call-builder, voice-clone-builder.

### Run

Same two paths as Wave 1.

**Path A**: `/vought-spawn-wave 2` in Claude Code.
**Path B**: three Claude Code windows, paste each `prompts/build/wave-2/*.prompt.md` into one.

These agents work in different sub-trees:
- landing-page-builder → `apps/web/`
- live-call-builder → `apps/app/app/live/`
- voice-clone-builder → `apps/app/app/onboarding/voice/` + `apps/app/app/settings/voice/`

No file conflicts.

### After Wave 2 finishes

Three smoke tests:

```bash
# 1. Landing page boots
cd apps/web && pnpm dev &
# Visit http://localhost:3000 in browser. The cinematic landing should render. Kill: kill %1

# 2. Live call screen boots
cd apps/app && pnpm dev &
# Visit http://localhost:3000/live/test-session in browser. State pill should appear.

# 3. Voice clone capture screen boots
# Visit http://localhost:3000/onboarding/voice. Should show 30s record screen.
```

### Save point

```bash
git add .
git commit -m "Wave 2 · landing + live call + voice clone"
```

---

## Wave 3 · Verification (1-2 hours)

Single agent: qa-verifier.

### Run

```
/vought-spawn-wave 3
```

Or paste `prompts/build/wave-3/qa-verifier.prompt.md` into Claude Code.

This agent does NOT write code. It audits everything Wave 1+2 produced:
- Token drift
- Motion timing
- Accessibility
- Performance (Lighthouse)
- Live screen latency (manual measurement)
- Signature motion phase-sync

### After Wave 3 finishes

Open the latest session log:

```bash
ls -t "vault/80 · Sessions/" | head -1
# Open the file printed. Read it.
```

Look for the **final verdict** line.

- **GREEN** → proceed to Wave 4
- **YELLOW** → fix the must-fixes listed, re-run qa-verifier, then proceed
- **RED** → STOP. Surface to yourself: which wave-1 or wave-2 agent caused this. Fix at the source. Re-run that agent, then re-run qa-verifier.

### Save point

```bash
git add .
git commit -m "Wave 3 · QA verification ($VERDICT)"
```

---

## Wave 4 · Polish (1-3 hours)

Two agents in parallel: motion-polisher, accessibility-auditor.

### Run

```
/vought-spawn-wave 4
```

Or two Claude Code windows with `wave-4/motion-polisher.prompt.md` and `wave-4/accessibility-auditor.prompt.md`.

These agents EDIT existing files in place (using the Edit tool, not Write). They polish what's already there.

Both can run in parallel because:
- motion-polisher touches motion code (CSS animation durations, easing, focus rings)
- accessibility-auditor produces a REPORT (not code changes) — your followup is to act on the report

### After Wave 4 finishes

Final smoke tests:

```bash
# Run Lighthouse on each page one more time
npx unlighthouse --site http://localhost:3000

# Run axe-core
pnpm dlx @axe-core/cli http://localhost:3000

# Verify motion phase-sync visually
# Open http://localhost:3000/live/test-session
# Watch the breath: it should pulse across canvas, suggestion card, and speaker timeline IN PHASE
```

### Save point

```bash
git add .
git commit -m "Wave 4 · polish + accessibility"
```

---

## Submission prep (Final 4-8 hours before deadline)

By now you have a working live call screen with voice cloning, a polished landing page, and verified accessibility/performance. Now you ship.

### Step 5.1 · Deploy

- `apps/web` → Vercel: `cd apps/web && vercel --prod`
- `apps/app` → Vercel: same
- `services/echo-engine` → Railway: connect repo, set env vars
- `services/diarization-sidecar` → Railway (CPU mode) or Modal (GPU mode)

### Step 5.2 · End-to-end test on prod

Run through the whole flow on the deployed URLs:
1. Visit the marketing landing
2. Click "Start trial" → onboarding
3. Record voice clone
4. Pick a persona (e.g., First Date)
5. Start a session
6. Speak as "the other person" — verify Cyrano whispers in your AirPod

If anything breaks, debug, fix, redeploy. Repeat until smooth.

### Step 5.3 · Film the 90-second video

Storyboard before filming (don't film blind):

- Shot 1 (12s): person on a real first date, looks awkward, glances at phone, smooth line comes out
- Shot 2 (8s): reveal — phone screen shows the suggestion blooming
- Shot 3 (8s): tight UI cuts — state pill, word stream, waveform
- Shot 4 (10s): cut to sales rep walking, AirPods in, hearing their own voice closing a deal
- Shot 5 (45s): hero close-up of the live screen with voice clone, narration of the value prop
- Shot 6 (7s): tagline + URL + logo

Edit in CapCut or Premiere. Color grade dark. Mono audio for whisper authenticity.

### Step 5.4 · Submit

- Post the video on X, LinkedIn, TikTok with `@elevenlabsio` and `#ElevenHacks`
- Submit on https://hacks.elevenlabs.io/guide before deadline
- Include repo URL, deployed URL, social post URLs

---

## Failure modes & recovery

### Agent goes off-scope

Symptom: a wave-2 agent starts modifying `packages/design-system/` (which belongs to wave 1).

Fix:
1. Stop the agent (close the tab or interrupt).
2. `git checkout -- packages/design-system/`  (revert the unwanted changes)
3. Re-run the agent with a sharper scope reminder: "Your scope is ONLY `apps/web/`. Do not touch packages/."

### Two agents conflict on the same file

Symptom: Wave 2 has two agents editing the same file (e.g., both touching `apps/app/app/layout.tsx`).

Fix:
1. Stop both.
2. `git checkout -- <conflicted-file>`
3. Run them sequentially instead of parallel. Whichever has stronger ownership claim goes first.

### Verification keeps failing on the same thing

Symptom: qa-verifier returns RED on motion timing; you fix; it returns RED again.

Fix:
1. Read the violation carefully. The agent fixing it might be re-introducing it.
2. Check the motion library in `packages/motion/` — the source of the timing constants. If it's wrong there, everything downstream is wrong.
3. Fix at the source (the motion library), then re-run the consuming pages.

### A wave never finishes

Symptom: agent has been "thinking" for >20 minutes with no output.

Fix:
1. Stop the agent.
2. Read its last partial output to understand where it got stuck.
3. Either: shorten the scope (split the prompt into two smaller prompts) OR pre-supply the answer it's stuck on.

### Lost the thread / forgot where you are

Run `/vought-status` in Claude Code. It tells you:
- Which phases are done/partial/pending
- The latest session log
- Service health
- Pending tasks

Read the latest session log in `vault/80 · Sessions/` first. That's the ground truth.

---

## Quick reference card

Print this, keep it next to you.

| Step | Command | Expected outcome |
|---|---|---|
| Bootstrap | `bash scripts/bootstrap.sh` | All checks pass |
| ngrok | `ngrok http 3001` | Forwarding URL printed |
| Create engine | `pnpm --filter=echo-engine create-engine` | `SPEECH_ENGINE_ID=seng_...` printed |
| Wave 1 | `/vought-spawn-wave 1` in Claude Code | 3 agents return green |
| Verify Wave 1 | smoke tests above | all 3 pass |
| Commit | `git commit -am "Wave 1 done"` | save point |
| Wave 2 | `/vought-spawn-wave 2` | 3 agents return |
| Verify Wave 2 | localhost:3000, /live/test, /onboarding/voice all boot | all 3 pages render |
| Commit | `git commit -am "Wave 2 done"` | save point |
| Wave 3 | `/vought-spawn-wave 3` | qa-verifier returns GREEN/YELLOW/RED |
| (If yellow) | fix issues per report | re-run qa-verifier until green |
| Wave 4 | `/vought-spawn-wave 4` | motion + a11y agents return |
| Deploy | `vercel --prod` per app | production URLs |
| Film + submit | follow Step 5.3 + 5.4 | hackathon submitted |

---

## One sentence summary

**Bootstrap → ngrok → Speech Engine resource → Wave 1 (commit) → Wave 2 (commit) → Wave 3 verify → Wave 4 polish (commit) → deploy → film → submit.** No skipping. No mixing. Save points between every wave. The runbook is the source of truth, the agents follow the runbook, and you follow the runbook.
