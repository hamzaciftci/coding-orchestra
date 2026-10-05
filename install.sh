#!/usr/bin/env bash
#
# Coding Orchestra installer for macOS / Linux / Git Bash.
# Copies the skills into the directory your agent scans for Agent Skills.
#
# Usage:
#   ./install.sh                      English skills -> ~/.claude/skills (Claude Code)
#   ./install.sh --agent codex        -> ~/.agents/skills (Codex)
#   ./install.sh --agent all          both of the above
#   ./install.sh --lang tr            Turkish skills (also: --tr, --en)
#   ./install.sh --project            install into the current project instead of your home
#   ./install.sh --dir PATH           install into the project at PATH
#   ./install.sh --skill NAME         only this skill (repeatable)
#   ./install.sh --prune-legacy       remove v1 skills that no longer exist in v2
#   ./install.sh --force              replace a same-named skill that is not from Coding Orchestra
#   ./install.sh --dry-run            show what would happen, change nothing
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

AGENT="claude"
LANG_CODE="en"
BASE=""
MODE="user"
PRUNE=0
FORCE=0
DRY=0
ONLY=()

while [[ $# -gt 0 ]]; do
  case "$1" in
    --agent)        AGENT="${2:?--agent needs a value}"; shift 2 ;;
    --lang)         LANG_CODE="${2:?--lang needs a value}"; shift 2 ;;
    --en)           LANG_CODE="en"; shift ;;
    --tr)           LANG_CODE="tr"; shift ;;
    --project)      BASE="$(pwd)"; MODE="project"; shift ;;
    --dir)          BASE="${2:?--dir needs a path}"; BASE="${BASE%/}"; MODE="project"; shift 2 ;;
    --skill)        ONLY+=("${2:?--skill needs a name}"); shift 2 ;;
    --prune-legacy) PRUNE=1; shift ;;
    --force)        FORCE=1; shift ;;
    --dry-run)      DRY=1; shift ;;
    -h|--help)      sed -n '2,16p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) echo "Unknown option: $1 (try --help)" >&2; exit 1 ;;
  esac
done

case "$LANG_CODE" in
  en) SRC="$SCRIPT_DIR/skills" ;;
  tr) SRC="$SCRIPT_DIR/locales/tr/skills" ;;
  *)  echo "Unknown language: $LANG_CODE (use en or tr)" >&2; exit 1 ;;
esac
[[ -d "$SRC" ]] || { echo "Skill source not found: $SRC" >&2; exit 1; }

[[ -n "$BASE" ]] || BASE="$HOME"
[[ -d "$BASE" ]] || { echo "Directory not found: $BASE" >&2; exit 1; }

TARGETS=()
case "$AGENT" in
  claude) TARGETS=("$BASE/.claude/skills") ;;
  codex)  TARGETS=("$BASE/.agents/skills") ;;
  all)    TARGETS=("$BASE/.claude/skills" "$BASE/.agents/skills") ;;
  *)      echo "Unknown agent: $AGENT (use claude, codex or all)" >&2; exit 1 ;;
esac

# Skills that existed in v1 and were merged or retired in v2.
LEGACY=(general-coding bug-fix-refactor fullstack-delivery ui-ux-polish)

# A skill folder is ours if it carries the v2 marker or the v1 `trigger:` field.
is_ours() {
  local file="$1/SKILL.md" name
  name="$(basename "$1")"
  [[ -f "$file" ]] || return 1
  grep -q "^  source: coding-orchestra" "$file" 2>/dev/null && return 0
  grep -q "^trigger: /$name\$" "$file" 2>/dev/null && return 0
  return 1
}

run() { if [[ $DRY -eq 1 ]]; then echo "     (dry run) $*"; else "$@"; fi; }

wanted() {
  [[ ${#ONLY[@]} -eq 0 ]] && return 0
  local s
  for s in "${ONLY[@]}"; do [[ "$s" == "$1" ]] && return 0; done
  return 1
}

for s in ${ONLY[@]+"${ONLY[@]}"}; do
  [[ -f "$SRC/$s/SKILL.md" ]] || { echo "No such skill: $s" >&2; exit 1; }
done

echo "Coding Orchestra: installing $LANG_CODE skills ($MODE scope)"

for TARGET in "${TARGETS[@]}"; do
  echo ""
  echo "  -> $TARGET"
  run mkdir -p "$TARGET"

  count=0
  for dir in "$SRC"/*/; do
    dir="${dir%/}"
    name="$(basename "$dir")"
    [[ -f "$dir/SKILL.md" ]] || continue
    wanted "$name" || continue
    dest="$TARGET/$name"
    if [[ -e "$dest" ]]; then
      if ! is_ours "$dest" && [[ $FORCE -eq 0 ]]; then
        echo "     skip  $name (a different skill with this name is already installed; use --force to replace it)"
        continue
      fi
      run rm -rf "$dest"
    fi
    run cp -R "$dir" "$dest"
    echo "     ok    $name"
    count=$((count + 1))
  done

  for name in "${LEGACY[@]}"; do
    dest="$TARGET/$name"
    [[ -d "$dest" ]] && is_ours "$dest" || continue
    if [[ $PRUNE -eq 1 ]]; then
      run rm -rf "$dest"
      echo "     removed legacy skill $name"
    else
      echo "     note  legacy v1 skill '$name' is still installed; rerun with --prune-legacy to remove it"
    fi
  done

  echo "     $count skill(s) installed"
done

echo ""
echo "Done. Start a new session so the agent picks the skills up."
echo "Claude Code: type / to list them. Codex: type \$ or run /skills."
