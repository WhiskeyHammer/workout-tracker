import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

// Global state for web fallback
let webTimer = null;

// 1. Wake Lock Manager (Keeps screen on)
window.wakeLockManager = {
  wakeLock: null,
  
  request: async function() {
    try {
      if ('wakeLock' in navigator) {
        this.wakeLock = await navigator.wakeLock.request('screen');
        console.log('Wake Lock acquired - screen will stay on during workout');
        
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

// 2. Notification Manager (Hybrid: Native Alarm + Web Notification)
window.notificationManager = {
  requestPermission: async function() {
    if (Capacitor.isNativePlatform()) {
      const result = await LocalNotifications.requestPermissions();
      return result.display === 'granted';
    } else {
      if (!('Notification' in window)) return false;
      if (Notification.permission === 'granted') return true;
      if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
      }
      return false;
    }
  },
  
  // Schedule a notification to fire after 'seconds'
  schedule: async function(seconds, title, body = '') {
    // Cancel any existing timer first
    await this.cancel();

    if (Capacitor.isNativePlatform()) {
      // NATIVE: Schedule exact system alarm
      // We use a fixed ID (1001) so we can easily overwrite/cancel it
      const fireDate = new Date(Date.now() + (seconds * 1000));
      
      try {
        await LocalNotifications.schedule({
          notifications: [{
            id: 1001,
            title: title,
            body: body,
            schedule: { at: fireDate, allowWhileIdle: true },
            sound: null, // Uses default system sound
            smallIcon: "ic_stat_icon_config_sample",
            actionTypeId: "",
            extra: null
          }]
        });
        console.log(`Native notification scheduled for ${seconds}s from now`);
      } catch (err) {
        console.error("Error scheduling native notification:", err);
      }
    } else {
      // WEB: Fallback to timeout
      console.log(`Web notification scheduled for ${seconds}s from now`);
      webTimer = setTimeout(() => {
        if (Notification.permission === 'granted') {
          const notification = new Notification(title, {
            body: body,
            icon: '/icons/icon-192x192.png',
            vibrate: [200, 100, 200],
            requireInteraction: true
          });
          notification.onclick = function() { window.focus(); this.close(); };
        }
        // Play sound via Web Audio API as backup
        if (typeof playBeep === 'function') playBeep();
      }, seconds * 1000);
    }
  },

  // Cancel any pending notifications
  cancel: async function() {
    if (Capacitor.isNativePlatform()) {
      try {
        const pending = await LocalNotifications.getPending();
        if (pending.notifications.length > 0) {
          await LocalNotifications.cancel({ notifications: pending.notifications });
        }
      } catch (err) {
        console.error("Error cancelling native notification:", err);
      }
    } else {
      if (webTimer) {
        clearTimeout(webTimer);
        webTimer = null;
      }
    }
  }
};

// Reacquire wake lock when page becomes visible (user returns to app)
document.addEventListener('visibilitychange', async () => {
  if (document.visibilityState === 'visible' && window.wakeLockManager.wakeLock === null) {
    const hasActiveWorkout = document.querySelector('.zz_btn_toggle_set_complete');
    if (hasActiveWorkout) {
      await window.wakeLockManager.request();
    }
  }
});