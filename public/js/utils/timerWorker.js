// Timer Web Worker - runs on separate thread, not throttled in background tabs
let timerInterval = null;
let endTime = null;

self.onmessage = function(e) {
  const { command, duration } = e.data;
  
  if (command === 'start') {
    // Clear any existing timer
    if (timerInterval) {
      clearInterval(timerInterval);
    }
    
    endTime = Date.now() + (duration * 1000);
    
    // Check every 100ms for accuracy
    timerInterval = setInterval(() => {
      const now = Date.now();
      const remainingMs = Math.max(0, endTime - now);
      const remainingSeconds = Math.ceil(remainingMs / 1000);
      
      // Send update to main thread
      self.postMessage({
        type: 'tick',
        remainingMs,
        remainingSeconds
      });
      
      // Timer finished
      if (remainingMs === 0) {
        clearInterval(timerInterval);
        timerInterval = null;
        self.postMessage({ type: 'complete' });
      }
    }, 100);
    
  } else if (command === 'stop') {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    endTime = null;
  }
};
