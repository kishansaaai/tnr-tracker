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
CREATE POLICY "Auth insert recoveries" ON recoveries FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update recoveries" ON recoveries FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth delete recoveries" ON recoveries FOR DELETE TO authenticated USING (true);

CREATE POLICY "Auth read medications" ON medications FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth insert medications" ON medications FOR INSERT TO authenticated WITH CHECK (
  EXISTS (
    SELECT 1 FROM recoveries
    WHERE id = recovery_id AND created_by = auth.uid()
  )
);
CREATE POLICY "Auth update medications" ON medications FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth delete medications" ON medications FOR DELETE TO authenticated USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE recoveries;
ALTER PUBLICATION supabase_realtime ADD TABLE medications;

-- ============================================================
-- Feature 4: Socialization & Adoption Pipeline
-- ============================================================

ALTER TABLE cats ADD COLUMN IF NOT EXISTS pipeline_status TEXT
  DEFAULT 'tnr' CHECK (pipeline_status IN ('tnr', 'socializing', 'adoption_ready', 'adopted'));
ALTER TABLE cats ADD COLUMN IF NOT EXISTS foster_name TEXT DEFAULT '';
ALTER TABLE cats ADD COLUMN IF NOT EXISTS adoption_date TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS adoptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cat_id UUID REFERENCES cats(id) ON DELETE CASCADE,
  adopter_name TEXT,
  adopter_contact TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE adoptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth read adoptions" ON adoptions FOR SELECT TO authenticated USING (
  created_by = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Auth insert adoptions" ON adoptions FOR INSERT TO authenticated WITH CHECK (
  created_by = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
