import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import db from '../config/database.js';

const router = express.Router();

// Get today's daily report
router.get('/today', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0];

    // Get or create today's report
    let [reports] = await db.execute(
      'SELECT * FROM daily_reports WHERE user_id = ? AND report_date = ?',
      [userId, today]
    );

    let report = reports[0];

    if (!report) {
      // Create new daily report
      const [result] = await db.execute(
        'INSERT INTO daily_reports (user_id, report_date) VALUES (?, ?)',
        [userId, today]
      );
      
      [reports] = await db.execute(
        'SELECT * FROM daily_reports WHERE id = ?',
        [result.insertId]
      );
      report = reports[0];
    }

    // Get today's activities
    const [activities] = await db.execute(
      `SELECT activity_type, activity_data, points_earned, created_at 
       FROM daily_activity_logs 
       WHERE user_id = ? AND activity_date = ? 
       ORDER BY created_at DESC`,
      [userId, today]
    );

    // Get today's insights
    const [insights] = await db.execute(
      `SELECT * FROM daily_insights 
       WHERE user_id = ? AND insight_date = ? 
       ORDER BY created_at DESC`,
      [userId, today]
    );

    // Get today's game sessions
    const [gameSessions] = await db.execute(
      `SELECT gs.*, g.title as game_title, g.category 
       FROM game_sessions gs 
       LEFT JOIN games g ON gs.game_id = g.id 
       WHERE gs.user_id = ? AND DATE(gs.completed_at) = ? 
       ORDER BY gs.completed_at DESC`,
      [userId, today]
    );

    // Calculate real-time stats
    const realTimeStats = await calculateRealTimeStats(userId, today);

    res.json({
      success: true,
      data: {
        report,
        activities,
        insights,
        gameSessions,
        realTimeStats
      }
    });

  } catch (error) {
    console.error('Error fetching daily report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch daily report'
    });
  }
});

// Get daily report for specific date
router.get('/date/:date', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { date } = req.params;

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Use YYYY-MM-DD'
      });
    }

    const [reports] = await db.execute(
      'SELECT * FROM daily_reports WHERE user_id = ? AND report_date = ?',
      [userId, date]
    );

    if (reports.length === 0) {
      return res.json({
        success: true,
        data: null,
        message: 'No data found for this date'
      });
    }

    // Get activities for the date
    const [activities] = await db.execute(
      `SELECT activity_type, activity_data, points_earned, created_at 
       FROM daily_activity_logs 
       WHERE user_id = ? AND activity_date = ? 
       ORDER BY created_at DESC`,
      [userId, date]
    );

    // Get insights for the date
    const [insights] = await db.execute(
      `SELECT * FROM daily_insights 
       WHERE user_id = ? AND insight_date = ? 
       ORDER BY created_at DESC`,
      [userId, date]
    );

    // Get game sessions for the date
    const [gameSessions] = await db.execute(
      `SELECT gs.*, g.title as game_title, g.category 
       FROM game_sessions gs 
       LEFT JOIN games g ON gs.game_id = g.id 
       WHERE gs.user_id = ? AND DATE(gs.completed_at) = ? 
       ORDER BY gs.completed_at DESC`,
      [userId, date]
    );

    res.json({
      success: true,
      data: {
        report: reports[0],
        activities,
        insights,
        gameSessions
      }
    });

  } catch (error) {
    console.error('Error fetching daily report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch daily report'
    });
  }
});

// Get weekly summary
router.get('/weekly', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [weeklyData] = await db.execute(
      `SELECT report_date, games_played, total_points_earned, total_play_time, 
              focus_score, mood_score, streak_maintained
       FROM daily_reports 
       WHERE user_id = ? AND report_date BETWEEN ? AND ?
       ORDER BY report_date DESC`,
      [userId, weekAgo.toISOString().split('T')[0], today.toISOString().split('T')[0]]
    );

    // Calculate weekly totals
    const weeklyTotals = weeklyData.reduce((totals, day) => ({
      totalGames: totals.totalGames + day.games_played,
      totalPoints: totals.totalPoints + day.total_points_earned,
      totalPlayTime: totals.totalPlayTime + day.total_play_time,
      avgFocusScore: totals.avgFocusScore + day.focus_score,
      avgMoodScore: totals.avgMoodScore + day.mood_score,
      streakDays: totals.streakDays + (day.streak_maintained ? 1 : 0)
    }), {
      totalGames: 0,
      totalPoints: 0,
      totalPlayTime: 0,
      avgFocusScore: 0,
      avgMoodScore: 0,
      streakDays: 0
    });

    // Calculate averages
    const daysWithData = weeklyData.length;
    if (daysWithData > 0) {
      weeklyTotals.avgFocusScore = weeklyTotals.avgFocusScore / daysWithData;
      weeklyTotals.avgMoodScore = weeklyTotals.avgMoodScore / daysWithData;
    }

    res.json({
      success: true,
      data: {
        weeklyData,
        weeklyTotals,
        daysTracked: daysWithData
      }
    });

  } catch (error) {
    console.error('Error fetching weekly summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch weekly summary'
    });
  }
});

