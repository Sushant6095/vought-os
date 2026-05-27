#!/usr/bin/env bash
# Toggle between auto mode (acceptEdits) and default prompt mode.

cd "$(dirname "$0")/.."

if [ ! -f .claude/settings.json ]; then
  echo "✗ .claude/settings.json not found"
  exit 1
fi

CURRENT_MODE=$(grep -o '"defaultMode"[[:space:]]*:[[:space:]]*"[^"]*"' .claude/settings.json | head -1 | grep -oE '"[^"]+"$' | tr -d '"')

if [ "$CURRENT_MODE" = "acceptEdits" ]; then
  sed -i.bak 's/"defaultMode": "acceptEdits"/"defaultMode": "default"/' .claude/settings.json
  rm -f .claude/settings.json.bak
  echo "✓ Switched to DEFAULT mode — Claude Code will prompt for sensitive actions"
else
  sed -i.bak 's/"defaultMode": "default"/"defaultMode": "acceptEdits"/' .claude/settings.json
  rm -f .claude/settings.json.bak
  echo "✓ Switched to AUTO mode (acceptEdits) — agents run unattended"
fi

echo
echo "Current settings:"
grep -E '"defaultMode"' .claude/settings.json
echo
echo "Restart Claude Code for changes to take effect."
