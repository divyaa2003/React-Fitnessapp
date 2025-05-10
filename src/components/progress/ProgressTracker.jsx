import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
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
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function ProgressTracker() {
  const { user } = useAuth();
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const [weightData, setWeightData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('workouts');
  const [timeRange, setTimeRange] = useState('month');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch workout history
        const workoutResponse = await axios.get('/api/workouts/history');
        setWorkoutHistory(workoutResponse.data);
        
        // Mock weight tracking data (in a real app, this would come from the backend)
        const mockWeightData = [
          { date: '2025-04-10', weight: 75.5 },
          { date: '2025-04-17', weight: 74.8 },
          { date: '2025-04-24', weight: 74.2 },
          { date: '2025-05-01', weight: 73.9 },
          { date: '2025-05-08', weight: 73.5 },
        ];
        setWeightData(mockWeightData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  // Filter data based on time range
  const filterDataByTimeRange = (data, dateField) => {
    const now = new Date();
    let cutoffDate;
    
    switch (timeRange) {
      case 'week':
        cutoffDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        cutoffDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'year':
        cutoffDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        cutoffDate = new Date(now.setMonth(now.getMonth() - 1));
    }
    
    return data.filter(item => new Date(item[dateField]) >= cutoffDate);
  };

  // Prepare workout chart data
  const workoutChartData = {
    labels: filterDataByTimeRange(workoutHistory, 'date')
      .map(w => new Date(w.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Completed Workouts',
        data: filterDataByTimeRange(workoutHistory, 'date')
          .map(w => w.completed ? 1 : 0),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 0.8)',
      },
    ],
  };

  // Prepare weight chart data
  const weightChartData = {
    labels: filterDataByTimeRange(weightData, 'date')
      .map(w => new Date(w.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Weight (kg)',
        data: filterDataByTimeRange(weightData, 'date')
          .map(w => w.weight),
        fill: false,
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgba(16, 185, 129, 0.8)',
        tension: 0.4,
      },
    ],
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: activeTab === 'workouts',
      }
    },
  };

  // Calculate progress stats
  const calculateStats = () => {
    if (workoutHistory.length === 0) return { workoutsCompleted: 0, completionRate: 0 };
    
    const filteredWorkouts = filterDataByTimeRange(workoutHistory, 'date');
    const completed = filteredWorkouts.filter(w => w.completed).length;
    
    return {
      workoutsCompleted: completed,
      completionRate: filteredWorkouts.length > 0 
        ? Math.round((completed / filteredWorkouts.length) * 100) 
        : 0
    };
  };

  const stats = calculateStats();

  // Calculate weight change
  const calculateWeightChange = () => {
    const filteredWeights = filterDataByTimeRange(weightData, 'date');
    if (filteredWeights.length < 2) return { change: 0, percentage: 0 };
    
    const oldestWeight = filteredWeights[0].weight;
    const newestWeight = filteredWeights[filteredWeights.length - 1].weight;
    const change = newestWeight - oldestWeight;
    const percentage = (change / oldestWeight) * 100;
    
    return {
      change: change.toFixed(1),
      percentage: percentage.toFixed(1)
    };
  };

  const weightChange = calculateWeightChange();

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
        <h1 className="text-3xl font-bold mb-8">Progress Tracker</h1>
        
        {/* Time Range Selector */}
        <div className="flex justify-end mb-6">
          <div className="inline-flex rounded-md shadow-sm">
            <button
              type="button"
              onClick={() => setTimeRange('week')}
              className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                timeRange === 'week'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Week
            </button>
            <button
              type="button"
              onClick={() => setTimeRange('month')}
              className={`px-4 py-2 text-sm font-medium ${
                timeRange === 'month'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Month
            </button>
            <button
              type="button"
              onClick={() => setTimeRange('year')}
              className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                timeRange === 'year'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Year
            </button>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-900 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Workouts Completed</h3>
            <p className="text-3xl font-bold text-blue-400">{stats.workoutsCompleted}</p>
            <p className="text-sm text-slate-400 mt-2">in selected period</p>
          </div>
          
          <div className="bg-slate-900 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Completion Rate</h3>
            <p className="text-3xl font-bold text-blue-400">{stats.completionRate}%</p>
            <p className="text-sm text-slate-400 mt-2">workouts completed</p>
          </div>
          
          <div className="bg-slate-900 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Weight Change</h3>
            <p className={`text-3xl font-bold ${
              parseFloat(weightChange.change) <= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {weightChange.change > 0 ? '+' : ''}{weightChange.change} kg
            </p>
            <p className="text-sm text-slate-400 mt-2">in selected period</p>
          </div>
          
          <div className="bg-slate-900 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Weight Change %</h3>
            <p className={`text-3xl font-bold ${
              parseFloat(weightChange.percentage) <= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {weightChange.percentage > 0 ? '+' : ''}{weightChange.percentage}%
            </p>
            <p className="text-sm text-slate-400 mt-2">in selected period</p>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="bg-slate-900 rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="flex border-b border-slate-800">
            <button
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'workouts'
                  ? 'bg-slate-800 text-white border-b-2 border-blue-500'
                  : 'text-slate-400 hover:text-white'
              }`}
              onClick={() => setActiveTab('workouts')}
            >
              Workout Consistency
            </button>
            <button
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'weight'
                  ? 'bg-slate-800 text-white border-b-2 border-blue-500'
                  : 'text-slate-400 hover:text-white'
              }`}
              onClick={() => setActiveTab('weight')}
            >
              Weight Tracking
            </button>
          </div>
          
          <div className="p-6">
            <div className="h-80">
              {activeTab === 'workouts' ? (
                workoutHistory.length > 0 ? (
                  <Bar data={workoutChartData} options={chartOptions} />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p>No workout data available</p>
                  </div>
                )
              ) : (
                weightData.length > 0 ? (
                  <Line data={weightChartData} options={chartOptions} />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p>No weight data available</p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
        
        {/* Add Weight Form */}
        {activeTab === 'weight' && (
          <div className="bg-slate-900 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Track Your Weight</h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label htmlFor="weight" className="block text-sm font-medium mb-1">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  id="weight"
                  className="w-full px-4 py-2 rounded bg-slate-800 border border-slate-700 focus:border-blue-500 focus:outline-none"
                  step="0.1"
                  min="20"
                  max="300"
                  placeholder="Enter your current weight"
                />
              </div>
              <div className="flex-1">
                <label htmlFor="date" className="block text-sm font-medium mb-1">
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  className="w-full px-4 py-2 rounded bg-slate-800 border border-slate-700 focus:border-blue-500 focus:outline-none"
                  defaultValue={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition duration-300"
                >
                  Add Entry
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
