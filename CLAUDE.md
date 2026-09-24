# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Listen Faster** (listenfaster.com) — a personal music/audio blog built with **Eleventy (11ty) v2** and **Nunjucks** templates. The site hosts daily one-minute audio pieces ("minutes"), blog posts, and a discography ("recordings"). Deployed to `listenfaster.com/main/` via rsync.

## Build & Development Commands

```bash
# Local dev server (cleans, generates thumbs, updates MP3 metadata, then serves with watch)
./serve.sh

# Individual steps from serve.sh:
rm -rf ./_site/
./make_thumbs.sh              # ImageMagick (requires the `magick` binary): 100x100 thumbs from img/ → thumbs/
python update_mp3_metadata.py # Reads MP3 duration/size, updates YAML frontmatter (requires mutagen)
npx @11ty/eleventy --serve    # Build + dev server with hot reload

# Production build + deploy
./deploy.sh                   # Build then rsync to benmca@listenfaster.com:listenfaster.com/main

# Just build (no serve)
npx @11ty/eleventy
```

## Testing

There are no automated tests, linting, or CI/CD configured. `npm test` intentionally exits with an error — it is a deliberate no-op, not a broken script.

Manual validation: run `./serve.sh` and verify pages, audio players, and feeds in the local server output.

## Architecture

### Content Model

All content is Markdown with YAML frontmatter. The primary content type is daily one-minute audio posts in `posts/1min/{number}.md`:

```yaml
---
title: January 1, 2024
date: 2024-01-01
tags:
- 1min
- op-1
- te
postnumber: 1
eleventyComputed:
  bgImg: /img/1min/{{ postnumber }}.jpg
duration: '1:23'
length: 1666364
---
```

- `postnumber` links to the MP3 at `snd/1min/{postnumber}.mp3` and image at `img/1min/{postnumber}.jpg`
- `duration` and `length` are auto-populated by `update_mp3_metadata.py`
- `eleventyComputed.bgImg` uses Nunjucks interpolation for dynamic paths

**Break posts** are tagged `2025.05.break` (or similar) and reuse audio from 365 posts earlier. The `update_mp3_metadata.py` script handles this offset lookup.

### Eleventy Configuration (.eleventy.js)

Key collections:
- `minutes` — all posts tagged `1min` (excluding break-only posts), sorted by date
- `minutesByMonth` — calendar grid grouping of minute posts (weeks/days)
- `tagList` — all unique tags, excluding system tags (`posts`, `all`, `1min`, `listen`, `blog`, `2025.02.break`)

Custom shortcodes: `audioPlayer`, `player`, `abc` (ABC music notation via abcjs)

Custom filters: `readableDate`, `htmlDateString`, `friendlyDate`, `thumb` (swaps `/img/` → `/thumbs/`), `head`, `itemsByTag`, `urlencode`, `openImagesInNewWindow`

SCSS compilation is handled as an Eleventy template format (not a separate build step). Path prefix is `/main/`.

### Template Hierarchy

```
_includes/base.njk          → HTML shell (head, meta, styles)
  _includes/minute.njk      → Individual 1min post layout
  _includes/post.njk        → Blog post layout
  _includes/1min-player.njk → Full-page player with playlist
  _includes/calendar.njk    → Month calendar grid view
```

Styles are in `_includes/_styles/` (modular SCSS: layout, nav, typography, variables, mixins, 1min-player).

### Feeds

- `podfeed.njk` → `minutes.xml` — RSS 2.0 podcast feed with iTunes extensions
- `rss.njk` → `rss.xml` — Atom blog feed

### Static Assets (passthrough copy)

`img/`, `thumbs/`, `episode_images/`, `snd/`, `assets/`, `js/` — all copied directly to output. Audio files (`snd/1min/`) are large (~2GB total) and excluded from git via .gitignore.

Generated output lives in `_site/` — never edit it by hand.

## Python Utilities

**`update_mp3_metadata.py`** — Reads MP3 files via `mutagen`, writes `duration` and `length` into markdown frontmatter. Handles break posts by looking up the MP3 from 365 posts prior. Run as part of the build pipeline.

**`tagmgr.py`** — CLI for bulk tag operations on markdown files:
```bash
python tagmgr.py posts/1min/*.md --add "newtag"
python tagmgr.py posts/1min/*.md --remove "oldtag"
python tagmgr.py posts/1min/*.md --process  # Auto-adds implied tags (e.g., op-1 → te → olallan)
```

**`copy_minutes_by_tag.sh`** — copies minute posts matching a tag to another location.

## Key Conventions

- Tags encode instruments, software, and projects (e.g., `op-1`, `te`, `csound`, `olallan`, `notation`)
- Tag relationships: `ep-133` or `op-1` implies `te`; `thuja` or `c4t` implies `csound`; `te` or `csound` implies `olallan`
- Images follow `img/1min/{postnumber}.jpg`, thumbnails at `thumbs/1min/{postnumber}.jpg`, episode artwork at `episode_images/1min/{postnumber}.jpg`
- Site deploys under path prefix `/main/` (not root) — relevant for any generated links or template paths
- **Break posts** are tagged `2025.05.break` (or similar year/month pattern) and reuse audio from 365 posts earlier; `update_mp3_metadata.py` handles this offset lookup automatically
- **Do not run `./deploy.sh` autonomously** — it rsyncs directly to production at `benmca@listenfaster.com:listenfaster.com/main`

## Code Style

- Match existing files: 2-space indentation in JS and SCSS
- Keep template lines short and wrapped
- Frontmatter keys stay consistent: `title`, `date`, `tags`, `postnumber`, `eleventyComputed`

## Commit & PR Guidelines

- Commit messages are short, lowercase, and descriptive (e.g., `add player order controls`, `add script to copy minutes by tag`)
- Keep commits focused — don't mix content changes and tooling changes in one commit
- PRs should explain what changed and why; include before/after screenshots or sample links for visual or content edits
- Call out feed or asset changes explicitly (new `posts/1min/` entries, edits to `podfeed.njk`)
