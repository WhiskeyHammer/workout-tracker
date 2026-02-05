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
    'android/build.gradle',
    'android/settings.gradle',
    'android/variables.gradle',
    'android/gradle.properties',
    'android/app/build.gradle',
    'android/app/proguard-rules.pro',
    'android/app/src/main/AndroidManifest.xml',
    'public/service-worker.js',
]

# 2. Critical Directories to verify recursively
INCLUDE_DIRS = [
    'middleware',
    'models',
    'routes',
    'public',
    'scripts',  # Source files like timerService.src.js
    'android/app/src/main/java',  # Native Android code
]

# 3. Only include files with these extensions (filters out images, mp3s, binaries)
ALLOWED_EXTENSIONS = {
    '.js', '.jsx', '.json', '.html', '.css', 
    '.java', '.xml', '.gradle', '.pro', '.properties'
}

# --- Script Logic ---
def is_relevant(file_path):
    """Returns True if the file matches our allowed extensions."""
    _, ext = os.path.splitext(file_path)
    return ext.lower() in ALLOWED_EXTENSIONS

def add_to_zip(zipf, file_path):
    """Adds a file to the zip if it exists."""
    if os.path.exists(file_path):
        print(f"Adding: {file_path}")
        zipf.write(file_path)
    else:
        print(f"Skipping (not found): {file_path}")

def main():
    print(f"Scanning for relevant files to create {OUTPUT_FILENAME}...")
    
    with zipfile.ZipFile(OUTPUT_FILENAME, 'w', zipfile.ZIP_DEFLATED) as zipf:
        # Add specific top-level files
        for f in INCLUDE_FILES:
            add_to_zip(zipf, f)

        # Walk through directories and filter by extension
        for d in INCLUDE_DIRS:
            if not os.path.isdir(d):
                print(f"Warning: Directory not found: {d}")
                continue
                
            for root, _, files in os.walk(d):
                for file in files:
                    full_path = os.path.join(root, file)
                    if is_relevant(full_path):
                        add_to_zip(zipf, full_path)

    print(f"\nDone! Created {OUTPUT_FILENAME}")

if __name__ == "__main__":
    main()