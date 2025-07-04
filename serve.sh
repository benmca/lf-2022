rm -rf ./_site/
./make_thumbs.sh
python update_mp3_metadata.py
npx @11ty/eleventy --serve
