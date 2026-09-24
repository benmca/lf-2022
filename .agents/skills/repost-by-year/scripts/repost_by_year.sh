#!/usr/bin/env bash
set -euo pipefail

START_DATE=""
END_DATE=""
START_NUMBER=""
DRY_RUN=0

usage() {
  cat <<USAGE
Usage:
  repost_by_year.sh --start-date YYYY-MM-DD [--end-date YYYY-MM-DD] [--start-number N] [--dry-run]

Behavior:
  - For each date in the range, pick the minute post from the same month/day one year earlier.
  - If that post is a repost (repost tag, break_post: true, or a "Reposted from [...](../n/)" header),
    step back another year until an original is found.
  - Dates that already have a minute post are skipped.
  - Copy source tags/body into each target, add "repost" tag, prepend repost link, copy duration/length.
  - Copy source assets (.mp3 and .png variants).

Defaults:
  --end-date     today
  --start-number highest existing postnumber + 1
USAGE
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --start-date) START_DATE="$2"; shift 2 ;;
    --end-date) END_DATE="$2"; shift 2 ;;
    --start-number) START_NUMBER="$2"; shift 2 ;;
    --dry-run) DRY_RUN=1; shift ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown arg: $1" >&2; usage; exit 1 ;;
  esac
done

if [[ -z "$START_DATE" ]]; then
  usage
  exit 1
fi

[[ -z "$END_DATE" ]] && END_DATE="$(date "+%Y-%m-%d")"

if [[ ! "$START_DATE" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ || ! "$END_DATE" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]]; then
  echo "Dates must be YYYY-MM-DD" >&2
  exit 1
fi

if [[ "$START_DATE" > "$END_DATE" ]]; then
  echo "--start-date is after --end-date" >&2
  exit 1
fi

date_add_days() {
  local base="$1" add_days="$2"
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
  awk 'BEGIN{fm=0;tagblk=0} /^---[[:space:]]*$/ {fm++; next} fm==1 {if(/^tags:/){tagblk=1} if(tagblk){if(/^layout:/){exit} print}}' "$1"
}

extract_field() {
  local f="$1" field="$2"
  # Values are copied verbatim, quotes included: an unquoted `duration: 1:14`
  # is read back as the sexagesimal number 74 by the YAML parser.
  awk -v key="$field" 'BEGIN{fm=0} /^---[[:space:]]*$/ {fm++; next} fm==1 && $0 ~ ("^" key ":") {sub("^" key ":[[:space:]]*", ""); print; exit}' "$f"
}

extract_body() {
  awk 'BEGIN{c=0} /^---[[:space:]]*$/ {c++; next} c>=2 {print}' "$1"
}

ensure_repost_tag() {
  local tags_block="$1"
  if printf '%s\n' "$tags_block" | grep -qE '^[[:space:]]*-[[:space:]]*repost$'; then
    printf '%s\n' "$tags_block"
  else
    printf '%s\n- repost' "$tags_block"
  fi
}

# A source is unusable when it is itself a repost: tagged `repost`, a break post
# (those reuse audio from 365 days earlier and own no assets), or carrying a
# repost header in either the current or the legacy format.
is_repost() {
  local f="$1"
  grep -qE '^break_post:[[:space:]]*true[[:space:]]*$' "$f" && return 0
  grep -qE '^-[[:space:]]*repost[[:space:]]*$' "$f" && return 0
  # Any link form: ../n/, /main/n/, or an absolute listenfaster.com/main/n/ URL
  grep -qE '^(Reposted from|From) \[[^]]+\]\([^)]*/[0-9]+/\)' "$f" && return 0
  grep -qE 'Reposting minute \([0-9]+\)' "$f" && return 0
  return 1
}

INDEX="$(mktemp -t repost_by_year_index)"
trap 'rm -f "$INDEX"' EXIT

