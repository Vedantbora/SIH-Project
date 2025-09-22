import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import db from '../config/database.js';

const router = express.Router();

// Get all games
router.get('/', async (req, res) => {
  try {
    const [games] = await db.execute(
      'SELECT id, title, description, category, points_reward, difficulty, icon, is_active FROM games WHERE is_active = true ORDER BY difficulty, title'
    );
    
    res.json({
      success: true,
      data: games
    });
  } catch (error) {
    console.error('Error fetching games:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch games'
    });
  }
});

// Get user's game statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get overall user stats
    const [userStats] = await db.execute(
      'SELECT * FROM user_stats WHERE user_id = ?',
      [userId]
    );

    // Get individual game stats
    const [gameStats] = await db.execute(
      `SELECT ugs.*, g.title, g.category, g.difficulty 
       FROM user_game_stats ugs 
       LEFT JOIN games g ON ugs.game_id = g.title 
       WHERE ugs.user_id = ? 
       ORDER BY ugs.last_played DESC`,
      [userId]
    );

    // Get recent game sessions
    const [recentSessions] = await db.execute(
      `SELECT gs.*, g.title as game_title, g.category 
       FROM game_sessions gs 
       LEFT JOIN games g ON gs.game_id = g.id 
       WHERE gs.user_id = ? 
       ORDER BY gs.completed_at DESC 
       LIMIT 10`,
      [userId]
    );

    res.json({
      success: true,
      data: {
        userStats: userStats[0] || {
          total_points: 0,
          games_completed: 0,
          current_streak: 0,
          longest_streak: 0,
          total_play_time: 0
        },
        gameStats,
        recentSessions
      }
    });
  } catch (error) {
    console.error('Error fetching game stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch game statistics'
    });
  }
});

// Record game session
router.post('/session', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { gameId, score, pointsEarned, gameTitle } = req.body;

    if (!gameId || score === undefined || pointsEarned === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: gameId, score, pointsEarned'
      });
    }

    // Start transaction
    await db.beginTransaction();

    try {
      // Get or create game record
      let [gameRows] = await db.execute(
        'SELECT id FROM games WHERE title = ?',
        [gameTitle || gameId]
      );

      let gameDbId;
      if (gameRows.length === 0) {
        // Create game record if it doesn't exist
        const [result] = await db.execute(
          'INSERT INTO games (title, category, points_reward, difficulty, icon) VALUES (?, ?, ?, ?, ?)',
          [gameTitle || gameId, 'Unknown', 10, 'easy', 'Gamepad2']
        );
        gameDbId = result.insertId;
      } else {
        gameDbId = gameRows[0].id;
      }

      // Insert game session
      await db.execute(
        'INSERT INTO game_sessions (user_id, game_id, score, points_earned) VALUES (?, ?, ?, ?)',
        [userId, gameDbId, score, pointsEarned]
      );

      // Update or create user game stats
      const [existingStats] = await db.execute(
        'SELECT * FROM user_game_stats WHERE user_id = ? AND game_id = ?',
        [userId, gameId]
      );

      if (existingStats.length > 0) {
        // Update existing stats
        await db.execute(
          `UPDATE user_game_stats 
           SET total_plays = total_plays + 1, 
               total_points = total_points + ?, 
               best_score = GREATEST(best_score, ?),
               last_played = NOW()
           WHERE user_id = ? AND game_id = ?`,
          [pointsEarned, score, userId, gameId]
        );
      } else {
        // Create new stats record
        await db.execute(
          'INSERT INTO user_game_stats (user_id, game_id, total_plays, total_points, best_score, last_played) VALUES (?, ?, 1, ?, ?, NOW())',
          [userId, gameId, pointsEarned, score]
        );
      }

      // Update overall user stats
      const [userStats] = await db.execute(
        'SELECT * FROM user_stats WHERE user_id = ?',
        [userId]
      );

      if (userStats.length > 0) {
        // Update existing user stats
        await db.execute(
          `UPDATE user_stats 
           SET total_points = total_points + ?,
               last_play_date = CURDATE()
           WHERE user_id = ?`,
          [pointsEarned, userId]
        );
      } else {
        // Create new user stats
        await db.execute(
          'INSERT INTO user_stats (user_id, total_points, last_play_date) VALUES (?, ?, CURDATE())',
          [userId, pointsEarned]
        );
      }

      // Update user's total points in users table
      await db.execute(
        'UPDATE users SET total_points = total_points + ? WHERE id = ?',
        [pointsEarned, userId]
      );

      // Update streak
      await updateStreak(userId);

      await db.commit();

      res.json({
        success: true,
        message: 'Game session recorded successfully',
        data: {
          pointsEarned,
          score,
          gameId
        }
      });

    } catch (error) {
      await db.rollback();
      throw error;
    }

  } catch (error) {
    console.error('Error recording game session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record game session',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Mark game as completed
router.post('/complete', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { gameId } = req.body;

    if (!gameId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required field: gameId'
      });
    }

    // Update game completion status
    await db.execute(
      'UPDATE user_game_stats SET is_completed = true WHERE user_id = ? AND game_id = ?',
      [userId, gameId]
    );

    // Update games completed count
    const [completedGames] = await db.execute(
      'SELECT COUNT(*) as count FROM user_game_stats WHERE user_id = ? AND is_completed = true',
      [userId]
    );

    await db.execute(
      'UPDATE user_stats SET games_completed = ? WHERE user_id = ?',
      [completedGames[0].count, userId]
    );

    res.json({
      success: true,
      message: 'Game marked as completed',
      data: {
        gamesCompleted: completedGames[0].count
      }
    });

  } catch (error) {
    console.error('Error marking game as completed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark game as completed'
    });
  }
});

// Get leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const [leaderboard] = await db.execute(
      `SELECT u.id, u.name, u.avatar_url, us.total_points, us.games_completed, us.current_streak
       FROM users u 
       LEFT JOIN user_stats us ON u.id = us.user_id 
       WHERE us.total_points > 0 
       ORDER BY us.total_points DESC 
       LIMIT 10`
    );

    res.json({
      success: true,
      data: leaderboard
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leaderboard'
    });
  }
});

// Helper function to update user streak
async function updateStreak(userId) {
  try {
    const [userStats] = await db.execute(
      'SELECT last_play_date, current_streak FROM user_stats WHERE user_id = ?',
      [userId]
    );

    if (userStats.length === 0) {
      // First time playing, streak = 1
      await db.execute(
        'UPDATE user_stats SET current_streak = 1, longest_streak = 1 WHERE user_id = ?',
        [userId]
      );
      return;
    }

    const stats = userStats[0];
    const today = new Date().toDateString();
    const lastPlayDate = stats.last_play_date ? new Date(stats.last_play_date).toDateString() : null;
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    let newStreak = stats.current_streak;

    if (lastPlayDate === today) {
      // Already played today, keep current streak
      return;
    } else if (lastPlayDate === yesterday) {
      // Played yesterday, increment streak
      newStreak += 1;
    } else {
      // Gap in playing, reset streak
      newStreak = 1;
    }

    // Update streak
    await db.execute(
      `UPDATE user_stats 
       SET current_streak = ?, 
           longest_streak = GREATEST(longest_streak, ?)
       WHERE user_id = ?`,
      [newStreak, newStreak, userId]
    );

  } catch (error) {
    console.error('Error updating streak:', error);
  }
}

export default router;
