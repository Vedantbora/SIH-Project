// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  PROFILE: '/auth/profile',
  
  // Chat
  CHAT_MESSAGE: '/chat/message',
  CHAT_STARTER: '/chat/starter',
  
  // Games
  GAMES: '/games',
  GAME_SESSION: '/games/session',
  
  // Reports
  DAILY_REPORTS: '/daily-reports',
  
  // Quotes
  QUOTES: '/quotes',
  DAILY_QUOTE: '/quotes/daily',
  
  // Rewards
  REWARDS: '/rewards',
  
  // Settings
  SETTINGS: '/settings',
  
  // Health
  HEALTH: '/health'
};

// Helper function to build full API URL
export const buildApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint}`;
};

// Helper function to get auth headers
export const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

