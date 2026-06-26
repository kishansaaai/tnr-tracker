-- TNR Tracker v2 Migration
-- Run this in the Supabase SQL Editor

-- ============================================================
-- Feature 1: Recovery & Medication Scheduler
-- ============================================================

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

ALTER TABLE recoveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;

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

ALTER PUBLICATION supabase_realtime ADD TABLE recoveries;
ALTER PUBLICATION supabase_realtime ADD TABLE medications;

-- ============================================================
-- Feature 4: Socialization & Adoption Pipeline
-- ============================================================

ALTER TABLE cats ADD COLUMN IF NOT EXISTS pipeline_status TEXT
  DEFAULT 'tnr' CHECK (pipeline_status IN ('tnr', 'socializing', 'adoption_ready', 'adopted'));
ALTER TABLE cats ADD COLUMN IF NOT EXISTS foster_name TEXT DEFAULT '';
ALTER TABLE cats ADD COLUMN IF NOT EXISTS adoption_date TIMESTAMPTZ;

DROP TABLE IF EXISTS adoptions CASCADE;

ALTER TABLE colonies ADD CONSTRAINT colonies_lat_range CHECK (lat BETWEEN -90 AND 90);
ALTER TABLE colonies ADD CONSTRAINT colonies_lng_range CHECK (lng BETWEEN -180 AND 180);
ALTER TABLE traps ADD CONSTRAINT traps_lat_range CHECK (lat BETWEEN -90 AND 90);
ALTER TABLE traps ADD CONSTRAINT traps_lng_range CHECK (lng BETWEEN -180 AND 180);

CREATE OR REPLACE VIEW public_profiles AS SELECT id, name FROM profiles;
GRANT SELECT ON public_profiles TO authenticated;

-- Security Definer helper to check admin role bypassing RLS recursion
CREATE OR REPLACE FUNCTION public.check_user_is_admin(user_id UUID)
RETURNS BOOLEAN SECURITY DEFINER AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql;

DROP POLICY IF EXISTS "Authenticated users can read all profiles" ON profiles;
CREATE POLICY "Users can read own profile, admins read all"
  ON profiles FOR SELECT TO authenticated
  USING (
    auth.uid() = id OR
    public.check_user_is_admin(auth.uid())
  );
  
ALTER TABLE updates DROP CONSTRAINT IF EXISTS updates_message_check;
ALTER TABLE updates ADD CONSTRAINT updates_message_check CHECK (message !~ '<[^>]+>');

-- ============================================================
-- Post-Evaluation Security & Performance Fixes
-- ============================================================

-- GiST Indexing for Coordinates
CREATE EXTENSION IF NOT EXISTS btree_gist;
CREATE INDEX IF NOT EXISTS idx_colonies_gist_coords ON colonies USING gist (lat, lng);

-- Storage UPDATE RLS Policy
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
