-- TNR Tracker Database Schema
-- Run this in the Supabase SQL Editor

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'volunteer' CHECK (role IN ('admin', 'volunteer')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Colonies table
CREATE TABLE IF NOT EXISTS colonies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  status TEXT NOT NULL DEFAULT 'unmanaged' CHECK (status IN ('unmanaged', 'in_progress', 'managed')),
  description TEXT DEFAULT '',
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cats table
CREATE TABLE IF NOT EXISTS cats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  colony_id UUID NOT NULL REFERENCES colonies(id) ON DELETE CASCADE,
  name TEXT DEFAULT '',
  gender TEXT NOT NULL DEFAULT 'unknown' CHECK (gender IN ('male', 'female', 'unknown')),
  neutered BOOLEAN NOT NULL DEFAULT false,
  health_notes TEXT DEFAULT '',
  photo_url TEXT DEFAULT '',
  logged_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Traps table
CREATE TABLE IF NOT EXISTS traps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  colony_id UUID NOT NULL REFERENCES colonies(id) ON DELETE CASCADE,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'in_use', 'needs_pickup')),
  assigned_to UUID REFERENCES profiles(id),
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Updates / Activity Feed table
CREATE TABLE IF NOT EXISTS updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  colony_id UUID NOT NULL REFERENCES colonies(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  posted_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Storage bucket for cat photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('cat-photos', 'cat-photos', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE colonies ENABLE ROW LEVEL SECURITY;
ALTER TABLE cats ENABLE ROW LEVEL SECURITY;
ALTER TABLE traps ENABLE ROW LEVEL SECURITY;
ALTER TABLE updates ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE POLICY "Authenticated users can read all profiles"
  ON profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- COLONIES
CREATE POLICY "Authenticated users can read all colonies"
  ON colonies FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert colonies"
  ON colonies FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Authenticated users can update colonies"
  ON colonies FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Only admins can delete colonies"
  ON colonies FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- CATS
CREATE POLICY "Authenticated users can read all cats"
  ON cats FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert cats"
  ON cats FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = logged_by);

CREATE POLICY "Authenticated users can update cats"
  ON cats FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete cats"
  ON cats FOR DELETE TO authenticated USING (true);

-- TRAPS
CREATE POLICY "Authenticated users can read all traps"
  ON traps FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert traps"
  ON traps FOR INSERT TO authenticated USING (true);

CREATE POLICY "Authenticated users can update traps"
  ON traps FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete traps"
  ON traps FOR DELETE TO authenticated USING (true);

-- UPDATES
CREATE POLICY "Authenticated users can read all updates"
  ON updates FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert updates"
  ON updates FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = posted_by);

CREATE POLICY "Authenticated users can delete updates"
  ON updates FOR DELETE TO authenticated USING (true);

-- Storage policy for cat photos
CREATE POLICY "Public can view cat photos"
  ON storage.objects FOR SELECT USING (bucket_id = 'cat-photos');

CREATE POLICY "Authenticated users can upload cat photos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'cat-photos');

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    'volunteer'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
