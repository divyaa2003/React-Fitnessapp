import { useState } from 'react';
import { motion } from 'framer-motion';

export default function MentalWellness() {
  const [mood, setMood] = useState(null);
  const [moodHistory, setMoodHistory] = useState([
    { date: '2025-05-09', mood: 'happy', notes: 'Great workout today!' },
    { date: '2025-05-08', mood: 'tired', notes: 'Feeling a bit exhausted from work' },
    { date: '2025-05-07', mood: 'motivated', notes: 'Ready to crush my fitness goals' }
  ]);
  const [notes, setNotes] = useState('');
  const [selectedMeditation, setSelectedMeditation] = useState(null);
  const [meditationTimer, setMeditationTimer] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  
  const moods = [
    { id: 'happy', emoji: '😊', label: 'Happy' },
    { id: 'motivated', emoji: '💪', label: 'Motivated' },
    { id: 'tired', emoji: '😴', label: 'Tired' },
    { id: 'stressed', emoji: '😓', label: 'Stressed' },
    { id: 'anxious', emoji: '😰', label: 'Anxious' },
    { id: 'calm', emoji: '😌', label: 'Calm' }
  ];
  
  const meditations = [
    { id: 1, title: 'Quick Calm', duration: 5, description: 'A 5-minute meditation to quickly calm your mind' },
    { id: 2, title: 'Body Scan', duration: 10, description: 'A 10-minute guided body awareness meditation' },
    { id: 3, title: 'Deep Focus', duration: 15, description: 'A 15-minute meditation to improve concentration' },
    { id: 4, title: 'Stress Relief', duration: 20, description: 'A 20-minute meditation to release tension and stress' }
  ];
  
  const handleMoodSubmit = () => {
    if (!mood) return;
    
    const newMoodEntry = {
      date: new Date().toISOString().split('T')[0],
      mood,
      notes
    };
    
    setMoodHistory([newMoodEntry, ...moodHistory]);
    setMood(null);
    setNotes('');
  };
  
  const startMeditation = (meditation) => {
    setSelectedMeditation(meditation);
    setMeditationTimer(meditation.duration * 60);
    setTimerRunning(true);
    
    // In a real app, you would implement a proper timer here
    // This is just a placeholder for demonstration
  };
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const getMoodEmoji = (moodId) => {
    const foundMood = moods.find(m => m.id === moodId);
    return foundMood ? foundMood.emoji : '❓';
  };
  
  return (
    <div className="max-w-7xl mx-auto p-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-8">Mental Wellness</h1>
        
        {/* Mood Tracker */}
        <div className="bg-slate-900 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">How are you feeling today?</h2>
          
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 mb-6">
            {moods.map(m => (
              <button
                key={m.id}
                onClick={() => setMood(m.id)}
                className={`flex flex-col items-center justify-center p-4 rounded-lg transition ${
                  mood === m.id 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-800 hover:bg-slate-700'
                }`}
              >
                <span className="text-3xl mb-2">{m.emoji}</span>
                <span className="text-sm">{m.label}</span>
              </button>
            ))}
          </div>
          
          <div className="mb-4">
            <label htmlFor="notes" className="block text-sm font-medium mb-1">
              Notes (optional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2 rounded bg-slate-800 border border-slate-700 focus:border-blue-500 focus:outline-none"
              rows="3"
              placeholder="How are you feeling today? Any specific thoughts?"
            ></textarea>
          </div>
          
          <button
            onClick={handleMoodSubmit}
            disabled={!mood}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition duration-300 disabled:opacity-50"
          >
            Log Mood
          </button>
        </div>
        
        {/* Meditation */}
        <div className="bg-slate-900 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Guided Meditation</h2>
          
          {selectedMeditation && timerRunning ? (
            <div className="text-center py-8">
              <h3 className="text-2xl font-bold mb-2">{selectedMeditation.title}</h3>
              <p className="text-slate-400 mb-6">{selectedMeditation.description}</p>
              
              <div className="text-6xl font-bold mb-8 text-blue-400">
                {formatTime(meditationTimer)}
              </div>
              
              <p className="text-lg mb-6">Take deep breaths and focus on your breathing</p>
              
              <button
                onClick={() => setTimerRunning(false)}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded transition duration-300"
              >
                End Session
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {meditations.map(meditation => (
                <div key={meditation.id} className="bg-slate-800 rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-1">{meditation.title}</h3>
                  <p className="text-sm text-slate-400 mb-3">{meditation.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-400">{meditation.duration} minutes</span>
                    <button
                      onClick={() => startMeditation(meditation)}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-1 px-3 rounded transition duration-300"
                    >
                      Start
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Breathing Exercise */}
        <div className="bg-slate-900 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Breathing Exercise</h2>
          
          <div className="text-center py-6">
            <div className="relative w-40 h-40 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-blue-500 opacity-20"></div>
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-blue-500"
                animate={{
                  scale: [1, 1.5, 1.5, 1, 1],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  repeatType: "loop"
                }}
              ></motion.div>
              <div className="absolute inset-0 flex items-center justify-center text-lg">
                Breathe
              </div>
            </div>
            
            <p className="text-slate-400 mb-2">Follow the circle</p>
            <p className="text-slate-400">Inhale as it expands, hold, then exhale as it contracts</p>
          </div>
        </div>
        
        {/* Mood History */}
        <div className="bg-slate-900 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Mood History</h2>
          
          {moodHistory.length > 0 ? (
            <div className="space-y-4">
              {moodHistory.map((entry, index) => (
                <div key={index} className="bg-slate-800 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{getMoodEmoji(entry.mood)}</span>
                      <span className="capitalize">{entry.mood}</span>
                    </div>
                    <span className="text-sm text-slate-400">{entry.date}</span>
                  </div>
                  {entry.notes && <p className="text-sm text-slate-300">{entry.notes}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400">No mood entries yet</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
