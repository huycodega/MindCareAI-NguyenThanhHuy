# Claude Code auto activity logger (Stop hook).
# 1) Appends working-tree changes to .claude/ai-log.md (local, deduped).
# 2) POSTs the same change set to the instructor AI-log ingest server
#    (config read from .env at runtime: AI_LOG_SERVER, AI_LOG_API_KEY).
# Never blocks the session: all network/IO failures are swallowed.

$ErrorActionPreference = "SilentlyContinue"

$repoRoot  = Split-Path -Parent $PSScriptRoot          # .claude -> repo root
$logPath   = Join-Path $PSScriptRoot "ai-log.md"
$statePath = Join-Path $PSScriptRoot ".ai-log-state"
$webLast   = Join-Path $PSScriptRoot ".ai-log-web-last.json"

# --- Current working-tree changes (drop the log's own .claude/ artifacts) ---
$porcelain = & git -C $repoRoot status --porcelain |
  Where-Object { $_ -notmatch '\.claude[/\\]' }
if (-not $porcelain) { exit 0 }                        # nothing changed -> skip

$current = ($porcelain | Out-String).Trim()

# --- Dedup: skip if the change set is identical to the last logged snapshot ---
if (Test-Path $statePath) {
  $prev = (Get-Content -LiteralPath $statePath -Raw).Trim()
  if ($prev -eq $current) { exit 0 }
}

$stamp   = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss zzz")   # human, for .md
$stampIso = (Get-Date).ToString("yyyy-MM-ddTHH:mm:sszzz")   # ISO, for server

# Clean file paths (strip the "XY " porcelain status prefix)
$fileList = $porcelain | ForEach-Object {
  $line = $_.TrimEnd()
  if ($line.Length -gt 3) { $line.Substring(3).Trim().Trim('"') }
} | Where-Object { $_ }

# ---------------------------- 1) Local markdown ----------------------------
if (-not (Test-Path $logPath)) {
  @(
    "# Claude AI Activity Log",
    "",
    "Auto-generated repo-local log of working-tree changes during Claude Code sessions.",
    "Written by .claude/ai-stop-log.ps1 (Stop hook). Mirrored to the AI-log server.",
    ""
  ) | Set-Content -LiteralPath $logPath -Encoding UTF8
}

$mdFiles = $fileList | ForEach-Object { "  - $_" }
$entryMd = @("## $stamp", "", "- Changed files:") + $mdFiles + @("")
Add-Content -LiteralPath $logPath -Value $entryMd -Encoding UTF8

# ------------------------ 2) Push to ingest server -------------------------
# Read AI_LOG_* from .env (not exported into the hook environment).
$server = $null; $apiKey = $null
$envPath = Join-Path $repoRoot ".env"
if (Test-Path $envPath) {
  foreach ($l in (Get-Content -LiteralPath $envPath)) {
    if ($l -match '^\s*AI_LOG_SERVER\s*=\s*(.+)$')      { $server = $matches[1].Trim().Trim('"') }
    elseif ($l -match '^\s*AI_LOG_API_KEY\s*=\s*(.+)$') { $apiKey = $matches[1].Trim().Trim('"') }
  }
}

if ($server -and $apiKey) {
  # Repo identifier the server validates against (GitHub repo name).
  $remote = & git -C $repoRoot config --get remote.origin.url
  if ($remote) { $repo = [IO.Path]::GetFileNameWithoutExtension(($remote -replace '/+$','')) }
  else         { $repo = Split-Path $repoRoot -Leaf }

  $summary = "Claude Code: $($fileList.Count) changed file(s) in working tree"
  $commit = (& git -C $repoRoot rev-parse HEAD)

  # Build JSON by hand so single-element arrays stay arrays (PS 5.1 quirk),
  # using ConvertTo-Json per scalar for correct escaping.
  function J([string]$s) { if ($null -eq $s) { '""' } else { $s | ConvertTo-Json } }
  $filesJson = "[" + (($fileList | ForEach-Object { $_ | ConvertTo-Json }) -join ",") + "]"
  $entry = "{" +
    "`"repo`":$(J $repo)," +
    "`"commit`":$(J $commit)," +
    "`"tool`":`"claude`"," +
    "`"event`":`"Stop`"," +
    "`"timestamp`":$(J $stampIso)," +
    "`"summary`":$(J $summary)," +
    "`"files`":$filesJson" +
  "}"
  $json = "{`"entries`":[$entry]}"

  try {
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    $resp = Invoke-RestMethod -Uri $server -Method Post `
      -Headers @{ Authorization = "Bearer $apiKey" } `
      -ContentType "application/json" -Body $json -TimeoutSec 15
    ($resp | ConvertTo-Json -Compress) | Set-Content -LiteralPath $webLast -Encoding UTF8
  } catch {
    "POST failed @ ${stampIso}: $($_.Exception.Message)" | Set-Content -LiteralPath $webLast -Encoding UTF8
  }
}

Set-Content -LiteralPath $statePath -Value $current -Encoding UTF8
exit 0