# "<postnumber> <date>", lowest postnumber wins for any duplicated date.
grep -H '^date:' posts/1min/*.md \
  | sed -E 's#^posts/1min/([0-9]+)\.md:date:[[:space:]]*#\1 #; s#['"'"'"]##g' \
  | sort -n > "$INDEX"

if [[ ! -s "$INDEX" ]]; then
  echo "No minute posts found under posts/1min/" >&2
  exit 1
fi

number_for_date() {
  awk -v d="$1" '$2==d {print $1; exit}' "$INDEX"
}

EARLIEST_YEAR="$(awk '{print substr($2,1,4)}' "$INDEX" | sort -n | head -1)"

if [[ -z "$START_NUMBER" ]]; then
  START_NUMBER="$(awk '{print $1}' "$INDEX" | sort -n | tail -1)"
  START_NUMBER=$((START_NUMBER + 1))
fi

shopt -s nullglob

next_number="$START_NUMBER"
target_date="$START_DATE"
written=0
skipped=0
unresolved=0

echo "Mapping (target <- source):"
while [[ "$target_date" < "$END_DATE" || "$target_date" == "$END_DATE" ]]; do
  existing="$(number_for_date "$target_date")"
  if [[ -n "$existing" ]]; then
    echo "  $target_date -- skipped, already posted as $existing"
    skipped=$((skipped + 1))
    target_date="$(date_add_days "$target_date" 1)"
    continue
  fi

  target_year="${target_date:0:4}"
  month_day="${target_date:4}"
  src=""
  src_date=""
  year=$((target_year - 1))
  while [[ "$year" -ge "$EARLIEST_YEAR" ]]; do
    candidate_date="${year}${month_day}"
    candidate="$(number_for_date "$candidate_date")"
    if [[ -n "$candidate" ]] && ! is_repost "posts/1min/$candidate.md"; then
      src="$candidate"
      src_date="$candidate_date"
      break
    fi
    year=$((year - 1))
  done

  if [[ -z "$src" ]]; then
    echo "  $target_date -- NO SOURCE FOUND in any prior year" >&2
    unresolved=$((unresolved + 1))
    target_date="$(date_add_days "$target_date" 1)"
    continue
  fi

  t="$next_number"
  echo "  $t ($target_date) <- $src ($src_date)"

  target_file="posts/1min/$t.md"
  src_file="posts/1min/$src.md"

  tags="$(extract_tags "$src_file")"
  tags="$(ensure_repost_tag "$tags")"
  duration="$(extract_field "$src_file" duration)"
  length="$(extract_field "$src_file" length)"
  source_date_title="$(title_from_date "$src_date")"
  body="$(extract_body "$src_file")"

  if [[ -f "$target_file" ]]; then
    title="$(extract_field "$target_file" title)"
    post_date="$(extract_field "$target_file" date)"
    layout="$(extract_field "$target_file" layout)"
    [[ -z "$layout" ]] && layout="minute.njk"
  else
    post_date="$target_date"
    title="$(title_from_date "$target_date")"
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
Reposted from [$source_date_title](../$src/):

$body
EOF2

    if [[ -f "snd/1min/$src.mp3" ]]; then
      cp "snd/1min/$src.mp3" "snd/1min/$t.mp3"
    else
      echo "    warning: snd/1min/$src.mp3 missing" >&2
    fi

    copied_img=0
    for d in img/1min thumbs/1min; do
      for f in "$d/$src.png" "$d/$src-"*.png; do
        [[ -e "$f" ]] || continue
        base="$(basename "$f")"
        suffix="${base#$src}"
        cp "$f" "$d/$t$suffix"
        copied_img=$((copied_img + 1))
      done
    done
    [[ "$copied_img" -eq 0 ]] && echo "    warning: no PNG assets found for source $src" >&2
  fi

  written=$((written + 1))
  next_number=$((next_number + 1))
  target_date="$(date_add_days "$target_date" 1)"
done

echo
echo "Posts written: $written   Dates skipped (already posted): $skipped   Unresolved: $unresolved"
if [[ "$DRY_RUN" -eq 1 ]]; then
  echo "(dry run - no files changed)"
fi
