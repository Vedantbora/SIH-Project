const API_BASE_URL = 'http://localhost:5000/api';

export interface Reward {
  id: string;
  title: string;
  description: string;
  points_required: number;
  category: 'voucher' | 'avatar' | 'digital';
  available: boolean;
}

export interface UserReward {
  id: string;
  user_id: string;
  reward_id: string;
  reward_title: string;
  points_spent: number;
  redeemed_at: string;
  status: 'redeemed' | 'pending' | 'expired';
}

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  name: string;
  total_points: number;
  avatar_url?: string;
}

class RewardsService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data || data;
  }

  async getAvailableRewards(): Promise<Reward[]> {
    try {
      return await this.request<Reward[]>('/rewards');
    } catch (error) {
      console.error('Failed to fetch available rewards:', error);
      // Return mock data for development
      return this.getMockRewards();
    }
  }

  async getUserRewards(): Promise<UserReward[]> {
    try {
      return await this.request<UserReward[]>('/rewards/user');
    } catch (error) {
      console.error('Failed to fetch user rewards:', error);
      // Return mock data for development
      return this.getMockUserRewards();
    }
  }

  async redeemReward(rewardId: string): Promise<{ success: boolean; message: string }> {
    try {
      return await this.request<{ success: boolean; message: string }>(`/rewards/${rewardId}/redeem`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Failed to redeem reward:', error);
      throw new Error('Failed to redeem reward. Please try again.');
    }
  }

  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    try {
      return await this.request<LeaderboardEntry[]>('/rewards/leaderboard');
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
      // Return mock data for development
      return this.getMockLeaderboard();
    }
  }

  async getUserPoints(): Promise<{ total_points: number; weekly_earned: number }> {
    try {
      return await this.request<{ total_points: number; weekly_earned: number }>('/rewards/points');
    } catch (error) {
      console.error('Failed to fetch user points:', error);
      return { total_points: 0, weekly_earned: 0 };
    }
  }

  // Mock data for development
  private getMockRewards(): Reward[] {
    return [
      {
        id: '1',
        title: 'Amazon Gift Card',
        description: 'Get a $10 Amazon gift card to treat yourself!',
        points_required: 1000,
        category: 'voucher',
        available: true,
      },
      {
        id: '2',
        title: 'Premium Avatar Pack',
        description: 'Unlock exclusive avatar customization options',
        points_required: 500,
        category: 'avatar',
        available: true,
      },
      {
        id: '3',
        title: 'Digital Badge Collection',
        description: 'Earn special achievement badges for your profile',
        points_required: 200,
        category: 'digital',
        available: true,
      },
      {
        id: '4',
        title: 'Starbucks Gift Card',
        description: 'Enjoy a coffee break with a $5 Starbucks gift card',
        points_required: 750,
        category: 'voucher',
        available: true,
      },
      {
        id: '5',
        title: 'Custom Avatar Frame',
        description: 'Get a unique frame for your avatar profile',
        points_required: 300,
        category: 'avatar',
        available: true,
      },
      {
        id: '6',
        title: 'Exclusive Wallpaper Pack',
        description: 'Download premium wallpapers for your devices',
        points_required: 150,
        category: 'digital',
        available: true,
      },
    ];
  }

  private getMockUserRewards(): UserReward[] {
    return [
      {
        id: '1',
        user_id: 'user123',
        reward_id: '3',
        reward_title: 'Digital Badge Collection',
        points_spent: 200,
        redeemed_at: '2024-01-15T10:30:00Z',
        status: 'redeemed',
      },
      {
        id: '2',
        user_id: 'user123',
        reward_id: '5',
        reward_title: 'Custom Avatar Frame',
        points_spent: 300,
        redeemed_at: '2024-01-10T14:20:00Z',
        status: 'redeemed',
      },
    ];
  }

  private getMockLeaderboard(): LeaderboardEntry[] {
    return [
      { rank: 1, user_id: '1', name: 'Alex Johnson', total_points: 2450 },
      { rank: 2, user_id: '2', name: 'Sarah Wilson', total_points: 2380 },
      { rank: 3, user_id: '3', name: 'Mike Chen', total_points: 2150 },
      { rank: 4, user_id: '4', name: 'Emma Davis', total_points: 1980 },
      { rank: 5, user_id: '5', name: 'You', total_points: 1200 },
    ];
  }
}

export const rewardsService = new RewardsService();
