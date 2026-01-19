import os
import subprocess
import sys
import platform
from pathlib import Path

def get_java_home():
    """
    Attempts to locate the Java installation included with Android Studio.
    """
    system = platform.system()
    
    if system == 'Windows':
        possible_paths = [
            r"C:\Program Files\Android\Android Studio\jbr",
            r"C:\Program Files\Android\Android Studio\jre",
            r"C:\Program Files\Android\Android Studio\jbr-17",
            r"C:\Program Files\Java",
        ]
    elif system == 'Darwin': # MacOS
        possible_paths = [
            "/Applications/Android Studio.app/Contents/jbr/Contents/Home",
            "/Applications/Android Studio.app/Contents/jre/Contents/Home",
            "/Library/Java/JavaVirtualMachines"
        ]
    else: # Linux
        possible_paths = [
            "/snap/android-studio/current/android-studio/jbr",
            "/opt/android-studio/jbr"
        ]

    # Check environment variable first
    if os.environ.get('JAVA_HOME'):
        return os.environ['JAVA_HOME']

    for path_str in possible_paths:
        path = Path(path_str)
        if path.exists():
            if 'Java' in path_str and system == 'Windows':
                # For generic Java folder, grab the first JDK found
                jdks = list(path.glob('jdk*'))
                if jdks:
                    return str(jdks[0])
            return str(path)
            
    return None

def run_command(command, cwd=None, env=None):
    """Runs a shell command and prints output."""
    print(f"👉 Running: {command}")
    try:
        # On Windows, shell=True is often needed for npm/npx
        is_windows = platform.system() == 'Windows'
        subprocess.check_call(command, cwd=cwd, env=env, shell=is_windows)
    except subprocess.CalledProcessError as e:
        print(f"❌ Error running command: {command}")
        sys.exit(1)

def main():
    # 1. Setup JAVA_HOME
    java_home = get_java_home()
    if not java_home:
        print("❌ Could not find JAVA_HOME. Please set it manually.")
        sys.exit(1)
    
    print(f"✅ Found JAVA_HOME: {java_home}")
    
    # Prepare environment variables
    env = os.environ.copy()
    env['JAVA_HOME'] = java_home
    # Ensure Java bin is in path for the process
    env['PATH'] = f"{os.path.join(java_home, 'bin')}{os.pathsep}{env['PATH']}"

    root_dir = os.getcwd()
    android_dir = os.path.join(root_dir, 'android')

    # 2. Rebuild the Timer Service JS
    print("\n--- 📦 Building Timer Code ---")
    run_command("npm run build:timer", cwd=root_dir, env=env)

    # 3. Clean Android Build (The Fix for the Sound File)
    print("\n--- 🧹 Cleaning Android Project ---")
    if platform.system() == 'Windows':
        gradle_cmd = "gradlew.bat clean"
    else:
        gradle_cmd = "./gradlew clean"
    
    run_command(gradle_cmd, cwd=android_dir, env=env)

    # 4. Sync Capacitor
    print("\n--- 🔄 Syncing Native Assets ---")
    run_command("npx cap sync", cwd=root_dir, env=env)

    # 5. Open Android Studio (Optional)
    print("\n--- 🚀 Opening Android Studio ---")
    print("(Remember to click the Green 'Run' arrow inside Android Studio)")
    run_command("npx cap open android", cwd=root_dir, env=env)

if __name__ == "__main__":
    main()