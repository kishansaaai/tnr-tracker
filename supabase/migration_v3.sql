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
