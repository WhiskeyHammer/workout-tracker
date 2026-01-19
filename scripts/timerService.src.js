import { Capacitor } from '@capacitor/core';
import { ForegroundService } from '@capawesome-team/capacitor-android-foreground-service';
import { NativeAudio } from '@capacitor-community/native-audio';
import { LocalNotifications } from '@capacitor/local-notifications';

// Timer state
let timerInterval = null;
let timerEndTime = null;
let onTickCallback = null;
let onCompleteCallback = null;
let isNotificationPending = false;

// CONSTANTS
const ALERT_ID = 99999; 
const ALERT_CHANNEL_ID = 'workout-timer-alert-v4'; // V4 to force sound reset
const ALERT_SOUND = 'beep'; 

async function init() {
  if (Capacitor.isNativePlatform()) {
    try {
      await LocalNotifications.requestPermissions();
      
      // Create Channel V4
      await LocalNotifications.createChannel({
        id: ALERT_CHANNEL_ID,
        name: 'Workout Timer (Complete)',
        description: 'Alerts when rest is done',
        importance: 5,
        visibility: 1,
        sound: ALERT_SOUND, // 'beep' -> res/raw/beep.wav
        vibration: true
      });

      await ForegroundService.createNotificationChannel({
        id: 'workout-timer-silent',
        name: 'Workout Timer (Countdown)',
        description: 'Shows active countdown',
        importance: 2,
        visibility: 1
      });

      await NativeAudio.preload({
        assetId: 'timerBeep',
        assetPath: 'beep.wav',
        audioChannelNum: 1,
        isUrl: false
      });
      
      console.log('Timer channels initialized');
    } catch (err) {
      console.error('Failed to init timer service:', err);
    }
  }
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

async function startNativeTimer(seconds, exerciseName) {
  if (!Capacitor.isNativePlatform()) return;

  const endTime = new Date(Date.now() + seconds * 1000);
  isNotificationPending = true;

  try {
    // Schedule System Notification (For background/locked state)
    await LocalNotifications.schedule({
      notifications: [{
        id: ALERT_ID,
        title: 'REST COMPLETE',
        body: `Time to set: ${exerciseName}`,
        channelId: ALERT_CHANNEL_ID,
        sound: ALERT_SOUND,
        schedule: { 
            at: endTime,
            allowWhileIdle: true 
        },
        smallIcon: 'ic_stat_icon_config_sample',
        actionTypeId: 'OPEN_APP'
      }]
    });

    // Start Foreground Service (Visual Countdown)
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

async function stopNativeTimer() {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await LocalNotifications.cancel({ notifications: [{ id: ALERT_ID }] });
    isNotificationPending = false;
    await ForegroundService.stopForegroundService();
  } catch (err) {}
}

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
  } catch (err) {}
}

async function playBeep() {
  try {
    await NativeAudio.play({ assetId: 'timerBeep' });
  } catch (e) {}
}

async function setupButtonListener() {
  if (!Capacitor.isNativePlatform()) return;
  
  await ForegroundService.addListener('buttonClicked', (event) => {
    if (event.buttonId === 1) { // Skip
        window.timerService.stop();
        if (onCompleteCallback) onCompleteCallback(true);
    }
  });

  await LocalNotifications.addListener('localNotificationActionPerformed', (payload) => {
    if (payload.notification.id === ALERT_ID) {
       // App opened via notification
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
    
    this.stop(false); 
    
    timerEndTime = Date.now() + (seconds * 1000);
    
    await startNativeTimer(seconds, exerciseName);
    
    timerInterval = setInterval(async () => {
      const now = Date.now();
      const remainingMs = Math.max(0, timerEndTime - now);
      const remainingSeconds = Math.ceil(remainingMs / 1000);
      
      if (onTickCallback) onTickCallback({ remainingMs, remainingSeconds });
      
      if (remainingMs > 0 && remainingSeconds !== this._lastSecond) {
        this._lastSecond = remainingSeconds;
        await updateForegroundService(remainingSeconds, exerciseName);
      }

      // --- NEW LOGIC: PRE-EMPTIVE CANCEL ---
      // If we are less than 1.5 seconds from finish AND the app is active (setInterval is running),
      // we cancel the System Notification so it doesn't double-fire.
      if (remainingMs < 1500 && isNotificationPending) {
         try {
             LocalNotifications.cancel({ notifications: [{ id: ALERT_ID }] });
             isNotificationPending = false;
         } catch(e) {}
      }
      
      // Timer Complete
      if (remainingMs === 0) {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        
        // App is Open -> Play App Sound
        // (If app was closed, this code wouldn't run, and the System Notification would have fired)
        await playBeep(); 
        
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