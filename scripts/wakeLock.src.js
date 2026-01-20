import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

// ============================================================
// IN-APP LOG CAPTURE SYSTEM
// ============================================================
const logHistory = [];
const MAX_LOGS = 500;

function captureLog(level, ...args) {
  const timestamp = new Date().toISOString();
  const message = args.map(a => {
    if (typeof a === 'object') {
      try {
        return JSON.stringify(a, null, 2);
      } catch (e) {
        return String(a);
      }
    }
    return String(a);
  }).join(' ');
  
  const entry = { timestamp, level, message };
  logHistory.push(entry);
  
  if (logHistory.length > MAX_LOGS) {
    logHistory.shift();
  }
  
  const prefix = '🔔 [NotificationDebug]';
  if (level === 'error') {
    console.error(prefix, timestamp, ...args);
  } else if (level === 'warn') {
    console.warn(prefix, timestamp, ...args);
  } else {
    console.log(prefix, timestamp, ...args);
  }
}

function logInfo(...args) { captureLog('info', ...args); }
function logWarn(...args) { captureLog('warn', ...args); }
function logError(...args) { captureLog('error', ...args); }

// ============================================================
// LOG EXPORT UI
// ============================================================
function createLogViewer() {
  const existing = document.getElementById('debug-log-viewer');
  if (existing) existing.remove();
  
  const overlay = document.createElement('div');
  overlay.id = 'debug-log-viewer';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: #000;
    color: #0f0;
    font-family: monospace;
    font-size: 11px;
    z-index: 999999;
    display: flex;
    flex-direction: column;
  `;
  
  const header = document.createElement('div');
  header.style.cssText = `
    padding: 10px;
    background: #222;
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  `;
  
  const closeBtn = document.createElement('button');
  closeBtn.textContent = 'CLOSE';
  closeBtn.style.cssText = 'padding: 8px 16px; background: #c00; color: white; border: none; border-radius: 4px;';
  closeBtn.onclick = () => overlay.remove();
  
  const copyBtn = document.createElement('button');
  copyBtn.textContent = 'COPY ALL';
  copyBtn.style.cssText = 'padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px;';
  copyBtn.onclick = () => {
    const text = logHistory.map(l => `[${l.timestamp}] [${l.level.toUpperCase()}] ${l.message}`).join('\n');
    navigator.clipboard.writeText(text).then(() => {
      copyBtn.textContent = 'COPIED!';
      setTimeout(() => copyBtn.textContent = 'COPY ALL', 2000);
    }).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      copyBtn.textContent = 'COPIED!';
      setTimeout(() => copyBtn.textContent = 'COPY ALL', 2000);
    });
  };
  
  const clearBtn = document.createElement('button');
  clearBtn.textContent = 'CLEAR';
  clearBtn.style.cssText = 'padding: 8px 16px; background: #666; color: white; border: none; border-radius: 4px;';
  clearBtn.onclick = () => {
    logHistory.length = 0;
    refreshLogs();
  };
  
  const testBtn = document.createElement('button');
  testBtn.textContent = 'TEST 5s';
  testBtn.style.cssText = 'padding: 8px 16px; background: #28a745; color: white; border: none; border-radius: 4px;';
  testBtn.onclick = async () => {
    testBtn.textContent = 'WAIT...';
    await window.notificationManager.schedule(5, 'Test Timer', 'Fired after 5 seconds');
    testBtn.textContent = 'SENT!';
    setTimeout(() => testBtn.textContent = 'TEST 5s', 2000);
  };
  
  const channelBtn = document.createElement('button');
  channelBtn.textContent = 'LIST CH';
  channelBtn.style.cssText = 'padding: 8px 16px; background: #17a2b8; color: white; border: none; border-radius: 4px;';
  channelBtn.onclick = () => listNotificationChannels();
  
  const permBtn = document.createElement('button');
  permBtn.textContent = 'PERMS';
  permBtn.style.cssText = 'padding: 8px 16px; background: #ffc107; color: black; border: none; border-radius: 4px;';
  permBtn.onclick = () => checkAndLogPermissions();
  
  header.appendChild(closeBtn);
  header.appendChild(copyBtn);
  header.appendChild(clearBtn);
  header.appendChild(testBtn);
  header.appendChild(channelBtn);
  header.appendChild(permBtn);
  
  const countDiv = document.createElement('div');
  countDiv.style.cssText = 'padding: 5px 10px; background: #333; color: #aaa;';
  countDiv.id = 'log-count';
  
  const logContent = document.createElement('pre');
  logContent.style.cssText = `
    flex: 1;
    overflow: auto;
    padding: 10px;
    margin: 0;
    white-space: pre-wrap;
    word-wrap: break-word;
  `;
  logContent.id = 'log-content';
  
  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  
  function refreshLogs() {
    const content = document.getElementById('log-content');
    const count = document.getElementById('log-count');
    if (content) {
      content.innerHTML = logHistory.map(l => {
        const color = l.level === 'error' ? '#f00' : l.level === 'warn' ? '#ff0' : '#0f0';
        return `<span style="color:${color}">[${l.timestamp.split('T')[1]}] [${l.level.toUpperCase()}]</span> ${escapeHtml(l.message)}`;
      }).join('\n');
      content.scrollTop = content.scrollHeight;
    }
    if (count) {
      count.textContent = `${logHistory.length} entries | Tap COPY ALL to export`;
    }
  }
  
  overlay.appendChild(countDiv);
  overlay.appendChild(logContent);
  overlay.appendChild(header);
  document.body.appendChild(overlay);
  
  refreshLogs();
  
  const intervalId = setInterval(() => {
    if (document.getElementById('debug-log-viewer')) {
      refreshLogs();
    } else {
      clearInterval(intervalId);
    }
  }, 500);
}

// ============================================================
// STARTUP DIAGNOSTICS
// ============================================================
logInfo('============================================================');
logInfo('NOTIFICATION SERVICE INITIALIZING');
logInfo('============================================================');
logInfo('Platform:', Capacitor.getPlatform());
logInfo('Is Native:', Capacitor.isNativePlatform());
logInfo('User Agent:', navigator.userAgent);

// ============================================================
// NOTIFICATION LISTENERS
// ============================================================
async function setupNotificationListeners() {
  if (!Capacitor.isNativePlatform()) {
    logInfo('Skipping native listeners - web platform');
    return;
  }

  try {
    logInfo('Setting up notification listeners...');

    await LocalNotifications.addListener('localNotificationReceived', (notification) => {
      logInfo('>>> EVENT: localNotificationReceived <<<');
      logInfo('Notification data:', notification);
    });
    logInfo('✓ localNotificationReceived listener added');

    await LocalNotifications.addListener('localNotificationActionPerformed', (action) => {
      logInfo('>>> EVENT: localNotificationActionPerformed <<<');
      logInfo('Action data:', action);
    });
    logInfo('✓ localNotificationActionPerformed listener added');

  } catch (err) {
    logError('Listener setup failed:', err.message, err.stack);
  }
}

setupNotificationListeners();

// ============================================================
// PERMISSIONS CHECK
// ============================================================
async function checkAndLogPermissions() {
  if (!Capacitor.isNativePlatform()) {
    logInfo('Skipping permission check - web platform');
    return;
  }

  try {
    logInfo('Checking permissions...');
    const status = await LocalNotifications.checkPermissions();
    logInfo('Permission status:', status);

    try {
      const exact = await LocalNotifications.checkExactNotificationSetting();
      logInfo('Exact alarm setting:', exact);
    } catch (e) {
      logWarn('checkExactNotificationSetting error:', e.message);
    }
  } catch (err) {
    logError('Permission check failed:', err.message);
  }
}

checkAndLogPermissions();

// ============================================================
// LIST CHANNELS
// ============================================================
async function listNotificationChannels() {
  if (!Capacitor.isNativePlatform()) return;

  try {
    logInfo('Listing notification channels...');
    const result = await LocalNotifications.listChannels();
    logInfo('Channels result:', result);
    
    if (!result.channels || result.channels.length === 0) {
      logWarn('*** NO CHANNELS FOUND - THIS MAY BE THE PROBLEM ***');
    } else {
      result.channels.forEach((ch, i) => {
        logInfo(`Channel[${i}]: id="${ch.id}" name="${ch.name}" importance=${ch.importance} sound="${ch.sound}"`);
      });
    }
  } catch (err) {
    logError('listChannels failed:', err.message);
  }
}

listNotificationChannels();

// ============================================================
// GLOBAL STATE
// ============================================================
let webTimer = null;

// ============================================================
// WAKE LOCK MANAGER
// ============================================================
window.wakeLockManager = {
  wakeLock: null,
  
  request: async function() {
    logInfo('Wake Lock request');
    try {
      if ('wakeLock' in navigator) {
        this.wakeLock = await navigator.wakeLock.request('screen');
        logInfo('✓ Wake Lock acquired');
        this.wakeLock.addEventListener('release', () => logInfo('Wake Lock released'));
        return true;
      }
      logWarn('Wake Lock not supported');
      return false;
    } catch (err) {
      logError('Wake Lock failed:', err.message);
      return false;
    }
  },
  
  release: async function() {
    if (this.wakeLock) {
      await this.wakeLock.release();
      this.wakeLock = null;
      logInfo('Wake Lock released');
    }
  }
};

// ============================================================
// NOTIFICATION MANAGER
// ============================================================
window.notificationManager = {
  
  requestPermission: async function() {
    logInfo('=== REQUEST PERMISSION ===');
    
    if (Capacitor.isNativePlatform()) {
      try {
        const result = await LocalNotifications.requestPermissions();
        logInfo('Permission result:', result);
        return result.display === 'granted';
      } catch (err) {
        logError('Permission request failed:', err.message);
        return false;
      }
    }
    return false;
  },
  
  schedule: async function(seconds, title, body = '') {
    logInfo('============================================================');
    logInfo('=== SCHEDULE NOTIFICATION ===');
    logInfo('============================================================');
    logInfo('seconds:', seconds);
    logInfo('title:', title);
    logInfo('body:', body);
    logInfo('Platform:', Capacitor.getPlatform());
    logInfo('isNative:', Capacitor.isNativePlatform());
    
    await this.cancel();

    if (Capacitor.isNativePlatform()) {
      const fireDate = new Date(Date.now() + (seconds * 1000));
      
      logInfo('Now:', new Date().toISOString());
      logInfo('Fire at:', fireDate.toISOString());
      
      const config = {
        notifications: [{
          id: 1001,
          title: title,
          body: body,
          schedule: { at: fireDate, allowWhileIdle: true },
          sound: null,
          smallIcon: "ic_stat_icon_config_sample",
          actionTypeId: "",
          extra: null
        }]
      };
      
      logInfo('Config:', config);
      
      try {
        logInfo('Calling LocalNotifications.schedule()...');
        const result = await LocalNotifications.schedule(config);
        logInfo('Schedule returned:', result);
        
        const pending = await LocalNotifications.getPending();
        logInfo('Pending after schedule:', pending);
        
        if (pending.notifications?.length > 0) {
          logInfo('✓ SUCCESS - notification queued');
        } else {
          logError('✗ FAIL - notification NOT in queue');
        }
        
      } catch (err) {
        logError('*** SCHEDULE FAILED ***');
        logError('Error:', err.message);
        logError('Name:', err.name);
        logError('Stack:', err.stack);
      }
    } else {
      logInfo('Web fallback - setTimeout');
      webTimer = setTimeout(() => {
        logInfo('Web timer fired');
        if (Notification.permission === 'granted') {
          new Notification(title, { body });
        }
      }, seconds * 1000);
    }
  },

  cancel: async function() {
    logInfo('=== CANCEL ===');
    
    if (Capacitor.isNativePlatform()) {
      try {
        const pending = await LocalNotifications.getPending();
        logInfo('Pending before cancel:', pending);
        
        if (pending.notifications?.length > 0) {
          await LocalNotifications.cancel({ notifications: pending.notifications });
          logInfo('Cancelled', pending.notifications.length, 'notification(s)');
        }
      } catch (err) {
        logError('Cancel failed:', err.message);
      }
    } else if (webTimer) {
      clearTimeout(webTimer);
      webTimer = null;
    }
  }
};

// ============================================================
// VISIBILITY HANDLER
// ============================================================
document.addEventListener('visibilitychange', async () => {
  logInfo('Visibility:', document.visibilityState);
  if (document.visibilityState === 'visible' && !window.wakeLockManager.wakeLock) {
    if (document.querySelector('.zz_btn_toggle_set_complete')) {
      await window.wakeLockManager.request();
    }
  }
});

// ============================================================
// DEBUG BUTTON
// ============================================================
window.showDebugLogs = createLogViewer;

logInfo('============================================================');
logInfo('SERVICE READY - tap red 🔔 button to view logs');
logInfo('============================================================');