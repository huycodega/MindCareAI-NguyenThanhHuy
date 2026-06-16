# Codex Working Notes

This repository uses a lightweight Codex activity log.

## Codex Log Rule

Whenever Codex makes a code/config/documentation change in this repo, append a
short entry to `.codex/codex-log.md` before the final response.

Use the helper when possible:

```powershell
powershell -ExecutionPolicy Bypass -File .codex/log_codex.ps1 `
  -Summary "What changed" `
  -Files "path/a, path/b" `
  -Verification "Commands/checks run" `
  -Notes "Anything the user should know"
```

If the helper cannot run, edit `.codex/codex-log.md` directly.

Keep entries concise and do not include secrets, raw PHI, API keys, or private
chat content. Prefer file paths, change summaries, command names, and test
results.

## Claude Code Log Rule

Claude Code logs automatically. A `Stop` hook in `.claude/settings.json` runs
`.claude/ai-stop-log.ps1` at the end of every turn and appends the working-tree
changes to `.claude/ai-log.md` (skips turns with no change; dedups identical
change sets). No manual action is required.

Manage or disable it via `/hooks`. The transient `.claude/.ai-log-state` file is
gitignored; `.claude/ai-log.md` is kept like `.codex/codex-log.md`.
