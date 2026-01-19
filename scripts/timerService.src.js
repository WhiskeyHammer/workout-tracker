import { Capacitor } from '@capacitor/core';
import { ForegroundService } from '@capawesome-team/capacitor-android-foreground-service';
import { NativeAudio } from '@capacitor-community/native-audio';
import { LocalNotifications } from '@capacitor/local-notifications';

// Timer state
let timerInterval = null;
let timerEndTime = null;
let onTickCallback = null;
let onCompleteCallback = null;

// CONSTANTS
const ALERT_ID = 99999; 
const ALERT_CHANNEL_ID = 'workout-timer-alert-v3'; 
const ALERT_SOUND = 'beep'; 

async function init() {
  if (Capacitor.isNativePlatform()) {
    try {
      await LocalNotifications.requestPermissions();
      
      const permStatus = await LocalNotifications.checkPermissions();
      if (permStatus.exact_alarm !== 'granted') {
         // Try to request specifically if possible, or just log warn
         console.warn('Exact Alarm permission not granted! Timer may be delayed.');
      }

      await LocalNotifications.createChannel({
        id: ALERT_CHANNEL_ID,
        name: 'Workout Timer (Complete)',
        description: 'Alerts when rest is done',
        importance: 5,
        visibility: 1,
        sound: ALERT_SOUND,
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

  try {
    await LocalNotifications.schedule({
      notifications: [{
        id: ALERT_ID,
        title: 'REST COMPLETE',
        body: `Time to set: ${exerciseName}`,
        channelId: ALERT_CHANNEL_ID,
        sound: ALERT_SOUND,
        schedule: { 
            at: endTime,
            allowWhileIdle: true // <--- THIS IS THE CRITICAL FIX
        },
        smallIcon: 'ic_stat_icon_config_sample',
        actionTypeId: 'OPEN_APP'
      }]
    });

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

  await LocalNotifications.addListener('localNotificationActionPerformed', (payload) => {
    if (payload.notification.id === ALERT_ID) {
       // App opened
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
        
        // Smart Check: Did the notification already fire while we were asleep?
        const timeSinceFinish = Date.now() - timerEndTime;
        const isLate = timeSinceFinish > 3000;
        
        if (!isLate) {
            await playBeep(); 
        } else {
            console.log('Timer finished in background - skipping in-app beep');
        }
        
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