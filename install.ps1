<#
  Coding Orchestra installer for Windows (PowerShell 5.1+).
  Copies the skills into the directory your agent scans for Agent Skills.

  Usage:
    ./install.ps1                      English skills -> ~/.claude/skills (Claude Code)
    ./install.ps1 -Agent codex         -> ~/.agents/skills (Codex)
    ./install.ps1 -Agent all           both of the above
    ./install.ps1 -Lang tr             Turkish skills (also: -Tr, -En)
    ./install.ps1 -Project             install into the current project instead of your home
    ./install.ps1 -Dir PATH            install into the project at PATH
    ./install.ps1 -Skill a,b           only these skills
    ./install.ps1 -PruneLegacy         remove v1 skills that no longer exist in v2
    ./install.ps1 -Force               replace a same-named skill that is not from Coding Orchestra
    ./install.ps1 -DryRun              show what would happen, change nothing
#>
[CmdletBinding()]
param(
  [ValidateSet("claude", "codex", "all")]
  [string]$Agent = "claude",
  [ValidateSet("en", "tr")]
  [string]$Lang = "en",
  [switch]$En,
  [switch]$Tr,
  [switch]$Project,
  [string]$Dir,
  [string[]]$Skill = @(),
  [switch]$PruneLegacy,
  [switch]$Force,
  [switch]$DryRun
)

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
if ($En) { $Lang = "en" }
if ($Tr) { $Lang = "tr" }

if ($Lang -eq "tr") { $Src = Join-Path $ScriptDir "locales\tr\skills" } else { $Src = Join-Path $ScriptDir "skills" }
if (-not (Test-Path $Src)) { Write-Error "Skill source not found: $Src"; exit 1 }

$Mode = "user"
if ($Dir) { $Base = $Dir; $Mode = "project" }
elseif ($Project) { $Base = (Get-Location).Path; $Mode = "project" }
else { $Base = $HOME }
if (-not (Test-Path $Base)) { Write-Error "Directory not found: $Base"; exit 1 }

$Targets = @()
if ($Agent -eq "claude" -or $Agent -eq "all") { $Targets += (Join-Path $Base ".claude\skills") }
if ($Agent -eq "codex" -or $Agent -eq "all") { $Targets += (Join-Path $Base ".agents\skills") }

# Skills that existed in v1 and were merged or retired in v2.
$Legacy = @("general-coding", "bug-fix-refactor", "fullstack-delivery", "ui-ux-polish")

# A skill folder is ours if it carries the v2 marker or the v1 `trigger:` field.
function Test-Ours([string]$Path) {
  $file = Join-Path $Path "SKILL.md"
  if (-not (Test-Path $file)) { return $false }
  $name = Split-Path $Path -Leaf
  $text = Get-Content -LiteralPath $file -Raw -Encoding UTF8
  if ($text -match "(?m)^  source: coding-orchestra") { return $true }
  if ($text -match ("(?m)^trigger: /" + [regex]::Escape($name) + "\r?$")) { return $true }
  return $false
}

foreach ($s in $Skill) {
  if (-not (Test-Path (Join-Path (Join-Path $Src $s) "SKILL.md"))) { Write-Error "No such skill: $s"; exit 1 }
}

Write-Host "Coding Orchestra: installing $Lang skills ($Mode scope)"

foreach ($Target in $Targets) {
  Write-Host ""
  Write-Host "  -> $Target"
  if (-not $DryRun) { New-Item -ItemType Directory -Force -Path $Target | Out-Null }

  $count = 0
  foreach ($item in (Get-ChildItem -LiteralPath $Src -Directory | Sort-Object Name)) {
    $name = $item.Name
    if (-not (Test-Path (Join-Path $item.FullName "SKILL.md"))) { continue }
    if ($Skill.Count -gt 0 -and ($Skill -notcontains $name)) { continue }
    $dest = Join-Path $Target $name
    if (Test-Path $dest) {
      if (-not (Test-Ours $dest) -and -not $Force) {
        Write-Host "     skip  $name (a different skill with this name is already installed; use -Force to replace it)"
        continue
      }
      if (-not $DryRun) { Remove-Item -LiteralPath $dest -Recurse -Force -Confirm:$false }
    }
    if (-not $DryRun) { Copy-Item -LiteralPath $item.FullName -Destination $dest -Recurse -Force }
    Write-Host "     ok    $name"
    $count++
  }

  foreach ($name in $Legacy) {
    $dest = Join-Path $Target $name
    if (-not ((Test-Path $dest) -and (Test-Ours $dest))) { continue }
    if ($PruneLegacy) {
      if (-not $DryRun) { Remove-Item -LiteralPath $dest -Recurse -Force -Confirm:$false }
      Write-Host "     removed legacy skill $name"
    } else {
      Write-Host "     note  legacy v1 skill '$name' is still installed; rerun with -PruneLegacy to remove it"
    }
  }

  Write-Host "     $count skill(s) installed"
}

Write-Host ""
if ($DryRun) { Write-Host "Dry run: nothing was changed." }
Write-Host "Done. Start a new session so the agent picks the skills up."
Write-Host "Claude Code: type / to list them. Codex: type `$ or run /skills."
