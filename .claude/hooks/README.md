# Hooks

Pre/post-event hooks for Claude Code. Currently configured:

- `PostToolUse(Write|Edit)` → `post-write-check.sh` runs the design token check on any file written or edited

Add more hooks via `.claude/settings.json` under the `hooks` key.
