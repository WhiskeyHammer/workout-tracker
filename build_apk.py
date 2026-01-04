import os
import subprocess
import socket
import qrcode
import sys
import shutil
import platform

def set_java_home():
    """Auto-detects Java from Android Studio if JAVA_HOME is missing."""
    if os.environ.get('JAVA_HOME') and os.path.exists(os.environ['JAVA_HOME']):
        return

    system = platform.system()
    candidates = []
    
    # Common Android Studio Java paths
    if system == "Windows":
        candidates = [
            r"C:\Program Files\Android\Android Studio\jbr",
            r"C:\Program Files\Android\Android Studio\jre",
        ]
    elif system == "Darwin": # macOS
        candidates = [
            "/Applications/Android Studio.app/Contents/jbr/Contents/Home",
            "/Applications/Android Studio.app/Contents/jre/Contents/Home",
        ]
    elif system == "Linux":
        candidates = [
            "/opt/android-studio/jbr",
            "/usr/local/android-studio/jbr",
            "/snap/android-studio/current/android-studio/jbr",
        ]

    for path in candidates:
        if os.path.exists(path):
            print(f"[+] Found Java at: {path}")
            os.environ['JAVA_HOME'] = path
            bin_path = os.path.join(path, "bin")
            if os.path.exists(bin_path):
                os.environ['PATH'] = bin_path + os.pathsep + os.environ['PATH']
            return

    print("[-] Warning: Could not auto-detect JAVA_HOME.")

def set_android_sdk():
    """Auto-detects Android SDK and creates local.properties."""
    # Check if we already have it
    if os.environ.get('ANDROID_HOME') and os.path.exists(os.environ['ANDROID_HOME']):
        print(f"[+] Using existing ANDROID_HOME: {os.environ['ANDROID_HOME']}")
        return

    system = platform.system()
    sdk_path = None
    
    # 1. Search for SDK in common locations
    if system == "Windows":
        # Standard Windows Path: %LOCALAPPDATA%\Android\Sdk
        local_app_data = os.environ.get('LOCALAPPDATA')
        if local_app_data:
            candidate = os.path.join(local_app_data, "Android", "Sdk")
            if os.path.exists(candidate):
                sdk_path = candidate
    elif system == "Darwin": # macOS
        candidate = os.path.expanduser("~/Library/Android/sdk")
        if os.path.exists(candidate):
            sdk_path = candidate
    elif system == "Linux":
        candidate = os.path.expanduser("~/Android/Sdk")
        if os.path.exists(candidate):
            sdk_path = candidate

    # 2. If found, configure environment and local.properties
    if sdk_path:
        print(f"[+] Found Android SDK at: {sdk_path}")
        os.environ['ANDROID_HOME'] = sdk_path
        os.environ['ANDROID_SDK_ROOT'] = sdk_path
        
        # Add platform-tools to path (optional but helpful)
        platform_tools = os.path.join(sdk_path, "platform-tools")
        if os.path.exists(platform_tools):
            os.environ['PATH'] = platform_tools + os.pathsep + os.environ['PATH']

        # 3. Create android/local.properties (Critical for Gradle)
        local_props_path = os.path.join("android", "local.properties")
        
        # Windows paths in properties files need double backslashes
        if system == "Windows":
            write_path = sdk_path.replace("\\", "\\\\")
        else:
            write_path = sdk_path

        try:
            with open(local_props_path, "w") as f:
                f.write(f"sdk.dir={write_path}\n")
            print(f"[+] Created local.properties pointing to SDK.")
        except Exception as e:
            print(f"[-] Warning: Could not write local.properties: {e}")
    else:
        print("[-] Warning: Could not auto-detect Android SDK. Build might fail.")

def get_ip():
    """Finds the local IP address of your computer."""
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(('10.255.255.255', 1))
        IP = s.getsockname()[0]
    except Exception:
        IP = '127.0.0.1'
    finally:
        s.close()
    return IP

def run_command(command, cwd=None):
    """Runs a shell command and stops if it fails."""
    print(f"🔹 Running: {command}")
    try:
        subprocess.check_call(command, shell=True, cwd=cwd)
    except subprocess.CalledProcessError:
        print(f"❌ Error running command: {command}")
        sys.exit(1)

def generate_qr(data):
    """Generates a QR code in the terminal."""
    qr = qrcode.QRCode()
    qr.add_data(data)
    qr.print_ascii()

def main():
    print("🚀 Starting Local Build Process...")

    # 1. Sync Web Assets
    print("\n📦 Syncing HTML/JS to Android...")
    run_command("npx cap sync android")

    # 2. Build APK via Gradle
    print("\n🔨 Compiling APK...")
    is_windows = os.name == 'nt'
    gradle_cmd = "gradlew.bat assembleDebug" if is_windows else "./gradlew assembleDebug"
    run_command(gradle_cmd, cwd="android")

    # 3. Locate Output
    output_dir = os.path.join("android", "app", "build", "outputs", "apk", "debug")
    apk_name = "app-debug.apk"
    source_apk = os.path.join(output_dir, apk_name)
    
    if not os.path.exists(source_apk):
        print("❌ Build finished, but APK not found.")
        sys.exit(1)

    # 3.5 Copy to Windows Downloads Folder
    print("\n📂 Copying to Downloads...")
    try:
        downloads_path = os.path.join(os.path.expanduser("~"), "Downloads")
        destination_apk = os.path.join(downloads_path, apk_name)
        shutil.copy2(source_apk, destination_apk)
        print(f"✅ APK Saved to: {destination_apk}")
    except Exception as e:
        print(f"⚠️ Could not copy to Downloads folder: {e}")

    # 4. Generate Link & QR
    ip = get_ip()
    port = 8000
    url = f"http://{ip}:{port}/{apk_name}"
    
    print("\n" + "="*40)
    print(f"✅ BUILD SUCCESSFUL!")
    print(f"scan the QR code below to install:")
    print("="*40)
    
    generate_qr(url)
    
    print(f"\n🔗 Text Link: {url}")
    print("📡 Server running... Press Ctrl+C to stop.")

    # 5. Start Server
    if is_windows:
        os.system(f"python -m http.server {port} --directory {output_dir}")
    else:
        os.system(f"python3 -m http.server {port} --directory {output_dir}")

if __name__ == "__main__":
    set_java_home()
    set_android_sdk() # <--- Added this call
    main()