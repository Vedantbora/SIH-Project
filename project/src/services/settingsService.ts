const API_BASE_URL = 'http://localhost:5000/api';

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

export interface UpdateSettingsRequest {
  notifications?: Partial<UserSettings['notifications']>;
  privacy?: Partial<UserSettings['privacy']>;
  preferences?: Partial<UserSettings['preferences']>;
  avatar?: Partial<UserSettings['avatar']>;
}

class SettingsService {
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

  async getUserSettings(): Promise<UserSettings> {
    try {
      return await this.request<UserSettings>('/settings');
    } catch (error) {
      console.error('Failed to fetch user settings:', error);
      // Return default settings for development
      return this.getDefaultSettings();
    }
  }

  async updateSettings(updates: UpdateSettingsRequest): Promise<UserSettings> {
    try {
      return await this.request<UserSettings>('/settings', {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    } catch (error) {
      console.error('Failed to update settings:', error);
      throw new Error('Failed to update settings. Please try again.');
    }
  }

  async updateProfile(profileData: { name?: string; email?: string; avatar_url?: string }): Promise<{ success: boolean; message: string }> {
    try {
      return await this.request<{ success: boolean; message: string }>('/settings/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw new Error('Failed to update profile. Please try again.');
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      return await this.request<{ success: boolean; message: string }>('/settings/password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
    } catch (error) {
      console.error('Failed to change password:', error);
      throw new Error('Failed to change password. Please try again.');
    }
  }

  async deleteAccount(): Promise<{ success: boolean; message: string }> {
    try {
      return await this.request<{ success: boolean; message: string }>('/settings/account', {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Failed to delete account:', error);
      throw new Error('Failed to delete account. Please try again.');
    }
  }

  async exportData(): Promise<Blob> {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/settings/export`, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Failed to export data:', error);
      throw new Error('Failed to export data. Please try again.');
    }
  }

  // Default settings for development
  private getDefaultSettings(): UserSettings {
    return {
      id: '1',
      user_id: 'user123',
      notifications: {
        email: true,
        push: true,
        daily_reminders: true,
        weekly_reports: true,
        game_achievements: true,
      },
      privacy: {
        profile_visibility: 'private',
        show_leaderboard: true,
        share_progress: false,
      },
      preferences: {
        theme: 'dark',
        language: 'en',
        timezone: 'UTC',
        date_format: 'MM/DD/YYYY',
      },
      avatar: {
        avatar_url: undefined,
        avatar_name: undefined,
        customizations: {},
      },
      updated_at: new Date().toISOString(),
    };
  }

  // Utility methods
  getAvailableLanguages() {
    return [
      { code: 'en', name: 'English' },
      { code: 'es', name: 'Español' },
      { code: 'fr', name: 'Français' },
      { code: 'de', name: 'Deutsch' },
      { code: 'it', name: 'Italiano' },
      { code: 'pt', name: 'Português' },
      { code: 'ru', name: 'Русский' },
      { code: 'ja', name: '日本語' },
      { code: 'ko', name: '한국어' },
      { code: 'zh', name: '中文' },
    ];
  }

  getAvailableTimezones() {
    return [
      'UTC',
      'America/New_York',
      'America/Chicago',
      'America/Denver',
      'America/Los_Angeles',
      'Europe/London',
      'Europe/Paris',
      'Europe/Berlin',
      'Asia/Tokyo',
      'Asia/Shanghai',
      'Asia/Kolkata',
      'Australia/Sydney',
    ];
  }

  getAvailableDateFormats() {
    return [
      { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (US)' },
      { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (EU)' },
      { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO)' },
    ];
  }
}

export const settingsService = new SettingsService();
