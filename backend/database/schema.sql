-- MindQuest Database Schema
-- Create database
CREATE DATABASE IF NOT EXISTS mindquest_db;
USE mindquest_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500),
    avatar_name VARCHAR(100),
    is_admin BOOLEAN DEFAULT FALSE,
    total_points INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Games table
CREATE TABLE IF NOT EXISTS games (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    points_reward INT DEFAULT 0,
    difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'easy',
    icon VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Daily quotes table
CREATE TABLE IF NOT EXISTS daily_quotes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    content TEXT NOT NULL,
    author VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    likes INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- User quote likes table
CREATE TABLE IF NOT EXISTS user_quote_likes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    quote_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (quote_id) REFERENCES daily_quotes(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_quote (user_id, quote_id)
);

-- Rewards table
CREATE TABLE IF NOT EXISTS rewards (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    points_required INT NOT NULL,
    category ENUM('voucher', 'avatar', 'digital') NOT NULL,
    available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- User rewards table (tracks redeemed rewards)
CREATE TABLE IF NOT EXISTS user_rewards (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    reward_id INT NOT NULL,
    points_spent INT NOT NULL,
    status ENUM('redeemed', 'pending', 'expired') DEFAULT 'redeemed',
    redeemed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reward_id) REFERENCES rewards(id) ON DELETE CASCADE
);

-- User settings table
CREATE TABLE IF NOT EXISTS user_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    notifications JSON NOT NULL,
    privacy JSON NOT NULL,
    preferences JSON NOT NULL,
    avatar JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Mood entries table
CREATE TABLE IF NOT EXISTS mood_entries (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    mood_score INT NOT NULL CHECK (mood_score >= 1 AND mood_score <= 10),
    notes TEXT,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Game sessions table
CREATE TABLE IF NOT EXISTS game_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    game_id INT NOT NULL,
    score INT DEFAULT 0,
    points_earned INT DEFAULT 0,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
);

-- User game statistics table
CREATE TABLE IF NOT EXISTS user_game_stats (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    game_id VARCHAR(50) NOT NULL,
    total_plays INT DEFAULT 0,
    total_points INT DEFAULT 0,
    best_score INT DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE,
    last_played TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_game (user_id, game_id)
);

-- User overall statistics table
CREATE TABLE IF NOT EXISTS user_stats (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    total_points INT DEFAULT 0,
    games_completed INT DEFAULT 0,
    current_streak INT DEFAULT 0,
    longest_streak INT DEFAULT 0,
    last_play_date DATE NULL,
    total_play_time INT DEFAULT 0, -- in minutes
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Daily reports table
CREATE TABLE IF NOT EXISTS daily_reports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    report_date DATE NOT NULL,
    games_played INT DEFAULT 0,
    total_points_earned INT DEFAULT 0,
    total_play_time INT DEFAULT 0, -- in minutes
    focus_score DECIMAL(5,2) DEFAULT 0.00, -- average focus score
    mood_score INT DEFAULT 5 CHECK (mood_score >= 1 AND mood_score <= 10),
    achievements_unlocked INT DEFAULT 0,
    streak_maintained BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_date (user_id, report_date)
);

-- Daily activity logs table
CREATE TABLE IF NOT EXISTS daily_activity_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    activity_date DATE NOT NULL,
    activity_type ENUM('game_played', 'meditation_completed', 'mood_logged', 'streak_milestone', 'achievement_unlocked') NOT NULL,
    activity_data JSON, -- flexible data storage for different activity types
    points_earned INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_date (user_id, activity_date)
);

-- Daily insights table
CREATE TABLE IF NOT EXISTS daily_insights (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    insight_date DATE NOT NULL,
    insight_type ENUM('motivational', 'achievement', 'improvement', 'celebration') NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_date_type (user_id, insight_date, insight_type)
);

-- Conversation entries table
CREATE TABLE IF NOT EXISTS conversation_entries (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    mood_detected ENUM('low', 'medium', 'high', 'critical') DEFAULT 'low',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Reward redemptions table
CREATE TABLE IF NOT EXISTS reward_redemptions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    reward_id INT NOT NULL,
    voucher_code VARCHAR(50) UNIQUE NOT NULL,
    redeemed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_used BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reward_id) REFERENCES rewards(id) ON DELETE CASCADE
);

-- Insert sample data
INSERT INTO games (title, description, category, points_reward, difficulty, icon) VALUES
('Memory Cards', 'Test your memory by matching pairs of cards. Improve your concentration and recall abilities.', 'Memory', 10, 'easy', 'Brain'),
('Focus Meditation', 'Practice mindfulness and improve your attention span with guided breathing exercises.', 'Focus', 15, 'easy', 'Target'),
('Reaction Time', 'Test your reflexes and improve your response time with quick visual challenges.', 'Focus', 20, 'medium', 'Zap'),
('Logic Puzzle', 'Solve challenging logic problems to enhance your critical thinking skills.', 'Logic', 25, 'hard', 'Puzzle'),
('Relaxation Sounds', 'Unwind with calming nature sounds and guided relaxation exercises.', 'Relaxation', 10, 'easy', 'Star'),
('Pattern Recognition', 'Identify and complete visual patterns to boost your pattern recognition abilities.', 'Logic', 18, 'medium', 'Gamepad2');

INSERT INTO daily_quotes (content, author, date, likes) VALUES
('Every day is a new beginning. Take a deep breath, smile, and start again.', 'Anonymous', CURDATE(), 42),
('You are stronger than you think and more capable than you imagine.', 'MindQuest Team', CURDATE(), 38),
('Progress, not perfection, is the goal.', 'Anonymous', CURDATE(), 25),
('Your mental health is just as important as your physical health.', 'MindQuest Team', CURDATE(), 30);

INSERT INTO rewards (title, description, points_required, category) VALUES
('Movie Ticket', 'Free movie ticket for any cinema', 100, 'voucher'),
('Coffee Voucher', 'Free coffee at partnered cafes', 50, 'voucher'),
('Premium Avatar', 'Unlock exclusive avatar customizations', 75, 'avatar'),
('Gift Card', '$25 Amazon gift card', 200, 'digital');
