import { Capacitor } from '@capacitor/core';
import { ForegroundService } from '@capawesome-team/capacitor-android-foreground-service';
import { NativeAudio } from '@capacitor-community/native-audio';
import { LocalNotifications } from '@capacitor/local-notifications';

// Timer state
let timerInterval = null;
let timerEndTime = null;
let onTickCallback = null;
let onCompleteCallback = null;
let timerCompletedAt = null; // NEW: Track when timer completed to prevent race conditions

// CONSTANTS - V16 (Channel created in MainActivity.java with USAGE_ALARM)
const ALERT_ID = 99999; 
const ALERT_CHANNEL_ID = 'workout-timer-alert-v16'; 
const ALERT_SOUND = 'beep'; 

// NEW: Grace period (ms) - don't cancel notification if timer completed within this window
const CANCEL_GRACE_PERIOD_MS = 3000;

async function init() {
  if (Capacitor.isNativePlatform()) {
    try {
      await LocalNotifications.requestPermissions();
      
      // Alert channel is created in MainActivity.java with USAGE_ALARM
      // audio attributes to bypass silent mode - do NOT create it here

      // Create Silent Channel for countdown
      await ForegroundService.createNotificationChannel({
        id: 'workout-timer-silent',
        name: 'Workout Timer (Countdown)',
        description: 'Shows active countdown',
        importance: 2,
        visibility: 1
      });

      // Preload NativeAudio
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
  } catch (e) {
    console.error('playBeep failed:', e);
  }
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
    
    timerCompletedAt = null; // Reset completion timestamp
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
        
        // FIX: Record when the timer completed
        timerCompletedAt = Date.now();
        
        const timeSinceTarget = Date.now() - timerEndTime;
        const isLate = timeSinceTarget > 1500;
        
        // FIX: Stop the foreground service countdown, but DON'T cancel the 
        // notification immediately - let it finish playing its sound.
        // The visibilitychange handler or a delayed cleanup will handle it.
        try {
          await ForegroundService.stopForegroundService();
        } catch (err) {}
        
        if (!isLate) {
          // App was in foreground the whole time - play in-app beep
          // and cancel the notification (since we're handling sound ourselves)
          await LocalNotifications.cancel({ notifications: [{ id: ALERT_ID }] });
          await playBeep(); 
        } else {
          // App was backgrounded - the notification already fired with sound.
          // FIX: Do NOT cancel it here. Let the notification sound finish.
          // It will be cleaned up by visibilitychange after the grace period,
          // or by the next timer start.
          console.log('App resumed late. Letting notification sound finish.');
          
          // FIX: Also play the in-app beep as a fallback, because sometimes
          // the notification sound gets cut short or doesn't play at all.
          await playBeep();
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
    timerCompletedAt = null;
    this._lastSecond = null;
    
    if (shouldStopNative) {
        await stopNativeTimer();
    }
  },
  
  isRunning: function() { return timerInterval !== null; },
  
  // NEW: Expose completion timestamp for visibilitychange handler
  getCompletedAt: function() { return timerCompletedAt; },
  
  _lastSecond: null
};

// --- VISIBILITY CHANGE HANDLER (FIXED) ---
// FIX: Don't aggressively cancel the notification if the timer just completed.
// This was the primary cause of silence when switching back to the app.
document.addEventListener('visibilitychange', async () => {
  if (document.visibilityState === 'visible') {
      try {
          const completedAt = window.timerService.getCompletedAt();
          const now = Date.now();
          
          if (completedAt && (now - completedAt) < CANCEL_GRACE_PERIOD_MS) {
            // Timer completed very recently - DON'T cancel the notification.
            // Let it finish playing its sound. Schedule a delayed cleanup instead.
            console.log('Timer just completed, delaying notification cancel to let sound finish.');
            setTimeout(async () => {
              try {
                await LocalNotifications.cancel({ notifications: [{ id: ALERT_ID }] });
              } catch (e) {}
            }, CANCEL_GRACE_PERIOD_MS);
          } else if (!window.timerService.isRunning()) {
            // Timer is not running and didn't just complete - safe to cancel
            await LocalNotifications.cancel({ notifications: [{ id: ALERT_ID }] });
          }
          // If timer IS running, don't cancel - it's still counting down
          
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