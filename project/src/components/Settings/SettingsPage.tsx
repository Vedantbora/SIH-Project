import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Key,
  Trash2,
  Download,
  Save,
  Eye,
  EyeOff,
  Check,
  X,
  AlertTriangle,
  Info,
  Camera,
  Upload
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { UserSettings, UpdateSettingsRequest } from '../../types';
import { settingsService } from '../../services/settingsService';

const SettingsPage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'privacy' | 'preferences' | 'account'>('profile');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    avatar_url: user?.avatar_url || ''
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await settingsService.getUserSettings();
      setSettings(data);
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (updates: UpdateSettingsRequest) => {
    if (!settings) return;
    
    setSaving(true);
    try {
      const updatedSettings = await settingsService.updateSettings(updates);
      setSettings(updatedSettings);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      await settingsService.updateProfile(profileData);
      updateUser(profileData);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    try {
      await settingsService.changePassword(passwordData.currentPassword, passwordData.newPassword);
      setShowPasswordForm(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Failed to change password:', error);
    }
  };

  const handleDataExport = async () => {
    try {
      const blob = await settingsService.exportData();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mindquest-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to export data:', error);
    }
  };

  const handleAccountDeletion = async () => {
    try {
      await settingsService.deleteAccount();
      // This would typically redirect to login or show a confirmation
      alert('Account deletion initiated. You will be logged out.');
    } catch (error) {
      console.error('Failed to delete account:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'preferences', label: 'Preferences', icon: Palette },
    { id: 'account', label: 'Account', icon: SettingsIcon }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
          <SettingsIcon className="text-cyan-400" size={40} />
          Settings
        </h1>
        <p className="text-slate-400 text-lg">Manage your account and preferences</p>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      activeTab === tab.id
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                    }`}
                  >
                    <Icon size={20} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6"
          >
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <User className="text-cyan-400" />
                  Profile Settings
                </h2>

                {/* Avatar Section */}
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-white text-2xl font-bold">
                      {profileData.name.charAt(0).toUpperCase()}
                    </div>
                    <button className="absolute -bottom-2 -right-2 bg-cyan-500 hover:bg-cyan-600 text-white p-2 rounded-full transition-colors">
                      <Camera size={16} />
                    </button>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Profile Picture</h3>
                    <p className="text-slate-400 text-sm">Click to upload a new avatar</p>
                  </div>
                </div>

                {/* Profile Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Name</label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <button
                  onClick={handleProfileUpdate}
                  className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
                >
                  <Save size={16} />
                  Save Changes
                </button>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && settings && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <Bell className="text-cyan-400" />
                  Notification Settings
                </h2>

                <div className="space-y-4">
                  {Object.entries(settings.notifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                      <div>
                        <h3 className="text-white font-medium capitalize">
                          {key.replace(/_/g, ' ')}
                        </h3>
                        <p className="text-slate-400 text-sm">
                          {key === 'email' && 'Receive notifications via email'}
                          {key === 'push' && 'Receive push notifications'}
                          {key === 'daily_reminders' && 'Daily mood check reminders'}
                          {key === 'weekly_reports' && 'Weekly progress reports'}
                          {key === 'game_achievements' && 'Game achievement notifications'}
                        </p>
                      </div>
                      <button
                        onClick={() => saveSettings({
                          notifications: { ...settings.notifications, [key]: !value }
                        })}
                        className={`w-12 h-6 rounded-full transition-colors ${
                          value ? 'bg-cyan-500' : 'bg-slate-600'
                        }`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                          value ? 'translate-x-6' : 'translate-x-0.5'
                        }`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Privacy Tab */}
            {activeTab === 'privacy' && settings && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <Shield className="text-cyan-400" />
                  Privacy Settings
                </h2>

                <div className="space-y-4">
                  <div className="p-4 bg-slate-700/30 rounded-lg">
                    <label className="block text-sm font-medium text-slate-300 mb-2">Profile Visibility</label>
                    <select
                      value={settings.privacy.profile_visibility}
                      onChange={(e) => saveSettings({
                        privacy: { ...settings.privacy, profile_visibility: e.target.value as any }
                      })}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="public">Public</option>
                      <option value="friends">Friends Only</option>
                      <option value="private">Private</option>
                    </select>
                  </div>

                  {Object.entries(settings.privacy).filter(([key]) => key !== 'profile_visibility').map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                      <div>
                        <h3 className="text-white font-medium capitalize">
                          {key.replace(/_/g, ' ')}
                        </h3>
                        <p className="text-slate-400 text-sm">
                          {key === 'show_leaderboard' && 'Show your name on leaderboards'}
                          {key === 'share_progress' && 'Allow others to see your progress'}
                        </p>
                      </div>
                      <button
                        onClick={() => saveSettings({
                          privacy: { ...settings.privacy, [key]: !value }
                        })}
                        className={`w-12 h-6 rounded-full transition-colors ${
                          value ? 'bg-cyan-500' : 'bg-slate-600'
                        }`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                          value ? 'translate-x-6' : 'translate-x-0.5'
                        }`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && settings && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <Palette className="text-cyan-400" />
                  Preferences
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Theme</label>
                    <select
                      value={settings.preferences.theme}
                      onChange={(e) => saveSettings({
                        preferences: { ...settings.preferences, theme: e.target.value as any }
                      })}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="auto">Auto</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Language</label>
                    <select
                      value={settings.preferences.language}
                      onChange={(e) => saveSettings({
                        preferences: { ...settings.preferences, language: e.target.value }
                      })}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                    >
                      {settingsService.getAvailableLanguages().map(lang => (
                        <option key={lang.code} value={lang.code}>{lang.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Timezone</label>
                    <select
                      value={settings.preferences.timezone}
                      onChange={(e) => saveSettings({
                        preferences: { ...settings.preferences, timezone: e.target.value }
                      })}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                    >
                      {settingsService.getAvailableTimezones().map(tz => (
                        <option key={tz} value={tz}>{tz}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Date Format</label>
                    <select
                      value={settings.preferences.date_format}
                      onChange={(e) => saveSettings({
                        preferences: { ...settings.preferences, date_format: e.target.value }
                      })}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                    >
                      {settingsService.getAvailableDateFormats().map(format => (
                        <option key={format.value} value={format.value}>{format.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Account Tab */}
            {activeTab === 'account' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <SettingsIcon className="text-cyan-400" />
                  Account Management
                </h2>

                {/* Password Change */}
                <div className="p-6 bg-slate-700/30 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Key className="text-cyan-400" />
                    Change Password
                  </h3>
                  
                  {!showPasswordForm ? (
                    <button
                      onClick={() => setShowPasswordForm(true)}
                      className="bg-slate-600 hover:bg-slate-500 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Change Password
                    </button>
                  ) : (
                    <div className="space-y-4">
                      <input
                        type="password"
                        placeholder="Current Password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                      />
                      <input
                        type="password"
                        placeholder="New Password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                      />
                      <input
                        type="password"
                        placeholder="Confirm New Password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handlePasswordChange}
                          className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                          Update Password
                        </button>
                        <button
                          onClick={() => setShowPasswordForm(false)}
                          className="bg-slate-600 hover:bg-slate-500 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Data Export */}
                <div className="p-6 bg-slate-700/30 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Download className="text-cyan-400" />
                    Export Data
                  </h3>
                  <p className="text-slate-400 mb-4">Download a copy of your data including reports, game history, and settings.</p>
                  <button
                    onClick={handleDataExport}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Download size={16} />
                    Export My Data
                  </button>
                </div>

                {/* Account Deletion */}
                <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <h3 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2">
                    <AlertTriangle className="text-red-400" />
                    Delete Account
                  </h3>
                  <p className="text-slate-400 mb-4">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                  
                  {!showDeleteConfirm ? (
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Trash2 size={16} />
                      Delete Account
                    </button>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
                        <p className="text-red-300 text-sm">
                          <strong>Warning:</strong> This will permanently delete your account, all your data, 
                          game history, reports, and settings. This action cannot be undone.
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleAccountDeletion}
                          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                        >
                          <Trash2 size={16} />
                          Yes, Delete My Account
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(false)}
                          className="bg-slate-600 hover:bg-slate-500 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
