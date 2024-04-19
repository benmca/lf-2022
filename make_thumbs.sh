#!/bin/bash

# Define the source and target directory
SOURCE_DIR="./img"
TARGET_DIR="./thumbs"

# Create the target directory if it doesn't exist
if ! [ -d "$TARGET_DIR" ]; then
    # echo "thumbs dir doesn't exist, creating"
    mkdir -p "$TARGET_DIR"
fi

# Function to generate thumbnails is not needed as we'll handle everything directly within the find command

# Find all images in the source directory and create thumbnails
find "$SOURCE_DIR" -type f \( -iname "*.jpg" -o -iname "*.png" -o -iname "*.jpeg" \) | while read img; do
    # Calculate the target path for the thumbnail, maintaining directory structure
    target="${TARGET_DIR}/${img#$SOURCE_DIR/}"
    target_dir=$(dirname "$target")

    if ! [ -d "$target_dir" ]; then
        # echo "target dir doesn't exist - creating"
        mkdir -p "$target_dir"
    fi
    
    if ! [ -f "$target" ]; then
        # echo "target file doesn't exist - creating"
        echo -n "."
        convert "$img" -resize 200x200 "$target"
    fi
done

echo "Thumbnails generated in $TARGET_DIR"
