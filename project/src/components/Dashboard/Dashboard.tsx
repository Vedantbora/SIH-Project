import React, { useState, useEffect } from 'react';
import { MessageCircle, TrendingUp, Calendar, Star, Zap, Activity, Clock, Target, Brain } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { useGameStore } from '../../stores/gameStore';
import { dailyReportService } from '../../services/dailyReportService';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { userPoints, moodEntries, games } = useApp();
  const { totalPoints, gamesCompleted, currentStreak, getTotalGamesPlayed } = useGameStore();
  const [todayStats, setTodayStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTodayStats();
  }, []);

  const loadTodayStats = async () => {
    try {
      setIsLoading(true);
      const data = await dailyReportService.getTodayReport();
      setTodayStats(data);
    } catch (error) {
      console.error('Failed to load today\'s stats:', error);
    } finally {
      setIsLoading(false);
    }
  };


  const recentMood = moodEntries.length > 0 ? moodEntries[0].mood_score : 0;
  const moodLabel = recentMood >= 8 ? 'Excellent' : recentMood >= 6 ? 'Good' : recentMood >= 4 ? 'Okay' : 'Needs Care';
  const moodColor = recentMood >= 8 ? 'text-green-400' : recentMood >= 6 ? 'text-blue-400' : recentMood >= 4 ? 'text-yellow-400' : 'text-red-400';

  const stats = [
    {
      label: 'Total Points',
      value: totalPoints || userPoints,
      icon: Star,
      color: 'from-amber-400 to-yellow-500',
      bgColor: 'from-amber-500/20 to-yellow-500/20',
      borderColor: 'border-amber-500/30'
    },
    {
      label: 'Current Streak',
      value: `${currentStreak} days`,
      icon: Calendar,
      color: 'from-purple-400 to-pink-500',
      bgColor: 'from-purple-500/20 to-pink-500/20',
      borderColor: 'border-purple-500/30'
    },
    {
      label: 'Games Completed',
      value: gamesCompleted,
      icon: Target,
      color: 'from-green-400 to-emerald-500',
      bgColor: 'from-green-500/20 to-emerald-500/20',
      borderColor: 'border-green-500/30'
    },
    {
      label: 'Total Plays',
      value: getTotalGamesPlayed(),
      icon: Zap,
      color: 'from-cyan-400 to-blue-500',
      bgColor: 'from-cyan-500/20 to-blue-500/20',
      borderColor: 'border-cyan-500/30'
    }
  ];

  const todayStatsData = [
    {
      label: 'Today\'s Games',
      value: todayStats?.realTimeStats?.gamesPlayed || 0,
      icon: Activity,
      color: 'from-blue-400 to-cyan-500'
    },
    {
      label: 'Today\'s Points',
      value: todayStats?.realTimeStats?.pointsEarned || 0,
      icon: Star,
      color: 'from-yellow-400 to-orange-500'
    },
    {
      label: 'Activities',
      value: todayStats?.realTimeStats?.totalActivities || 0,
      icon: Brain,
      color: 'from-purple-400 to-pink-500'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="text-center py-8">
        <div className="flex flex-col items-center space-y-8">
          {/* Large Avatar Display */}
          {user?.avatar_url && (
            <div className="relative mb-4">
              <div className="relative">
                {/* Avatar Container with Stand Effect */}
                <div className="relative z-10">
                  <div className="w-48 h-48 mx-auto relative group">
                    {user.avatar_url.includes('.glb') ? (
                      // For Ready Player Me GLB files, show a placeholder with avatar name
                      <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex flex-col items-center justify-center text-white">
                        <div className="text-6xl mb-2">🎭</div>
                        <div className="text-lg font-bold">{user?.avatar_name || user?.name}</div>
                        <div className="text-sm opacity-80">3D Avatar</div>
                      </div>
                    ) : (
                      <img
                        src={user.avatar_url}
                        alt={user?.avatar_name || user?.name || "Avatar"}
                        className="w-full h-full object-cover rounded-2xl border-4 border-cyan-400/50 shadow-2xl shadow-cyan-500/20 transition-all duration-500 group-hover:scale-105 group-hover:shadow-cyan-500/30 animate-pulse"
                        style={{animationDuration: '3s'}}
                        onError={(e) => {
                          console.log('Avatar image failed to load:', user.avatar_url);
                          e.currentTarget.style.display = 'none';
                        }}
                        onLoad={() => {
                          console.log('Avatar image loaded successfully:', user.avatar_url);
                        }}
                      />
                    )}
                    {/* Glow Effect */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-cyan-500/20 to-transparent"></div>
                    {/* Status Indicator */}
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center border-4 border-slate-900 shadow-lg">
                      <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div>
                
                {/* Stand/Platform Effect */}
                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-56 h-8 bg-gradient-to-r from-slate-700 to-slate-600 rounded-full shadow-xl"></div>
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-48 h-4 bg-gradient-to-r from-slate-800 to-slate-700 rounded-full shadow-2xl"></div>
                
                {/* Floating Particles Effect */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-4 left-4 w-2 h-2 bg-cyan-400 rounded-full animate-ping opacity-60"></div>
                  <div className="absolute top-8 right-6 w-1 h-1 bg-blue-400 rounded-full animate-ping opacity-40" style={{animationDelay: '0.5s'}}></div>
                  <div className="absolute bottom-8 left-8 w-1.5 h-1.5 bg-purple-400 rounded-full animate-ping opacity-50" style={{animationDelay: '1s'}}></div>
                </div>
              </div>
            </div>
          )}

          {/* Small Avatar (Fallback) */}
          {!user?.avatar_url && (
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center border-4 border-slate-700">
                <span className="text-2xl font-bold text-white">
                  {user?.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center border-2 border-slate-900">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
            </div>
          )}


          {/* Greeting */}
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Welcome back, {user?.avatar_name || user?.name}! 👋
            </h1>
            <p className="text-xl text-slate-300">
              {user?.avatar_url ? 
                "Your avatar is ready! Let's continue your wellness journey together." :
                "Ready to continue your wellness journey today?"
              }
            </p>
            {user?.avatar_url && (
              <p className="text-sm text-cyan-400 mt-2 animate-pulse">
                ✨ Your personalized companion is here to help you!
              </p>
            )}
          </div>

          {/* Main CTA */}
          <Link
            to="/talk"
            className="group bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white px-8 py-4 rounded-2xl text-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-cyan-500/25 flex items-center space-x-3"
          >
            <MessageCircle className="w-6 h-6 group-hover:animate-pulse" />
            <span>Talk With Me</span>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className={`bg-gradient-to-br ${stat.bgColor} border ${stat.borderColor} rounded-xl p-6 backdrop-blur-sm hover:scale-105 transition-transform duration-300`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <p className="text-slate-300 text-sm font-medium">{stat.label}</p>
                <p className={`text-2xl font-bold bg-gradient-to-br ${stat.color} bg-clip-text text-transparent`}>
                  {stat.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Today's Progress Section */}
      {!isLoading && (
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Clock className="w-6 h-6 text-blue-400" />
              Today's Progress
            </h2>
            <Link 
              to="/reports" 
              className="text-blue-400 hover:text-blue-300 transition-colors text-sm font-medium"
            >
              View Full Report →
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {todayStatsData.map((stat, index) => (
              <div key={stat.label} className="text-center">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r ${stat.color} mb-3`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-gray-300 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="flex flex-wrap gap-3 justify-center">
              <Link 
                to="/games" 
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Zap className="w-4 h-4" />
                Play Games
              </Link>
              <Link 
                to="/talk" 
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Start Chat
              </Link>
              <Link 
                to="/reports" 
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <TrendingUp className="w-4 h-4" />
                View Reports
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          to="/games"
          className="group bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:border-purple-500/50 hover:bg-purple-500/10 transition-all duration-300 transform hover:scale-105"
        >
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg">Play Games</h3>
              <p className="text-slate-400 text-sm">Fun activities for wellness</p>
            </div>
          </div>
          <p className="text-slate-300">{games.length} games available to boost your mood and skills</p>
        </Link>

        <Link
          to="/reports"
          className="group bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-all duration-300 transform hover:scale-105"
        >
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg">View Progress</h3>
              <p className="text-slate-400 text-sm">Track your wellness journey</p>
            </div>
          </div>
          <p className="text-slate-300">See how you've been feeling and growing over time</p>
        </Link>

        <Link
          to="/quotes"
          className="group bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:border-amber-500/50 hover:bg-amber-500/10 transition-all duration-300 transform hover:scale-105"
        >
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg">Daily Inspiration</h3>
              <p className="text-slate-400 text-sm">Motivational quotes & stories</p>
            </div>
          </div>
          <p className="text-slate-300">Get inspired with daily positive messages</p>
        </Link>
      </div>

      {/* Mood Check-in Reminder */}
      {moodEntries.length === 0 && (
        <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 rounded-xl p-6">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-emerald-300 font-semibold text-lg mb-2">Daily Mood Check-in</h3>
              <p className="text-emerald-100 mb-4">
                Start tracking your mood today! Regular check-ins help us understand your patterns and provide better support.
              </p>
              <Link
                to="/talk"
                className="inline-flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Share How You Feel</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;