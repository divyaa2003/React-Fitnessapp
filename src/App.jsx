import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import axios from 'axios'
import Confetti from 'react-confetti'

// Components
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Generator from './components/Generator'
import Workout from './components/Workout'
import Login from './components/auth/Login'
import Register from './components/auth/Register'
import Profile from './components/profile/Profile'
import Dashboard from './components/dashboard/Dashboard'
import ProgressTracker from './components/progress/ProgressTracker'
import Achievements from './components/gamification/Achievements'
import NutritionTracker from './components/nutrition/NutritionTracker'
import MentalWellness from './components/wellness/MentalWellness'
import Chatbot from './components/chatbot/Chatbot'

// Utils
import { generateWorkout } from './utils/function'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/auth/ProtectedRoute'

// CSS
import "./index.css"

// Set up axios defaults
axios.defaults.baseURL = 'http://localhost:5000'
axios.defaults.withCredentials = true

function AppContent() {
  // Create a mock user for all features to work without login
  const mockUser = {
    username: 'Guest User',
    profile: {
      name: 'Guest',
      fitnessLevel: 'intermediate',
      fitnessGoal: 'strength_power',
      streak: 5
    }
  }
  
  const user = mockUser
  const navigate = useNavigate()
  const location = useLocation()
  
  const [workout, setWorkout] = useState(null)
  const [workoutType, setWorkoutType] = useState('individual')
  const [muscles, setMuscles] = useState([])
  const [goal, setGoal] = useState('strength_power')
  const [showConfetti, setShowConfetti] = useState(false)

  // Save workout to local storage instead of backend
  useEffect(() => {
    if (workout) {
      try {
        // Get existing workouts from localStorage or initialize empty array
        const existingWorkouts = JSON.parse(localStorage.getItem('workoutHistory') || '[]')
        
        // Add new workout with timestamp
        const newWorkout = {
          id: Date.now(),
          date: new Date().toISOString(),
          workout: workout,
          completed: false
        }
        
        // Save updated workouts array
        localStorage.setItem('workoutHistory', JSON.stringify([newWorkout, ...existingWorkouts]))
        
        toast.success('Workout saved to your history!')
      } catch (error) {
        console.error('Error saving workout:', error)
      }
    }
  }, [workout])

  function updateWorkout() {
    if (muscles.length < 1) {
      toast.warning('Please select at least one muscle group')
      return
    }
    
    // Generate personalized workout based on user profile if available
    let workoutParams = { poison: workoutType, muscles, goal }
    
    if (user?.profile) {
      workoutParams.fitnessLevel = user.profile.fitnessLevel || 'intermediate'
      workoutParams.fitnessGoal = user.profile.fitnessGoal || goal
    }
    
    let newWorkout = generateWorkout(workoutParams)
    setWorkout(newWorkout)

    if (location.pathname !== '/') {
      navigate('/#workout')
    } else {
      window.location.href = '#workout'
    }
  }

  const completeWorkout = (workoutId) => {
    try {
      // Get existing workouts from localStorage
      const existingWorkouts = JSON.parse(localStorage.getItem('workoutHistory') || '[]')
      
      // Find and update the workout
      const updatedWorkouts = existingWorkouts.map(workout => {
        if (workout.id === workoutId) {
          return { ...workout, completed: true }
        }
        return workout
      })
      
      // Save updated workouts
      localStorage.setItem('workoutHistory', JSON.stringify(updatedWorkouts))
      
      // Show confetti animation
      setShowConfetti(true)
      toast.success('🏆 Workout completed!')
      setTimeout(() => setShowConfetti(false), 5000)
      
    } catch (error) {
      console.error('Error completing workout:', error)
      toast.error('Failed to mark workout as complete')
    }
  }

  // No loading state needed since we're using a mock user

  return (
    <div className='min-h-screen flex flex-col bg-gradient-to-r from-slate-800 to-slate-950 text-white text-sm sm:text-base'>
      <Navbar />
      
      {showConfetti && <Confetti />}
      
      <main className='flex-grow'>
        <Routes>
          <Route path="/" element={
            <main className="flex flex-col">
              <Hero />
              <Generator
                poison={workoutType}
                setPoison={setWorkoutType}
                muscles={muscles}
                setMuscles={setMuscles}
                goal={goal}
                setGoal={setGoal}
                updateWorkout={updateWorkout}
              />
              {workout && (
                <Workout 
                  workout={workout} 
                  onComplete={completeWorkout} 
                  showConfetti={showConfetti}
                />
              )}
            </main>
          } />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/progress" element={<ProgressTracker />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/nutrition" element={<NutritionTracker />} />
          <Route path="/wellness" element={<MentalWellness />} />
        </Routes>
      </main>
      
      {/* Chatbot component appears on all pages */}
      <Chatbot />
      
      <ToastContainer position="bottom-right" theme="dark" />
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App