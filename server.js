const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const workoutRoutes = require('./routes/workouts');
const workoutSessionRoutes = require('./routes/workoutSessions');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/workout-sessions', workoutSessionRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    message: 'Workout Tracker API is running'
  });
});

// Version endpoint
app.get('/api/version', (req, res) => {
  // Prevent caching of version information
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  
  try {
    const versionPath = path.join(__dirname, 'public', 'version.json');
    const fs = require('fs');
    
    console.log('📋 Version endpoint called');
    console.log('   Version file path:', versionPath);
    console.log('   File exists:', fs.existsSync(versionPath));
    
    if (fs.existsSync(versionPath)) {
      const versionData = JSON.parse(fs.readFileSync(versionPath, 'utf8'));
      console.log('   Version data:', JSON.stringify(versionData, null, 2));
      res.json(versionData);
    } else {
      console.log('   ⚠️  Version file not found, using fallback');
      // Return fallback version if file doesn't exist
      const fallback = {
        commitHash: 'unknown',
        shortHash: 'dev',
        commitDate: new Date().toISOString(),
        branch: 'unknown',
        buildDate: new Date().toISOString(),
        repository: 'https://github.com/WhiskeyHammer/workout-tracker'
      };
      res.json(fallback);
    }
  } catch (error) {
    console.error('❌ Error reading version:', error);
    res.status(500).json({ error: 'Failed to read version information' });
  }
});

// Serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
