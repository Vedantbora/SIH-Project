import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, TrendingUp, Target, Clock, Star, Brain, Zap, Trophy, Award, Activity, BarChart3, Calendar as CalendarIcon } from 'lucide-react';
import { dailyReportService } from '../../services/dailyReportService';
import { DailyReport, DailyActivity, DailyInsight, WeeklySummary, RealTimeStats } from '../../types/dailyReport';

const DailyReportsPage: React.FC = () => {
  const [todayReport, setTodayReport] = useState<any>(null);
  const [weeklySummary, setWeeklySummary] = useState<WeeklySummary | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [dateReport, setDateReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'today' | 'weekly' | 'history'>('today');

  useEffect(() => {
    loadTodayReport();
    loadWeeklySummary();
  }, []);

  useEffect(() => {
    if (selectedDate !== new Date().toISOString().split('T')[0]) {
      loadDateReport(selectedDate);
    }
  }, [selectedDate]);

  const loadTodayReport = async () => {
    try {
      setIsLoading(true);
      const data = await dailyReportService.getTodayReport();
      setTodayReport(data);
    } catch (error) {
      console.error('Failed to load today\'s report:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadWeeklySummary = async () => {
    try {
      const data = await dailyReportService.getWeeklySummary();
      setWeeklySummary(data);
    } catch (error) {
      console.error('Failed to load weekly summary:', error);
    }
  };

  const loadDateReport = async (date: string) => {
    try {
      const data = await dailyReportService.getReportByDate(date);
      setDateReport(data);
    } catch (error) {
      console.error('Failed to load date report:', error);
      setDateReport(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'game_played': return <Zap className="w-5 h-5 text-blue-400" />;
      case 'meditation_completed': return <Brain className="w-5 h-5 text-green-400" />;
      case 'mood_logged': return <Star className="w-5 h-5 text-yellow-400" />;
      case 'streak_milestone': return <Trophy className="w-5 h-5 text-purple-400" />;
      case 'achievement_unlocked': return <Award className="w-5 h-5 text-orange-400" />;
      default: return <Activity className="w-5 h-5 text-gray-400" />;
    }
  };

  const getInsightIcon = (insightType: string) => {
    switch (insightType) {
      case 'achievement': return <Trophy className="w-6 h-6 text-yellow-400" />;
      case 'celebration': return <Star className="w-6 h-6 text-purple-400" />;
      case 'improvement': return <TrendingUp className="w-6 h-6 text-green-400" />;
      case 'motivational': return <Brain className="w-6 h-6 text-blue-400" />;
      default: return <Award className="w-6 h-6 text-gray-400" />;
    }
  };

  const getInsightColor = (insightType: string) => {
    switch (insightType) {
      case 'achievement': return 'border-yellow-400 bg-yellow-400/10';
      case 'celebration': return 'border-purple-400 bg-purple-400/10';
      case 'improvement': return 'border-green-400 bg-green-400/10';
      case 'motivational': return 'border-blue-400 bg-blue-400/10';
      default: return 'border-gray-400 bg-gray-400/10';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <div className="text-white text-xl">Loading daily reports...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <BarChart3 className="w-10 h-10 text-purple-400" />
            Daily Reports
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Track your daily progress, insights, and achievements in real-time.
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap gap-3 mb-8 justify-center"
        >
          {[
            { id: 'today', label: 'Today', icon: Calendar },
            { id: 'weekly', label: 'Weekly', icon: TrendingUp },
            { id: 'history', label: 'History', icon: CalendarIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* Today's Report */}
        <AnimatePresence mode="wait">
          {activeTab === 'today' && (
            <motion.div
              key="today"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {todayReport && (
                <div className="space-y-6">
                  {/* Today's Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
                      <Zap className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-white">{todayReport.realTimeStats?.gamesPlayed || 0}</div>
                      <div className="text-gray-300">Games Played</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
                      <Star className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-white">{todayReport.realTimeStats?.pointsEarned || 0}</div>
                      <div className="text-gray-300">Points Earned</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
                      <Trophy className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-white">{todayReport.realTimeStats?.currentStreak || 0}</div>
                      <div className="text-gray-300">Day Streak</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
                      <Activity className="w-8 h-8 text-green-400 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-white">{todayReport.realTimeStats?.totalActivities || 0}</div>
                      <div className="text-gray-300">Activities</div>
                    </div>
                  </div>

                  {/* Today's Activities */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                    <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                      <Activity className="w-6 h-6 text-green-400" />
                      Today's Activities
                    </h3>
                    <div className="space-y-4">
                      {todayReport.activities && todayReport.activities.length > 0 ? (
                        todayReport.activities.map((activity: DailyActivity, index: number) => (
                          <motion.div
                            key={activity.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center gap-4 p-4 bg-white/5 rounded-lg"
                          >
                            {getActivityIcon(activity.activity_type)}
                            <div className="flex-1">
                              <div className="text-white font-medium capitalize">
                                {activity.activity_type.replace('_', ' ')}
                              </div>
                              <div className="text-gray-300 text-sm">
                                {new Date(activity.created_at).toLocaleTimeString()}
                              </div>
                            </div>
                            <div className="text-yellow-400 font-bold">
                              +{activity.points_earned} pts
                            </div>
                          </motion.div>
                        ))
                      ) : (
                        <div className="text-center text-gray-400 py-8">
                          No activities recorded today yet. Start playing games to see your progress!
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Today's Insights */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                    <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                      <Brain className="w-6 h-6 text-purple-400" />
                      Daily Insights
                    </h3>
                    <div className="space-y-4">
                      {todayReport.insights && todayReport.insights.length > 0 ? (
                        todayReport.insights.map((insight: DailyInsight, index: number) => (
                          <motion.div
                            key={insight.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`p-4 rounded-lg border-l-4 ${getInsightColor(insight.insight_type)}`}
                          >
                            <div className="flex items-start gap-3">
                              {getInsightIcon(insight.insight_type)}
                              <div className="flex-1">
                                <h4 className="text-white font-bold mb-1">{insight.title}</h4>
                                <p className="text-gray-300">{insight.description}</p>
                              </div>
                            </div>
                          </motion.div>
                        ))
                      ) : (
                        <div className="text-center text-gray-400 py-8">
                          No insights available yet. Keep playing to unlock personalized insights!
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Weekly Summary */}
          {activeTab === 'weekly' && (
            <motion.div
              key="weekly"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {weeklySummary && (
                <div className="space-y-6">
                  {/* Weekly Totals */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
                      <Target className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-white">{weeklySummary.weeklyTotals.totalGames}</div>
                      <div className="text-gray-300">Games This Week</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
                      <Star className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-white">{weeklySummary.weeklyTotals.totalPoints}</div>
                      <div className="text-gray-300">Points This Week</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
                      <Clock className="w-8 h-8 text-green-400 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-white">{Math.round(weeklySummary.weeklyTotals.totalPlayTime)}m</div>
                      <div className="text-gray-300">Play Time</div>
                    </div>
                  </div>

                  {/* Weekly Chart Placeholder */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                    <h3 className="text-2xl font-bold text-white mb-4">Weekly Progress</h3>
                    <div className="h-64 flex items-center justify-center text-gray-400">
                      <div className="text-center">
                        <BarChart3 className="w-16 h-16 mx-auto mb-4" />
                        <p>Weekly progress chart coming soon!</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* History */}
          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <h3 className="text-2xl font-bold text-white mb-4">Historical Reports</h3>
                <div className="mb-4">
                  <label className="block text-gray-300 mb-2">Select Date:</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-white/10 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-400"
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
                
                {dateReport ? (
                  <div className="space-y-4">
                    <div className="text-white font-bold text-lg">
                      Report for {formatDate(selectedDate)}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-white/5 rounded-lg p-4 text-center">
                        <div className="text-xl font-bold text-white">{dateReport.report.games_played}</div>
                        <div className="text-gray-300 text-sm">Games</div>
                      </div>
                      <div className="bg-white/5 rounded-lg p-4 text-center">
                        <div className="text-xl font-bold text-white">{dateReport.report.total_points_earned}</div>
                        <div className="text-gray-300 text-sm">Points</div>
                      </div>
                      <div className="bg-white/5 rounded-lg p-4 text-center">
                        <div className="text-xl font-bold text-white">{dateReport.report.total_play_time}m</div>
                        <div className="text-gray-300 text-sm">Play Time</div>
                      </div>
                      <div className="bg-white/5 rounded-lg p-4 text-center">
                        <div className="text-xl font-bold text-white">{dateReport.report.focus_score}%</div>
                        <div className="text-gray-300 text-sm">Focus</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-400 py-8">
                    No data available for this date.
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DailyReportsPage;
