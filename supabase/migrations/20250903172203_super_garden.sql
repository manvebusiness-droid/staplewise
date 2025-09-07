/*
  # Fix User Registration RLS Policy

  1. Security Changes
    - Drop existing restrictive RLS policies on users table
    - Add proper policy for user registration that works with Supabase Auth
    - Allow users to insert their own profile during registration
    - Maintain security by ensuring users can only manage their own data

  This fixes the "new row violates row-level security policy" error during registration.
*/

-- Drop existing policies that might be too restrictive
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

-- Create new policies that work with Supabase Auth registration flow
CREATE POLICY "Enable read access for users to their own data" 
  ON users FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Enable insert for authenticated users during registration" 
  ON users FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable update for users to their own data" 
  ON users FOR UPDATE 
  USING (auth.uid() = id) 
  WITH CHECK (auth.uid() = id);

-- Also ensure admin users can read all user data for dashboard
CREATE POLICY "Enable admin read access to all users" 
  ON users FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'ADMIN'
    )
  );

-- Grant necessary permissions
GRANT ALL ON users TO authenticated;
GRANT SELECT ON users TO anon;