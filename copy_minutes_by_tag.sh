#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage: ./copy_minutes_by_tag.sh [--mode or|and] tag1 [tag2 ...]

Copies mp3 files for matching 1min posts into:
  ~/Dropbox/minutes-<tag1>-<tag2>-...

Examples:
  ./copy_minutes_by_tag.sh op-1
  ./copy_minutes_by_tag.sh --mode and op-1 te
  ./copy_minutes_by_tag.sh --mode or csound livecoding
EOF
}

mode="or"
if [[ $# -lt 1 ]]; then
  usage
  exit 1
fi

if [[ "${1:-}" == "--mode" ]]; then
  mode="${2:-}"
  shift 2 || true
fi

if [[ "$mode" != "or" && "$mode" != "and" ]]; then
  echo "Invalid --mode: $mode (use 'or' or 'and')" >&2
  exit 1
fi

if [[ $# -lt 1 ]]; then
  usage
  exit 1
fi

tags=("$@")
dest_dir="${HOME}/Dropbox/minutes-$(IFS=-; echo "${tags[*]}")"
mkdir -p "$dest_dir"

MODE="$mode"
TAGS="$(printf "%s\n" "${tags[@]}")"
export MODE TAGS

mapfile -t mp3s < <(
  python3 - <<'PY'
import os
import re
import sys

root = os.getcwd()
mode = os.environ["MODE"]
tags = os.environ["TAGS"].split("\n")
posts_dir = os.path.join(root, "posts", "1min")

def parse_frontmatter(path):
    with open(path, "r", encoding="utf-8") as f:
        lines = f.readlines()
    if not lines or not lines[0].strip().startswith("---"):
        return {}
    fm_lines = []
    for line in lines[1:]:
        if line.strip().startswith("---"):
            break
        fm_lines.append(line.rstrip("\n"))
    data = {}
    current_key = None
    in_tags = False
    for line in fm_lines:
        key_match = re.match(r"^([A-Za-z0-9_]+):", line)
        if key_match:
            key, _, rest = line.partition(":")
            key = key.strip()
            val = rest.strip()
            data[key] = val if val else None
            current_key = key
            in_tags = (key == "tags")
            if in_tags and data[key] is None:
                data["tags"] = []
            continue
        if in_tags:
            m = re.match(r"^\s*-\s*(.+)$", line)
            if m:
                data.setdefault("tags", [])
                data["tags"].append(m.group(1).strip())
    return data

mp3s = []
for entry in sorted(os.listdir(posts_dir)):
    if not entry.endswith(".md"):
        continue
    path = os.path.join(posts_dir, entry)
    fm = parse_frontmatter(path)
    file_tags = set(fm.get("tags", []))
    if mode == "and":
        match = all(t in file_tags for t in tags)
    else:
        match = any(t in file_tags for t in tags)
    if not match:
        continue
    postnumber = fm.get("postnumber")
    if not postnumber:
        postnumber = os.path.splitext(entry)[0]
    mp3 = os.path.join(root, "snd", "1min", f"{postnumber}.mp3")
    if os.path.exists(mp3):
        mp3s.append(mp3)

for mp3 in mp3s:
    print(mp3)
PY
)

if [[ ${#mp3s[@]} -eq 0 ]]; then
  echo "No matching mp3 files found for tags: ${tags[*]}"
  exit 0
fi

for mp3 in "${mp3s[@]}"; do
  cp -f "$mp3" "$dest_dir/"
done

echo "Copied ${#mp3s[@]} file(s) to $dest_dir"
