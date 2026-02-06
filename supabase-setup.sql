-- Supabase Setup for Travel Log
-- Run this SQL in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/YOUR_PROJECT/sql/new

-- Create the visited_countries table
CREATE TABLE IF NOT EXISTS visited_countries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  country_code TEXT NOT NULL,         -- ISO 3166-1 alpha-3 (e.g., "USA", "GBR")
  visited_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id, country_code)
);

-- Enable Row Level Security
ALTER TABLE visited_countries ENABLE ROW LEVEL SECURITY;

-- Policy: users can only see their own data
CREATE POLICY "Users can view own visited countries"
  ON visited_countries FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: users can insert their own data
CREATE POLICY "Users can insert own visited countries"
  ON visited_countries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: users can delete their own data
CREATE POLICY "Users can delete own visited countries"
  ON visited_countries FOR DELETE
  USING (auth.uid() = user_id);

-- Index for fast lookups by user
CREATE INDEX IF NOT EXISTS idx_visited_countries_user
  ON visited_countries(user_id);

-- Grant access to authenticated users
GRANT ALL ON visited_countries TO authenticated;
