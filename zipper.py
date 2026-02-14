import os
import zipfile

# --- Configuration ---
OUTPUT_FILENAME = 'troubleshooting_context.zip'

# 1. Critical Top-Level Files
INCLUDE_FILES = [
    'package.json',
    'package-lock.json',
    'capacitor.config.json',
    'server.js',
    'build_apk.py',
    'clean_native.py',
    'fix_sound.py',
    '.env',
    # Android Configs
    'android/build.gradle',
    'android/settings.gradle',
    'android/variables.gradle',
    'android/gradle.properties',
    'android/app/build.gradle',
    'android/app/proguard-rules.pro',
    'android/app/src/main/AndroidManifest.xml',
]

# 2. Critical Directories to verify recursively
INCLUDE_DIRS = [
    'middleware',
    'models',
    # Your actual frontend code is here:
    'android/app/src/main/assets/public', 
    # Native Android code logic:
    'android/app/src/main/java', 
]

# 3. Only include files with these extensions (filters out images, mp3s, binaries)
ALLOWED_EXTENSIONS = {
    '.js', '.jsx', '.json', '.html', '.css', 
    '.java', '.xml', '.gradle', '.pro', '.properties',
    '.py', '.env', '.txt'
}

# --- Script Logic ---
def is_relevant(file_path):
    """Returns True if the file matches our allowed extensions."""
    _, ext = os.path.splitext(file_path)
    return ext.lower() in ALLOWED_EXTENSIONS

def add_to_zip(zipf, file_path):
    """Adds a file to the zip if it exists."""
    if os.path.exists(file_path):
        print(f"Adding file: {file_path}")
        zipf.write(file_path)
    else:
        print(f"Skipping (not found): {file_path}")

def add_dir_to_zip(zipf, dir_path):
    """Walks a directory and adds relevant files."""
    if not os.path.exists(dir_path):
        print(f"Warning: Directory not found: {dir_path}")
        return

    for root, _, files in os.walk(dir_path):
        for file in files:
            file_path = os.path.join(root, file)
            if is_relevant(file_path):
                print(f"  Adding: {file_path}")
                zipf.write(file_path)

def main():
    print(f"Scanning for relevant files to create {OUTPUT_FILENAME}...")
    
    with zipfile.ZipFile(OUTPUT_FILENAME, 'w', zipfile.ZIP_DEFLATED) as zipf:
        # Add specific top-level files
        for f in INCLUDE_FILES:
            add_to_zip(zipf, f)

        # Walk through directories and filter by extension
        for d in INCLUDE_DIRS:
            add_dir_to_zip(zipf, d)

    print(f"\nDone! Created {OUTPUT_FILENAME}")

if __name__ == "__main__":
    main()