import { Capacitor } from '@capacitor/core';
import { ForegroundService } from '@capawesome-team/capacitor-android-foreground-service';
import { NativeAudio } from '@capacitor-community/native-audio';
import { LocalNotifications } from '@capacitor/local-notifications';

// Timer state
let timerInterval = null;
let timerEndTime = null;
let onTickCallback = null;
let onCompleteCallback = null;

// CONSTANTS - V7 (New Channel to force sound update)
const ALERT_ID = 99999; 
const ALERT_CHANNEL_ID = 'workout-timer-alert-v7'; 
const ALERT_SOUND = 'beep'; 

async function init() {
  if (Capacitor.isNativePlatform()) {
    try {
      await LocalNotifications.requestPermissions();
      
      // 1. Create Channel V7
      await LocalNotifications.createChannel({
        id: ALERT_CHANNEL_ID,
        name: 'Workout Timer (Complete)',
        description: 'Alerts when rest is done',
        importance: 5, 
        visibility: 1,
        sound: ALERT_SOUND,
        vibration: true
      });

      // 2. Create Silent Channel
      await ForegroundService.createNotificationChannel({
        id: 'workout-timer-silent',
        name: 'Workout Timer (Countdown)',
        description: 'Shows active countdown',
        importance: 2,
        visibility: 1
      });

      // 3. Preload NativeAudio
      await NativeAudio.preload({
        assetId: 'timerBeep',
        assetPath: 'beep.wav',
        audioChannelNum: 1,
        isUrl: false
      });
      
      console.log(`Timer initialized. Using Channel: ${ALERT_CHANNEL_ID}`);
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

  try {
    // Schedule Notification
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

    // Start Visual Countdown
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
      
      if (remainingMs === 0) {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        
        // Smart Logic: Check if we are "late" (app was asleep)
        const timeSinceTarget = Date.now() - timerEndTime;
        const isLate = timeSinceTarget > 1500;
        
        // Kill the notification immediately so it doesn't ring when we unlock
        await LocalNotifications.cancel({ notifications: [{ id: ALERT_ID }] });
        await ForegroundService.stopForegroundService();
        
        if (!isLate) {
            await playBeep(); 
        } else {
            console.log('App resumed late. Silencing App (Notification handled it).');
        }

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

// --- AGGRESSIVE KILL SWITCH ---
// The moment the app becomes visible, kill any ringing notification
document.addEventListener('visibilitychange', async () => {
  if (document.visibilityState === 'visible') {
      try {
          // Immediately kill the alert notification
          await LocalNotifications.cancel({ notifications: [{ id: ALERT_ID }] });
          
          // Re-acquire wake lock if needed
          if (!window.wakeLockManager.wakeLock) {
            const hasActiveWorkout = document.querySelector('.zz_btn_toggle_set_complete');
            if (hasActiveWorkout) await window.wakeLockManager.request();
          }
      } catch(e) {}
  }
});

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

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => window.timerService.init());
} else {
  window.timerService.init();
}