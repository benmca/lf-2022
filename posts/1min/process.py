import os
import re
import sys

def process_markdown_files(folder_path):
    for filename in os.listdir(folder_path):
        if filename.endswith(".md"):
            file_path = os.path.join(folder_path, filename)
            with open(file_path, 'r', encoding='utf-8') as file:
                lines = file.readlines()

            new_lines = []
            mp3_path = None
            for line in lines:
                audio_player_match = re.match(r"\{\%\s*audioPlayer\s+\"([^\"]+)\"\s*\%\}", line)
                if audio_player_match:
                    mp3_path = audio_player_match.group(1)
                    continue  # Skip adding this line to new_lines

            for line in lines:
                if line.strip().startswith('![') or re.match(r"\{\%\s*audioPlayer\s+\"([^\"]+)\"\s*\%\}", line):
                    continue  # Skip adding image markdown lines
                new_lines.append(line)  # Add the permalink line first
                if line.startswith("permalink"):
                    if mp3_path:
                        new_lines.append(f'audio: {mp3_path}\n')  # Add the new audio line
                        postnumber = os.path.basename(mp3_path).rsplit('.', 1)[0]  # Ensure splitting only removes the last extension
                        new_lines.append(f'postnumber: {postnumber}\n')  # Add the new postnumber line
                    continue


            with open(file_path, 'w', encoding='utf-8') as file:
                file.writelines(new_lines)
            print(f"Processed {filename}")

if __name__ == "__main__":
    # If a folder path is provided as an argument, use it; otherwise, use the current directory
    folder_path = sys.argv[1] if len(sys.argv) > 1 else os.getcwd()
    process_markdown_files(folder_path)
