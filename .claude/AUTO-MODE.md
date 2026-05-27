# Auto Mode · Skip Permissions

This repo is configured for **multi-agent auto mode**. Agents spawned via the Task tool inherit the project's permission settings and run without prompting on common tool calls.

## What's allowed without prompting

Every read, write, edit, glob, grep, and TodoWrite call inside the project directory. Plus standard build tools and platform CLIs:

| Category | Allowed |
|---|---|
| File operations | Read / Write / Edit / MultiEdit / NotebookEdit on any project path |
| Search | Glob / Grep across the repo |
| Package managers | npm, npx, pnpm, yarn, pip, uv |
| Language runtimes | node, tsx, python3 |
| Voice stack | ngrok, huggingface-cli, ffmpeg, ffprobe, uvicorn |
| Databases | psql, createdb, redis-cli |
| Cloud platform CLIs | vercel, railway, flyctl, modal, supabase, gh |
| Browser automation | playwright, lighthouse, unlighthouse, axe |
| Git | status, diff, log, branch, checkout, add, commit, pull, stash, tag, remote, init, config |
| Shell | ls, cat, cp, mv, mkdir, touch, chmod, echo, find, grep, sed, awk, jq, tar, unzip, tree, open |
| WebFetch | ElevenLabs, OpenAI, Anthropic, GitHub, HuggingFace, Vercel, Railway, Neon, Upstash + reference sites |

## What's blocked (won't even ask — hard deny)

| Category | Blocked |
|---|---|
| Mass deletion | `rm -rf /`, `rm -rf ~`, `rm -rf /etc`, etc. |
| Privilege escalation | `sudo` anything |
| Piped shell from network | `curl ... \| sh`, `wget ... \| bash` |
| Destructive git | `git push --force`, `git reset --hard HEAD~N` |
| Database destruction | `dropdb`, `DROP DATABASE` |
| Secret reads | `.env`, `.env.local`, `.env.production`, `*.pem`, `*.key`, `*credentials*`, `~/.ssh/`, `~/.aws/` |
| Secret writes | Same paths, blocked for Write/Edit too |
| Package publishing | `npm publish`, `pnpm publish` |
| Deploy teardown | `vercel remove`, `railway down`, `railway delete` |

## What's NOT blocked (be careful)

Auto mode trusts agents with:
- `git commit` (agents can commit anything they wrote)
- `vercel --prod` and `railway up` (agents can deploy to your accounts if logged in)
- Long-running processes (`pnpm dev`, `uvicorn`) — may need manual kill
- API calls that cost money (OpenAI, ElevenLabs, Anthropic) — agents will use them freely

If you want tighter control on these, copy `.claude/settings.local.json.example` to `.claude/settings.local.json` and add them to the `ask` array.

## How to revert to prompting mode

```bash
# Restore the previous settings (created when auto-mode was enabled)
cp .claude/settings.json.backup .claude/settings.json
```

Or edit `.claude/settings.json` and change `"defaultMode": "acceptEdits"` to `"defaultMode": "default"`.

## How to disable auto mode for a single Claude Code session

Start Claude Code with the no-skip flag:

```bash
claude --permission-prompts
# or
CLAUDE_NO_AUTO=1 claude
```

This overrides project settings for that session only.

## How sub-agents inherit permissions

When the orchestrator spawns a subagent via the Task tool, the subagent inherits the project's permission set. This means:

- A wave-1 subagent CAN write to `packages/design-system/` without asking
- A wave-8 subagent CAN run `railway up` without asking
- A wave-2 subagent CANNOT read your `.env` file (denied for all)

Subagents do not have access to your `~/.ssh`, `~/.aws`, or other home-dir secrets. They are scoped to the project directory plus the explicit additional directories listed in settings.

## Hooks still run

The PostToolUse hook (`post-write-check.sh`) still runs after every Write/Edit/MultiEdit, regardless of auto mode. It checks for token drift and forbidden phrases in any file touched. Non-blocking — warnings are printed but the action proceeds.

## Trust model summary

Auto mode is appropriate when:
- You're in a sprint and want the swarm to operate at full speed
- You trust the prompts you're feeding the agents
- You have git as your safety net (commits between waves = save points)
- You're willing to review the work after, not during

Auto mode is NOT appropriate when:
- You're on a shared machine
- You're running unfamiliar third-party agents
- You're operating against production systems you can't easily roll back
- You don't want to monitor what the swarm is doing

## Hackathon mode recommendation

For the next 48 hours: leave auto mode ON. Commit between waves so you have rollback points. Don't worry about prompts.

After the hackathon: revert to default mode for normal development.
