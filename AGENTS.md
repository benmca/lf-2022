# Repository Guidelines

## Project Structure & Module Organization

- `posts/` contains Markdown content. Entries in `posts/1min/` are called “minutes” and are numbered (e.g., `posts/1min/123.md`) to match `postnumber`.
- `_includes/` holds Nunjucks layouts/partials; `_includes/_styles/` contains modular SCSS used by Eleventy.
- Static assets live in `img/`, `thumbs/`, `episode_images/`, `snd/`, `assets/`, and `js/` and are copied into the site.
- Generated output is `_site/` (do not edit by hand).

## Build, Test, and Development Commands

- `./serve.sh` — clean build, generate thumbnails, update MP3 metadata, then run Eleventy with a dev server.
- `npx @11ty/eleventy` — build the site once (no server).
- `./make_thumbs.sh` — generate 100x100 thumbnails from `img/` into `thumbs/` (requires ImageMagick `magick`).
- `python update_mp3_metadata.py` — fills `duration` and `length` in frontmatter from MP3s (requires `mutagen`).
- `./deploy.sh` — production build + rsync deploy (host-specific commands inside).

## Coding Style & Naming Conventions

- Indentation follows existing files: 2 spaces in JS/SCSS; keep template lines short and wrapped.
- Nunjucks/Markdown frontmatter keys are consistent: `title`, `date`, `tags`, `postnumber`, `eleventyComputed`.
- Minute assets follow a fixed pattern: `img/1min/{postnumber}.jpg`, `thumbs/1min/{postnumber}.jpg`, `snd/1min/{postnumber}.mp3`.

## Testing Guidelines

- No automated tests or linting are configured. `npm test` intentionally exits with an error.
- Manual validation: run `./serve.sh` and verify pages, audio players, and feeds in the local server output.

## Commit & Pull Request Guidelines

- Commit messages are short, lowercase, and descriptive (e.g., `add player order controls`, `add script to copy minutes by tag`).
- Keep commits focused; avoid mixing content changes and tooling changes in one commit.
- PRs should explain what changed and why. Include before/after screenshots or sample links for visual/content edits.
- Call out feed or asset changes explicitly (e.g., new `posts/1min/` entries or edits to `podfeed.njk`).

## Notes for Contributors

- This is an Eleventy (11ty) v2 + Nunjucks site; SCSS is compiled during the Eleventy build.
- `posts/1min/` (“minutes”) drives calendar and playlist collections; preserve existing tag conventions for discovery.
