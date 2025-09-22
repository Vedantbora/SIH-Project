import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, RotateCcw, Trophy, Clock, Target } from 'lucide-react';
import { useGameStore } from '../../stores/gameStore';

interface Card {
  id: number;
  value: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const symbols = ['🎮', '🧠', '💡', '⭐', '🎯', '🎨', '🚀', '💎', '🌸', '🌙', '🔥', '⚡'];

const MemoryCardsGame: React.FC<{ onGameEnd: (score: number) => void }> = ({ onGameEnd }) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const { addPoints, completeGame } = useGameStore();

  const totalPairs = 6;

  // Initialize game
  const initializeGame = useCallback(() => {
    const gameSymbols = symbols.slice(0, totalPairs);
    const gameCards: Card[] = [];
    
    // Create pairs
    [...gameSymbols, ...gameSymbols].forEach((symbol, index) => {
      gameCards.push({
        id: index,
        value: symbol,
        isFlipped: false,
        isMatched: false
      });
    });

    // Shuffle cards
    const shuffledCards = gameCards.sort(() => Math.random() - 0.5);
    setCards(shuffledCards);
    setFlippedCards([]);
    setMoves(0);
    setTimeLeft(60);
    setGameStarted(true);
    setGameEnded(false);
    setMatchedPairs(0);
  }, [totalPairs]);

  // Handle card click
  const handleCardClick = (cardId: number) => {
    if (gameEnded || !gameStarted) return;
    
    const card = cards.find(c => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched || flippedCards.length >= 2) return;

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    setCards(prevCards => 
      prevCards.map(c => 
        c.id === cardId ? { ...c, isFlipped: true } : c
      )
    );

    if (newFlippedCards.length === 2) {
      setMoves(prev => prev + 1);
      
      setTimeout(() => {
        const [firstId, secondId] = newFlippedCards;
        const firstCard = cards.find(c => c.id === firstId);
        const secondCard = cards.find(c => c.id === secondId);

        if (firstCard?.value === secondCard?.value) {
          // Match found
          setCards(prevCards => 
            prevCards.map(c => 
              c.id === firstId || c.id === secondId 
                ? { ...c, isMatched: true }
                : c
            )
          );
          setMatchedPairs(prev => prev + 1);
        } else {
          // No match, flip back
          setCards(prevCards => 
            prevCards.map(c => 
              c.id === firstId || c.id === secondId 
                ? { ...c, isFlipped: false }
                : c
            )
          );
        }
        setFlippedCards([]);
      }, 1000);
    }
  };

  // Timer effect
  useEffect(() => {
    if (gameStarted && !gameEnded && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gameStarted) {
      endGame();
    }
  }, [timeLeft, gameStarted, gameEnded]);

  // Check for game completion
  useEffect(() => {
    if (matchedPairs === totalPairs && gameStarted) {
      endGame();
    }
  }, [matchedPairs, totalPairs, gameStarted]);

  // Calculate score
  const calculateScore = () => {
    const timeBonus = Math.max(0, timeLeft * 2);
    const movesBonus = Math.max(0, (20 - moves) * 3);
    const completionBonus = matchedPairs === totalPairs ? 50 : 0;
    return timeBonus + movesBonus + completionBonus;
  };

  // End game
  const endGame = () => {
    setGameEnded(true);
    const score = calculateScore();
    const points = Math.floor(score / 10) + 10; // Base 10 points + score bonus
    
    addPoints('memory-cards', points, score);
    if (matchedPairs === totalPairs) {
      completeGame('memory-cards');
    }
    
    setTimeout(() => {
      onGameEnd(score);
    }, 2000);
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
            <Brain className="w-8 h-8 text-purple-400" />
            <h1 className="text-2xl font-bold text-white">Memory Cards</h1>
          </motion.div>
          
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <Clock className="w-6 h-6 text-blue-400 mx-auto mb-1" />
              <div className="text-xl font-bold text-white">{timeLeft}s</div>
              <div className="text-xs text-gray-300">Time</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <Target className="w-6 h-6 text-green-400 mx-auto mb-1" />
              <div className="text-xl font-bold text-white">{moves}</div>
              <div className="text-xs text-gray-300">Moves</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <Trophy className="w-6 h-6 text-yellow-400 mx-auto mb-1" />
              <div className="text-xl font-bold text-white">{matchedPairs}/{totalPairs}</div>
              <div className="text-xs text-gray-300">Pairs</div>
            </div>
          </div>
        </div>

        {/* Game Board */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 mb-6">
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <AnimatePresence>
              {cards.map((card) => (
                <motion.div
                  key={card.id}
                  initial={{ scale: 0, rotate: 180 }}
                  animate={{ scale: 1, rotate: card.isFlipped ? 0 : 180 }}
                  exit={{ scale: 0 }}
                  whileHover={{ scale: card.isFlipped || card.isMatched ? 1 : 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`aspect-square rounded-xl cursor-pointer transition-all duration-300 ${
                    card.isMatched 
                      ? 'bg-green-500/20 border-2 border-green-400' 
                      : card.isFlipped 
                        ? 'bg-white/20 border-2 border-purple-400' 
                        : 'bg-white/10 hover:bg-white/15 border-2 border-transparent'
                  }`}
                  onClick={() => handleCardClick(card.id)}
                >
                  <div className="w-full h-full flex items-center justify-center text-3xl">
                    {(card.isFlipped || card.isMatched) && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-white"
                      >
                        {card.value}
                      </motion.span>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={initializeGame}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
            {gameStarted ? 'Restart' : 'Start Game'}
          </motion.button>
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
                <h2 className="text-3xl font-bold text-white mb-2">
                  {matchedPairs === totalPairs ? 'Congratulations!' : 'Time\'s Up!'}
                </h2>
                <p className="text-gray-300 mb-6">
                  {matchedPairs === totalPairs 
                    ? 'You matched all pairs!' 
                    : `You matched ${matchedPairs} out of ${totalPairs} pairs`}
                </p>
                
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-white">
                    <span>Score:</span>
                    <span className="font-bold">{calculateScore()}</span>
                  </div>
                  <div className="flex justify-between text-white">
                    <span>Moves:</span>
                    <span className="font-bold">{moves}</span>
                  </div>
                  <div className="flex justify-between text-white">
                    <span>Time Left:</span>
                    <span className="font-bold">{timeLeft}s</span>
                  </div>
                  <div className="flex justify-between text-yellow-400 font-bold">
                    <span>Points Earned:</span>
                    <span>+{Math.floor(calculateScore() / 10) + 10}</span>
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

export default MemoryCardsGame;
