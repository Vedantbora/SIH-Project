export interface User {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  avatar_name?: string;
  is_admin: boolean;
  total_points: number;
  created_at: string;
}

export interface Game {
  id: string;
  title: string;
  description: string;
  category: string;
  points_reward: number;
  difficulty: 'easy' | 'medium' | 'hard';
  icon: string;
}

export interface DailyQuote {
  id: string;
  content: string;
  author: string;
  date: string;
  likes: number;
  user_liked: boolean;
}

export interface MoodEntry {
  id: string;
  user_id: string;
  mood_score: number;
  date: string;
  notes?: string;
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  points_required: number;
  category: 'voucher' | 'avatar' | 'digital';
  available: boolean;
}

export interface GameSession {
  id: string;
  user_id: string;
  game_id: string;
  score: number;
  points_earned: number;
  completed_at: string;
}

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface ConversationEntry {
  id: string;
  user_id: string;
  message: string;
  ai_response: string;
  mood_detected: RiskLevel;
  timestamp: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  notifications: {
    email: boolean;
    push: boolean;
    daily_reminders: boolean;
    weekly_reports: boolean;
    game_achievements: boolean;
  };
  privacy: {
    profile_visibility: 'public' | 'private' | 'friends';
    show_leaderboard: boolean;
    share_progress: boolean;
  };
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    timezone: string;
    date_format: string;
  };
  avatar: {
    avatar_url?: string;
    avatar_name?: string;
    customizations: Record<string, any>;
  };
  updated_at: string;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  daily_reminders: boolean;
  weekly_reports: boolean;
  game_achievements: boolean;
}

export interface PrivacySettings {
  profile_visibility: 'public' | 'private' | 'friends';
  show_leaderboard: boolean;
  share_progress: boolean;
}

export interface PreferenceSettings {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  date_format: string;
}