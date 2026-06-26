-- TNR Tracker Database Schema
-- Run this in the Supabase SQL Editor

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'volunteer' CHECK (role IN ('admin', 'volunteer', 'feeder')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Colonies table
CREATE TABLE IF NOT EXISTS colonies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL CHECK (lat BETWEEN -90 AND 90),
  lng DOUBLE PRECISION NOT NULL CHECK (lng BETWEEN -180 AND 180),
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
  pipeline_status TEXT DEFAULT 'tnr' CHECK (pipeline_status IN ('tnr', 'socializing', 'adoption_ready', 'adopted')),
  foster_name TEXT DEFAULT '',
  adoption_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Traps table
CREATE TABLE IF NOT EXISTS traps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  colony_id UUID NOT NULL REFERENCES colonies(id) ON DELETE CASCADE,
  lat DOUBLE PRECISION NOT NULL CHECK (lat BETWEEN -90 AND 90),
  lng DOUBLE PRECISION NOT NULL CHECK (lng BETWEEN -180 AND 180),
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'in_use', 'needs_pickup')),
  assigned_to UUID REFERENCES profiles(id),
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Updates / Activity Feed table
CREATE TABLE IF NOT EXISTS updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  colony_id UUID NOT NULL REFERENCES colonies(id) ON DELETE CASCADE,
  message TEXT NOT NULL CHECK (message !~ '<[^>]+>'),
  posted_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recoveries table
CREATE TABLE IF NOT EXISTS recoveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cat_id UUID NOT NULL REFERENCES cats(id) ON DELETE CASCADE,
  colony_id UUID NOT NULL REFERENCES colonies(id) ON DELETE CASCADE,
  surgery_type TEXT NOT NULL DEFAULT 'spay_neuter' CHECK (surgery_type IN ('spay_neuter', 'medical', 'dental', 'other')),
  surgery_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  release_date TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'recovering' CHECK (status IN ('recovering', 'released', 'complications')),
  vet_notes TEXT DEFAULT '',
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Medications table
CREATE TABLE IF NOT EXISTS medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recovery_id UUID NOT NULL REFERENCES recoveries(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dosage TEXT DEFAULT '',
  frequency TEXT DEFAULT 'daily',
  start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  next_due TIMESTAMPTZ,
  completed BOOLEAN NOT NULL DEFAULT false,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Storage bucket for cat photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('cat-photos', 'cat-photos', true)
ON CONFLICT (id) DO NOTHING;



-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_cats_colony_id ON cats(colony_id);
CREATE INDEX IF NOT EXISTS idx_traps_colony_id ON traps(colony_id);
CREATE INDEX IF NOT EXISTS idx_cats_pipeline ON cats(pipeline_status);
CREATE INDEX IF NOT EXISTS idx_recoveries_cat_id ON recoveries(cat_id);

-- GiST Indexing for Coordinates
CREATE EXTENSION IF NOT EXISTS btree_gist;
CREATE INDEX IF NOT EXISTS idx_colonies_gist_coords ON colonies USING gist (lat, lng);

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE colonies ENABLE ROW LEVEL SECURITY;
ALTER TABLE cats ENABLE ROW LEVEL SECURITY;
ALTER TABLE traps ENABLE ROW LEVEL SECURITY;
ALTER TABLE updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE recoveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;


-- PROFILES
CREATE VIEW public_profiles AS SELECT id, name FROM profiles;
GRANT SELECT ON public_profiles TO authenticated;

CREATE POLICY "Users can read own profile, admins read all"
  ON profiles FOR SELECT TO authenticated
  USING (
    auth.uid() = id OR
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = (SELECT role FROM profiles WHERE id = auth.uid()));

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

CREATE POLICY "Volunteers can update their own colonies"
  ON colonies FOR UPDATE TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Admins can update any colony"
  ON colonies FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

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

CREATE POLICY "Only admins can mark cats adopted"
  ON cats FOR UPDATE TO authenticated
  USING (
    auth.uid() = logged_by AND (
      pipeline_status IS DISTINCT FROM 'adopted' OR
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    )
  );

CREATE POLICY "Admins can update any cat"
  ON cats FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Volunteers can delete their own cats"
  ON cats FOR DELETE TO authenticated
  USING (auth.uid() = logged_by);

CREATE POLICY "Admins can delete any cat"
  ON cats FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- TRAPS
CREATE POLICY "Authenticated users can read all traps"
  ON traps FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert traps"
  ON traps FOR INSERT TO authenticated
  WITH CHECK (
    assigned_to IS NULL OR
    assigned_to = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Owners or admins can update traps"
  ON traps FOR UPDATE TO authenticated
  USING (
    auth.uid() = assigned_to OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Owners or admins can delete traps"
  ON traps FOR DELETE TO authenticated
  USING (
    auth.uid() = assigned_to OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- UPDATES
CREATE POLICY "Authenticated users can read all updates"
  ON updates FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert updates"
  ON updates FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = posted_by AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'volunteer'))
  );

CREATE POLICY "Feeders can insert feeding updates"
  ON updates FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = posted_by AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'feeder')
  );

CREATE POLICY "Users can delete their own updates"
  ON updates FOR DELETE TO authenticated
  USING (auth.uid() = posted_by);

-- RECOVERIES
CREATE POLICY "Auth read recoveries" ON recoveries FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth insert recoveries" ON recoveries FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Auth update recoveries" ON recoveries FOR UPDATE TO authenticated USING (
    auth.uid() = created_by OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Auth delete recoveries" ON recoveries FOR DELETE TO authenticated USING (
    auth.uid() = created_by OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- MEDICATIONS
CREATE POLICY "Auth read medications" ON medications FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth insert medications" ON medications FOR INSERT TO authenticated WITH CHECK (
  EXISTS (
    SELECT 1 FROM recoveries
    WHERE id = recovery_id AND created_by = auth.uid()
  )
);
CREATE POLICY "Auth update medications" ON medications FOR UPDATE TO authenticated USING (
  EXISTS (
    SELECT 1 FROM recoveries
    WHERE id = recovery_id AND created_by = auth.uid()
  ) OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Auth delete medications" ON medications FOR DELETE TO authenticated USING (
  EXISTS (
    SELECT 1 FROM recoveries
    WHERE id = recovery_id AND created_by = auth.uid()
  ) OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);



-- Storage policy for cat photos
CREATE POLICY "Public can view cat photos"
  ON storage.objects FOR SELECT USING (bucket_id = 'cat-photos');

CREATE POLICY "Users can upload to their own folder"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'cat-photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete their own cat photos"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'cat-photos' AND owner = auth.uid());

CREATE POLICY "Users can update their own cat photos"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'cat-photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'cat-photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

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
