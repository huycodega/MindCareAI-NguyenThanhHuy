# Starter Code Template — Cohort 2

Empty starter template for AI20K Build Cohort 2 team repositories. Includes pre-configured AI usage logging hooks for Claude Code, Cursor, Codex, Gemini CLI, Antigravity, and GitHub Copilot.

## Structure

```
├── scripts/
│   ├── _pyrun.sh             # Cross-platform Python launcher (bash)
│   ├── _pyrun.cmd            # Cross-platform Python launcher (Windows)
│   ├── setup_hooks.sh        # One-time pre-push hook installer (POSIX)
│   ├── setup_hooks.ps1       # One-time pre-push hook installer (Windows)
│   ├── log_hook.py           # AI tool hook handler (Claude / Cursor / Codex / Gemini / Copilot)
│   ├── log_antigravity.py    # Auto-log hook for Antigravity
│   ├── log_manual.py         # Manual log for ChatGPT / web tools
│   └── submit_log.py         # Submits logs on git push
├── .agents/                  # Antigravity rules + workflows
├── .claude/  .codex/  .cursor/  .gemini/  .github/hooks/   # Per-tool hook configs
├── .env.example
├── JOURNAL.md                # Weekly journal — product journey & learnings
└── WORKLOG.md                # Technical decisions, task assignments, brainstorming
```

## Getting Started

### 1. Clone and install pre-push hook

**Linux / macOS / Git Bash:**
```bash
git clone <repo-url>
cd <repo>
bash scripts/setup_hooks.sh
```

**Windows PowerShell:**
```powershell
git clone <repo-url>
cd <repo>
powershell -ExecutionPolicy Bypass -File scripts\setup_hooks.ps1
```

### 2. Configure environment

```bash
cp .env.example .env       # macOS / Linux / Git Bash
# copy .env.example .env   # Windows cmd
```

Fill in `AI_LOG_SERVER` and `AI_LOG_API_KEY` (provided by the course).

### 3. Build your project

This is an empty starter — pick any language/framework. The hooks are language-agnostic; they only need Python on the host (any of `python3`, `python`, or `py` works).

## Weekly Journal

Update **[JOURNAL.md](./JOURNAL.md)** at the end of every week:

- Features shipped
- AI tools used and how they helped
- Hardest problem of the week and how you solved it
- What you'd do differently
- Plan for next week

> JOURNAL.md **must be updated** before each PR — it is your learning record for the course.

## Worklog

Update **[WORKLOG.md](./WORKLOG.md)** whenever your team makes a technical decision or changes direction:

- **Technical decisions** — why this approach over alternatives?
- **Task assignments** — who does what, by when
- **Brainstorming** — options considered, pros / cons, conclusion
- **Important bugs** — root cause and fix

## AI Logging

Prompts and tool calls are **automatically logged** when you use any supported AI tool (Claude Code, Cursor, Codex, Gemini, Antigravity, Copilot). No manual steps needed after running `setup_hooks`.

For ChatGPT or other web tools, log manually:

```bash
# POSIX
bash scripts/_pyrun.sh scripts/log_manual.py --tool chatgpt --prompt "<what you did>"

# Windows
scripts\_pyrun.cmd scripts\log_manual.py --tool chatgpt --prompt "<what you did>"
```

### Python requirements

The hook system needs **one** of: `python3`, `python`, or `py` on PATH.

| OS | Recommended install |
|---|---|
| Windows | Python 3 from [python.org](https://www.python.org/downloads/) — installer adds both `python` and `py` to PATH |
| Ubuntu / Debian | `sudo apt install python3` (already preinstalled on most distros) |
| macOS | `brew install python3` or use system Python 3 |

The `scripts/_pyrun.*` wrappers detect whichever is available — students do not need to alias `python3` → `python`.

---

## Gate 1

| Resource | Link |
|---|---|
| Project Brief | [Notion — Project Brief](https://www.notion.so/Project-Brief-378534a1531380ae93cad798fff87fdc?source=copy_link) |
| PRD (EduVault) | [Notion — PRD_EduVault](https://www.notion.so/PRD_EduVault-378534a15313807b8e4fc30feaf83043?source=copy_link) |
| Wireframe / UI Flow | [Google Drive](https://drive.google.com/file/d/1O-7x5yfBniNPIQPw9KyfbYuHF5C76d81/view?usp=sharing) |
