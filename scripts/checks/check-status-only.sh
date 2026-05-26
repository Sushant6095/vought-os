#!/usr/bin/env bash
# Quick HTTP status check across all routes. No Playwright required.

WEB="http://localhost:3000"
APP="http://localhost:3001"

ROUTES_WEB=(/ /copilot /receptionist /platform /pricing /customers /security /about /contact /blog)
ROUTES_APP=(/ /live /live/test-session /onboarding/voice /settings/voice)

printf "\n%-12s %-32s %s\n" "BASE" "ROUTE" "STATUS"
echo "─────────────────────────────────────────────────────"

for r in "${ROUTES_WEB[@]}"; do
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$WEB$r" 2>/dev/null)
  case "$code" in
    200) icon="✓" ;;
    3*)  icon="↪" ;;
    4*|5*) icon="✗" ;;
    *) icon="?" ;;
  esac
  printf "%-12s %-32s %s %s\n" "$WEB" "$r" "$code" "$icon"
done

echo ""
for r in "${ROUTES_APP[@]}"; do
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$APP$r" 2>/dev/null)
  case "$code" in
    200) icon="✓" ;;
    3*)  icon="↪" ;;
    4*|5*) icon="✗" ;;
    *) icon="?" ;;
  esac
  printf "%-12s %-32s %s %s\n" "$APP" "$r" "$code" "$icon"
done

echo ""
