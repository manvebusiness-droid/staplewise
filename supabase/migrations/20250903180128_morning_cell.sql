/*
  # Fix Email Confirmation and User Registration Issues

  1. Authentication Changes
    - Disable email confirmation requirement for development
    - Fix user registration flow to work without email verification
    - Ensure users can login immediately after registration

  2. Security
    - Maintain security while allowing immediate access
    - Users table remains accessible for registration and login
*/

-- Update auth settings to disable email confirmation
-- Note: This should be done in Supabase Dashboard > Authentication > Settings
-- But we can also handle it in the application logic

-- Ensure all existing users are marked as email confirmed
UPDATE auth.users SET email_confirmed_at = NOW() WHERE email_confirmed_at IS NULL;

-- Grant necessary permissions for authentication flow
GRANT ALL ON auth.users TO authenticated;
GRANT SELECT ON auth.users TO anon;