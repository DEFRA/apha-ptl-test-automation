#!/usr/bin/env bash
# Install or update the E2E agent pack in a repository.
# Usage: bash install.sh /path/to/repo
#
# - Copies github/* into <repo>/.github/ (agents, instructions, skills).
# - Backs up any file it would overwrite, under .github/.backup-<timestamp>/.
# - Merges ignore.txt into <repo>/.gitignore (the mechanism that blocks commits) and into
#   <repo>/.copilotignore for editors that read it.
# - Installs vscode/settings.json as <repo>/.vscode/settings.json, so the agents stop prompting for
#   their own commands. Never overwrites an existing settings file: writes settings.pack.json instead.
set -euo pipefail

repo="${1:?Usage: bash install.sh /path/to/repo}"
here="$(cd "$(dirname "$0")" && pwd)"
[ -d "$repo" ] || { echo "Not a folder: $repo" >&2; exit 1; }
[ -d "$here/github" ] || { echo "No github/ folder next to install.sh" >&2; exit 1; }

dest="$repo/.github"
mkdir -p "$dest"

# 1. Back up anything that would be replaced, so a local edit is never lost silently.
stamp="$(date +%Y%m%d-%H%M%S)"
backup="$dest/.backup-$stamp"
backed_up=0
while IFS= read -r rel; do
  [ -n "$rel" ] || continue
  # Only back up a file whose content actually differs, so a re-run stays quiet.
  if [ -f "$dest/$rel" ] && ! cmp -s "$here/github/$rel" "$dest/$rel"; then
    mkdir -p "$backup/$(dirname "$rel")"
    cp "$dest/$rel" "$backup/$rel"
    backed_up=$((backed_up + 1))
  fi
done < <(cd "$here/github" && find . -type f ! -name '.DS_Store' | sed 's|^\./||')

# 2. Copy. Exclude .DS_Store so a Mac's folder metadata never lands in a repo.
(cd "$here/github" && find . -type f ! -name '.DS_Store' -print0 | while IFS= read -r -d '' f; do
  mkdir -p "$dest/$(dirname "$f")"
  cp "$f" "$dest/$f"
done)
find "$dest" -name '.DS_Store' -delete 2>/dev/null || true

# 3. Merge ignore patterns, idempotently, preserving existing content.
merge_ignore() {
  target="$1"
  touch "$target"
  added=0
  while IFS= read -r line || [ -n "$line" ]; do
    case "$line" in ''|'#'*) continue ;; esac
    if ! grep -qxF -- "$line" "$target"; then
      printf '%s\n' "$line" >> "$target"
      added=$((added + 1))
    fi
  done < "$here/ignore.txt"
  echo "  $target: $added new pattern(s)"
}

merge_ignore "$repo/.gitignore"
merge_ignore "$repo/.copilotignore"

# 4. Workspace approval settings: the difference between a finished run and two days of prompts.
settings_src="$here/vscode/settings.json"
if [ -f "$settings_src" ]; then
  if [ -f "$repo/.vscode/settings.json" ]; then
    cp "$settings_src" "$repo/.vscode/settings.pack.json"
    echo "  .vscode/settings.json already exists: merge .vscode/settings.pack.json into it (approvals)."
  else
    mkdir -p "$repo/.vscode"
    cp "$settings_src" "$repo/.vscode/settings.json"
    echo "  .vscode/settings.json: workspace approvals installed."
  fi
fi

echo "Installed to $dest"
if [ "$backed_up" -gt 0 ]; then
  echo "  backed up $backed_up existing file(s) to $backup"
fi
echo "Next: reload the window so .vscode/settings.json applies, select the e2e-architect agent, and read v2/README.md (Autonomy: no approval steps)."
