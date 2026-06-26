-- Create api_rate_limits table for global DB-backed rate limiting
CREATE TABLE IF NOT EXISTS api_rate_limits (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  last_call TIMESTAMPTZ NOT NULL,
  call_count INT NOT NULL DEFAULT 1
);

-- Enable RLS
ALTER TABLE api_rate_limits ENABLE ROW LEVEL SECURITY;

-- Select policy: users can only view their own rate limit row
CREATE POLICY "Users read own rate limit" ON api_rate_limits FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- All operations policy for service role / edge function execution
CREATE POLICY "Service role manages rate limits" ON api_rate_limits FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================================
-- Profile RLS Recursion Fixes
-- ============================================================

-- Security Definer helper to check admin role bypassing RLS recursion
CREATE OR REPLACE FUNCTION public.check_user_is_admin(user_id UUID)
RETURNS BOOLEAN SECURITY DEFINER AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql;

-- Security Definer helper to get user role bypassing RLS recursion
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TEXT SECURITY DEFINER AS $$
BEGIN
  RETURN (SELECT role FROM public.profiles WHERE id = user_id);
END;
$$ LANGUAGE plpgsql;

-- Recreate SELECT policy without recursion
DROP POLICY IF EXISTS "Users can read own profile, admins read all" ON profiles;
CREATE POLICY "Users can read own profile, admins read all"
  ON profiles FOR SELECT TO authenticated
  USING (
    auth.uid() = id OR
    public.check_user_is_admin(auth.uid())
  );

-- Recreate UPDATE policy without recursion
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = public.get_user_role(auth.uid()));
