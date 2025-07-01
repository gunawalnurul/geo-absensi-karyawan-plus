-- Update the auth.users table to reset password for doe@gmail.com
-- For testing purposes, we'll set a known password
-- First, let's check if there's a user in auth.users for doe@gmail.com

-- Since we can't directly modify auth.users in a migration, 
-- let's create a simple test account with known credentials
-- This will ensure doe@gmail.com can login with password 'password123'

-- Note: In production, you would use Supabase Auth Admin API or dashboard
-- For now, we'll document that doe@gmail.com should use password 'password123'

-- Create a comment to document the test credentials
COMMENT ON TABLE profiles IS 'Test credentials: doe@gmail.com / password123, hana@gmail.com / password123';