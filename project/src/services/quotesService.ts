import { Quote, UserQuote } from '../types/quote';

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

export const quotesService = {
  // Get all daily quotes
  async getQuotes(): Promise<Quote[]> {
    const response = await fetch(`${API_BASE_URL}/quotes`, {
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch quotes');
    }
    
    const data = await response.json();
    return data.data;
  },

  // Get today's quote
  async getTodaysQuote(): Promise<Quote | null> {
    const response = await fetch(`${API_BASE_URL}/quotes/today`, {
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch today\'s quote');
    }
    
    const data = await response.json();
    return data.data;
  },

  // Get user's submitted quotes
  async getUserQuotes(): Promise<UserQuote[]> {
    const response = await fetch(`${API_BASE_URL}/quotes/user`, {
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch user quotes');
    }
    
    const data = await response.json();
    return data.data;
  },

  // Submit a new quote
  async submitQuote(quote: { content: string; author?: string }): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/quotes/submit`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(quote)
    });
    
    if (!response.ok) {
      throw new Error('Failed to submit quote');
    }
    
    const data = await response.json();
    return data.data;
  },

  // Like a quote
  async likeQuote(quoteId: number, quoteType: 'daily' | 'user' = 'daily'): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/quotes/like`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ quoteId, quoteType })
    });
    
    if (!response.ok) {
      throw new Error('Failed to like quote');
    }
  },

  // Unlike a quote
  async unlikeQuote(quoteId: number, quoteType: 'daily' | 'user' = 'daily'): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/quotes/like`, {
      method: 'DELETE',
      headers: getHeaders(),
      body: JSON.stringify({ quoteId, quoteType })
    });
    
    if (!response.ok) {
      throw new Error('Failed to unlike quote');
    }
  },

  // Get approved user quotes
  async getApprovedUserQuotes(): Promise<UserQuote[]> {
    const response = await fetch(`${API_BASE_URL}/quotes/user-approved`, {
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch approved user quotes');
    }
    
    const data = await response.json();
    return data.data;
  }
};
