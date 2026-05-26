#!/usr/bin/env bash
# Post-write hook: run quick design-token sanity check on the file just written.
# Silent on success, prints violations on failure. Does not block the operation.

FILE="${1:-}"
[ -z "$FILE" ] && exit 0

# Only check source files in apps/ or packages/
case "$FILE" in
  *apps/*|*packages/*)
    # Quick checks
    if grep -nE '#[0-9a-fA-F]{3,8}\b' "$FILE" 2>/dev/null | grep -v -E '(tokens\.ts|tailwind\.config\.ts|icon.*\.svg)'; then
      echo "⚠  Hard-coded hex color in $FILE — use design tokens (vault/20 · Design System/Tokens · Color.md)"
    fi
    if grep -nE 'AI-powered|supercharge|10x|revolutioniz' "$FILE" 2>/dev/null; then
      echo "⚠  Forbidden phrase in $FILE — see vault/10 · Strategy/Brand Voice.md"
    fi
    ;;
esac
exit 0
