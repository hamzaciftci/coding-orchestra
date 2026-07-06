#!/usr/bin/env bash
#
# Coding Orchestra — installer for macOS / Linux
# Copies every skill in ./skills into your personal Claude Code skills folder.
#
# Usage:
#   ./install.sh              # install to ~/.claude/skills (global, all projects)
#   ./install.sh --project    # install to ./.claude/skills (current project only)
#   ./install.sh --dir PATH   # install to a custom .claude/skills parent
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC="$SCRIPT_DIR/skills"

TARGET_PARENT="$HOME/.claude"
MODE="global"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --project) TARGET_PARENT="$(pwd)/.claude"; MODE="project"; shift ;;
    --dir)     TARGET_PARENT="${2%/}/.claude"; MODE="custom"; shift 2 ;;
    -h|--help)
      grep '^#' "$0" | sed 's/^#//'; exit 0 ;;
    *) echo "Unknown option: $1" >&2; exit 1 ;;
  esac
done

TARGET="$TARGET_PARENT/skills"

if [[ ! -d "$SRC" ]]; then
  echo "❌ Could not find skills/ next to this script ($SRC)." >&2
  exit 1
fi

echo "🎻 Coding Orchestra — installing skills"
echo "   Source: $SRC"
echo "   Target: $TARGET  ($MODE)"
echo ""

mkdir -p "$TARGET"

count=0
for dir in "$SRC"/*/; do
  [[ -f "$dir/SKILL.md" ]] || continue
  name="$(basename "$dir")"
  cp -R "$dir" "$TARGET/"
  echo "   ✓ $name"
  count=$((count + 1))
done

echo ""
echo "✅ Installed $count skills into $TARGET"
echo "   Restart Claude Code, then type /  (or just describe your task)."
