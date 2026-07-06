<#
  Coding Orchestra — installer for Windows (PowerShell)
  Copies every skill into your personal Claude Code skills folder.

  Usage:
    ./install.ps1               # Turkish skills -> ~/.claude/skills (global)
    ./install.ps1 -En           # English skills (skills-en\)
    ./install.ps1 -Lang tr      # explicit language (tr = default, en)
    ./install.ps1 -Project      # install to .\.claude\skills (current project only)
    ./install.ps1 -Dir PATH     # install to a custom .claude\skills parent
#>
[CmdletBinding()]
param(
  [switch]$Project,
  [string]$Dir,
  [switch]$En,
  [ValidateSet("tr","en")]
  [string]$Lang = "tr"
)

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
if ($En) { $Lang = "en" }
$SrcName = if ($Lang -eq "en") { "skills-en" } else { "skills" }
$Src = Join-Path $ScriptDir $SrcName

if ($Project) {
  $TargetParent = Join-Path (Get-Location) ".claude"; $Mode = "project"
} elseif ($Dir) {
  $TargetParent = Join-Path $Dir ".claude"; $Mode = "custom"
} else {
  $TargetParent = Join-Path $HOME ".claude"; $Mode = "global"
}
$Target = Join-Path $TargetParent "skills"

if (-not (Test-Path $Src)) {
  Write-Error "Could not find skills\ next to this script ($Src)."
  exit 1
}

Write-Host "🎻 Coding Orchestra — installing skills"
Write-Host "   Source: $Src"
Write-Host "   Target: $Target  ($Mode)"
Write-Host ""

New-Item -ItemType Directory -Force -Path $Target | Out-Null

$count = 0
Get-ChildItem $Src -Directory | ForEach-Object {
  $skillFile = Join-Path $_.FullName "SKILL.md"
  if (Test-Path $skillFile) {
    Copy-Item $_.FullName -Destination $Target -Recurse -Force
    Write-Host "   ✓ $($_.Name)"
    $count++
  }
}

Write-Host ""
Write-Host "✅ Installed $count skills into $Target"
Write-Host "   Restart Claude Code, then type /  (or just describe your task)."
