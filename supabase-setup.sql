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

-- ============================================================
-- Leaderboard: profiles table, trigger, and RPC function
-- ============================================================

-- Public profiles table (mirrors select fields from auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Everyone can read profiles (needed for leaderboard)
CREATE POLICY "Profiles are publicly readable"
  ON profiles FOR SELECT
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

GRANT SELECT ON profiles TO authenticated;

-- Auto-populate profile when a new user signs up via Google OAuth
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Traveler'),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    display_name = COALESCE(EXCLUDED.display_name, profiles.display_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
    updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- One-time backfill for existing users (run once after creating the table)
-- INSERT INTO profiles (id, display_name, avatar_url)
-- SELECT
--   id,
--   COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', 'Traveler'),
--   raw_user_meta_data->>'avatar_url'
-- FROM auth.users
-- ON CONFLICT (id) DO NOTHING;

-- Leaderboard RPC: returns users ranked by countries visited
CREATE OR REPLACE FUNCTION get_leaderboard(result_limit INT DEFAULT 10)
RETURNS TABLE (
  user_id UUID,
  display_name TEXT,
  avatar_url TEXT,
  country_count BIGINT,
  country_codes TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id AS user_id,
    p.display_name,
    p.avatar_url,
    COUNT(vc.country_code) AS country_count,
    ARRAY_AGG(vc.country_code ORDER BY vc.visited_at DESC) AS country_codes
  FROM profiles p
  LEFT JOIN visited_countries vc ON vc.user_id = p.id
  GROUP BY p.id, p.display_name, p.avatar_url
  HAVING COUNT(vc.country_code) > 0
  ORDER BY country_count DESC, p.display_name ASC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
