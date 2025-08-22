-- Create goals table for financial goal tracking
-- Run this in your Supabase SQL editor

-- Create enum types first
CREATE TYPE goal_type AS ENUM (
  'savings',
  'debt_payoff', 
  'investment',
  'emergency_fund',
  'major_purchase',
  'retirement',
  'custom'
);

CREATE TYPE goal_priority AS ENUM (
  'low',
  'medium', 
  'high',
  'critical'
);

-- Create goals table
CREATE TABLE goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type goal_type NOT NULL DEFAULT 'savings',
  target_amount DECIMAL(12, 2) NOT NULL CHECK (target_amount > 0),
  current_amount DECIMAL(12, 2) NOT NULL DEFAULT 0 CHECK (current_amount >= 0),
  target_date DATE NOT NULL,
  priority goal_priority NOT NULL DEFAULT 'medium',
  category TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_goals_user_id ON goals(user_id);
CREATE INDEX idx_goals_type ON goals(type);
CREATE INDEX idx_goals_priority ON goals(priority);
CREATE INDEX idx_goals_target_date ON goals(target_date);

-- Enable Row Level Security (RLS)
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own goals" ON goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own goals" ON goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals" ON goals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals" ON goals
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_goals_updated_at
  BEFORE UPDATE ON goals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample goals for testing (optional)
-- Note: Replace 'your-user-id' with an actual user ID from auth.users
/*
INSERT INTO goals (user_id, name, type, target_amount, current_amount, target_date, priority, description) VALUES
  ('your-user-id', 'Emergency Fund', 'emergency_fund', 15000.00, 8500.00, '2024-12-31', 'critical', '6 months of expenses for financial security'),
  ('your-user-id', 'Vacation to Europe', 'major_purchase', 5000.00, 2200.00, '2024-06-15', 'medium', 'Dream vacation to explore European cities'),
  ('your-user-id', 'Investment Portfolio', 'investment', 25000.00, 12000.00, '2025-12-31', 'medium', 'Build diversified investment portfolio');
*/

-- Grant necessary permissions
GRANT ALL ON goals TO authenticated;
GRANT ALL ON goals TO service_role;