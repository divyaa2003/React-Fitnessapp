import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const { user } = useAuth();
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    completedWorkouts: 0,
    streak: 0,
    lastWorkout: null
  });

  useEffect(() => {
    try {
      // Get workout history from local storage
      const storedWorkouts = JSON.parse(localStorage.getItem('workoutHistory') || '[]');
      setWorkoutHistory(storedWorkouts);
      
      // Calculate stats
      const completed = storedWorkouts.filter(w => w.completed).length;
      const lastWorkoutDate = storedWorkouts.length > 0 ? 
        new Date(storedWorkouts[0].date).toLocaleDateString() : 'Never';
      
      setStats({
        totalWorkouts: storedWorkouts.length,
        completedWorkouts: completed,
        streak: 5, // Mock streak count
        lastWorkout: lastWorkoutDate
      });
    } catch (error) {
      console.error('Error loading workout history:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Prepare chart data
  const chartData = {
    labels: workoutHistory.slice(-7).map(w => new Date(w.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Workouts',
        data: workoutHistory.slice(-7).map(w => w.completed ? 1 : 0),
        fill: false,
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 0.8)',
      },
    ],
  };

  const chartOptions = {
    scales: {
      y: {
        beginAtZero: true,
        max: 1,
        ticks: {
          stepSize: 1,
          callback: function(value) {
            return value === 0 ? 'Missed' : 'Completed';
          }
        }
      }
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  // Get recommended workouts based on user profile
  const getRecommendedWorkouts = () => {
    const fitnessGoal = user?.profile?.fitnessGoal || 'weight_loss';
    
    const recommendations = {
      weight_loss: ['HIIT', 'Cardio', 'Full Body'],
      muscle_gain: ['Upper Body', 'Lower Body', 'Push/Pull'],
      endurance: ['Long Distance', 'Interval Training', 'Stamina Building']
    };
    
    return recommendations[fitnessGoal] || recommendations.weight_loss;
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-8">Your Fitness Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Stats Cards */}
          <div className="bg-slate-900 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Total Workouts</h3>
            <p className="text-3xl font-bold text-blue-400">{stats.totalWorkouts}</p>
          </div>
          
          <div className="bg-slate-900 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Completed</h3>
            <p className="text-3xl font-bold text-blue-400">{stats.completedWorkouts}</p>
          </div>
          
          <div className="bg-slate-900 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Current Streak</h3>
            <p className="text-3xl font-bold text-blue-400">{stats.streak} days</p>
          </div>
          
          <div className="bg-slate-900 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Last Workout</h3>
            <p className="text-xl font-bold text-blue-400">{stats.lastWorkout}</p>
          </div>
        </div>
        
        {/* Workout History Chart */}
        <div className="bg-slate-900 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Last 7 Days Activity</h2>
          <div className="h-64">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Recommended Workouts */}
          <div className="bg-slate-900 rounded-lg shadow-lg p-6 md:col-span-1">
            <h2 className="text-xl font-semibold mb-4">Recommended Workouts</h2>
            <ul className="space-y-2">
              {getRecommendedWorkouts().map((workout, index) => (
                <li key={index} className="flex items-center">
                  <i className="fas fa-dumbbell text-blue-400 mr-2"></i>
                  <span>{workout}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4">
              <Link to="/" className="text-blue-400 hover:text-blue-300 flex items-center">
                <span>Generate a new workout</span>
                <i className="fas fa-arrow-right ml-2"></i>
              </Link>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="bg-slate-900 rounded-lg shadow-lg p-6 md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Your Fitness Profile</h2>
            {user?.profile ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-400">Name</p>
                  <p>{user.profile.name || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Age</p>
                  <p>{user.profile.age || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Weight</p>
                  <p>{user.profile.weight ? `${user.profile.weight} kg` : 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Height</p>
                  <p>{user.profile.height ? `${user.profile.height} cm` : 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Fitness Goal</p>
                  <p className="capitalize">{user.profile.fitnessGoal?.replace('_', ' ') || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Fitness Level</p>
                  <p className="capitalize">{user.profile.fitnessLevel || 'Not set'}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="mb-4">Complete your profile to get personalized workouts</p>
                <Link to="/profile" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition duration-300">
                  Complete Profile
                </Link>
              </div>
            )}
          </div>
        </div>
        
        {/* Recent Workouts */}
        <div className="bg-slate-900 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Workouts</h2>
          {workoutHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Exercises</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {workoutHistory.slice(-5).reverse().map((workout, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(workout.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap capitalize">
                        {workout.workout[0]?.muscles?.join(', ') || 'Custom'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {workout.workout.length}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {workout.completed ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Completed
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            In Progress
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-4">
              <p>No workout history yet</p>
              <Link to="/" className="text-blue-400 hover:text-blue-300 mt-2 inline-block">
                Generate your first workout
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
