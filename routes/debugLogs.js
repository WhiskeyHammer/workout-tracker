const express = require('express');
const DebugLog = require('../models/DebugLog');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// Save a debug log dump from the in-app log viewer
router.post('/', async (req, res) => {
  try {
    const { content, entryCount, platform, userAgent } = req.body;

    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: 'content (string) is required' });
    }

    const log = new DebugLog({
      userId: req.user.userId,
      content: content.slice(0, 1000000), // cap at ~1MB to be safe
      entryCount: entryCount || 0,
      platform: platform || '',
      userAgent: userAgent || ''
    });

    await log.save();

    console.log('✅ Debug log saved:', log._id, `(${log.entryCount} entries)`);
    res.status(201).json({ message: 'Logs saved', id: log._id });
  } catch (error) {
    console.error('Error saving debug log:', error);
    res.status(500).json({ error: 'Error saving debug log' });
  }
});

module.exports = router;
