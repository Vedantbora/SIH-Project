import { DailyReport, DailyActivity, DailyInsight, WeeklySummary } from '../types/dailyReport';

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

export const dailyReportService = {
  // Get today's daily report
  async getTodayReport(): Promise<{
    report: DailyReport;
    activities: DailyActivity[];
    insights: DailyInsight[];
    gameSessions: any[];
    realTimeStats: any;
  }> {
    const response = await fetch(`${API_BASE_URL}/daily-reports/today`, {
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch today\'s report');
    }
    
    const data = await response.json();
    return data.data;
  },

  // Get daily report for specific date
  async getReportByDate(date: string): Promise<{
    report: DailyReport | null;
    activities: DailyActivity[];
    insights: DailyInsight[];
    gameSessions: any[];
  }> {
    const response = await fetch(`${API_BASE_URL}/daily-reports/date/${date}`, {
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch daily report');
    }
    
    const data = await response.json();
    return data.data;
  },

  // Get weekly summary
  async getWeeklySummary(): Promise<WeeklySummary> {
    const response = await fetch(`${API_BASE_URL}/daily-reports/weekly`, {
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch weekly summary');
    }
    
    const data = await response.json();
    return data.data;
  },

  // Log daily activity
  async logActivity(activity: {
    activityType: string;
    activityData?: any;
    pointsEarned?: number;
  }): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/daily-reports/activity`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(activity)
    });
    
    if (!response.ok) {
      throw new Error('Failed to log activity');
    }
    
    const data = await response.json();
    return data.data;
  },

  // Mark insight as read
  async markInsightAsRead(insightId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/daily-reports/insights/${insightId}/read`, {
      method: 'PUT',
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to mark insight as read');
    }
  }
};
