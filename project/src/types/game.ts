export interface Game {
  id: number;
  title: string;
  description: string;
  category: string;
  points_reward: number;
  difficulty: 'easy' | 'medium' | 'hard';
  icon: string;
  is_active: boolean;
}

export interface GameStats {
  id: number;
  user_id: number;
  game_id: string;
  total_plays: number;
  total_points: number;
  best_score: number;
  is_completed: boolean;
  last_played: string | null;
  title?: string;
  category?: string;
  difficulty?: string;
}

export interface UserStats {
  id: number;
  user_id: number;
  total_points: number;
  games_completed: number;
  current_streak: number;
  longest_streak: number;
  last_play_date: string | null;
  total_play_time: number;
}

export interface GameSession {
  gameId: string;
  score: number;
  pointsEarned: number;
  gameTitle?: string;
}

export interface GameSessionRecord {
  id: number;
  user_id: number;
  game_id: number;
  score: number;
  points_earned: number;
  completed_at: string;
  game_title?: string;
  category?: string;
}

export interface LeaderboardEntry {
  id: number;
  name: string;
  avatar_url: string | null;
  total_points: number;
  games_completed: number;
  current_streak: number;
}
