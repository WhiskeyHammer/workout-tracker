import { Capacitor } from '@capacitor/core';
import { ForegroundService } from '@capawesome-team/capacitor-android-foreground-service';
import { NativeAudio } from '@capacitor-community/native-audio';

// Timer state
let timerInterval = null;
let timerEndTime = null;
let onTickCallback = null;
let onCompleteCallback = null;

// Initialize
async function init() {
  if (Capacitor.isNativePlatform()) {
    try {
      // 1. Create SILENT channel (For the countdown)
      // We set 'importance: 2' (Low) so it doesn't make sound or popup
      await ForegroundService.createNotificationChannel({
        id: 'workout-timer-silent',
        name: 'Workout Timer (Countdown)',
        description: 'Shows active countdown',
        importance: 2, 
        visibility: 1
      });

      // 2. Create ALERT channel (For the finish)
      // We set 'importance: 5' (High) and attach the 'beep' sound
      // This tells Android: "When a notification hits this channel, play res/raw/beep.wav"
      await ForegroundService.createNotificationChannel({
        id: 'workout-timer-alert',
        name: 'Workout Timer (Complete)',
        description: 'Alerts when rest is done',
        importance: 5, 
        sound: 'beep', 
        visibility: 1,
        vibration: true
      });

      // 3. Preload NativeAudio (For when the app is actually open)
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

// Start foreground service (Countdown)
async function startForegroundService(seconds, exerciseName) {
  if (!Capacitor.isNativePlatform()) return;
  
  try {
    // Start the service using the SILENT channel
    await ForegroundService.startForegroundService({
      id: 1,
      title: 'Rest Timer',
      body: `${formatTime(seconds)} - ${exerciseName}`,
      smallIcon: 'ic_stat_icon_config_sample',
      buttons: [{ title: 'Skip', id: 1 }],
      notificationChannelId: 'workout-timer-silent', 
    });
  } catch (err) {
    console.error('Failed to start foreground service:', err);
  }
}

// Update the countdown
async function updateForegroundService(seconds, exerciseName) {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await ForegroundService.updateForegroundService({
      id: 1,
      title: 'Rest Timer',
      body: `${formatTime(seconds)} - ${exerciseName}`,
      smallIcon: 'ic_stat_icon_config_sample',
      notificationChannelId: 'workout-timer-silent'
    });
  } catch (err) { /* Service might have stopped */ }
}

// Trigger the 'DONE' notification
async function triggerCompleteNotification() {
  if (!Capacitor.isNativePlatform()) return;

  try {
    // Stop the silent countdown...
    await ForegroundService.stopForegroundService();
    
    // ...and immediately start the ALERT service (Sound!)
    await ForegroundService.startForegroundService({
      id: 2, 
      title: 'REST COMPLETE',
      body: 'Get back to work!',
      smallIcon: 'ic_stat_icon_config_sample',
      notificationChannelId: 'workout-timer-alert', // Uses the sound channel
      buttons: [{ title: 'OK', id: 2 }]
    });

    // Auto-clear after 5s so the notification doesn't stay forever
    setTimeout(() => {
        ForegroundService.stopForegroundService();
    }, 5000);

  } catch (err) {
    console.error('Failed to trigger complete notification:', err);
  }
}

async function playBeep() {
  try {
    // Try to play the in-app sound first
    await NativeAudio.play({ assetId: 'timerBeep' });
  } catch (e) { 
    console.log("NativeAudio play failed (app likely backgrounded), relying on Notification sound.");
  }
}

// Listen for button clicks (Skip / OK)
async function setupButtonListener() {
  if (!Capacitor.isNativePlatform()) return;
  
  await ForegroundService.addListener('buttonClicked', (event) => {
    if (event.buttonId === 1) { // Skip button
        window.timerService.stop();
        if (onCompleteCallback) onCompleteCallback(true);
    }
    if (event.buttonId === 2) { // OK button (Finish)
        ForegroundService.stopForegroundService();
    }
  });
}

// Main Service
window.timerService = {
  init: async function() {
    await init();
    await setupButtonListener();
  },
  
  start: async function(options) {
    const { seconds, exerciseName, onTick, onComplete } = options;
    onTickCallback = onTick;
    onCompleteCallback = onComplete;
    
    this.stop(); 
    
    timerEndTime = Date.now() + (seconds * 1000);
    await startForegroundService(seconds, exerciseName);
    
    timerInterval = setInterval(async () => {
      const now = Date.now();
      const remainingMs = Math.max(0, timerEndTime - now);
      const remainingSeconds = Math.ceil(remainingMs / 1000);
      
      if (onTickCallback) onTickCallback({ remainingMs, remainingSeconds });
      
      if (remainingMs > 0 && remainingSeconds !== this._lastSecond) {
        this._lastSecond = remainingSeconds;
        await updateForegroundService(remainingSeconds, exerciseName);
      }
      
      if (remainingMs === 0) {
        this.stop(false); // Stop interval, keep notification logic for completion
        
        await playBeep(); // 1. Try NativeAudio
        await triggerCompleteNotification(); // 2. Trigger System Sound
        
        if (onCompleteCallback) onCompleteCallback(false);
      }
    }, 100);
  },
  
  stop: async function(clearNotification = true) {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    timerEndTime = null;
    this._lastSecond = null;
    
    if (clearNotification) {
        await ForegroundService.stopForegroundService();
    }
  },
  
  isRunning: function() { return timerInterval !== null; },
  _lastSecond: null
};

// WakeLock Logic (Unchanged from your original code)
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