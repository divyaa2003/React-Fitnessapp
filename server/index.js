const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:5174',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fitness-app')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profile: {
    name: String,
    age: Number,
    weight: Number,
    height: Number,
    fitnessGoal: { type: String, enum: ['weight_loss', 'muscle_gain', 'endurance'] },
    fitnessLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced'] }
  },
  workoutHistory: [{
    date: Date,
    workout: Object,
    completed: Boolean
  }],
  achievements: [{
    name: String,
    description: String,
    dateEarned: Date,
    icon: String
  }],
  streak: { type: Number, default: 0 },
  lastWorkout: Date
});

const User = mongoose.model('User', userSchema);

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};

// Auth Routes
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword
    });
    
    await newUser.save();
    
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Check if user exists
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Create and assign token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      secure: process.env.NODE_ENV === 'production'
    });
    
    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profile: user.profile
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logout successful' });
});

// Profile Routes
app.get('/api/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/profile', verifyToken, async (req, res) => {
  try {
    const { name, age, weight, height, fitnessGoal, fitnessLevel } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      {
        profile: { name, age, weight, height, fitnessGoal, fitnessLevel }
      },
      { new: true }
    ).select('-password');
    
    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Workout Routes
app.post('/api/workouts', verifyToken, async (req, res) => {
  try {
    const { workout } = req.body;
    
    const user = await User.findById(req.userId);
    
    user.workoutHistory.push({
      date: new Date(),
      workout,
      completed: false
    });
    
    await user.save();
    
    res.status(201).json({ message: 'Workout saved successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/workouts/:workoutId/complete', verifyToken, async (req, res) => {
  try {
    const { workoutId } = req.params;
    
    const user = await User.findById(req.userId);
    
    // Find the workout in the user's history
    const workoutIndex = user.workoutHistory.findIndex(w => w._id.toString() === workoutId);
    
    if (workoutIndex === -1) {
      return res.status(404).json({ message: 'Workout not found' });
    }
    
    // Mark workout as completed
    user.workoutHistory[workoutIndex].completed = true;
    
    // Update streak
    const lastWorkoutDate = user.lastWorkout ? new Date(user.lastWorkout) : null;
    const currentDate = new Date();
    
    if (!lastWorkoutDate) {
      // First workout
      user.streak = 1;
    } else {
      const dayDifference = Math.floor((currentDate - lastWorkoutDate) / (1000 * 60 * 60 * 24));
      
      if (dayDifference === 1) {
        // Consecutive day
        user.streak += 1;
      } else if (dayDifference > 1) {
        // Streak broken
        user.streak = 1;
      }
      // If dayDifference === 0, it's the same day, don't update streak
    }
    
    user.lastWorkout = currentDate;
    
    // Check for achievements
    if (user.streak === 7) {
      user.achievements.push({
        name: 'Week Warrior',
        description: 'Completed workouts for 7 consecutive days',
        dateEarned: currentDate,
        icon: '🔥'
      });
    }
    
    if (user.workoutHistory.filter(w => w.completed).length === 10) {
      user.achievements.push({
        name: 'Dedicated',
        description: 'Completed 10 workouts',
        dateEarned: currentDate,
        icon: '💪'
      });
    }
    
    await user.save();
    
    res.json({
      message: 'Workout completed',
      streak: user.streak,
      newAchievements: user.achievements.filter(a => a.dateEarned.toDateString() === currentDate.toDateString())
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/workouts/history', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    res.json(user.workoutHistory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
