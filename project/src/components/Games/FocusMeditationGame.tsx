import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Play, Pause, RotateCcw, Trophy, Clock, Brain } from 'lucide-react';
import { useGameStore } from '../../stores/gameStore';

interface BreathingState {
  phase: 'inhale' | 'hold' | 'exhale' | 'pause';
  duration: number;
  progress: number;
}

const FocusMeditationGame: React.FC<{ onGameEnd: (score: number) => void }> = ({ onGameEnd }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [targetTime, setTargetTime] = useState(300); // 5 minutes
  const [breathingState, setBreathingState] = useState<BreathingState>({
    phase: 'inhale',
    duration: 4000,
    progress: 0
  });
  const [focusScore, setFocusScore] = useState(100);
  const [distractions, setDistractions] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const { addPoints, completeGame } = useGameStore();
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const breathingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const breathingCycle = [
    { phase: 'inhale', duration: 4000, color: 'from-blue-400 to-blue-600' },
    { phase: 'hold', duration: 2000, color: 'from-green-400 to-green-600' },
    { phase: 'exhale', duration: 6000, color: 'from-purple-400 to-purple-600' },
    { phase: 'pause', duration: 2000, color: 'from-gray-400 to-gray-600' }
  ];

  const currentCycleIndex = Math.floor(sessionTime / 14000) % breathingCycle.length;
  const currentCycle = breathingCycle[currentCycleIndex];

  // Start/Stop session
  const toggleSession = () => {
    if (!gameStarted) {
      setGameStarted(true);
    }
    setIsPlaying(!isPlaying);
  };

  // Reset session
  const resetSession = () => {
    setIsPlaying(false);
    setSessionTime(0);
    setFocusScore(100);
    setDistractions(0);
    setGameStarted(false);
    setGameEnded(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (breathingIntervalRef.current) clearInterval(breathingIntervalRef.current);
  };

  // Handle distraction (clicking during session)
  const handleDistraction = () => {
    if (isPlaying && gameStarted) {
      setDistractions(prev => prev + 1);
      setFocusScore(prev => Math.max(0, prev - 10));
    }
  };

  // Timer effect
  useEffect(() => {
    if (isPlaying && gameStarted) {
      intervalRef.current = setInterval(() => {
        setSessionTime(prev => {
          const newTime = prev + 1;
          if (newTime >= targetTime) {
            endGame();
            return targetTime;
          }
          return newTime;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, gameStarted, targetTime]);

  // Breathing animation effect
  useEffect(() => {
    if (isPlaying && gameStarted) {
      breathingIntervalRef.current = setInterval(() => {
        setBreathingState(prev => ({
          ...prev,
          progress: (prev.progress + 1) % 100
        }));
      }, 50);
    } else {
      if (breathingIntervalRef.current) clearInterval(breathingIntervalRef.current);
    }

    return () => {
      if (breathingIntervalRef.current) clearInterval(breathingIntervalRef.current);
    };
  }, [isPlaying, gameStarted]);

  // Calculate score
  const calculateScore = () => {
    const timeBonus = Math.floor(sessionTime / 60) * 10; // 10 points per minute
    const focusBonus = Math.floor(focusScore / 10) * 5; // 5 points per 10% focus
    const distractionPenalty = distractions * 5;
    const completionBonus = sessionTime >= targetTime ? 50 : 0;
    
    return Math.max(0, timeBonus + focusBonus + completionBonus - distractionPenalty);
  };

  // End game
  const endGame = () => {
    setIsPlaying(false);
    setGameEnded(true);
    
    const score = calculateScore();
    const points = Math.floor(score / 10) + 15; // Base 15 points + score bonus
    
    addPoints('focus-meditation', points, score);
    if (sessionTime >= targetTime) {
      completeGame('focus-meditation');
    }
    
    setTimeout(() => {
      onGameEnd(score);
    }, 3000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPhaseText = (phase: string) => {
    switch (phase) {
      case 'inhale': return 'Breathe In';
      case 'hold': return 'Hold';
      case 'exhale': return 'Breathe Out';
      case 'pause': return 'Rest';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 mb-4"
          >
            <Target className="w-8 h-8 text-blue-400" />
            <h1 className="text-2xl font-bold text-white">Focus Meditation</h1>
          </motion.div>
          
          <div className="grid grid-cols-4 gap-4 max-w-lg mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <Clock className="w-6 h-6 text-blue-400 mx-auto mb-1" />
              <div className="text-lg font-bold text-white">{formatTime(sessionTime)}</div>
              <div className="text-xs text-gray-300">Time</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <Brain className="w-6 h-6 text-green-400 mx-auto mb-1" />
              <div className="text-lg font-bold text-white">{focusScore}%</div>
              <div className="text-xs text-gray-300">Focus</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <Target className="w-6 h-6 text-yellow-400 mx-auto mb-1" />
              <div className="text-lg font-bold text-white">{distractions}</div>
              <div className="text-xs text-gray-300">Distractions</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <Trophy className="w-6 h-6 text-purple-400 mx-auto mb-1" />
              <div className="text-lg font-bold text-white">{formatTime(targetTime)}</div>
              <div className="text-xs text-gray-300">Target</div>
            </div>
          </div>
        </div>

        {/* Breathing Circle */}
        <div className="flex justify-center mb-8">
          <motion.div
            className={`w-80 h-80 rounded-full bg-gradient-to-r ${currentCycle.color} flex items-center justify-center cursor-pointer`}
            animate={{
              scale: breathingState.phase === 'inhale' ? 1.2 : 
                     breathingState.phase === 'exhale' ? 0.8 : 1,
              opacity: breathingState.phase === 'pause' ? 0.6 : 1
            }}
            transition={{
              duration: currentCycle.duration / 1000,
              ease: "easeInOut"
            }}
            onClick={handleDistraction}
          >
            <div className="text-center text-white">
              <div className="text-2xl font-bold mb-2">
                {getPhaseText(currentCycle.phase)}
              </div>
              <div className="text-lg opacity-75">
                {isPlaying ? 'Click to focus' : 'Start to begin'}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white/10 backdrop-blur-sm rounded-full p-2 mb-6">
          <motion.div
            className="bg-gradient-to-r from-blue-400 to-purple-400 h-3 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(sessionTime / targetTime) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleSession}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
              isPlaying 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            {isPlaying ? 'Pause' : (gameStarted ? 'Resume' : 'Start')}
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={resetSession}
            className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
            Reset
          </motion.button>
        </div>

        {/* Instructions */}
        {!gameStarted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 text-center text-gray-300 max-w-2xl mx-auto"
          >
            <h3 className="text-xl font-bold text-white mb-4">How to Play</h3>
            <div className="space-y-2 text-left">
              <p>• Follow the breathing circle - breathe in, hold, breathe out, rest</p>
              <p>• Try to complete 5 minutes of focused meditation</p>
              <p>• Avoid clicking during the session to maintain focus</p>
              <p>• Higher focus score = more points!</p>
            </div>
          </motion.div>
        )}

        {/* Game End Modal */}
        <AnimatePresence>
          {gameEnded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gradient-to-br from-purple-900 to-blue-900 rounded-2xl p-8 max-w-md mx-4 text-center"
              >
                <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-white mb-2">
                  {sessionTime >= targetTime ? 'Meditation Complete!' : 'Session Ended!'}
                </h2>
                <p className="text-gray-300 mb-6">
                  {sessionTime >= targetTime 
                    ? 'Great job completing the full meditation!' 
                    : `You meditated for ${formatTime(sessionTime)}`}
                </p>
                
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-white">
                    <span>Session Time:</span>
                    <span className="font-bold">{formatTime(sessionTime)}</span>
                  </div>
                  <div className="flex justify-between text-white">
                    <span>Focus Score:</span>
                    <span className="font-bold">{focusScore}%</span>
                  </div>
                  <div className="flex justify-between text-white">
                    <span>Distractions:</span>
                    <span className="font-bold">{distractions}</span>
                  </div>
                  <div className="flex justify-between text-yellow-400 font-bold">
                    <span>Points Earned:</span>
                    <span>+{Math.floor(calculateScore() / 10) + 15}</span>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onGameEnd(calculateScore())}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg transition-colors"
                >
                  Continue
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FocusMeditationGame;
