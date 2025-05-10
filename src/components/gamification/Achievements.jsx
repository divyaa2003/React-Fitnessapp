import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

export default function Achievements() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      // Get workout history from local storage to calculate achievements
      const storedWorkouts = JSON.parse(localStorage.getItem('workoutHistory') || '[]');
      
      // Mock achievements based on workout history
      const mockAchievements = [];
      
      // First workout achievement
      if (storedWorkouts.length > 0) {
        mockAchievements.push({
          name: 'First Steps',
          description: 'Complete your first workout',
          dateEarned: new Date().toISOString(),
          icon: '🏃'
        });
      }
      
      // Completed workouts achievement
      const completedWorkouts = storedWorkouts.filter(w => w.completed).length;
      if (completedWorkouts >= 3) {
        mockAchievements.push({
          name: 'Dedicated',
          description: 'Complete multiple workouts',
          dateEarned: new Date().toISOString(),
          icon: '💪'
        });
      }
      
      // Add mock streak achievement
      mockAchievements.push({
        name: 'Week Warrior',
        description: 'Complete workouts for 7 consecutive days',
        dateEarned: new Date().toISOString(),
        icon: '🔥'
      });
      
      setAchievements(mockAchievements);
    } catch (error) {
      console.error('Error loading achievements:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Define all possible achievements
  const allAchievements = [
    {
      id: 'first_workout',
      name: 'First Steps',
      description: 'Complete your first workout',
      icon: '🏃',
      tier: 'bronze'
    },
    {
      id: 'week_warrior',
      name: 'Week Warrior',
      description: 'Complete workouts for 7 consecutive days',
      icon: '🔥',
      tier: 'silver'
    },
    {
      id: 'dedicated',
      name: 'Dedicated',
      description: 'Complete 10 workouts',
      icon: '💪',
      tier: 'silver'
    },
    {
      id: 'month_master',
      name: 'Month Master',
      description: 'Complete workouts for 30 consecutive days',
      icon: '🏆',
      tier: 'gold'
    },
    {
      id: 'century_club',
      name: 'Century Club',
      description: 'Complete 100 workouts',
      icon: '🌟',
      tier: 'gold'
    },
    {
      id: 'variety_victor',
      name: 'Variety Victor',
      description: 'Try workouts for all muscle groups',
      icon: '🌈',
      tier: 'silver'
    },
    {
      id: 'early_bird',
      name: 'Early Bird',
      description: 'Complete a workout before 7 AM',
      icon: '🌅',
      tier: 'bronze'
    },
    {
      id: 'night_owl',
      name: 'Night Owl',
      description: 'Complete a workout after 10 PM',
      icon: '🌙',
      tier: 'bronze'
    },
    {
      id: 'weekend_warrior',
      name: 'Weekend Warrior',
      description: 'Complete workouts on 5 consecutive weekends',
      icon: '📅',
      tier: 'gold'
    },
    {
      id: 'profile_complete',
      name: 'Identity Established',
      description: 'Complete your profile information',
      icon: '📝',
      tier: 'bronze'
    }
  ];

  // Check if achievement is unlocked
  const isUnlocked = (achievementId) => {
    return achievements.some(a => a.name === allAchievements.find(aa => aa.id === achievementId)?.name);
  };

  // Get achievement date if unlocked
  const getUnlockDate = (achievementId) => {
    const achievement = achievements.find(a => a.name === allAchievements.find(aa => aa.id === achievementId)?.name);
    return achievement ? new Date(achievement.dateEarned).toLocaleDateString() : null;
  };

  // Get tier color
  const getTierColor = (tier) => {
    switch (tier) {
      case 'bronze': return 'from-amber-700 to-amber-500';
      case 'silver': return 'from-slate-400 to-slate-300';
      case 'gold': return 'from-yellow-500 to-yellow-300';
      default: return 'from-slate-700 to-slate-600';
    }
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
        <h1 className="text-3xl font-bold mb-8">Your Achievements</h1>
        
        <div className="bg-slate-900 rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Achievement Progress</h2>
            <div className="flex items-center">
              <span className="text-2xl font-bold text-blue-400">{achievements.length}</span>
              <span className="text-slate-400 ml-2">/ {allAchievements.length}</span>
            </div>
          </div>
          
          <div className="w-full bg-slate-800 rounded-full h-4 mb-6">
            <div 
              className="bg-blue-500 h-4 rounded-full" 
              style={{ width: `${(achievements.length / allAchievements.length) * 100}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between text-sm">
            <span>Beginner</span>
            <span>Intermediate</span>
            <span>Advanced</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {allAchievements.map((achievement) => {
            const unlocked = isUnlocked(achievement.id);
            const unlockDate = getUnlockDate(achievement.id);
            
            return (
              <motion.div
                key={achievement.id}
                whileHover={{ scale: 1.02 }}
                className={`rounded-lg shadow-lg overflow-hidden ${unlocked ? 'border-2 border-blue-500' : 'border border-slate-700'}`}
              >
                <div className={`h-24 flex items-center justify-center bg-gradient-to-r ${getTierColor(achievement.tier)}`}>
                  <span className="text-5xl">{achievement.icon}</span>
                </div>
                
                <div className="p-6 bg-slate-900">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold">{achievement.name}</h3>
                    {unlocked ? (
                      <span className="bg-blue-500 text-xs px-2 py-1 rounded-full">Unlocked</span>
                    ) : (
                      <span className="bg-slate-700 text-xs px-2 py-1 rounded-full">Locked</span>
                    )}
                  </div>
                  
                  <p className="text-sm text-slate-400 mb-4">{achievement.description}</p>
                  
                  {unlocked && unlockDate && (
                    <div className="text-xs text-slate-500">
                      Unlocked on {unlockDate}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
