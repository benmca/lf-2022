#!/bin/zsh

rm -rf ./_site/
./make_thumbs.sh
npx @11ty/eleventy
rsync -avz --delete ./_site/ benmca@listenfaster.com:listenfaster.com/main
