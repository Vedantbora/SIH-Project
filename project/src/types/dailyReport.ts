export interface DailyReport {
  id: number;
  user_id: number;
  report_date: string;
  games_played: number;
  total_points_earned: number;
  total_play_time: number;
  focus_score: number;
  mood_score: number;
  achievements_unlocked: number;
  streak_maintained: boolean;
  created_at: string;
  updated_at: string;
}

export interface DailyActivity {
  id: number;
  user_id: number;
  activity_date: string;
  activity_type: 'game_played' | 'meditation_completed' | 'mood_logged' | 'streak_milestone' | 'achievement_unlocked';
  activity_data: any;
  points_earned: number;
  created_at: string;
}

export interface DailyInsight {
  id: number;
  user_id: number;
  insight_date: string;
  insight_type: 'motivational' | 'achievement' | 'improvement' | 'celebration';
  title: string;
  description: string;
  is_read: boolean;
  created_at: string;
}

export interface WeeklySummary {
  weeklyData: DailyReport[];
  weeklyTotals: {
    totalGames: number;
    totalPoints: number;
    totalPlayTime: number;
    avgFocusScore: number;
    avgMoodScore: number;
    streakDays: number;
  };
  daysTracked: number;
}

export interface RealTimeStats {
  gamesPlayed: number;
  pointsEarned: number;
  totalActivities: number;
  currentStreak: number;
  moodScore: number | null;
}
