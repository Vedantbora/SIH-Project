import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { testConnection } from '../config/database.js';

const router = express.Router();

// Mock rewards data for development
const mockRewards = [
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

// Get all available rewards
router.get('/', async (req, res) => {
  try {
    res.json({
      success: true,
      data: mockRewards.filter(reward => reward.available)
    });
  } catch (error) {
    console.error('Error fetching rewards:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch rewards'
    });
  }
});

// Get user's redeemed rewards
router.get('/user', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Mock user rewards data
    const mockUserRewards = [
      {
        id: '1',
        user_id: userId,
        reward_id: '3',
        reward_title: 'Digital Badge Collection',
        points_spent: 200,
        redeemed_at: '2024-01-15T10:30:00Z',
        status: 'redeemed',
      },
      {
        id: '2',
        user_id: userId,
        reward_id: '5',
        reward_title: 'Custom Avatar Frame',
        points_spent: 300,
        redeemed_at: '2024-01-10T14:20:00Z',
        status: 'redeemed',
      },
    ];

    res.json({
      success: true,
      data: mockUserRewards
    });
  } catch (error) {
    console.error('Error fetching user rewards:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user rewards'
    });
  }
});

// Redeem a reward
router.post('/:rewardId/redeem', authenticateToken, async (req, res) => {
  try {
    const { rewardId } = req.params;
    const userId = req.user.id;
    
    // Find the reward
    const reward = mockRewards.find(r => r.id === rewardId);
    if (!reward) {
      return res.status(404).json({
        success: false,
        message: 'Reward not found'
      });
    }

    if (!reward.available) {
      return res.status(400).json({
        success: false,
        message: 'Reward is not available'
      });
    }

    // Mock user points check (in real app, this would query the database)
    const userPoints = 1200; // Mock user points
    
    if (userPoints < reward.points_required) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient points to redeem this reward'
      });
    }

    // In a real application, you would:
    // 1. Deduct points from user account
    // 2. Create a user_rewards record
    // 3. Send confirmation email/notification
    // 4. Handle the actual reward delivery

    res.json({
      success: true,
      message: `Successfully redeemed ${reward.title}!`,
      data: {
        reward_id: rewardId,
        points_spent: reward.points_required,
        remaining_points: userPoints - reward.points_required
      }
    });
  } catch (error) {
    console.error('Error redeeming reward:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to redeem reward'
    });
  }
});

// Get leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    // Mock leaderboard data
    const mockLeaderboard = [
      { rank: 1, user_id: '1', name: 'Alex Johnson', total_points: 2450, avatar_url: null },
      { rank: 2, user_id: '2', name: 'Sarah Wilson', total_points: 2380, avatar_url: null },
      { rank: 3, user_id: '3', name: 'Mike Chen', total_points: 2150, avatar_url: null },
      { rank: 4, user_id: '4', name: 'Emma Davis', total_points: 1980, avatar_url: null },
      { rank: 5, user_id: '5', name: 'David Brown', total_points: 1850, avatar_url: null },
    ];

    res.json({
      success: true,
      data: mockLeaderboard
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leaderboard'
    });
  }
});

// Get user points summary
router.get('/points', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Mock user points data
    const userPoints = {
      total_points: 1200,
      weekly_earned: 150,
      monthly_earned: 450,
      lifetime_earned: 1200
    };

    res.json({
      success: true,
      data: userPoints
    });
  } catch (error) {
    console.error('Error fetching user points:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user points'
    });
  }
});

// Get reward categories
router.get('/categories', async (req, res) => {
  try {
    const categories = [
      { id: 'voucher', name: 'Gift Cards & Vouchers', icon: 'shopping-bag', color: 'orange' },
      { id: 'avatar', name: 'Avatar Customization', icon: 'user', color: 'purple' },
      { id: 'digital', name: 'Digital Rewards', icon: 'sparkles', color: 'blue' }
    ];

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching reward categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reward categories'
    });
  }
});

export default router;
