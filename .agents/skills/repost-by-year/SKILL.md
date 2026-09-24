---
name: repost-by-year
description: Repost minute posts from the same calendar day in a previous year, preferring the most recent year and falling back a year at a time when that post is itself a repost or break post. Use when asked to fill a range of dates with "this day last year" reposts.
---

# Repost By Year

Use this skill for the `lf-2022` "same day, previous year" minute repost workflow.
It is the date-driven sibling of [repost-by-tags](../repost-by-tags/SKILL.md) and writes
target posts using the identical convention.

## Workflow

1. For each target date, look up the minute post with the same month and day one year earlier.
2. If that post is a repost, step back another year and try again. A source counts as a repost when it:
- carries the `repost` tag, or
- has `break_post: true` in frontmatter (break posts reuse audio from 365 days earlier and own no assets), or
- opens with a `From [<date>](../<n>/):` line, or
- contains an old-style `Reposting minute (<n>)` link.
3. Keep stepping back until an original post is found. Report any target date with no usable source instead of guessing.
4. For each target post (same convention as `repost-by-tags`):
- Keep target `title`, `date`, `layout`, and `postnumber` if the file already exists.
- Copy `tags` and body text from the source.
- Add tag `repost` to target tags.
- Add a first body line: `From <source date>:` formatted as `Month D, YYYY`, with the date linked via a relative path to the source minute.
- Copy source `duration` and `length` to target.
5. Copy assets:
- `snd/1min/<source>.mp3` -> `snd/1min/<target>.mp3`
- `img/1min/<source>.png` and `img/1min/<source>-*.png` -> target-numbered equivalents
- `thumbs/1min/<source>.png` and `thumbs/1min/<source>-*.png` -> target-numbered equivalents
6. Verify output files and mapping.

## Script

Run `scripts/repost_by_year.sh` for deterministic execution.

Example: fill a date range, numbering from the next free post number

```bash
.agents/skills/repost-by-year/scripts/repost_by_year.sh \
  --start-date 2026-07-24 \
  --end-date 2026-09-20
```

Example: preview only, with an explicit starting post number

```bash
.agents/skills/repost-by-year/scripts/repost_by_year.sh \
  --start-date 2026-07-24 \
  --end-date 2026-09-20 \
  --start-number 920 \
  --dry-run
```

## Notes

- Selection is deterministic: the source is fixed by the target's calendar day, not random.
- Dates that already have a minute post are skipped, so re-running a partially completed range is safe.
- `--end-date` defaults to today; `--start-number` defaults to the highest existing `postnumber` plus one.
- Episode artwork is not copied — run `./make_episode_images.sh` afterwards to generate the missing JPGs from the copied PNGs.
