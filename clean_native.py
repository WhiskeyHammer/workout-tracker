import os
import subprocess
import sys
import platform
from pathlib import Path

def get_java_home():
    system = platform.system()
    if system == 'Windows':
        possible_paths = [
            r"C:\Program Files\Android\Android Studio\jbr",
            r"C:\Program Files\Android\Android Studio\jre",
            r"C:\Program Files\Java",
        ]
    elif system == 'Darwin':
        possible_paths = ["/Applications/Android Studio.app/Contents/jbr/Contents/Home"]
    else:
        possible_paths = ["/opt/android-studio/jbr"]

    if os.environ.get('JAVA_HOME'): return os.environ['JAVA_HOME']

    for path_str in possible_paths:
        path = Path(path_str)
        if path.exists():
            if 'Java' in path_str and system == 'Windows':
                jdks = list(path.glob('jdk*'))
                if jdks: return str(jdks[0])
            return str(path)
    return None

def run_command(command, cwd=None, env=None):
    print(f"👉 Running: {command}")
    try:
        is_windows = platform.system() == 'Windows'
        subprocess.check_call(command, cwd=cwd, env=env, shell=is_windows)
    except subprocess.CalledProcessError:
        print(f"❌ Error running: {command}")
        sys.exit(1)

def main():
    java_home = get_java_home()
    if not java_home:
        print("❌ JAVA_HOME not found.")
        sys.exit(1)
    
    print(f"✅ Found JAVA_HOME: {java_home}")
    env = os.environ.copy()
    env['JAVA_HOME'] = java_home
    env['PATH'] = f"{os.path.join(java_home, 'bin')}{os.pathsep}{env['PATH']}"

    root_dir = os.getcwd()
    android_dir = os.path.join(root_dir, 'android')

    # 1. Build JS
    run_command("npm run build:timer", cwd=root_dir, env=env)

    # 2. Clean Android (Fixes Sound issues)
    cmd = "gradlew.bat clean" if platform.system() == 'Windows' else "./gradlew clean"
    run_command(cmd, cwd=android_dir, env=env)

    # 3. Sync & Open
    run_command("npx cap sync", cwd=root_dir, env=env)

if __name__ == "__main__":
    main()