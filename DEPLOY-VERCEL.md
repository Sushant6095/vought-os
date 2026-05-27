# Vought · Vercel Deploy Guide (self-serve)

Deploy the two Next.js frontends to Vercel. ~10 min. Free Hobby tier, no card.

> **Scope:** This puts the **marketing site** and the **product app shell** live on public URLs.
> The **live voice loop** needs the echo-engine deployed + the ElevenLabs Speech Engine
> repointed — that's a separate backend step (see "What this does NOT cover" at the bottom).

---

## 0 · Prereqs (already done)

- `vercel` CLI authed as **sushant6095** (`vercel whoami` ✓)
- `apps/app` already linked to project **vought-app** (`.vercel/project.json` exists)

If you ever need to re-auth: `vercel login`.

---

## ⚠️ The one monorepo rule

This is a **pnpm + Turborepo** monorepo. The apps depend on workspace packages
(`@vought/design-system`, `@vought/motion`, `@vought/ui`). So:

- **Always run `vercel` from inside the app directory** (`apps/app` or `apps/web`).
- Vercel auto-detects the pnpm workspace at the repo root and installs from there, so the
  `@vought/*` packages resolve. Don't run it from the repo root.
- `packageManager: pnpm@9.12.0` is declared in the root `package.json`, so Vercel uses pnpm
  automatically.

---

## 1 · Deploy the PRODUCT APP (apps/app) — do this first

It's first because the marketing site bakes the app's URL in at build time.

```bash
cd /Users/vyapar/Downloads/vought/apps/app

# --- set the 2 required secrets (reads values from your .env.local, no copy/paste) ---
grep '^ELEVENLABS_API_KEY=' .env.local | cut -d= -f2- | tr -d '\n' | vercel env add ELEVENLABS_API_KEY production
grep '^SPEECH_ENGINE_ID='   .env.local | cut -d= -f2- | tr -d '\n' | vercel env add SPEECH_ENGINE_ID production
# (Skip NEXT_PUBLIC_DIARIZATION_WS_URL — diart is deferred. The app handles its absence.)

# --- deploy to production ---
vercel --prod
```

The last line of output is your deployment URL. The stable alias will be
**https://vought-app.vercel.app** (or `vought-app-<something>.vercel.app` if that name is taken).

**Copy the app URL — you need it in step 2.**

Verify:
```bash
curl -s -o /dev/null -w "%{http_code}\n" https://vought-app.vercel.app
# expect 200
```

---

## 2 · Deploy the MARKETING SITE (apps/web)

```bash
cd /Users/vyapar/Downloads/vought/apps/web

# link as a new project
vercel link --project vought-web --yes

# point it at the app URL from step 1 (build-time var — MUST be set before deploy)
echo "https://vought-app.vercel.app" | vercel env add NEXT_PUBLIC_APP_URL production

# OPTIONAL: the marketing site reads VOUGHT_API_KEY for its demo/API features.
# If you have a value, set it; otherwise skip and those bits degrade gracefully.
# echo "your_value" | vercel env add VOUGHT_API_KEY production

# deploy
vercel --prod
```

Stable alias: **https://vought-web.vercel.app**

Verify a few routes:
```bash
for r in / /copilot /receptionist /platform /pricing /security /about /contact /blog /docs; do
  echo "  $r -> $(curl -s -o /dev/null -w '%{http_code}' https://vought-web.vercel.app$r)"
done
```

---

## 3 · Re-deploying later (after code changes)

```bash
cd apps/app   # or apps/web
vercel --prod
```

To change an env var: `vercel env rm NAME production` then `vercel env add NAME production`,
then redeploy. (NEXT_PUBLIC_* vars only take effect after a fresh `vercel --prod`.)

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| Build fails: `Cannot find module '@vought/design-system'` | You ran `vercel` from the repo root. `cd` into the app dir and retry. If it persists, in the Vercel dashboard → project → Settings → check **Root Directory** = `apps/app` (or `apps/web`) and **Include files outside root directory** = ON. |
| Build fails: wrong package manager | Confirm root `package.json` has `"packageManager": "pnpm@9.12.0"`. Vercel reads this. |
| `/live` or `/onboarding` errors at runtime | The 2 secrets aren't set on **Production**. Re-check `vercel env ls`. |
| Marketing "Open app" links point to `undefined` | `NEXT_PUBLIC_APP_URL` wasn't set before the web build. Set it, then `vercel --prod` again. |
| Wrong production URL / name taken | `vercel ls` shows your deployments. The `*.vercel.app` namespace is global; if `vought-app` is taken you'll get a suffixed alias — just use whatever URL Vercel prints. |

---

## What this does NOT cover (the backend / live voice loop)

The deployed app can mint ElevenLabs tokens, but the actual whisper loop only works once the
**echo-engine** (a persistent WebSocket server) is live somewhere and the **ElevenLabs Speech
Engine resource** is repointed to it. Vercel can't host that server. Plan (free, no card):

1. **Neon** (Postgres + pgvector) — run `database/schema.sql`, get `DATABASE_URL`
2. **Upstash** (Redis) — get `REDIS_URL`
3. **Render** free web service — deploy `services/echo-engine` from GitHub
   (build `npm install && npm run build`, start `npm start`, health `/health`)
4. Repoint the Speech Engine resource to `wss://<render-url>/ws`
5. **cron-job.org** keepalive ping → Render free tier sleeps after 15 min idle

Tell me when the two Vercel URLs are live and I'll drive that backend half (and the
Speech Engine repoint, which is the fragile step), then run the prod smoke test + Lighthouse.
