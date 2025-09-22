import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Gift, 
  Star, 
  Trophy, 
  Coins, 
  Award, 
  ShoppingBag, 
  User, 
  Sparkles,
  TrendingUp,
  Calendar,
  Target,
  Zap,
  Gamepad2,
  MessageCircle,
  BarChart3,
  Quote
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Reward } from '../../types';
import { rewardsService } from '../../services/rewardsService';

const RewardsPage: React.FC = () => {
  const { user } = useAuth();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [userRewards, setUserRewards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'available' | 'earned' | 'leaderboard'>('available');

  useEffect(() => {
    loadRewards();
    loadUserRewards();
  }, []);

  const loadRewards = async () => {
    try {
      const data = await rewardsService.getAvailableRewards();
      setRewards(data);
    } catch (error) {
      console.error('Failed to load rewards:', error);
    }
  };

  const loadUserRewards = async () => {
    try {
      const data = await rewardsService.getUserRewards();
      setUserRewards(data);
    } catch (error) {
      console.error('Failed to load user rewards:', error);
    } finally {
      setLoading(false);
    }
  };

  const redeemReward = async (rewardId: string) => {
    try {
      await rewardsService.redeemReward(rewardId);
      loadRewards();
      loadUserRewards();
    } catch (error) {
      console.error('Failed to redeem reward:', error);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'voucher': return ShoppingBag;
      case 'avatar': return User;
      case 'digital': return Sparkles;
      default: return Gift;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'voucher': return 'from-orange-500 to-red-500';
      case 'avatar': return 'from-purple-500 to-pink-500';
      case 'digital': return 'from-blue-500 to-cyan-500';
      default: return 'from-green-500 to-emerald-500';
    }
  };

  const mockLeaderboard = [
    { rank: 1, name: 'Alex Johnson', points: 2450, avatar: '👑' },
    { rank: 2, name: 'Sarah Wilson', points: 2380, avatar: '🥈' },
    { rank: 3, name: 'Mike Chen', points: 2150, avatar: '🥉' },
    { rank: 4, name: 'Emma Davis', points: 1980, avatar: '⭐' },
    { rank: 5, name: 'You', points: user?.total_points || 0, avatar: '🎯' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
          <Gift className="text-cyan-400" size={40} />
          Rewards & Earn
        </h1>
        <p className="text-slate-400 text-lg">Earn points and unlock amazing rewards!</p>
      </motion.div>

      {/* Points Display */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 backdrop-blur-sm border border-cyan-500/30 rounded-2xl p-6 mb-8"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-cyan-500/20 p-3 rounded-full">
              <Coins className="text-cyan-400" size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">{user?.total_points || 0}</h3>
              <p className="text-slate-400">Total Points</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 text-green-400">
              <TrendingUp size={16} />
              <span className="text-sm">+150 this week</span>
            </div>
            <p className="text-slate-400 text-sm">Keep going!</p>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-800/50 rounded-lg p-1 mb-6">
        {[
          { id: 'available', label: 'Available Rewards', icon: Gift },
          { id: 'earned', label: 'My Rewards', icon: Trophy },
          { id: 'leaderboard', label: 'Leaderboard', icon: Award }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                activeTab === tab.id
                  ? 'bg-cyan-500 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'available' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rewards.map((reward) => {
              const Icon = getCategoryIcon(reward.category);
              const canAfford = (user?.total_points || 0) >= reward.points_required;
              
              return (
                <motion.div
                  key={reward.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                  className={`bg-slate-800/50 backdrop-blur-sm border rounded-2xl p-6 transition-all ${
                    canAfford 
                      ? 'border-cyan-500/30 hover:border-cyan-500/50' 
                      : 'border-slate-700/50 opacity-75'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${getCategoryColor(reward.category)} flex items-center justify-center mb-4`}>
                    <Icon className="text-white" size={24} />
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2">{reward.title}</h3>
                  <p className="text-slate-400 mb-4">{reward.description}</p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Coins className="text-yellow-400" size={16} />
                      <span className="text-white font-semibold">{reward.points_required}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      reward.available ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {reward.available ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                  
                  <button
                    onClick={() => redeemReward(reward.id)}
                    disabled={!canAfford || !reward.available}
                    className={`w-full py-2 px-4 rounded-lg font-semibold transition-all ${
                      canAfford && reward.available
                        ? 'bg-cyan-500 hover:bg-cyan-600 text-white'
                        : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {!canAfford ? 'Not enough points' : 'Redeem Now'}
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}

        {activeTab === 'earned' && (
          <div className="space-y-4">
            {userRewards.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="mx-auto text-slate-400 mb-4" size={48} />
                <h3 className="text-xl font-semibold text-white mb-2">No rewards earned yet</h3>
                <p className="text-slate-400">Start playing games and completing activities to earn your first reward!</p>
              </div>
            ) : (
              userRewards.map((userReward) => (
                <motion.div
                  key={userReward.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center">
                      <Trophy className="text-white" size={24} />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">{userReward.reward_title}</h4>
                      <p className="text-slate-400 text-sm">Redeemed on {new Date(userReward.redeemed_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 text-yellow-400">
                      <Coins size={16} />
                      <span className="font-semibold">{userReward.points_spent}</span>
                    </div>
                    <span className="text-green-400 text-sm">Redeemed</span>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Award className="text-yellow-400" />
              Weekly Leaderboard
            </h3>
            
            <div className="space-y-3">
              {mockLeaderboard.map((player, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    player.name === 'You' 
                      ? 'bg-cyan-500/20 border border-cyan-500/30' 
                      : 'bg-slate-700/30'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">{player.avatar}</div>
                    <div>
                      <h4 className="text-white font-semibold">{player.name}</h4>
                      <p className="text-slate-400 text-sm">Rank #{player.rank}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 text-yellow-400">
                      <Star size={16} />
                      <span className="font-bold text-lg">{player.points}</span>
                    </div>
                    <p className="text-slate-400 text-sm">points</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* How to Earn Points */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 mt-8"
      >
        <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <Target className="text-green-400" />
          How to Earn Points
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Gamepad2, title: 'Play Games', points: '10-50 points', desc: 'Complete games and challenges' },
            { icon: MessageCircle, title: 'Daily Chat', points: '5-15 points', desc: 'Have conversations with AI' },
            { icon: BarChart3, title: 'Daily Reports', points: '10 points', desc: 'Submit your daily mood report' },
            { icon: Quote, title: 'Quote Activities', points: '5-10 points', desc: 'Like and interact with quotes' }
          ].map((activity, index) => {
            const Icon = activity.icon;
            return (
              <div key={index} className="text-center p-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-3">
                  <Icon className="text-white" size={24} />
                </div>
                <h4 className="text-white font-semibold mb-1">{activity.title}</h4>
                <p className="text-cyan-400 font-bold text-sm mb-1">{activity.points}</p>
                <p className="text-slate-400 text-xs">{activity.desc}</p>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default RewardsPage;
