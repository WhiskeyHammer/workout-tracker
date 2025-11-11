const express = require('express');
const WorkoutSession = require('../models/WorkoutSession');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// Get all workout sessions for a user (history)
router.get('/', async (req, res) => {
  try {
    const sessions = await WorkoutSession.find({ userId: req.user.userId })
      .sort({ completedAt: -1 })
      .limit(100); // Limit to last 100 sessions
    res.json(sessions);
  } catch (error) {
    console.error('Error fetching workout sessions:', error);
    res.status(500).json({ error: 'Error fetching workout sessions' });
  }
});

// Get the most recent session for a specific workout
router.get('/workout/:workoutId/latest', async (req, res) => {
  try {
    const session = await WorkoutSession.findOne({
      userId: req.user.userId,
      workoutId: req.params.workoutId
    }).sort({ completedAt: -1 });
    
    if (!session) {
      return res.status(404).json({ error: 'No session found' });
    }
    
    res.json(session);
  } catch (error) {
    console.error('Error fetching latest session:', error);
    res.status(500).json({ error: 'Error fetching latest session' });
  }
});

// Get all sessions for a specific workout
router.get('/workout/:workoutId', async (req, res) => {
  try {
    const sessions = await WorkoutSession.find({
      userId: req.user.userId,
      workoutId: req.params.workoutId
    }).sort({ completedAt: -1 });
    
    res.json(sessions);
  } catch (error) {
    console.error('Error fetching workout sessions:', error);
    res.status(500).json({ error: 'Error fetching workout sessions' });
  }
});

// Create a new workout session
router.post('/', async (req, res) => {
  try {
    const { workoutId, workoutName, exercises, nextWeights, weightsSet, exerciseNotes, completedAt } = req.body;
    
    // Validate required fields
    if (!workoutId || !workoutName || !exercises || exercises.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const session = new WorkoutSession({
      userId: req.user.userId,
      workoutId,
      workoutName,
      exercises,
      nextWeights: nextWeights || {},
      weightsSet: weightsSet || [],
      exerciseNotes: exerciseNotes || {},
      completedAt: completedAt || new Date()
    });

    await session.save();
    
    console.log('✅ Workout session saved successfully:', session._id);
    res.status(201).json({ 
      message: 'Workout session saved', 
      session 
    });
  } catch (error) {
    console.error('Error saving workout session:', error);
    res.status(500).json({ error: 'Error saving workout session' });
  }
});

// Delete a workout session
router.delete('/:id', async (req, res) => {
  try {
    const session = await WorkoutSession.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({ message: 'Session deleted' });
  } catch (error) {
    console.error('Error deleting session:', error);
    res.status(500).json({ error: 'Error deleting session' });
  }
});

module.exports = router;
