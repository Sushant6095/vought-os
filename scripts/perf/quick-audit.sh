#!/usr/bin/env bash
# Quick Lighthouse pulse check across critical routes. No Playwright.
# Run with WEB_BASE / APP_BASE env vars for production.

WEB="${WEB_BASE:-http://localhost:3000}"
APP="${APP_BASE:-http://localhost:3001}"

OUT="scripts/perf/lighthouse"
mkdir -p "$OUT"

ROUTES=(
  "$WEB|/|landing"
  "$WEB|/copilot|copilot"
  "$WEB|/pricing|pricing"
  "$APP|/live/test-session|live"
)

echo
printf "%-25s %-6s %-6s %-6s %-6s %-7s %-6s\n" "ROUTE" "PERF" "A11Y" "BP" "SEO" "LCP" "CLS"
echo "────────────────────────────────────────────────────────────────────────"

for entry in "${ROUTES[@]}"; do
  IFS='|' read -r base path slug <<< "$entry"
  url="${base}${path}"
  out="$OUT/${slug}.json"

  npx --yes lighthouse "$url" \
    --only-categories=performance,accessibility,best-practices,seo \
    --output=json \
    --output-path="$out" \
    --quiet \
    --chrome-flags="--headless" 2>/dev/null

  if [ -f "$out" ]; then
    perf=$(jq -r '.categories.performance.score * 100 | floor' "$out")
    a11y=$(jq -r '.categories.accessibility.score * 100 | floor' "$out")
    bp=$(jq -r '.categories["best-practices"].score * 100 | floor' "$out")
    seo=$(jq -r '.categories.seo.score * 100 | floor' "$out")
    lcp=$(jq -r '.audits["largest-contentful-paint"].numericValue | floor' "$out")
    cls=$(jq -r '.audits["cumulative-layout-shift"].numericValue' "$out")
    printf "%-25s %-6s %-6s %-6s %-6s %-7s %-6s\n" "$path" "$perf" "$a11y" "$bp" "$seo" "${lcp}ms" "$cls"
  else
    printf "%-25s %s\n" "$path" "AUDIT FAILED"
  fi
done

echo
echo "Targets:  Marketing Perf ≥95 / LCP ≤1200ms / CLS ≤0.05"
echo "          App       Perf ≥90 / LCP ≤1600ms / CLS ≤0.1"
echo
echo "Full reports: $OUT/<slug>.json"
