const express = require('express');
const Workout = require('../models/Workout');
const WorkoutSession = require('../models/WorkoutSession');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// Get all workouts
router.get('/', async (req, res) => {
  try {
    const workouts = await Workout.find({ userId: req.user.userId })
      .sort({ updatedAt: -1 });
    res.json(workouts);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching workouts' });
  }
});

// Get single workout by ID
router.get('/:id', async (req, res) => {
  try {
    const workout = await Workout.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!workout) {
      return res.status(404).json({ error: 'Workout not found' });
    }

    res.json(workout);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching workout' });
  }
});

// Create workout
router.post('/', async (req, res) => {
  try {
    const { name, data, exerciseNotes } = req.body;
    
    const workout = new Workout({
      userId: req.user.userId,
      name: name || 'My Workout',
      data,
      exerciseNotes: exerciseNotes || {}
    });

    await workout.save();
    res.status(201).json({ message: 'Workout saved', workout });
  } catch (error) {
    res.status(500).json({ error: 'Error saving workout' });
  }
});

// Update workout
router.put('/:id', async (req, res) => {
  try {
    const { name, data, exerciseNotes, lastCompletedSession } = req.body;
    
    const workout = await Workout.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!workout) {
      return res.status(404).json({ error: 'Workout not found' });
    }

    if (name) workout.name = name;
    if (data) workout.data = data;
    if (exerciseNotes) workout.exerciseNotes = exerciseNotes;
    if (lastCompletedSession) workout.lastCompletedSession = lastCompletedSession;
    workout.updatedAt = Date.now();

    await workout.save();
    res.json({ message: 'Workout updated', workout });
  } catch (error) {
    res.status(500).json({ error: 'Error updating workout' });
  }
});

// Delete workout
router.delete('/:id', async (req, res) => {
  try {
    const workout = await Workout.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!workout) {
      return res.status(404).json({ error: 'Workout not found' });
    }

    // If workout title contains "Test Workout", delete all matching workout sessions
    if (workout.name && workout.name.includes('Test Workout')) {
      await WorkoutSession.deleteMany({
        userId: req.user.userId,
        workoutName: workout.name
      });
    }

    res.json({ message: 'Workout deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting workout' });
  }
});

// Get workout names only (for library view)
router.get('/library', async (req, res) => {
  try {
    const workouts = await Workout.find({ userId: req.user.userId })
      .select('name updatedAt createdAt')
      .sort({ updatedAt: -1 });
    
    res.json(workouts);
  } catch (error) {
    console.error('Get library error:', error);
    res.status(500).json({ error: 'Error fetching workout library' });
  }
});

module.exports = router;
