-- Add missing subscription_expires_at column to users table
-- Migration: 004_add_subscription_expires_at.sql

-- Add subscription_expires_at column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP WITH TIME ZONE;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_users_subscription_expires_at ON users(subscription_expires_at);

-- Update RLS policies to include the new column (no changes needed as it's just a column addition)
