const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    default: 'My Workout'
  },
  data: {
    exercises: { type: Array, default: [] },
    nextWeights: { type: Object, default: {} },
    weightsSet: { type: Array, default: [] }
  },
  lastCompletedSession: {
    exercises: { type: mongoose.Schema.Types.Mixed },
    nextWeights: { type: mongoose.Schema.Types.Mixed },
    weightsSet: { type: Array },
    completedAt: { type: Date }
  },
  exerciseNotes: {
    type: Object,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

workoutSchema.index({ userId: 1, updatedAt: -1 });

module.exports = mongoose.model('Workout', workoutSchema);
