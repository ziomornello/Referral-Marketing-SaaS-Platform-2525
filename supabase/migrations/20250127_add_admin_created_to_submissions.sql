-- Add admin_created column to submissions table
ALTER TABLE submissions_rh847 
ADD COLUMN IF NOT EXISTS admin_created BOOLEAN DEFAULT false;

-- Update existing records
UPDATE submissions_rh847 
SET admin_created = false 
WHERE admin_created IS NULL;

-- Add comment
COMMENT ON COLUMN submissions_rh847.admin_created IS 'Flag che indica se la submission è stata creata dall''amministratore';