import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import db from '../config/database.js';

const router = express.Router();

// Get all daily quotes
router.get('/', async (req, res) => {
  try {
    const [quotes] = await db.execute(
      'SELECT id, content, author, date, likes FROM daily_quotes WHERE is_active = true ORDER BY date DESC, likes DESC'
    );
    
    res.json({
      success: true,
      data: quotes
    });
  } catch (error) {
    console.error('Error fetching quotes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quotes'
    });
  }
});

// Get today's quote
router.get('/today', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const [quotes] = await db.execute(
      'SELECT id, content, author, date, likes FROM daily_quotes WHERE is_active = true ORDER BY RAND() LIMIT 1'
    );
    
    res.json({
      success: true,
      data: quotes[0] || null
    });
  } catch (error) {
    console.error('Error fetching today\'s quote:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch today\'s quote'
    });
  }
});

// Get user's submitted quotes
router.get('/user', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const [quotes] = await db.execute(
      `SELECT id, content, author, is_approved, likes, created_at 
       FROM user_quotes 
       WHERE user_id = ? 
       ORDER BY created_at DESC`,
      [userId]
    );
    
    res.json({
      success: true,
      data: quotes
    });
  } catch (error) {
    console.error('Error fetching user quotes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user quotes'
    });
  }
});

// Submit a new quote
router.post('/submit', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { content, author } = req.body;

    if (!content || content.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Quote content must be at least 10 characters long'
      });
    }

    const [result] = await db.execute(
      'INSERT INTO user_quotes (user_id, content, author) VALUES (?, ?, ?)',
      [userId, content.trim(), author?.trim() || 'Anonymous']
    );

    res.json({
      success: true,
      message: 'Quote submitted successfully! It will be reviewed before being published.',
      data: {
        quoteId: result.insertId
      }
    });

  } catch (error) {
    console.error('Error submitting quote:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit quote'
    });
  }
});

// Like a quote
router.post('/like', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { quoteId, quoteType = 'daily' } = req.body;

    if (!quoteId) {
      return res.status(400).json({
        success: false,
        message: 'Quote ID is required'
      });
    }

    // Check if already liked
    const [existingLikes] = await db.execute(
      'SELECT id FROM quote_likes WHERE user_id = ? AND quote_id = ? AND quote_type = ?',
      [userId, quoteId, quoteType]
    );

    if (existingLikes.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'You have already liked this quote'
      });
    }

    // Add like
    await db.execute(
      'INSERT INTO quote_likes (user_id, quote_id, quote_type) VALUES (?, ?, ?)',
      [userId, quoteId, quoteType]
    );

    // Update quote likes count
    const tableName = quoteType === 'daily' ? 'daily_quotes' : 'user_quotes';
    await db.execute(
      `UPDATE ${tableName} SET likes = likes + 1 WHERE id = ?`,
      [quoteId]
    );

    res.json({
      success: true,
      message: 'Quote liked successfully!'
    });

  } catch (error) {
    console.error('Error liking quote:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to like quote'
    });
  }
});

// Unlike a quote
router.delete('/like', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { quoteId, quoteType = 'daily' } = req.body;

    if (!quoteId) {
      return res.status(400).json({
        success: false,
        message: 'Quote ID is required'
      });
    }

    // Remove like
    const [result] = await db.execute(
      'DELETE FROM quote_likes WHERE user_id = ? AND quote_id = ? AND quote_type = ?',
      [userId, quoteId, quoteType]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({
        success: false,
        message: 'You have not liked this quote'
      });
    }

    // Update quote likes count
    const tableName = quoteType === 'daily' ? 'daily_quotes' : 'user_quotes';
    await db.execute(
      `UPDATE ${tableName} SET likes = GREATEST(likes - 1, 0) WHERE id = ?`,
      [quoteId]
    );

    res.json({
      success: true,
      message: 'Quote unliked successfully!'
    });

  } catch (error) {
    console.error('Error unliking quote:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unlike quote'
    });
  }
});

// Get approved user quotes (for public display)
router.get('/user-approved', async (req, res) => {
  try {
    const [quotes] = await db.execute(
      `SELECT id, content, author, likes, created_at 
       FROM user_quotes 
       WHERE is_approved = true 
       ORDER BY likes DESC, created_at DESC 
       LIMIT 50`
    );
    
    res.json({
      success: true,
      data: quotes
    });
  } catch (error) {
    console.error('Error fetching approved user quotes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch approved user quotes'
    });
  }
});

export default router;
