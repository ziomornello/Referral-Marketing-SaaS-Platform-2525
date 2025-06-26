-- Add is_blocked field to users table for blocking users from accessing the platform
ALTER TABLE users_rh847 
ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT false;

-- Update existing users to not be blocked by default
UPDATE users_rh847 
SET is_blocked = false 
WHERE is_blocked IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN users_rh847.is_blocked IS 'Flag to block user access to the platform (default: false)';

-- Verify the column was added correctly
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'users_rh847' AND column_name = 'is_blocked';