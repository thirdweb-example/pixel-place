-- Collaborative Grid Database Schema for Supabase (Fixed)
-- Run this in your Supabase SQL editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Grid updates table (current state only)
CREATE TABLE grid_updates (
  id BIGSERIAL PRIMARY KEY,
  row INTEGER NOT NULL CHECK (row >= 0 AND row < 100),
  col INTEGER NOT NULL CHECK (col < 165),
  color_id INTEGER CHECK (color_id >= 0 AND color_id < 32), -- NULL = uncolored, 0-31 = colored
  user_id VARCHAR(255) NOT NULL, -- Using string ID from thirdweb auth
  username VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  session_id VARCHAR(255) NOT NULL,

  -- Ensure one update per cell (latest wins)
  UNIQUE(row, col)
);

-- User sessions table for presence
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL UNIQUE, -- From thirdweb auth
  username VARCHAR(100) NOT NULL,
  last_active TIMESTAMPTZ DEFAULT NOW(),
  current_row INTEGER,
  current_col INTEGER,
  is_online BOOLEAN DEFAULT true,

  -- Track last cell update for rate limiting
  last_cell_update TIMESTAMPTZ DEFAULT NOW()
);

-- Enable realtime for both tables
ALTER PUBLICATION supabase_realtime ADD TABLE grid_updates;
ALTER PUBLICATION supabase_realtime ADD TABLE user_sessions;

-- Indexes for performance
CREATE INDEX idx_grid_updates_position ON grid_updates(row, col);
CREATE INDEX idx_grid_updates_created_at ON grid_updates(created_at);
CREATE INDEX idx_grid_updates_user_id ON grid_updates(user_id);
CREATE INDEX idx_user_sessions_online ON user_sessions(is_online);
CREATE INDEX idx_user_sessions_last_active ON user_sessions(last_active);
CREATE INDEX idx_user_sessions_last_cell_update ON user_sessions(last_cell_update);

-- Row Level Security (RLS)
ALTER TABLE grid_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Policies for grid_updates - SECURE VERSION (API route only)
CREATE POLICY "Anyone can read grid updates" ON grid_updates
  FOR SELECT USING (true);

-- Only allow inserts through the API route (server-side)
CREATE POLICY "No direct client inserts" ON grid_updates
  FOR INSERT WITH CHECK (false);

-- Only allow updates through the API route (server-side)
CREATE POLICY "No direct client updates" ON grid_updates
  FOR UPDATE USING (false);

-- Only allow deletes through the API route (server-side)
CREATE POLICY "No direct client deletes" ON grid_updates
  FOR DELETE USING (false);

-- Policies for user_sessions - SECURE VERSION (API route only)
CREATE POLICY "Anyone can read user sessions" ON user_sessions
  FOR SELECT USING (true);

-- Only allow inserts through the API route (server-side)
CREATE POLICY "No direct client inserts" ON user_sessions
  FOR INSERT WITH CHECK (false);

-- Only allow updates through the API route (server-side)
CREATE POLICY "No direct client updates" ON user_sessions
  FOR UPDATE USING (false);

-- Only allow deletes through the API route (server-side)
CREATE POLICY "No direct client deletes" ON user_sessions
  FOR DELETE USING (false);


