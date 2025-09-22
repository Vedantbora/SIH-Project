import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Play, RotateCcw, Trophy, Clock, Target, Timer } from 'lucide-react';
import { useGameStore } from '../../stores/gameStore';

interface ReactionTest {
  id: number;
  startTime: number;
  reactionTime: number | null;
  isWaiting: boolean;
  isActive: boolean;
}

const ReactionTimeGame: React.FC<{ onGameEnd: (score: number) => void }> = ({ onGameEnd }) => {
  const [tests, setTests] = useState<ReactionTest[]>([]);
  const [currentTest, setCurrentTest] = useState(0);
  const [gameState, setGameState] = useState<'waiting' | 'ready' | 'active' | 'ended'>('waiting');
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [waitTime, setWaitTime] = useState(0);
  const { addPoints, completeGame } = useGameStore();
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const totalTests = 5;

  // Initialize game
  const initializeGame = () => {
    const newTests: ReactionTest[] = [];
    for (let i = 0; i < totalTests; i++) {
      newTests.push({
        id: i,
        startTime: 0,
        reactionTime: null,
        isWaiting: false,
        isActive: false
      });
    }
    setTests(newTests);
    setCurrentTest(0);
    setGameState('waiting');
    setGameStarted(true);
    setGameEnded(false);
    setCountdown(3);
    setWaitTime(0);
  };

  // Start countdown
  const startCountdown = () => {
    setGameState('ready');
    setCountdown(3);
    
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          startTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Start a test
  const startTest = () => {
    const waitTime = Math.random() * 3000 + 2000; // 2-5 seconds wait
    setWaitTime(waitTime);
    setGameState('waiting');
    
    setTests(prev => prev.map((test, index) => 
      index === currentTest 
        ? { ...test, isWaiting: true }
        : test
    ));

    timeoutRef.current = setTimeout(() => {
      setGameState('active');
      startTimeRef.current = Date.now();
      
      setTests(prev => prev.map((test, index) => 
        index === currentTest 
          ? { ...test, isWaiting: false, isActive: true, startTime: startTimeRef.current }
          : test
      ));
    }, waitTime);
  };

  // Handle click during test
  const handleClick = () => {
    if (gameState === 'active') {
      const reactionTime = Date.now() - startTimeRef.current;
      
      setTests(prev => prev.map((test, index) => 
        index === currentTest 
          ? { ...test, reactionTime, isActive: false }
          : test
      ));

      if (currentTest < totalTests - 1) {
        setCurrentTest(prev => prev + 1);
        setTimeout(() => {
          setGameState('waiting');
          startTest();
        }, 1000);
      } else {
        endGame();
      }
    } else if (gameState === 'waiting') {
      // Clicked too early - penalty
      setTests(prev => prev.map((test, index) => 
        index === currentTest 
          ? { ...test, reactionTime: -1, isActive: false, isWaiting: false }
          : test
      ));

      if (currentTest < totalTests - 1) {
        setCurrentTest(prev => prev + 1);
        setTimeout(() => {
          setGameState('waiting');
          startTest();
        }, 1000);
      } else {
        endGame();
      }
    }
  };

  // Calculate score
  const calculateScore = () => {
    const validTests = tests.filter(test => test.reactionTime && test.reactionTime > 0);
    const avgReactionTime = validTests.length > 0 
      ? validTests.reduce((sum, test) => sum + (test.reactionTime || 0), 0) / validTests.length 
      : 1000;
    
    const accuracy = (validTests.length / totalTests) * 100;
    const speedBonus = Math.max(0, 500 - avgReactionTime) * 2;
    const accuracyBonus = accuracy * 10;
    
    return Math.floor(speedBonus + accuracyBonus);
  };

  // End game
  const endGame = () => {
    setGameState('ended');
    setGameEnded(true);
    
    const score = calculateScore();
    const points = Math.floor(score / 20) + 20; // Base 20 points + score bonus
    
    addPoints('reaction-time', points, score);
    
    const validTests = tests.filter(test => test.reactionTime && test.reactionTime > 0);
    if (validTests.length >= totalTests * 0.8) { // 80% success rate
      completeGame('reaction-time');
    }
    
    setTimeout(() => {
      onGameEnd(score);
    }, 3000);
  };

  // Reset game
  const resetGame = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setGameStarted(false);
    setGameEnded(false);
    setCurrentTest(0);
    setGameState('waiting');
    setTests([]);
  };

  const getAverageReactionTime = () => {
    const validTests = tests.filter(test => test.reactionTime && test.reactionTime > 0);
    if (validTests.length === 0) return 0;
    return validTests.reduce((sum, test) => sum + (test.reactionTime || 0), 0) / validTests.length;
  };

  const getCurrentTestData = () => {
    return tests[currentTest] || { reactionTime: null, isWaiting: false, isActive: false };
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
            <Zap className="w-8 h-8 text-yellow-400" />
            <h1 className="text-2xl font-bold text-white">Reaction Time</h1>
          </motion.div>
          
          <div className="grid grid-cols-4 gap-4 max-w-lg mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <Target className="w-6 h-6 text-blue-400 mx-auto mb-1" />
              <div className="text-lg font-bold text-white">{currentTest + 1}/{totalTests}</div>
              <div className="text-xs text-gray-300">Test</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <Timer className="w-6 h-6 text-green-400 mx-auto mb-1" />
              <div className="text-lg font-bold text-white">
                {getCurrentTestData().reactionTime ? `${getCurrentTestData().reactionTime}ms` : '-'}
              </div>
              <div className="text-xs text-gray-300">Current</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <Clock className="w-6 h-6 text-yellow-400 mx-auto mb-1" />
              <div className="text-lg font-bold text-white">
                {getAverageReactionTime() > 0 ? `${Math.round(getAverageReactionTime())}ms` : '-'}
              </div>
              <div className="text-xs text-gray-300">Average</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <Trophy className="w-6 h-6 text-purple-400 mx-auto mb-1" />
              <div className="text-lg font-bold text-white">{calculateScore()}</div>
              <div className="text-xs text-gray-300">Score</div>
            </div>
          </div>
        </div>

        {/* Game Area */}
        <div className="flex justify-center mb-8">
          <motion.div
            className={`w-80 h-80 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 ${
              gameState === 'waiting' && gameStarted
                ? 'bg-red-500/20 border-4 border-red-400'
                : gameState === 'ready'
                ? 'bg-yellow-500/20 border-4 border-yellow-400'
                : gameState === 'active'
                ? 'bg-green-500/20 border-4 border-green-400'
                : 'bg-white/10 border-4 border-gray-400'
            }`}
            animate={{
              scale: gameState === 'active' ? [1, 1.1, 1] : 1,
            }}
            transition={{
              scale: {
                duration: 0.5,
                repeat: gameState === 'active' ? Infinity : 0,
                repeatType: "reverse"
              }
            }}
            onClick={handleClick}
          >
            <div className="text-center text-white">
              <AnimatePresence mode="waiting">
                {gameState === 'waiting' && !gameStarted && (
                  <motion.div
                    key="start"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <Play className="w-16 h-16 mx-auto mb-4" />
                    <div className="text-xl font-bold">Click to Start</div>
                    <div className="text-sm opacity-75 mt-2">Test your reaction time!</div>
                  </motion.div>
                )}
                
                {gameState === 'ready' && (
                  <motion.div
                    key="countdown"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <div className="text-6xl font-bold text-yellow-400">{countdown}</div>
                    <div className="text-lg mt-2">Get Ready...</div>
                  </motion.div>
                )}
                
                {gameState === 'waiting' && gameStarted && (
                  <motion.div
                    key="waiting"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <div className="text-xl font-bold text-red-400">Wait...</div>
                    <div className="text-sm opacity-75 mt-2">Don't click yet!</div>
                  </motion.div>
                )}
                
                {gameState === 'active' && (
                  <motion.div
                    key="active"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <Zap className="w-16 h-16 mx-auto mb-4 text-green-400" />
                    <div className="text-xl font-bold text-green-400">CLICK NOW!</div>
                    <div className="text-sm opacity-75 mt-2">As fast as you can!</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* Test Results */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 mb-6">
          <h3 className="text-xl font-bold text-white mb-4 text-center">Test Results</h3>
          <div className="grid grid-cols-5 gap-4">
            {tests.map((test, index) => (
              <div key={test.id} className="text-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${
                  test.reactionTime === null
                    ? 'bg-gray-600'
                    : test.reactionTime === -1
                    ? 'bg-red-500'
                    : test.reactionTime < 300
                    ? 'bg-green-500'
                    : test.reactionTime < 500
                    ? 'bg-yellow-500'
                    : 'bg-orange-500'
                }`}>
                  <span className="text-white font-bold">{index + 1}</span>
                </div>
                <div className="text-sm text-gray-300">
                  {test.reactionTime === null
                    ? '-'
                    : test.reactionTime === -1
                    ? 'Too Early'
                    : `${test.reactionTime}ms`}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4">
          {!gameStarted ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startCountdown}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              <Play className="w-5 h-5" />
              Start Test
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={resetGame}
              className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
              Reset
            </motion.button>
          )}
        </div>

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
                <h2 className="text-3xl font-bold text-white mb-2">Test Complete!</h2>
                <p className="text-gray-300 mb-6">Great job testing your reaction time!</p>
                
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-white">
                    <span>Average Reaction Time:</span>
                    <span className="font-bold">{Math.round(getAverageReactionTime())}ms</span>
                  </div>
                  <div className="flex justify-between text-white">
                    <span>Tests Completed:</span>
                    <span className="font-bold">{tests.filter(t => t.reactionTime && t.reactionTime > 0).length}/{totalTests}</span>
                  </div>
                  <div className="flex justify-between text-white">
                    <span>Accuracy:</span>
                    <span className="font-bold">{Math.round((tests.filter(t => t.reactionTime && t.reactionTime > 0).length / totalTests) * 100)}%</span>
                  </div>
                  <div className="flex justify-between text-yellow-400 font-bold">
                    <span>Points Earned:</span>
                    <span>+{Math.floor(calculateScore() / 20) + 20}</span>
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

export default ReactionTimeGame;
