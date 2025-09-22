import { GameStats, GameSession } from '../types/game';

const API_BASE_URL = 'http://localhost:5000/api';

// Get auth token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

// API headers with auth
const getHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

export const gameService = {
  // Get all available games
  async getGames() {
    const response = await fetch(`${API_BASE_URL}/games`, {
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch games');
    }
    
    const data = await response.json();
    return data.data;
  },

  // Get user's game statistics
  async getGameStats() {
    const response = await fetch(`${API_BASE_URL}/games/stats`, {
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch game statistics');
    }
    
    const data = await response.json();
    return data.data;
  },

  // Record a game session
  async recordGameSession(session: GameSession) {
    const response = await fetch(`${API_BASE_URL}/games/session`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(session)
    });
    
    if (!response.ok) {
      throw new Error('Failed to record game session');
    }
    
    const data = await response.json();
    return data.data;
  },

  // Mark a game as completed
  async completeGame(gameId: string) {
    const response = await fetch(`${API_BASE_URL}/games/complete`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ gameId })
    });
    
    if (!response.ok) {
      throw new Error('Failed to mark game as completed');
    }
    
    const data = await response.json();
    return data.data;
  },

  // Get leaderboard
  async getLeaderboard() {
    const response = await fetch(`${API_BASE_URL}/games/leaderboard`, {
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch leaderboard');
    }
    
    const data = await response.json();
    return data.data;
  }
};
