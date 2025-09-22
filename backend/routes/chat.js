import express from 'express';
import jwt from 'jsonwebtoken';
import { executeQuery } from '../config/database.js';
import aiService from '../services/aiService.js';

const router = express.Router();

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
    req.userId = decoded.userId;
    next();
  });
};

// Send message to AI
router.post('/message', authenticateToken, async (req, res) => {
  try {
    const { message, preferredLanguage } = req.body;
    const userId = req.userId;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    // Get user context
    const users = await executeQuery(
      'SELECT id, name, email, avatar_name FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = users[0];

    // Get recent conversation history for context
    const recentMessages = await executeQuery(
      `SELECT message, ai_response, created_at 
       FROM conversation_entries 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT 5`,
      [userId]
    );

    // Generate AI response with language preference and conversation context
    const userContext = { 
      ...user, 
      preferredLanguage,
      conversationHistory: recentMessages.reverse() // Reverse to get chronological order
    };
    const aiResponse = await aiService.generateResponse(message, userContext);

    // Save conversation to database
    await executeQuery(
      'INSERT INTO conversation_entries (user_id, message, ai_response, mood_detected) VALUES (?, ?, ?, ?)',
      [userId, message, aiResponse.response, aiResponse.riskLevel]
    );

    res.json({
      success: true,
      data: {
        response: aiResponse.response,
        riskLevel: aiResponse.riskLevel,
        timestamp: aiResponse.timestamp
      }
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get conversation history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { limit = 50, offset = 0 } = req.query;

    const conversations = await executeQuery(
      `SELECT id, message, ai_response, mood_detected, created_at 
       FROM conversation_entries 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [userId, parseInt(limit), parseInt(offset)]
    );

    res.json({
      success: true,
      data: conversations
    });

  } catch (error) {
    console.error('Chat history error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get conversation starter
router.get('/starter', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { language } = req.query;

    // Get user context
    const users = await executeQuery(
      'SELECT id, name, email, avatar_name FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = users[0];
    const userContext = { ...user, preferredLanguage: language };
    const starter = aiService.generateConversationStarter(userContext);

    res.json({
      success: true,
      data: {
        starter: starter
      }
    });

  } catch (error) {
    console.error('Conversation starter error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
