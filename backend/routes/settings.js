import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { testConnection } from '../config/database.js';

const router = express.Router();

// Mock settings data for development
const getDefaultSettings = (userId) => ({
  id: '1',
  user_id: userId,
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
    avatar_url: null,
    avatar_name: null,
    customizations: {},
  },
  updated_at: new Date().toISOString(),
});

// Get user settings
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // In a real application, this would query the database
    const settings = getDefaultSettings(userId);
    
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error fetching user settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user settings'
    });
  }
});

// Update user settings
router.put('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const updates = req.body;
    
    // In a real application, this would update the database
    const currentSettings = getDefaultSettings(userId);
    const updatedSettings = {
      ...currentSettings,
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: updatedSettings,
      message: 'Settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating user settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user settings'
    });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, avatar_url } = req.body;
    
    // In a real application, this would update the users table
    // For now, we'll just return a success response
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: userId,
        name: name || req.user.name,
        email: email || req.user.email,
        avatar_url: avatar_url || req.user.avatar_url
      }
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user profile'
    });
  }
});

// Change password
router.put('/password', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    
    // In a real application, this would:
    // 1. Verify the current password
    // 2. Hash the new password
    // 3. Update the password in the database
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }
    
    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password'
    });
  }
});

// Export user data
router.get('/export', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // In a real application, this would:
    // 1. Query all user data from various tables
    // 2. Compile it into a JSON file
    // 3. Return the file as a download
    
    const userData = {
      user_info: {
        id: userId,
        name: req.user.name,
        email: req.user.email,
        created_at: new Date().toISOString()
      },
      settings: getDefaultSettings(userId),
      game_sessions: [],
      daily_reports: [],
      quotes_liked: [],
      conversations: [],
      exported_at: new Date().toISOString()
    };
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="mindquest-data-${new Date().toISOString().split('T')[0]}.json"`);
    res.json(userData);
  } catch (error) {
    console.error('Error exporting user data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export user data'
    });
  }
});

// Delete user account
router.delete('/account', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // In a real application, this would:
    // 1. Delete all user data from all tables
    // 2. Remove the user account
    // 3. Send confirmation email
    
    res.json({
      success: true,
      message: 'Account deletion initiated. You will receive a confirmation email.'
    });
  } catch (error) {
    console.error('Error deleting user account:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user account'
    });
  }
});

// Get available languages
router.get('/languages', async (req, res) => {
  try {
    const languages = [
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
    
    res.json({
      success: true,
      data: languages
    });
  } catch (error) {
    console.error('Error fetching languages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch languages'
    });
  }
});

// Get available timezones
router.get('/timezones', async (req, res) => {
  try {
    const timezones = [
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
    
    res.json({
      success: true,
      data: timezones
    });
  } catch (error) {
    console.error('Error fetching timezones:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch timezones'
    });
  }
});

export default router;
