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

-- Atomic rate-limiting function to prevent concurrent race conditions
CREATE OR REPLACE FUNCTION public.check_and_increment_rate_limit(
  p_user_id UUID,
  p_limit_seconds INT,
  p_max_calls INT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_last_call TIMESTAMPTZ;
  v_call_count INT;
  v_now TIMESTAMPTZ := NOW();
BEGIN
  -- Lock the user's rate limit row to block concurrent calls
  SELECT last_call, call_count 
  INTO v_last_call, v_call_count
  FROM public.api_rate_limits
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF FOUND THEN
    -- Check if cooldown period is still active
    IF v_now - v_last_call < (p_limit_seconds * INTERVAL '1 second') THEN
      RETURN FALSE;
    ELSE
      -- Cooldown passed; increment calls and set timestamp
      UPDATE public.api_rate_limits
      SET last_call = v_now,
          call_count = v_call_count + 1
      WHERE user_id = p_user_id;
      RETURN TRUE;
    END IF;
  ELSE
    -- Initial insert
    INSERT INTO public.api_rate_limits (user_id, last_call, call_count)
    VALUES (p_user_id, v_now, 1)
    ON CONFLICT (user_id) DO UPDATE 
    SET last_call = EXCLUDED.last_call,
        call_count = public.api_rate_limits.call_count + 1;
    RETURN TRUE;
  END IF;
END;
$$;
