#!/bin/bash
# Fast local iteration: keeps _site, skips thumbs + mp3 metadata, rebuilds only changed files
npx @11ty/eleventy --serve --incremental
