import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { gameService } from '../services/gameService';
import { GameStats, UserStats, GameSession } from '../types/game';

interface LocalGameStats {
  completed: boolean;
  points: number;
  bestScore: number;
  timesPlayed: number;
  lastPlayed: string | null;
}

interface GameStore {
  // Game Statistics
  totalPoints: number;
  gamesCompleted: number;
  currentStreak: number;
  longestStreak: number;
  lastPlayDate: string | null;
  
  // Individual Game Stats
  gameStats: Record<string, LocalGameStats>;
  
  // Loading states
  isLoading: boolean;
  isSaving: boolean;
  
  // Actions
  addPoints: (gameId: string, points: number, score?: number) => Promise<void>;
  completeGame: (gameId: string) => Promise<void>;
  resetStats: () => void;
  loadGameStats: () => Promise<void>;
  
  // Getters
  getGameStats: (gameId: string) => LocalGameStats;
  getTotalGamesPlayed: () => number;
}

const defaultGameStats: LocalGameStats = {
  completed: false,
  points: 0,
  bestScore: 0,
  timesPlayed: 0,
  lastPlayed: null
};

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      // Initial state
      totalPoints: 0,
      gamesCompleted: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastPlayDate: null,
      gameStats: {},
      isLoading: false,
      isSaving: false,

      // Add points for completing a game
      addPoints: async (gameId: string, points: number, score: number = 0) => {
        set({ isSaving: true });
        
        try {
          // Update local state first for immediate UI feedback
          set((state) => {
            const currentStats = state.gameStats[gameId] || { ...defaultGameStats };
            const newStats = {
              ...currentStats,
              points: currentStats.points + points,
              bestScore: Math.max(currentStats.bestScore, score),
              timesPlayed: currentStats.timesPlayed + 1,
              lastPlayed: new Date().toISOString()
            };

            // Update streak
            const today = new Date().toDateString();
            const lastPlayDate = state.lastPlayDate ? new Date(state.lastPlayDate).toDateString() : null;
            const newStreak = lastPlayDate === today ? state.currentStreak : 
                             lastPlayDate === new Date(Date.now() - 86400000).toDateString() ? 
                             state.currentStreak + 1 : 1;

            return {
              totalPoints: state.totalPoints + points,
              gameStats: {
                ...state.gameStats,
                [gameId]: newStats
              },
              currentStreak: newStreak,
              longestStreak: Math.max(state.longestStreak, newStreak),
              lastPlayDate: new Date().toISOString()
            };
          });

          // Save to database
          const session: GameSession = {
            gameId,
            score,
            pointsEarned: points,
            gameTitle: gameId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())
          };

          await gameService.recordGameSession(session);
          
          // Log activity to daily reports
          try {
            const { dailyReportService } = await import('../services/dailyReportService');
            await dailyReportService.logActivity({
              activityType: 'game_played',
              activityData: {
                gameId,
                score,
                gameTitle: session.gameTitle
              },
              pointsEarned: points
            });
          } catch (error) {
            console.error('Failed to log daily activity:', error);
          }
          
        } catch (error) {
          console.error('Failed to save game session:', error);
          // Could implement retry logic or show error to user
        } finally {
          set({ isSaving: false });
        }
      },

      // Complete a game
      completeGame: async (gameId: string) => {
        try {
          // Update local state
          set((state) => {
            const currentStats = state.gameStats[gameId] || { ...defaultGameStats };
            const newStats = {
              ...currentStats,
              completed: true,
              lastPlayed: new Date().toISOString()
            };

            const wasAlreadyCompleted = currentStats.completed;
            const newGamesCompleted = wasAlreadyCompleted ? state.gamesCompleted : state.gamesCompleted + 1;

            return {
              gamesCompleted: newGamesCompleted,
              gameStats: {
                ...state.gameStats,
                [gameId]: newStats
              }
            };
          });

          // Save to database
          await gameService.completeGame(gameId);
          
          // Log achievement to daily reports
          try {
            const { dailyReportService } = await import('../services/dailyReportService');
            await dailyReportService.logActivity({
              activityType: 'achievement_unlocked',
              activityData: {
                gameId,
                achievement: 'game_completed'
              },
              pointsEarned: 0
            });
          } catch (error) {
            console.error('Failed to log achievement:', error);
          }
          
        } catch (error) {
          console.error('Failed to mark game as completed:', error);
        }
      },

      // Reset all stats
      resetStats: () => {
        set({
          totalPoints: 0,
          gamesCompleted: 0,
          currentStreak: 0,
          longestStreak: 0,
          lastPlayDate: null,
          gameStats: {}
        });
      },

      // Load game stats from database
      loadGameStats: async () => {
        set({ isLoading: true });
        
        try {
          const data = await gameService.getGameStats();
          
          if (data.userStats) {
            const userStats = data.userStats;
            set({
              totalPoints: userStats.total_points || 0,
              gamesCompleted: userStats.games_completed || 0,
              currentStreak: userStats.current_streak || 0,
              longestStreak: userStats.longest_streak || 0,
              lastPlayDate: userStats.last_play_date
            });
          }

          if (data.gameStats) {
            const gameStatsMap: Record<string, LocalGameStats> = {};
            
            data.gameStats.forEach((stat: any) => {
              gameStatsMap[stat.game_id] = {
                completed: stat.is_completed,
                points: stat.total_points || 0,
                bestScore: stat.best_score || 0,
                timesPlayed: stat.total_plays || 0,
                lastPlayed: stat.last_played
              };
            });
            
            set({ gameStats: gameStatsMap });
          }
          
        } catch (error) {
          console.error('Failed to load game stats:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      // Get stats for a specific game
      getGameStats: (gameId: string) => {
        return get().gameStats[gameId] || { ...defaultGameStats };
      },

      // Get total games played across all games
      getTotalGamesPlayed: () => {
        const stats = get().gameStats;
        return Object.values(stats).reduce((total, gameStats) => total + gameStats.timesPlayed, 0);
      }
    }),
    {
      name: 'mindquest-game-storage',
      version: 1
    }
  )
);
