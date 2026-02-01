
import argparse
import glob
import os
import re

def modify_tags(file_path, add_tags=None, remove_tags=None):
    with open(file_path, 'r') as file:
        lines = file.readlines()

    tag_line_index = None
    for i, line in enumerate(lines):
        if line.startswith("tags:"):
            tag_line_index = i
            break

    if tag_line_index is None:
        print(f"No 'tags:' line found in {file_path}. Skipping...")
        return

    # Extract existing tags from the line
    tag_line = lines[tag_line_index]
    match = re.search(r"tags: \[(.*?)\]", tag_line)
    if not match:
        print(f"Malformed 'tags:' line in {file_path}. Skipping...")
        return

    current_tags = [tag.strip().strip("'").strip('"') for tag in match.group(1).split(",") if tag.strip()]

    # Add or remove tags as needed
    if add_tags:
        current_tags = list(set(current_tags + add_tags))
    if remove_tags:
        current_tags = [tag for tag in current_tags if tag not in remove_tags]

    # Update the line with modified tags
    tagstring = ', '.join([f'\"{tag}\"' for tag in current_tags])
    new_tag_line = f"tags: [{tagstring}]\n"
    lines[tag_line_index] = new_tag_line

    # Write the updated content back to the file
    with open(file_path, 'w') as file:
        file.writelines(lines)

    print(f"Updated tags in {file_path}.")


def modify_tags_te_olallan(file_path, add_tags=None, remove_tags=None):
    with open(file_path, 'r') as file:
        lines = file.readlines()

    current_tags = []
    tag_line_index = None
    initial_tag_line_index = None
    for i, line in enumerate(lines):
        if line.startswith("tags:"):
            initial_tag_line_index = i
            tag_line_index = i+1
            break
    if tag_line_index is None:
        print("no tags in " + file_path + " -- continuing")
        return

    cur_line = lines[tag_line_index]
    while cur_line.startswith("-"):
        tag = cur_line.split('- ')[1].strip()
        current_tags.append(tag)
        tag_line_index = tag_line_index + 1
        cur_line = lines[tag_line_index]

    if ('ep-133' in current_tags or 'op-1' in current_tags) and 'te' not in current_tags:
        current_tags.append('te')
    if ('thuja' in current_tags or 'c4t' in current_tags) and 'csound' not in current_tags:
        current_tags.append('csound')

    if ('te' in current_tags or 'csound' in current_tags ) and 'olallan' not in current_tags:
        current_tags.append('olallan')

    new_lines = lines[0:initial_tag_line_index + 1]
    new_lines.extend(["- " + tag + "\n" for tag in current_tags])
    new_lines.extend(lines[tag_line_index + 1:])
    # Write the updated content back to the file
    with open(file_path, 'w') as file:
        file.writelines(new_lines)

    print(f"Updated tags in {file_path}.")


def main():
    parser = argparse.ArgumentParser(description="Modify tags in Markdown files.")
    parser.add_argument("paths", nargs='+', help="Markdown files or wildcard pathspecs to modify.")
    parser.add_argument("--add", nargs='*', help="Tags to add.")
    parser.add_argument("--remove", nargs='*', help="Tags to remove.")
    parser.add_argument("--process", action="store_true", default=False, help="Tags to remove.")

    args = parser.parse_args()

    files_to_process = []

    for path in args.paths:
        if '*' in path or '?' in path:
            # Expand the pathspec to match files
            files_to_process.extend(glob.glob(path, recursive=True))
        else:
            # Treat as a direct file path
            files_to_process.append(path)

    if not files_to_process:
        print("No matching files found to process.")
        return

    for file_path in files_to_process:
        if not os.path.isfile(file_path):
            print(f"File not found or not a file: {file_path}. Skipping...")
            continue

        if args.process:
            modify_tags_te_olallan(file_path)
        else:
            modify_tags(file_path, add_tags=args.add, remove_tags=args.remove)


if __name__ == "__main__":
    main()
