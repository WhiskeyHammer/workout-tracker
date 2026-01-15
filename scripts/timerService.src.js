import { Capacitor } from '@capacitor/core';
import { ForegroundService } from '@capawesome-team/capacitor-android-foreground-service';
import { NativeAudio } from '@capacitor-community/native-audio';

// Timer state
let timerInterval = null;
let timerEndTime = null;
let onTickCallback = null;
let onCompleteCallback = null;

// Initialize native audio on app start
async function initAudio() {
  if (Capacitor.isNativePlatform()) {
    try {
      await NativeAudio.preload({
        assetId: 'timerBeep',
        assetPath: 'beep.mp3',
        audioChannelNum: 1,
        isUrl: false
      });
      console.log('Timer beep sound preloaded');
    } catch (err) {
      console.error('Failed to preload beep sound:', err);
    }
  }
}

// Play the beep sound
async function playBeep() {
  if (Capacitor.isNativePlatform()) {
    try {
      await NativeAudio.play({ assetId: 'timerBeep' });
      // Play it twice with a short delay for emphasis
      setTimeout(async () => {
        try {
          await NativeAudio.play({ assetId: 'timerBeep' });
        } catch (e) { /* ignore */ }
      }, 250);
    } catch (err) {
      console.error('Failed to play beep:', err);
    }
  } else {
    // Web fallback - use AudioContext
    playWebBeep();
  }
}

// Web Audio API beep (fallback for browser)
function playWebBeep() {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
    
    // Second beep
    setTimeout(() => {
      const osc2 = audioContext.createOscillator();
      const gain2 = audioContext.createGain();
      osc2.connect(gain2);
      gain2.connect(audioContext.destination);
      osc2.frequency.value = 800;
      osc2.type = 'sine';
      gain2.gain.setValueAtTime(0.3, audioContext.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      osc2.start(audioContext.currentTime);
      osc2.stop(audioContext.currentTime + 0.5);
    }, 200);
  } catch (e) {
    console.error('Web beep failed:', e);
  }
}

// Format seconds as M:SS
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Start foreground service with timer
async function startForegroundService(seconds, exerciseName) {
  if (!Capacitor.isNativePlatform()) return;
  
  try {
    // Create notification channel first (required for Android 8+)
    await ForegroundService.createNotificationChannel({
      id: 'workout-timer',
      name: 'Workout Timer',
      description: 'Shows countdown during rest periods',
      importance: 3, // Default importance
    });
    
    // Start the foreground service
    await ForegroundService.startForegroundService({
      id: 1,
      title: 'Rest Timer',
      body: `${formatTime(seconds)} - ${exerciseName}`,
      smallIcon: 'ic_stat_icon_config_sample',
      buttons: [
        { title: 'Skip', id: 1 }
      ],
      silent: true, // Don't make sound on every update
      notificationChannelId: 'workout-timer',
    });
    
    console.log('Foreground service started');
  } catch (err) {
    console.error('Failed to start foreground service:', err);
  }
}

// Update the foreground notification
async function updateForegroundService(seconds, exerciseName) {
  if (!Capacitor.isNativePlatform()) return;
  
  try {
    await ForegroundService.updateForegroundService({
      id: 1,
      title: 'Rest Timer',
      body: `${formatTime(seconds)} - ${exerciseName}`,
      smallIcon: 'ic_stat_icon_config_sample',
    });
  } catch (err) {
    // Ignore update errors - service might have stopped
  }
}

// Stop foreground service
async function stopForegroundService() {
  if (!Capacitor.isNativePlatform()) return;
  
  try {
    await ForegroundService.stopForegroundService();
    console.log('Foreground service stopped');
  } catch (err) {
    // Ignore - service might not be running
  }
}

// Listen for notification button clicks
async function setupButtonListener() {
  if (!Capacitor.isNativePlatform()) return;
  
  try {
    await ForegroundService.addListener('buttonClicked', (event) => {
      console.log('Notification button clicked:', event);
      if (event.buttonId === 1) {
        // Skip button pressed
        window.timerService.stop();
        if (onCompleteCallback) {
          onCompleteCallback(true); // true = was skipped
        }
      }
    });
  } catch (err) {
    console.error('Failed to setup button listener:', err);
  }
}

// The main timer service exposed to the app
window.timerService = {
  // Initialize - call once on app startup
  init: async function() {
    await initAudio();
    await setupButtonListener();
    console.log('Timer service initialized');
  },
  
  // Start a timer
  // options: { seconds, exerciseName, onTick, onComplete }
  start: async function(options) {
    const { seconds, exerciseName, onTick, onComplete } = options;
    
    // Store callbacks
    onTickCallback = onTick;
    onCompleteCallback = onComplete;
    
    // Clear any existing timer
    this.stop();
    
    // Calculate end time
    timerEndTime = Date.now() + (seconds * 1000);
    
    // Start foreground service (Android)
    await startForegroundService(seconds, exerciseName);
    
    // Start the interval
    timerInterval = setInterval(async () => {
      const now = Date.now();
      const remainingMs = Math.max(0, timerEndTime - now);
      const remainingSeconds = Math.ceil(remainingMs / 1000);
      
      // Call tick callback
      if (onTickCallback) {
        onTickCallback({
          remainingMs,
          remainingSeconds
        });
      }
      
      // Update notification every second (not every 100ms to save battery)
      if (remainingMs > 0 && remainingSeconds !== this._lastSecond) {
        this._lastSecond = remainingSeconds;
        await updateForegroundService(remainingSeconds, exerciseName);
      }
      
      // Timer complete
      if (remainingMs === 0) {
        this.stop();
        
        // Play the beep
        await playBeep();
        
        // Call complete callback
        if (onCompleteCallback) {
          onCompleteCallback(false); // false = not skipped, completed naturally
        }
      }
    }, 100);
    
    console.log(`Timer started: ${seconds}s for ${exerciseName}`);
  },
  
  // Stop the timer
  stop: async function() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    timerEndTime = null;
    this._lastSecond = null;
    
    await stopForegroundService();
  },
  
  // Check if timer is running
  isRunning: function() {
    return timerInterval !== null;
  },
  
  // Internal state
  _lastSecond: null
};

// Also keep the wake lock manager for screen-on functionality
window.wakeLockManager = {
  wakeLock: null,
  
  request: async function() {
    try {
      if ('wakeLock' in navigator) {
        this.wakeLock = await navigator.wakeLock.request('screen');
        console.log('Wake Lock acquired');
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to acquire Wake Lock:', err);
      return false;
    }
  },
  
  release: async function() {
    if (this.wakeLock !== null) {
      try {
        await this.wakeLock.release();
        this.wakeLock = null;
      } catch (err) {
        console.error('Failed to release Wake Lock:', err);
      }
    }
  }
};

// Reacquire wake lock when page becomes visible
document.addEventListener('visibilitychange', async () => {
  if (document.visibilityState === 'visible' && window.wakeLockManager.wakeLock === null) {
    const hasActiveWorkout = document.querySelector('.zz_btn_toggle_set_complete');
    if (hasActiveWorkout) {
      await window.wakeLockManager.request();
    }
  }
});

// Initialize timer service when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.timerService.init();
  });
} else {
  window.timerService.init();
}
