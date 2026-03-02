-- ============================================================
-- Supabase Table: submissions
-- Run this in the Supabase SQL Editor if the table doesn't exist
-- or needs to be recreated with the correct schema
-- ============================================================

-- Drop existing table if recreating
-- DROP TABLE IF EXISTS submissions;

CREATE TABLE IF NOT EXISTS submissions (
  id TEXT PRIMARY KEY,                          -- e.g. 'sub-1709234567890'
  student_id TEXT NOT NULL,                     -- matches staff.js student IDs
  assignment_id TEXT,                           -- null for ad hoc submissions
  uploaded_by TEXT,                             -- teacher email who uploaded
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),        -- when it was uploaded
  priority_flag TEXT CHECK (priority_flag IN ('red', 'yellow', 'green')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'complete', 'error')),
  is_ad_hoc BOOLEAN DEFAULT FALSE,
  reviewed BOOLEAN DEFAULT FALSE,
  data JSONB NOT NULL,                          -- full submission object (all analysis results)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_submissions_uploaded_by ON submissions(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_submissions_student_id ON submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_submissions_uploaded_at ON submissions(uploaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_submissions_priority_flag ON submissions(priority_flag);

-- Row Level Security (RLS)
-- Enable RLS but allow the anon key to do everything
-- (auth is handled at the application layer via AUTH_USERS)
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Policy: allow all operations for the anon key
-- This is safe because auth is enforced by the Next.js middleware
CREATE POLICY "Allow all operations" ON submissions
  FOR ALL
  USING (true)
  WITH CHECK (true);
