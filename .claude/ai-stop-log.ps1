# Claude Code auto activity logger (Stop hook).
# Appends a short entry to .claude/ai-log.md listing the files changed in the
# working tree. Only writes when there are real changes, and dedups against the
# previous snapshot so identical turns are not logged twice.

$ErrorActionPreference = "SilentlyContinue"

$repoRoot  = Split-Path -Parent $PSScriptRoot          # .claude -> repo root
$logPath   = Join-Path $PSScriptRoot "ai-log.md"
$statePath = Join-Path $PSScriptRoot ".ai-log-state"

# Current working-tree changes (porcelain = stable, script-friendly format).
# Drop the log's own artifacts under .claude/ so they don't cause self-churn.
$porcelain = & git -C $repoRoot status --porcelain |
  Where-Object { $_ -notmatch '\.claude[/\\]' }
if (-not $porcelain) { exit 0 }                        # nothing changed -> skip

$current = ($porcelain | Out-String).Trim()

# Dedup: skip if the change set is identical to the last logged snapshot
if (Test-Path $statePath) {
  $prev = (Get-Content -LiteralPath $statePath -Raw).Trim()
  if ($prev -eq $current) { exit 0 }
}

$timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss zzz")

# Initialize the log file with a header on first run
if (-not (Test-Path $logPath)) {
  @(
    "# Claude AI Activity Log",
    "",
    "Auto-generated repo-local log of working-tree changes during Claude Code sessions.",
    "Written by .claude/ai-stop-log.ps1 (Stop hook). Do not store secrets here.",
    ""
  ) | Set-Content -LiteralPath $logPath -Encoding UTF8
}

$files = $porcelain | ForEach-Object { "  - " + ($_.Trim()) }

$entry = @("## $timestamp", "", "- Changed files:") + $files + @("")

Add-Content -LiteralPath $logPath -Value $entry -Encoding UTF8
Set-Content -LiteralPath $statePath -Value $current -Encoding UTF8
exit 0
