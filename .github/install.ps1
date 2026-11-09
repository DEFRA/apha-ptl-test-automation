# Install or update the E2E agent pack in a repository.
# Usage: powershell -ExecutionPolicy Bypass -File install.ps1 -Repo C:\path\to\repo
#
# - Copies github/* into <repo>\.github\ (agents, instructions, skills).
# - Backs up any file it would overwrite, under .github\.backup-<timestamp>\.
# - Merges ignore.txt into <repo>\.gitignore (the mechanism that blocks commits) and into
#   <repo>\.copilotignore for editors that read it.
# - Installs vscode\settings.json as <repo>\.vscode\settings.json, so the agents stop prompting for
#   their own commands. Never overwrites an existing settings file: writes settings.pack.json instead.
param([Parameter(Mandatory = $true)][string]$Repo)

$ErrorActionPreference = 'Stop'
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not (Test-Path $Repo -PathType Container)) { throw "Not a folder: $Repo" }
$source = Join-Path $here 'github'
if (-not (Test-Path $source)) { throw "No github folder next to install.ps1" }

$dest = Join-Path $Repo '.github'
New-Item -ItemType Directory -Force -Path $dest | Out-Null

$files = Get-ChildItem -Path $source -Recurse -File | Where-Object { $_.Name -ne '.DS_Store' }

# 1. Back up anything that would be replaced.
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$backup = Join-Path $dest ".backup-$stamp"
$backedUp = 0
foreach ($file in $files) {
  $rel = $file.FullName.Substring($source.Length).TrimStart('\', '/')
  $target = Join-Path $dest $rel
  # Only back up a file whose content actually differs, so a re-run stays quiet.
  $differs = (Test-Path $target) -and ((Get-FileHash $target).Hash -ne (Get-FileHash $file.FullName).Hash)
  if ($differs) {
    $targetDir = Split-Path -Parent $target
    New-Item -ItemType Directory -Force -Path $targetDir | Out-Null
    Copy-Item -Path $target -Destination (Join-Path $backup $rel) -Force -ErrorAction SilentlyContinue
    $backedUp++
  }
}

# 2. Copy.
foreach ($file in $files) {
  $rel = $file.FullName.Substring($source.Length).TrimStart('\', '/')
  $target = Join-Path $dest $rel
  $targetDir = Split-Path -Parent $target
  New-Item -ItemType Directory -Force -Path $targetDir | Out-Null
  Copy-Item -Path $file.FullName -Destination $target -Force
}

# 3. Merge ignore patterns, idempotently.
function Merge-Ignore([string]$Target, [string]$SourceFile) {
  if (-not (Test-Path $Target)) { New-Item -ItemType File -Path $Target | Out-Null }
  $existing = @(Get-Content $Target -ErrorAction SilentlyContinue)
  $added = 0
  foreach ($line in Get-Content $SourceFile) {
    if ([string]::IsNullOrWhiteSpace($line) -or $line.StartsWith('#')) { continue }
    if ($existing -notcontains $line) {
      Add-Content -Path $Target -Value $line
      $existing += $line
      $added++
    }
  }
  Write-Host "  $Target : $added new pattern(s)"
}

Merge-Ignore (Join-Path $Repo '.gitignore') (Join-Path $here 'ignore.txt')
Merge-Ignore (Join-Path $Repo '.copilotignore') (Join-Path $here 'ignore.txt')

# 4. Workspace approval settings: the difference between a finished run and two days of prompts.
$settingsSource = Join-Path $here 'vscode\settings.json'
if (Test-Path $settingsSource) {
  $settingsDir = Join-Path $Repo '.vscode'
  $settingsTarget = Join-Path $settingsDir 'settings.json'
  New-Item -ItemType Directory -Force -Path $settingsDir | Out-Null
  if (Test-Path $settingsTarget) {
    Copy-Item $settingsSource (Join-Path $settingsDir 'settings.pack.json') -Force
    Write-Host "  .vscode\settings.json already exists: merge .vscode\settings.pack.json into it (approvals)."
  } else {
    Copy-Item $settingsSource $settingsTarget -Force
    Write-Host "  .vscode\settings.json: workspace approvals installed."
  }
}

Write-Host "Installed to $dest"
if ($backedUp -gt 0) { Write-Host "  backed up $backedUp existing file(s) to $backup" }
Write-Host "Next: open the repository in VS Code, select the e2e-architect agent, and read v2\README.md."
