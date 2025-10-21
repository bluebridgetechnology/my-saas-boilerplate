-- Script to make a user an admin
-- Run this in your Supabase SQL editor or via the CLI

-- First, check if the user exists
SELECT id, email, is_admin FROM users WHERE email = 'kolawole365@gmail.com';

-- If the user exists, make them an admin
UPDATE users 
SET 
  is_admin = true,
  role = 'admin',
  admin_permissions = '["all"]'::jsonb
WHERE email = 'kolawole365@gmail.com';

-- If the user doesn't exist, create them as an admin
-- (This would typically happen after they sign up normally)
INSERT INTO users (email, is_admin, role, admin_permissions, name)
VALUES (
  'kolawole365@gmail.com',
  true,
  'admin',
  '["all"]'::jsonb,
  'Admin User'
)
ON CONFLICT (email) DO UPDATE SET
  is_admin = true,
  role = 'admin',
  admin_permissions = '["all"]'::jsonb;

-- Verify the change
SELECT id, email, is_admin, role, admin_permissions FROM users WHERE email = 'kolawole365@gmail.com';
