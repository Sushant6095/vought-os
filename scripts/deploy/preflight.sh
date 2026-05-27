#!/usr/bin/env bash
# Vought · Deploy pre-flight checks
# Runs every check the deployment-engineer agent uses, in order. Fail fast.

set +e   # don't halt on individual check failure; we collect all results

PASS=0
FAIL=0

check() {
  local name="$1"; shift
  if "$@" > /dev/null 2>&1; then
    echo "  ✓ $name"
    PASS=$((PASS+1))
  else
    echo "  ✗ $name"
    FAIL=$((FAIL+1))
  fi
}

echo
echo "══ CLI tools ══"
check "node v20+" bash -c '[ "$(node --version | sed s/v//)" \> "20" ]'
check "pnpm" pnpm --version
check "vercel" vercel --version
check "railway" railway --version
check "ffmpeg" ffmpeg -version
check "playwright" npx playwright --version

echo
echo "══ Auth ══"
check "vercel logged in" vercel whoami
check "railway logged in" railway whoami

echo
echo "══ Local services ══"
check "web on :3000" curl -fs -o /dev/null http://localhost:3000
check "app on :3001" curl -fs -o /dev/null http://localhost:3001
check "echo-engine /health" curl -fs http://localhost:3001/health
check "diart /health" curl -fs http://localhost:8000/health

echo
echo "══ Required files ══"
check "echo-engine .env" test -f services/echo-engine/.env
check "app .env.local" test -f apps/app/.env.local
check "schema.sql" test -f database/schema.sql

echo
echo "══ Required env keys ══"
check "ELEVENLABS_API_KEY" bash -c 'grep -q "^ELEVENLABS_API_KEY=sk_" services/echo-engine/.env'
check "OPENAI_API_KEY" bash -c 'grep -q "^OPENAI_API_KEY=sk-" services/echo-engine/.env'
check "SPEECH_ENGINE_ID" bash -c 'grep -q "^SPEECH_ENGINE_ID=seng_" services/echo-engine/.env'

echo
echo "════════════════════════════════════════"
echo "  Pre-flight: $PASS passed · $FAIL failed"
echo "════════════════════════════════════════"
[ $FAIL -gt 0 ] && exit 1 || exit 0
