import os
import struct
import math
import re
import subprocess
import sys
import platform
from pathlib import Path

# --- CONFIG ---
FREQUENCY = 800     # Original Frequency
BEEP_DURATION = 0.8 # Audible Beep Length
SILENCE_PADDING = 0.2 # Silence to prevent cutoff
TOTAL_DURATION = BEEP_DURATION + SILENCE_PADDING
VOLUME = 1.0        # Max Amplitude
SAMPLE_RATE = 44100
CHANNEL_ID_REGEX = r"(workout-timer-alert-v)[0-9]+"
NEW_CHANNEL_ID = "workout-timer-alert-v13" # Moving to V13

def get_java_home():
    system = platform.system()
    possible_paths = []
    if system == 'Windows':
        possible_paths = [
            r"C:\Program Files\Android\Android Studio\jbr",
            r"C:\Program Files\Android\Android Studio\jre",
            r"C:\Program Files\Java"
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

def generate_wav(path):
    """Generates Padded Sine Beep"""
    num_samples = int(SAMPLE_RATE * TOTAL_DURATION)
    beep_samples = int(SAMPLE_RATE * BEEP_DURATION)
    data_size = num_samples * 2
    file_size = 36 + data_size
    
    with open(path, 'wb') as f:
        f.write(b'RIFF')
        f.write(struct.pack('<I', file_size))
        f.write(b'WAVE')
        f.write(b'fmt ')
        f.write(struct.pack('<I', 16)) 
        f.write(struct.pack('<H', 1))  
        f.write(struct.pack('<H', 1))  
        f.write(struct.pack('<I', SAMPLE_RATE))
        f.write(struct.pack('<I', SAMPLE_RATE * 2)) 
        f.write(struct.pack('<H', 2))  
        f.write(struct.pack('<H', 16)) 
        f.write(b'data')
        f.write(struct.pack('<I', data_size))
        
        for i in range(num_samples):
            if i < beep_samples:
                t = float(i) / SAMPLE_RATE
                sample = math.sin(2 * math.pi * FREQUENCY * t) * VOLUME
                if i < 500: sample *= (i / 500)
                elif i > beep_samples - 500: sample *= ((beep_samples - i) / 500)
            else:
                sample = 0.0
            
            val = int(sample * 32767)
            f.write(struct.pack('<h', val))
            
    print(f"✅ Generated Beep at: {path}")

def update_code_version():
    js_path = Path("scripts/timerService.src.js")
    if not js_path.exists(): return False
    content = js_path.read_text(encoding='utf-8')
    new_content = re.sub(CHANNEL_ID_REGEX, NEW_CHANNEL_ID, content)
    if new_content != content:
        js_path.write_text(new_content, encoding='utf-8')
        print(f"✅ Updated code to Channel: {NEW_CHANNEL_ID}")
    return True

def run_command(cmd, env):
    print(f"\n👉 Running: {cmd}")
    is_win = platform.system() == 'Windows'
    try:
        subprocess.check_call(cmd, env=env, shell=is_win)
    except subprocess.CalledProcessError:
        sys.exit(1)

def main():
    print("🔊 --- SYNCING SOUNDS (V13) --- 🔊")
    java_home = get_java_home()
    if not java_home: sys.exit(1)
    env = os.environ.copy()
    env['JAVA_HOME'] = java_home
    env['PATH'] = f"{os.path.join(java_home, 'bin')}{os.pathsep}{env['PATH']}"
    
    # Define BOTH locations
    loc1 = Path("android/app/src/main/res/raw") # For Notifications (Locked)
    loc2 = Path("android/app/src/main/assets")  # For NativeAudio (Unlocked)
    
    loc1.mkdir(parents=True, exist_ok=True)
    loc2.mkdir(parents=True, exist_ok=True)
    
    # Clean and Generate
    for loc in [loc1, loc2]:
        for f in loc.glob("beep.*"): f.unlink()
        generate_wav(loc / "beep.wav")
    
    if not update_code_version(): sys.exit(1)
        
    run_command("npm run build:timer", env)
    
    clean_cmd = "gradlew.bat clean" if platform.system() == 'Windows' else "./gradlew clean"
    android_dir = os.path.join(os.getcwd(), 'android')
    if os.path.exists(os.path.join(android_dir, 'gradlew.bat')):
        clean_cmd = f"cd android && {clean_cmd} && cd .."
    run_command(clean_cmd, env)
    
    run_command("npx cap sync", env)

if __name__ == "__main__":
    main()