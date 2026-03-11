---
name: repost-by-tags
description: Repost one or more minute posts by selecting random source posts that contain a specific tag, while avoiding reused sources. Use when asked to generate repost minute entries (for example posts/1min/773.md, 774.md) by copying source tags/body, prepending a repost link, and copying associated audio/image assets.
---

# Repost By Tags

Use this skill for the `lf-2022` minute repost workflow.

## Workflow

1. Select source minute posts from `posts/1min/*.md` that contain the requested tag line (`- <tag>`).
2. Exclude sources already used in prior reposts.
3. Randomly choose one unique source per target post number.
4. For each target post:
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

Run `scripts/repost_by_tags.sh` for deterministic execution.

Example: update existing posts

```bash
.agents/skills/repost-by-tags/scripts/repost_by_tags.sh \
  --tag foley \
  --targets 767,768,769,770,771,772
```

Example: create new posts with sequential dates

```bash
.agents/skills/repost-by-tags/scripts/repost_by_tags.sh \
  --tag foley \
  --targets 773,774 \
  --start-date 2026-02-12
```

## Notes

- Do not reuse sources already referenced in existing repost lines unless explicitly requested.
- Keep selection random but unique within a run.
- If source PNG files do not exist, continue without image copy and report it.
