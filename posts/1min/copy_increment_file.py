import sys
import os
from datetime import datetime, timedelta
import re

# Helper function to parse and update key-value pairs
def parse_and_update_metadata(metadata, increment_days):
    updated_metadata = []
    for line in metadata:
        # Use regex to capture both quoted and unquoted values
        match = re.match(r'(\w+):\s*(["\']?)(.*?)(\2)$', line)
        if not match:
            updated_metadata.append(line)
            continue
        
        key = match.group(1)
        quote = match.group(2)
        value = match.group(3)

        if key == "title":
            # Increment the date in the title in the format "Month Day, Year"
            try:
                date_obj = datetime.strptime(value, "%B %d, %Y")
                new_date = date_obj + timedelta(days=increment_days)
                # Remove leading zero in day if present
                value = new_date.strftime("%B %-d, %Y")  # Format as "Month D, Year"
            except ValueError:
                pass  # If the date isn't properly formatted, leave it unchanged

        elif key == "date":
            # Increment the date in the format "YYYY-MM-DD"
            try:
                date_obj = datetime.strptime(value, "%Y-%m-%d")
                new_date = date_obj + timedelta(days=increment_days)
                value = new_date.strftime("%Y-%m-%d")
            except ValueError:
                pass  # If the date isn't properly formatted, leave it unchanged

        elif key == "postnumber":
            # Increment the post number
            try:
                value = str(int(value) + increment_days)
            except ValueError:
                pass  # If postnumber isn't a valid number, leave it unchanged

        # Rebuild the line, preserving quotes if they were present
        updated_metadata.append(f'{key}: {quote}{value}{quote}')

    return updated_metadata

def main():
    if len(sys.argv) != 3:
        print("Usage: python copy_increment_file.py <filename.md> <number_of_copies>")
        sys.exit(1)

    source_file = sys.argv[1]
    num_copies = int(sys.argv[2])

    # Check if the file exists
    if not os.path.isfile(source_file):
        print(f"File '{source_file}' not found.")
        sys.exit(1)

    # Extract the base name and number from the file
    base_filename, ext = os.path.splitext(source_file)
    try:
        file_number = int(base_filename)
    except ValueError:
        print("Filename must contain a number before the extension.")
        sys.exit(1)

    with open(source_file, "r") as f:
        content = f.read()

    # Split content into metadata and body
    parts = content.split('---')
    if len(parts) < 3:
        print("Invalid file format. Make sure the metadata is enclosed between '---'.")
        sys.exit(1)

    # Extract metadata and body
    metadata_lines = parts[1].strip().splitlines()
    body_content = parts[2].strip()

    # Loop to create multiple copies
    for i in range(num_copies):
        incremented_number = file_number + i
        new_filename = f"{incremented_number}.md"

        # Update metadata (incrementing date and postnumber by i)
        updated_metadata = parse_and_update_metadata(metadata_lines, i)

        # Write the new file
        with open(new_filename, "w") as f:
            f.write('---\n')
            f.write('\n'.join(updated_metadata))
            f.write('\n---\n')
            f.write(body_content)

        print(f"Created file: {new_filename}")

if __name__ == "__main__":
    main()