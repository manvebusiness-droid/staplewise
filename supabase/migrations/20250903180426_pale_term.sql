/*
  # Completely Disable Email Confirmation for Development

  1. Authentication Changes
    - Mark all existing auth users as email confirmed
    - Update any users that might not be confirmed
    - Ensure registration works without email confirmation

  This fixes the "Email not confirmed" error during login.
*/

-- Mark all existing auth users as email confirmed
UPDATE auth.users 
SET email_confirmed_at = COALESCE(email_confirmed_at, NOW())
WHERE email_confirmed_at IS NULL;

-- Also update any users that might have been created recently
UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL OR email_confirmed_at < created_at;

-- Ensure the users table has proper permissions
GRANT ALL ON users TO authenticated;
GRANT ALL ON users TO anon;

-- Add a function to auto-confirm emails (for development)
CREATE OR REPLACE FUNCTION auto_confirm_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-confirm email for new users in development
  NEW.email_confirmed_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-confirm new users
DROP TRIGGER IF EXISTS auto_confirm_user_trigger ON auth.users;
CREATE TRIGGER auto_confirm_user_trigger
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION auto_confirm_user();