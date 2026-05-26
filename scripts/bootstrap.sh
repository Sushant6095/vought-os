#!/usr/bin/env bash
set -euo pipefail

echo "→ Vought bootstrap"
echo

# Node check
if ! command -v node &> /dev/null; then
  echo "✗ Node not found. Install Node 20+ first: brew install node@20"
  exit 1
fi
NODE_VERSION=$(node --version | sed 's/v//' | cut -d. -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
  echo "✗ Node 20+ required, found v$NODE_VERSION"
  exit 1
fi
echo "✓ Node $(node --version)"

# Python check
if ! command -v python3 &> /dev/null; then
  echo "✗ Python 3.11+ required. Install: brew install python@3.11"
  exit 1
fi
echo "✓ Python $(python3 --version | awk '{print $2}')"

# pnpm check
if ! command -v pnpm &> /dev/null; then
  echo "→ Installing pnpm globally..."
  npm install -g pnpm@9
fi
echo "✓ pnpm $(pnpm --version)"

# Postgres + Redis check
command -v psql > /dev/null && echo "✓ Postgres found" || echo "⚠  Postgres not found, install: brew install postgresql@15"
command -v redis-cli > /dev/null && echo "✓ Redis found" || echo "⚠  Redis not found, install: brew install redis"

# Install workspace
echo
echo "→ Installing workspace dependencies..."
pnpm install

# Set up Python service
echo
echo "→ Setting up diarization sidecar Python venv..."
cd services/diarization-sidecar
if [ ! -d .venv ]; then
  python3 -m venv .venv
fi
source .venv/bin/activate
pip install -r requirements.txt -q
deactivate
cd - > /dev/null

# Env files
echo
echo "→ Env files..."
[ ! -f services/echo-engine/.env ] && cp services/echo-engine/.env.example services/echo-engine/.env && echo "✓ Created services/echo-engine/.env (edit to add API keys)"

echo
echo "✓ Bootstrap complete."
echo
echo "Next steps:"
echo "  1. Edit services/echo-engine/.env — add ELEVENLABS_API_KEY, OPENAI_API_KEY"
echo "  2. Boot infra:    docker-compose -f infra/docker-compose.yml up -d"
echo "  3. Start ngrok:   ngrok http 3001"
echo "  4. Set PUBLIC_WS_URL in services/echo-engine/.env"
echo "  5. Create Speech Engine:  pnpm --filter=echo-engine create-engine"
echo "  6. Copy seng_... ID into env files"
echo "  7. Start all services:  pnpm dev"
echo
echo "Or just run /vought-spawn-wave 1 in Claude Code to build wave 1 in parallel."
