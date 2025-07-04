#!/usr/bin/env python3
import os
import re
import glob
import yaml
from pathlib import Path
from mutagen.mp3 import MP3

def get_mp3_duration_size(mp3_path):
    """Get duration in MM:SS format and size in bytes of an MP3 file."""
    try:
        audio = MP3(mp3_path)
        total_seconds = int(round(audio.info.length))
        minutes = total_seconds // 60
        seconds = total_seconds % 60
        return {
            'duration': f"{minutes}:{seconds:02d}",
            'length': os.path.getsize(mp3_path)
        }
    except Exception as e:
        print(f"Error processing {mp3_path}: {e}")
        return None

def update_front_matter(file_path, mp3_data):
    """Update the front matter of a markdown file with MP3 metadata."""
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Split content into front matter and the rest
    parts = re.split(r'^---\s*$', content, 2, flags=re.MULTILINE)
    if len(parts) < 3:
        print(f"Could not find valid front matter in {file_path}")
        return False
    
    # Parse YAML front matter
    try:
        front_matter = yaml.safe_load(parts[1])
    except yaml.YAMLError as e:
        print(f"Error parsing YAML in {file_path}: {e}")
        return False
    
    # Update with MP3 data
    front_matter.update(mp3_data)
    
    # Reconstruct the file content
    updated_content = f"---\n{yaml.dump(front_matter, default_flow_style=False, sort_keys=False)}---{parts[2]}"
    
    # Write back to file
    with open(file_path, 'w') as f:
        f.write(updated_content)
    
    return True

def process_minutes():
    # Set up paths
    base_dir = Path(__file__).parent
    posts_dir = base_dir / 'posts' / '1min'
    snd_dir = base_dir / 'snd' / '1min'
    
    # Find all markdown files
    md_files = list(posts_dir.glob('*.md'))
    
    for md_file in md_files:
        # Extract post number from filename
        post_number = md_file.stem
        if not post_number.isdigit():
            print(f"Skipping non-numeric filename: {md_file}")
            continue
        
        # Find corresponding MP3 file
        mp3_file = snd_dir / f"{post_number}.mp3"
        if not mp3_file.exists():
            print(f"No matching MP3 found for {md_file}")
            continue
        
        # Get MP3 metadata
        mp3_data = get_mp3_duration_size(mp3_file)
        if not mp3_data:
            continue
        
        print(f"Updating {md_file}: duration={mp3_data['duration']}s, size={mp3_data['length']} bytes")
        
        # Update the markdown file
        if update_front_matter(md_file, mp3_data):
            print(f"Successfully updated {md_file}")
        else:
            print(f"Failed to update {md_file}")

if __name__ == "__main__":
    process_minutes()
