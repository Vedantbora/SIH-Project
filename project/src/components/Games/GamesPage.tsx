import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Target, Zap, Trophy, Play, Star, Gamepad2, Puzzle } from 'lucide-react';
import { useGameStore } from '../../stores/gameStore';
import MemoryCardsGame from './MemoryCardsGame';
import FocusMeditationGame from './FocusMeditationGame';
import ReactionTimeGame from './ReactionTimeGame';

interface Game {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: 'Memory' | 'Focus' | 'Logic' | 'Relaxation';
  points: number;
  completed: boolean;
  unlocked: boolean;
}

const GamesPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [currentGame, setCurrentGame] = useState<string | null>(null);
  const { totalPoints, gamesCompleted, currentStreak, getGameStats, getTotalGamesPlayed, loadGameStats, isLoading } = useGameStore();

  // Load game stats from database when component mounts
  useEffect(() => {
    loadGameStats();
  }, [loadGameStats]);

  const games: Game[] = [
    {
      id: 'memory-cards',
      title: 'Memory Cards',
      description: 'Test your memory by matching pairs of cards. Improve your concentration and recall abilities.',
      icon: <Brain className="w-8 h-8" />,
      difficulty: 'Easy',
      category: 'Memory',
      points: getGameStats('memory-cards').points,
      completed: getGameStats('memory-cards').completed,
      unlocked: true
    },
    {
      id: 'focus-meditation',
      title: 'Focus Meditation',
      description: 'Practice mindfulness and improve your attention span with guided breathing exercises.',
      icon: <Target className="w-8 h-8" />,
      difficulty: 'Easy',
      category: 'Focus',
      points: getGameStats('focus-meditation').points,
      completed: getGameStats('focus-meditation').completed,
      unlocked: true
    },
    {
      id: 'reaction-time',
      title: 'Reaction Time',
      description: 'Test your reflexes and improve your response time with quick visual challenges.',
      icon: <Zap className="w-8 h-8" />,
      difficulty: 'Medium',
      category: 'Focus',
      points: getGameStats('reaction-time').points,
      completed: getGameStats('reaction-time').completed,
      unlocked: true
    },
    {
      id: 'logic-puzzle',
      title: 'Logic Puzzle',
      description: 'Solve challenging logic problems to enhance your critical thinking skills.',
      icon: <Puzzle className="w-8 h-8" />,
      difficulty: 'Hard',
      category: 'Logic',
      points: 0,
      completed: false,
      unlocked: false
    },
    {
      id: 'relaxation-sounds',
      title: 'Relaxation Sounds',
      description: 'Unwind with calming nature sounds and guided relaxation exercises.',
      icon: <Star className="w-8 h-8" />,
      difficulty: 'Easy',
      category: 'Relaxation',
      points: 0,
      completed: false,
      unlocked: false
    },
    {
      id: 'pattern-recognition',
      title: 'Pattern Recognition',
      description: 'Identify and complete visual patterns to boost your pattern recognition abilities.',
      icon: <Gamepad2 className="w-8 h-8" />,
      difficulty: 'Medium',
      category: 'Logic',
      points: 0,
      completed: false,
      unlocked: false
    }
  ];

  const categories = ['All', 'Memory', 'Focus', 'Logic', 'Relaxation'];

  const filteredGames = selectedCategory === 'All' 
    ? games 
    : games.filter(game => game.category === selectedCategory);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-400 bg-green-400/20';
      case 'Medium': return 'text-yellow-400 bg-yellow-400/20';
      case 'Hard': return 'text-red-400 bg-red-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const handlePlayGame = (game: Game) => {
    setSelectedGame(game);
    setCurrentGame(game.id);
  };

  const handleGameEnd = async (score: number) => {
    setCurrentGame(null);
    setSelectedGame(null);
    // Reload stats from database to ensure consistency
    await loadGameStats();
  };

  // Render the actual game if one is selected
  if (currentGame) {
    switch (currentGame) {
      case 'memory-cards':
        return <MemoryCardsGame onGameEnd={handleGameEnd} />;
      case 'focus-meditation':
        return <FocusMeditationGame onGameEnd={handleGameEnd} />;
      case 'reaction-time':
        return <ReactionTimeGame onGameEnd={handleGameEnd} />;
      default:
        return <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6 flex items-center justify-center">
          <div className="text-white text-xl">Game coming soon!</div>
        </div>;
    }
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <div className="text-white text-xl">Loading game statistics...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <Gamepad2 className="w-10 h-10 text-purple-400" />
            Mental Health Games
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Improve your mental wellness through engaging games designed to boost memory, focus, and cognitive abilities.
          </p>
        </motion.div>

        {/* Stats Overview */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
            <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{gamesCompleted}</div>
            <div className="text-gray-300">Games Completed</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
            <Star className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{totalPoints}</div>
            <div className="text-gray-300">Points Earned</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
            <Brain className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{currentStreak}</div>
            <div className="text-gray-300">Streak Days</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
            <Target className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{getTotalGamesPlayed()}</div>
            <div className="text-gray-300">Total Plays</div>
          </div>
        </motion.div>

        {/* Category Filter */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap gap-3 mb-8 justify-center"
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${
                selectedCategory === category
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
              }`}
            >
              {category}
            </button>
          ))}
        </motion.div>

        {/* Games Grid */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredGames.map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className={`bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/15 transition-all duration-300 group ${
                !game.unlocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              }`}
              onClick={() => game.unlocked && handlePlayGame(game)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="text-purple-400 group-hover:scale-110 transition-transform duration-200">
                  {game.icon}
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(game.difficulty)}`}>
                  {game.difficulty}
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
                {game.title}
              </h3>
              
              <p className="text-gray-300 mb-4 text-sm leading-relaxed">
                {game.description}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-yellow-400">
                  <Star className="w-4 h-4" />
                  <span className="text-sm font-medium">{game.points} pts</span>
                  {game.completed && (
                    <Trophy className="w-4 h-4 text-yellow-400" />
                  )}
                </div>
                
                {game.unlocked ? (
                  <button className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-all duration-200 group-hover:shadow-lg group-hover:shadow-purple-600/25">
                    <Play className="w-4 h-4" />
                    {game.completed ? 'Play Again' : 'Play'}
                  </button>
                ) : (
                  <button className="flex items-center gap-2 bg-gray-600 text-gray-400 px-4 py-2 rounded-lg cursor-not-allowed">
                    <Play className="w-4 h-4" />
                    Locked
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </div>
  );
};

export default GamesPage;
