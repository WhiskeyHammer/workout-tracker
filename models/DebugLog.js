const mongoose = require('mongoose');

const debugLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  content: {
    type: String,
    required: true
  },
  entryCount: {
    type: Number,
    default: 0
  },
  platform: {
    type: String,
    default: ''
  },
  userAgent: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

module.exports = mongoose.model('DebugLog', debugLogSchema);
