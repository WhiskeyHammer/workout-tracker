// whiskeyhammer/workout-tracker/workout-tracker-8276d47834898423559b318e0915690087936fb1/routes/workouts.js

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
      .sort({ order: 1, createdAt: -1 });
    res.json(workouts);
  } catch (error) {
    console.error('Error fetching workouts:', error);
    res.status(500).json({ error: 'Error fetching workouts' });
  }
});

// Get workout names only (for library view) - MUST come before /:id route
router.get('/library', async (req, res) => {
  try {
    // Added 'lastCompletedSession' to the select string
    const workouts = await Workout.find({ userId: req.user.userId })
      .select('name updatedAt createdAt lastCompletedSession') 
      .sort({ order: 1, createdAt: -1 });
    
    res.json(workouts);
  } catch (error) {
    console.error('Get library error:', error);
    res.status(500).json({ error: 'Error fetching workout library' });
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

// Reorder workout (move up or down) - MUST come before /:id route
router.post('/:id/reorder', async (req, res) => {
  try {
    const { direction } = req.body; // 'up' or 'down'
    const workoutId = req.params.id;

    // Get all user's workouts sorted by current order
    const workouts = await Workout.find({ userId: req.user.userId })
      .sort({ order: 1, createdAt: -1 });

    // Find the index of the workout to move
    const currentIndex = workouts.findIndex(w => w._id.toString() === workoutId);
    
    if (currentIndex === -1) {
      return res.status(404).json({ error: 'Workout not found' });
    }

    // Calculate new index
    let newIndex;
    if (direction === 'up' && currentIndex > 0) {
      newIndex = currentIndex - 1;
    } else if (direction === 'down' && currentIndex < workouts.length - 1) {
      newIndex = currentIndex + 1;
    } else {
      // Can't move (already at top/bottom)
      return res.json({ message: 'No change', workouts });
    }

    // Swap the workouts
    const temp = workouts[currentIndex];
    workouts[currentIndex] = workouts[newIndex];
    workouts[newIndex] = temp;

    // Update order values for all workouts
    const updatePromises = workouts.map((workout, index) => {
      return Workout.findByIdAndUpdate(workout._id, { order: index });
    });

    await Promise.all(updatePromises);

    // Fetch updated workouts
    const updatedWorkouts = await Workout.find({ userId: req.user.userId })
      .sort({ order: 1, createdAt: -1 });

    res.json({ message: 'Workout reordered', workouts: updatedWorkouts });
  } catch (error) {
    console.error('Reorder error:', error);
    res.status(500).json({ error: 'Error reordering workout' });
  }
});

module.exports = router;