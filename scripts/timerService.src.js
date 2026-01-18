import { Capacitor } from '@capacitor/core';
import { ForegroundService } from '@capawesome-team/capacitor-android-foreground-service';
import { NativeAudio } from '@capacitor-community/native-audio';
import { LocalNotifications } from '@capacitor/local-notifications';

// Timer state
let timerInterval = null;
let timerEndTime = null;
let onTickCallback = null;
let onCompleteCallback = null;
const ALERT_ID = 99999; // Unique ID for the finish alarm

async function init() {
  if (Capacitor.isNativePlatform()) {
    try {
      // 1. Request permissions for Notifications and Alarms
      await LocalNotifications.requestPermissions();
      
      // 2. Delete the old possibly broken channel (crucial step!)
      try {
        await LocalNotifications.deleteChannel({ id: 'workout-timer-alert' });
      } catch (e) { /* ignore if didn't exist */ }

      // 3. Create the ALERT channel (High Importance + Sound)
      // This is for the "DONE" message
      await LocalNotifications.createChannel({
        id: 'workout-timer-alert',
        name: 'Workout Timer (Complete)',
        description: 'Alerts when rest is done',
        importance: 5, // High
        visibility: 1,
        sound: 'beep.wav', // Looks for res/raw/beep.wav
        vibration: true
      });

      // 4. Create the SILENT channel (Low Importance)
      // This is for the countdown updating every second
      await ForegroundService.createNotificationChannel({
        id: 'workout-timer-silent',
        name: 'Workout Timer (Countdown)',
        description: 'Shows active countdown',
        importance: 2, // Low (no sound, no popup)
        visibility: 1
      });

      // Preload NativeAudio as backup for when app is open
      await NativeAudio.preload({
        assetId: 'timerBeep',
        assetPath: 'beep.wav',
        audioChannelNum: 1,
        isUrl: false
      });
      
      console.log('Timer channels and audio initialized');
    } catch (err) {
      console.error('Failed to init timer service:', err);
    }
  }
}

// Format seconds as M:SS
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

async function startNativeTimer(seconds, exerciseName) {
  if (!Capacitor.isNativePlatform()) return;

  const endTime = new Date(Date.now() + seconds * 1000);

  try {
    // 1. Schedule the FINAL ALERT immediately
    // Android OS handles this, so it works even if app sleeps
    await LocalNotifications.schedule({
      notifications: [{
        id: ALERT_ID,
        title: 'REST COMPLETE',
        body: `Time to set: ${exerciseName}`,
        channelId: 'workout-timer-alert', // Use the loud channel
        sound: 'beep.wav',
        schedule: { at: endTime },
        smallIcon: 'ic_stat_icon_config_sample', // ensure this icon exists or remove line
        actionTypeId: 'OPEN_APP'
      }]
    });

    // 2. Start the SILENT countdown service
    // This updates the notification bar visually while app is alive
    await ForegroundService.startForegroundService({
      id: 1,
      title: 'Rest Timer',
      body: `${formatTime(seconds)} - ${exerciseName}`,
      smallIcon: 'ic_stat_icon_config_sample',
      notificationChannelId: 'workout-timer-silent',
      buttons: [{ title: 'Skip', id: 1 }]
    });
    
  } catch (err) {
    console.error('Failed to start native timer:', err);
  }
}

// Stop everything
async function stopNativeTimer() {
  if (!Capacitor.isNativePlatform()) return;
  
  try {
    // Cancel the scheduled future beep
    await LocalNotifications.cancel({ notifications: [{ id: ALERT_ID }] });
    // Stop the visual countdown
    await ForegroundService.stopForegroundService();
  } catch (err) {
    console.error('Error stopping timer:', err);
  }
}

async function updateForegroundService(seconds, exerciseName) {
  if (!Capacitor.isNativePlatform()) return;
  try {
    // Only update the visual text
    await ForegroundService.updateForegroundService({
      id: 1,
      title: 'Rest Timer',
      body: `${formatTime(seconds)} - ${exerciseName}`,
      smallIcon: 'ic_stat_icon_config_sample',
      notificationChannelId: 'workout-timer-silent'
    });
  } catch (err) {}
}

async function playBeep() {
  try {
    await NativeAudio.play({ assetId: 'timerBeep' });
  } catch (e) {}
}

async function setupButtonListener() {
  if (!Capacitor.isNativePlatform()) return;
  
  // Listen for "Skip" on the foreground service
  await ForegroundService.addListener('buttonClicked', (event) => {
    if (event.buttonId === 1) { // Skip
        window.timerService.stop();
        if (onCompleteCallback) onCompleteCallback(true);
    }
  });

  // Listen for clicking the "Complete" notification to open app
  await LocalNotifications.addListener('localNotificationActionPerformed', (payload) => {
    // If they click the "Rest Complete" notification, just clear it
    if (payload.notification.id === ALERT_ID) {
       // App is opening, logic is handled by UI
    }
  });
}

window.timerService = {
  init: async function() {
    await init();
    await setupButtonListener();
  },
  
  start: async function(options) {
    const { seconds, exerciseName, onTick, onComplete } = options;
    onTickCallback = onTick;
    onCompleteCallback = onComplete;
    
    // Clear any existing
    this.stop(false); 
    
    timerEndTime = Date.now() + (seconds * 1000);
    
    // Start Native Schedulers
    await startNativeTimer(seconds, exerciseName);
    
    // Start JS Interval (for UI updates and foreground countdown)
    timerInterval = setInterval(async () => {
      const now = Date.now();
      const remainingMs = Math.max(0, timerEndTime - now);
      const remainingSeconds = Math.ceil(remainingMs / 1000);
      
      if (onTickCallback) onTickCallback({ remainingMs, remainingSeconds });
      
      // Update notification text (if app is awake enough to do so)
      if (remainingMs > 0 && remainingSeconds !== this._lastSecond) {
        this._lastSecond = remainingSeconds;
        await updateForegroundService(remainingSeconds, exerciseName);
      }
      
      // Timer Complete Logic
      if (remainingMs === 0) {
        // Clear interval but don't cancel notification yet (let it ring)
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        
        // If app is OPEN, play sound via NativeAudio too (double safety)
        await playBeep();
        
        // Stop the "countdown" service, but leave the "Alert" notification
        await ForegroundService.stopForegroundService();

        if (onCompleteCallback) onCompleteCallback(false);
      }
    }, 100);
  },
  
  stop: async function(shouldStopNative = true) {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    timerEndTime = null;
    this._lastSecond = null;
    
    if (shouldStopNative) {
        await stopNativeTimer();
    }
  },
  
  isRunning: function() { return timerInterval !== null; },
  _lastSecond: null
};

// WakeLock Manager
window.wakeLockManager = {
  wakeLock: null,
  request: async function() {
    try {
      if ('wakeLock' in navigator) {
        this.wakeLock = await navigator.wakeLock.request('screen');
        return true;
      }
    } catch (e) {}
    return false;
  },
  release: async function() {
    if (this.wakeLock) {
      await this.wakeLock.release();
      this.wakeLock = null;
    }
  }
};

document.addEventListener('visibilitychange', async () => {
  if (document.visibilityState === 'visible' && !window.wakeLockManager.wakeLock) {
    const hasActiveWorkout = document.querySelector('.zz_btn_toggle_set_complete');
    if (hasActiveWorkout) await window.wakeLockManager.request();
  }
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => window.timerService.init());
} else {
  window.timerService.init();
}