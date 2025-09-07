/*
  # Add User Insert Policy

  1. Security
    - Add policy for authenticated users to insert their own profile data into users table
    - This allows user registration to work properly with Supabase Auth

  This policy ensures that users can create their own profile record during registration,
  where the user's auth.uid() matches the id being inserted.
*/

-- Add RLS policy to allow users to insert their own profile
CREATE POLICY "Users can insert own profile" 
  ON users 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);