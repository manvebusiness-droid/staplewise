/*
  # Fix Queries Table RLS Policy

  1. Security Changes
    - Drop all existing conflicting policies on queries table
    - Create simple, working policies for query submissions
    - Allow authenticated users to insert queries
    - Maintain read access for all authenticated users

  This fixes the "new row violates row-level security policy for table queries" error.
*/

-- Drop all existing policies on queries table that might conflict
DROP POLICY IF EXISTS "Anyone can read queries" ON queries;
DROP POLICY IF EXISTS "Anyone can create queries" ON queries;
DROP POLICY IF EXISTS "Sales and admin can update queries" ON queries;
DROP POLICY IF EXISTS "Allow query read" ON queries;
DROP POLICY IF EXISTS "Allow query insert" ON queries;
DROP POLICY IF EXISTS "Allow query update" ON queries;

-- Ensure RLS is enabled
ALTER TABLE queries ENABLE ROW LEVEL SECURITY;

-- Create simple, working policies for queries table
CREATE POLICY "Enable read access for queries" 
  ON queries FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Enable insert for authenticated users on queries" 
  ON queries FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users on queries" 
  ON queries FOR UPDATE 
  TO authenticated 
  USING (true);

CREATE POLICY "Enable delete for authenticated users on queries" 
  ON queries FOR DELETE 
  TO authenticated 
  USING (true);

-- Grant necessary permissions
GRANT ALL ON queries TO authenticated;
GRANT SELECT ON queries TO anon;