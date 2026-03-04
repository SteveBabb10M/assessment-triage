-- ============================================================
-- Migration: Add charrsid column for cohort cross-referencing
-- Run this in the Supabase SQL Editor on existing deployments
-- Date: March 2026
-- ============================================================

-- Add charrsid JSONB array column
ALTER TABLE submissions 
  ADD COLUMN IF NOT EXISTS charrsids JSONB DEFAULT '[]'::jsonb;

-- GIN index for efficient set intersection queries
-- Enables: SELECT * FROM submissions WHERE charrsids && '["ABC123", "DEF456"]'::jsonb
CREATE INDEX IF NOT EXISTS idx_submissions_charrsids 
  ON submissions USING GIN (charrsids);

-- Example cohort cross-referencing query:
-- Find all submissions that share ANY charrsid values with a given submission
--
-- SELECT s2.id, s2.student_id, s2.assignment_id,
--   (SELECT jsonb_agg(elem) FROM jsonb_array_elements_text(s1.charrsids) AS elem
--    WHERE elem IN (SELECT jsonb_array_elements_text(s2.charrsids))) AS shared_charrsids
-- FROM submissions s1
-- JOIN submissions s2 ON s1.id != s2.id
--   AND s1.charrsids && s2.charrsids  -- GIN-indexed containment check
-- WHERE s1.id = 'target-submission-id';
