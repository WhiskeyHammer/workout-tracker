// Wake Lock and Notification utilities for keeping app active during workouts
// Global utilities - no exports needed as these are loaded as script tags

// Wake Lock management
window.wakeLockManager = {
  wakeLock: null,
  
  request: async function() {
    try {
      if ('wakeLock' in navigator) {
        this.wakeLock = await navigator.wakeLock.request('screen');
        console.log('Wake Lock acquired - screen will stay on during workout');
        
        // Reacquire wake lock when page becomes visible again
        this.wakeLock.addEventListener('release', () => {
          console.log('Wake Lock released');
        });
        
        return true;
      } else {
        console.log('Wake Lock API not supported on this device');
        return false;
      }
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
        console.log('Wake Lock manually released');
      } catch (err) {
        console.error('Failed to release Wake Lock:', err);
      }
    }
  }
};

// Notification utilities
window.notificationManager = {
  requestPermission: async function() {
    if (!('Notification' in window)) {
      console.log('Notifications not supported on this device');
      return false;
    }
    
    if (Notification.permission === 'granted') {
      return true;
    }
    
    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    
    return false;
  },
  
  show: function(title, options = {}) {
    if (Notification.permission === 'granted') {
      const notification = new Notification(title, {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-96x96.png',
        vibrate: [200, 100, 200, 100, 200],
        requireInteraction: true,
        body: options.body || '',
        tag: 'workout-timer',
        ...options
      });
      
      // Play notification sound
      notification.onclick = function() {
        window.focus();
        this.close();
      };
      
      return notification;
    }
    return null;
  }
};

// Reacquire wake lock when page becomes visible (user returns to app)
document.addEventListener('visibilitychange', async () => {
  if (document.visibilityState === 'visible' && window.wakeLockManager.wakeLock === null) {
    // Check if there's an active timer by checking if the workout tracker is active
    const hasActiveWorkout = document.querySelector('.zz_btn_toggle_set_complete');
    if (hasActiveWorkout) {
      await window.wakeLockManager.request();
    }
  }
});
