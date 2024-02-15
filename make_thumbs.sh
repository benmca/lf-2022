#!/bin/bash

# Define the source and target directory
SOURCE_DIR="./img"
TARGET_DIR="./thumbs"

# Create the target directory if it doesn't exist
mkdir -p "$TARGET_DIR"

# Function to generate thumbnails is not needed as we'll handle everything directly within the find command

# Find all images in the source directory and create thumbnails
find "$SOURCE_DIR" -type f \( -iname "*.jpg" -o -iname "*.png" -o -iname "*.jpeg" \) | while read img; do
    # Calculate the target path for the thumbnail, maintaining directory structure
    target="${TARGET_DIR}/${img#$SOURCE_DIR/}"
    target_dir=$(dirname "$target")
    
    # Ensure the target directory exists
    mkdir -p "$target_dir"
    
    # Create a thumbnail of the image
    convert "$img" -resize 200x200 "$target"
done

echo "Thumbnails generated in $TARGET_DIR"
