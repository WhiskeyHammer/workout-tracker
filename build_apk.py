import os
import subprocess
import socket
import qrcode
import sys
import shutil
import platform
import time  # <--- Added import

def set_java_home():
    """Auto-detects Java from Android Studio if JAVA_HOME is missing."""
    if os.environ.get('JAVA_HOME') and os.path.exists(os.environ['JAVA_HOME']):
        return

    system = platform.system()
    candidates = []
    
    if system == "Windows":
        candidates = [
            r"C:\Program Files\Android\Android Studio\jbr",
            r"C:\Program Files\Android\Android Studio\jre",
        ]
    elif system == "Darwin": 
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
    if os.environ.get('ANDROID_HOME') and os.path.exists(os.environ['ANDROID_HOME']):
        print(f"[+] Using existing ANDROID_HOME: {os.environ['ANDROID_HOME']}")
        return

    system = platform.system()
    sdk_path = None
    
    if system == "Windows":
        local_app_data = os.environ.get('LOCALAPPDATA')
        if local_app_data:
            candidate = os.path.join(local_app_data, "Android", "Sdk")
            if os.path.exists(candidate):
                sdk_path = candidate
    elif system == "Darwin":
        candidate = os.path.expanduser("~/Library/Android/sdk")
        if os.path.exists(candidate):
            sdk_path = candidate
    elif system == "Linux":
        candidate = os.path.expanduser("~/Android/Sdk")
        if os.path.exists(candidate):
            sdk_path = candidate

    if sdk_path:
        print(f"[+] Found Android SDK at: {sdk_path}")
        os.environ['ANDROID_HOME'] = sdk_path
        os.environ['ANDROID_SDK_ROOT'] = sdk_path
        
        platform_tools = os.path.join(sdk_path, "platform-tools")
        if os.path.exists(platform_tools):
            os.environ['PATH'] = platform_tools + os.pathsep + os.environ['PATH']

        local_props_path = os.path.join("android", "local.properties")
        
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
    print(f"🔹 Running: {command}")
    try:
        subprocess.check_call(command, shell=True, cwd=cwd)
    except subprocess.CalledProcessError:
        print(f"❌ Error running command: {command}")
        sys.exit(1)

def generate_qr(data):
    qr = qrcode.QRCode()
    qr.add_data(data)
    qr.print_ascii()

def main():
    print("🚀 Starting Local Build Process...")

    # Define Output Paths
    output_dir = os.path.abspath(os.path.join("android", "app", "build", "outputs", "apk", "debug"))
    default_apk = "app-debug.apk"
    custom_apk = "app-debug-run-coach.apk"
    
    source_path = os.path.join(output_dir, default_apk)
    final_path = os.path.join(output_dir, custom_apk)

    # 1. Sync
    print("\n📦 Syncing HTML/JS to Android...")
    run_command("npx cap sync android")

    # 2. Build
    print("\n🔨 Compiling APK...")
    is_windows = os.name == 'nt'
    gradle_cmd = "gradlew.bat assembleDebug" if is_windows else "./gradlew assembleDebug"
    run_command(gradle_cmd, cwd="android")

    # 3. Locate & Verify Freshness
    if not os.path.exists(source_path):
        print(f"❌ Build finished, but {default_apk} not found.")
        sys.exit(1)

    file_age = time.time() - os.path.getmtime(source_path)
    if file_age > 60:
        print(f"❌ Error: The APK found is stale! It is {int(file_age)} seconds old.")
        print("   This means the Gradle build failed to produce a NEW file.")
        sys.exit(1)
    
    print(f"✨ Verified fresh build (created {int(file_age)}s ago).")

    # 4. Rename
    # Ensure no conflict before renaming
    if os.path.exists(final_path):
        os.remove(final_path)
    
    os.rename(source_path, final_path)
    print(f"✨ Renamed to: {custom_apk}")

    # 5. Copy to Downloads (Optional Backup)
    try:
        downloads_path = os.path.join(os.path.expanduser("~"), "Downloads")
        destination_apk = os.path.join(downloads_path, custom_apk)
        shutil.copy2(final_path, destination_apk)
        print(f"📂 Backup copied to: {destination_apk}")
    except Exception:
        pass

    # 6. Generate Link & QR
    ip = get_ip()
    port = 8000
    url = f"http://{ip}:{port}/{custom_apk}"
    
    print("\n" + "="*40)
    print(f"✅ BUILD SUCCESSFUL!")
    print(f"Scan the QR code below to install:")
    print("="*40)
    
    generate_qr(url)
    
    print(f"\n🔗 Link: {url}")
    print("📡 Server running... Press Ctrl+C to stop.")

    # 7. Start Server from Project Output Directory
    # We change directory explicitly to handle paths with spaces
    os.chdir(output_dir)
    subprocess.run([sys.executable, "-m", "http.server", str(port)])

if __name__ == "__main__":
    set_java_home()
    set_android_sdk()
    main()