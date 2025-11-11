const mongoose = require('mongoose');

const workoutSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  workoutId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workout',
    required: true,
    index: true
  },
  workoutName: {
    type: String,
    required: true
  },
  exercises: [{
    exercise: String,
    exerciseNotes: String,
    sets: [{
      id: Number,
      reps: String,
      weight: String,
      rest: String,
      notes: String,
      'weight group': String,
      completed: Boolean
    }]
  }],
  nextWeights: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  weightsSet: {
    type: Array,
    default: []
  },
  exerciseNotes: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  completedAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient querying of user's workout history
workoutSessionSchema.index({ userId: 1, completedAt: -1 });
workoutSessionSchema.index({ workoutId: 1, completedAt: -1 });

module.exports = mongoose.model('WorkoutSession', workoutSessionSchema);
