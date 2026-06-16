param(
  [Parameter(Mandatory=$true)]
  [string]$Summary,

  [string]$Files = "",
  [string]$Verification = "",
  [string]$Notes = ""
)

$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$logPath = Join-Path $PSScriptRoot "codex-log.md"
$timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss zzz")

if (-not (Test-Path $logPath)) {
  @(
    "# Codex Activity Log",
    "",
    "Short repo-local log of changes made by Codex.",
    ""
  ) | Set-Content -LiteralPath $logPath -Encoding UTF8
}

$entry = @(
  "## $timestamp",
  "",
  "- Summary: $Summary"
)

if ($Files.Trim().Length -gt 0) {
  $entry += "- Files: $Files"
}

if ($Verification.Trim().Length -gt 0) {
  $entry += "- Verification: $Verification"
}

if ($Notes.Trim().Length -gt 0) {
  $entry += "- Notes: $Notes"
}

$entry += ""
Add-Content -LiteralPath $logPath -Value $entry -Encoding UTF8