// Log daily activity
router.post('/activity', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { activityType, activityData, pointsEarned } = req.body;
    const today = new Date().toISOString().split('T')[0];

    if (!activityType) {
      return res.status(400).json({
        success: false,
        message: 'Activity type is required'
      });
    }

    // Insert activity log
    const [result] = await db.execute(
      'INSERT INTO daily_activity_logs (user_id, activity_date, activity_type, activity_data, points_earned) VALUES (?, ?, ?, ?, ?)',
      [userId, today, activityType, JSON.stringify(activityData || {}), pointsEarned || 0]
    );

    // Update daily report
    await updateDailyReport(userId, today, activityType, pointsEarned || 0, activityData);

    // Generate insights if needed
    await generateInsights(userId, today, activityType, activityData);

    res.json({
      success: true,
      message: 'Activity logged successfully',
      data: {
        activityId: result.insertId,
        pointsEarned: pointsEarned || 0
      }
    });

  } catch (error) {
    console.error('Error logging activity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to log activity'
    });
  }
});

// Mark insight as read
router.put('/insights/:insightId/read', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { insightId } = req.params;

    await db.execute(
      'UPDATE daily_insights SET is_read = true WHERE id = ? AND user_id = ?',
      [insightId, userId]
    );

    res.json({
      success: true,
      message: 'Insight marked as read'
    });

  } catch (error) {
    console.error('Error updating insight:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update insight'
    });
  }
});

// Helper function to calculate real-time stats
async function calculateRealTimeStats(userId, date) {
  try {
    // Get today's game sessions
    const [gameSessions] = await db.execute(
      'SELECT COUNT(*) as games_played, SUM(points_earned) as total_points FROM game_sessions WHERE user_id = ? AND DATE(completed_at) = ?',
      [userId, date]
    );

    // Get today's activities count
    const [activities] = await db.execute(
      'SELECT COUNT(*) as total_activities FROM daily_activity_logs WHERE user_id = ? AND activity_date = ?',
      [userId, date]
    );

    // Get current streak
    const [streak] = await db.execute(
      'SELECT current_streak FROM user_stats WHERE user_id = ?',
      [userId]
    );

    // Get today's mood if logged
    const [mood] = await db.execute(
      'SELECT mood_score FROM daily_reports WHERE user_id = ? AND report_date = ?',
      [userId, date]
    );

    return {
      gamesPlayed: gameSessions[0]?.games_played || 0,
      pointsEarned: gameSessions[0]?.total_points || 0,
      totalActivities: activities[0]?.total_activities || 0,
      currentStreak: streak[0]?.current_streak || 0,
      moodScore: mood[0]?.mood_score || null
    };

  } catch (error) {
    console.error('Error calculating real-time stats:', error);
    return {
      gamesPlayed: 0,
      pointsEarned: 0,
      totalActivities: 0,
      currentStreak: 0,
      moodScore: null
    };
  }
}

// Helper function to update daily report
async function updateDailyReport(userId, date, activityType, pointsEarned, activityData) {
  try {
    // Get or create daily report
    let [reports] = await db.execute(
      'SELECT * FROM daily_reports WHERE user_id = ? AND report_date = ?',
      [userId, date]
    );

    if (reports.length === 0) {
      await db.execute(
        'INSERT INTO daily_reports (user_id, report_date) VALUES (?, ?)',
        [userId, date]
      );
      [reports] = await db.execute(
        'SELECT * FROM daily_reports WHERE user_id = ? AND report_date = ?',
        [userId, date]
      );
    }

    const report = reports[0];

    // Update based on activity type
    switch (activityType) {
      case 'game_played':
        await db.execute(
          'UPDATE daily_reports SET games_played = games_played + 1, total_points_earned = total_points_earned + ? WHERE id = ?',
          [pointsEarned, report.id]
        );
        break;
      case 'meditation_completed':
        await db.execute(
          'UPDATE daily_reports SET total_play_time = total_play_time + COALESCE(?, 5) WHERE id = ?',
          [activityData?.duration || 5, report.id]
        );
        break;
      case 'streak_milestone':
        await db.execute(
          'UPDATE daily_reports SET streak_maintained = true WHERE id = ?',
          [report.id]
        );
        break;
    }

  } catch (error) {
    console.error('Error updating daily report:', error);
  }
}

// Helper function to generate insights
async function generateInsights(userId, date, activityType, activityData) {
  try {
    const insights = [];

    // Generate insights based on activity
    if (activityType === 'game_played' && activityData?.score > 80) {
      insights.push({
        insight_type: 'achievement',
        title: 'Great Performance!',
        description: `You scored ${activityData.score} points! Keep up the excellent work!`
      });
    }

    if (activityType === 'streak_milestone' && activityData?.streak >= 7) {
      insights.push({
        insight_type: 'celebration',
        title: 'Amazing Streak!',
        description: `You've maintained a ${activityData.streak}-day streak! Your consistency is inspiring!`
      });
    }

    // Insert insights
    for (const insight of insights) {
      await db.execute(
        'INSERT INTO daily_insights (user_id, insight_date, insight_type, title, description) VALUES (?, ?, ?, ?, ?)',
        [userId, date, insight.insight_type, insight.title, insight.description]
      );
    }

  } catch (error) {
    console.error('Error generating insights:', error);
  }
}

export default router;
