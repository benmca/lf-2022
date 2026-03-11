#!/usr/bin/env bash
set -euo pipefail

TAG=""
TARGETS_CSV=""
START_DATE=""
EXCLUDE_CSV=""
DRY_RUN=0

usage() {
  cat <<USAGE
Usage:
  repost_by_tags.sh --tag <tag> --targets <n1,n2,...> [--start-date YYYY-MM-DD] [--exclude-sources a,b,c] [--dry-run]

Behavior:
  - Select unique random source posts in posts/1min/*.md that contain "- <tag>".
  - Exclude sources already used by existing repost header links.
  - Exclude any numbers provided by --exclude-sources.
  - Copy source tags/body into each target, add "repost" tag, prepend repost link, copy duration/length.
  - Copy source assets (.mp3 and .png variants).
USAGE
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --tag)
      TAG="$2"; shift 2 ;;
    --targets)
      TARGETS_CSV="$2"; shift 2 ;;
    --start-date)
      START_DATE="$2"; shift 2 ;;
    --exclude-sources)
      EXCLUDE_CSV="$2"; shift 2 ;;
    --dry-run)
      DRY_RUN=1; shift ;;
    -h|--help)
      usage; exit 0 ;;
    *)
      echo "Unknown arg: $1" >&2
      usage
      exit 1 ;;
  esac
done

if [[ -z "$TAG" || -z "$TARGETS_CSV" ]]; then
  usage
  exit 1
fi

if ! command -v rg >/dev/null 2>&1; then
  echo "rg is required" >&2
  exit 1
fi

IFS=',' read -r -a TARGETS <<< "$TARGETS_CSV"
if [[ ${#TARGETS[@]} -eq 0 ]]; then
  echo "No targets provided" >&2
  exit 1
fi

# Collect candidate sources by tag.
ALL_SOURCES=()
while IFS= read -r line; do
  ALL_SOURCES+=("$line")
done < <(rg -l "^- ${TAG}$" posts/1min/*.md | sed 's#posts/1min/##; s#\.md##' | sort -n)
if [[ ${#ALL_SOURCES[@]} -eq 0 ]]; then
  echo "No sources found for tag '${TAG}'" >&2
  exit 1
fi

# Collect sources already used in repost headers.
# Support both old and new formats:
# - [Reposting minute (123)](../123/)
# - From [February 13, 2026](../123/)
USED_FROM_REPOSTS=()
while IFS= read -r line; do
  USED_FROM_REPOSTS+=("$line")
done < <(
  {
    rg -No "\[Reposting minute \(([0-9]+)\)\]\(\.\./[0-9]+/\)" posts/1min/*.md | sed -E 's/.*\(([0-9]+)\).*/\1/'
    rg -No "^From \[[^]]+\]\(\.\./([0-9]+)/\)" posts/1min/*.md | sed -E 's#.*\(\.\./([0-9]+)/\).*#\1#'
  } | sort -n | uniq
)

# Explicit exclusions.
EXPLICIT_EXCLUDES=()
if [[ -n "$EXCLUDE_CSV" ]]; then
  IFS=',' read -r -a EXPLICIT_EXCLUDES <<< "$EXCLUDE_CSV"
fi

in_list() {
  local needle="$1"
  shift
  local item
  for item in "$@"; do
    [[ "$item" == "$needle" ]] && return 0
  done
  return 1
}

# Filter candidates: exclude used/reposted and source files that are reposts themselves.
CANDIDATES=()
for n in "${ALL_SOURCES[@]}"; do
  exclude_hit=0
  if [[ ${#USED_FROM_REPOSTS[@]} -gt 0 ]] && in_list "$n" "${USED_FROM_REPOSTS[@]}"; then
    exclude_hit=1
  fi
  if [[ ${#EXPLICIT_EXCLUDES[@]} -gt 0 ]] && in_list "$n" "${EXPLICIT_EXCLUDES[@]}"; then
    exclude_hit=1
  fi
  if [[ "$exclude_hit" -eq 1 ]]; then
    continue
  fi
  if rg -q "Reposting minute \([0-9]+\)" "posts/1min/$n.md"; then
    continue
  fi
  CANDIDATES+=("$n")
done

if [[ ${#CANDIDATES[@]} -lt ${#TARGETS[@]} ]]; then
  echo "Not enough candidates after exclusions. Need ${#TARGETS[@]}, have ${#CANDIDATES[@]}" >&2
  exit 1
fi

PICKS=()
while IFS= read -r line; do
  PICKS+=("$line")
done < <(printf '%s\n' "${CANDIDATES[@]}" | shuf -n "${#TARGETS[@]}")

date_add_days() {
  local base="$1"
  local add_days="$2"
  if date -j -f "%Y-%m-%d" "$base" "+%Y-%m-%d" >/dev/null 2>&1; then
    date -j -v+"${add_days}"d -f "%Y-%m-%d" "$base" "+%Y-%m-%d"
  else
    date -d "$base +$add_days day" "+%Y-%m-%d"
  fi
}

title_from_date() {
  local iso="$1"
  if date -j -f "%Y-%m-%d" "$iso" "+%B %-d, %Y" >/dev/null 2>&1; then
    date -j -f "%Y-%m-%d" "$iso" "+%B %-d, %Y"
  else
    date -d "$iso" "+%B %-d, %Y"
  fi
}

extract_tags() {
  local f="$1"
  awk 'BEGIN{fm=0;tagblk=0} /^---[[:space:]]*$/ {fm++; next} fm==1 {if(/^tags:/){tagblk=1} if(tagblk){if(/^layout:/){exit} print}}' "$f"
}

extract_field() {
  local f="$1"
  local field="$2"
  awk -v key="$field" 'BEGIN{fm=0} /^---[[:space:]]*$/ {fm++; next} fm==1 && $0 ~ ("^" key ":") {sub("^" key ":[[:space:]]*", ""); print; exit}' "$f"
}

extract_body() {
  local f="$1"
  awk 'BEGIN{c=0} /^---[[:space:]]*$/ {c++; next} c>=2 {print}' "$f"
}

ensure_repost_tag() {
  local tags_block="$1"
  if printf '%s\n' "$tags_block" | rg -q '^[[:space:]]*-[[:space:]]*repost$'; then
    printf '%s\n' "$tags_block"
  else
    printf '%s\n- repost' "$tags_block"
  fi
}

shopt -s nullglob

echo "Mapping (target <- source):"
for i in "${!TARGETS[@]}"; do
  t="${TARGETS[$i]}"
  s="${PICKS[$i]}"
  echo "  $t <- $s"

  target_file="posts/1min/$t.md"
  src_file="posts/1min/$s.md"

  tags="$(extract_tags "$src_file")"
  tags="$(ensure_repost_tag "$tags")"
  duration="$(extract_field "$src_file" duration)"
  length="$(extract_field "$src_file" length)"
  source_date_iso="$(extract_field "$src_file" date)"
  source_date_title="$(title_from_date "$source_date_iso")"
  body="$(extract_body "$src_file")"

  if [[ -f "$target_file" ]]; then
    title="$(extract_field "$target_file" title)"
    post_date="$(extract_field "$target_file" date)"
    layout="$(extract_field "$target_file" layout)"
    [[ -z "$layout" ]] && layout="minute.njk"
  else
    if [[ -z "$START_DATE" ]]; then
      echo "Target $t does not exist; provide --start-date YYYY-MM-DD" >&2
      exit 1
    fi
    post_date="$(date_add_days "$START_DATE" "$i")"
    title="$(title_from_date "$post_date")"
    layout="minute.njk"
  fi

  if [[ "$DRY_RUN" -eq 0 ]]; then
    cat > "$target_file" <<EOF2
---
title: $title
date: $post_date
$tags
layout: $layout
postnumber: $t
duration: $duration
length: $length
---

From [$source_date_title](../$s/):

$body
EOF2

    cp "snd/1min/$s.mp3" "snd/1min/$t.mp3"

    for d in img/1min thumbs/1min; do
      for f in "$d/$s.png" "$d/$s-"*.png; do
        [[ -e "$f" ]] || continue
        base="$(basename "$f")"
        suffix="${base#$s}"
        cp "$f" "$d/$t$suffix"
      done
    done
  fi
done
