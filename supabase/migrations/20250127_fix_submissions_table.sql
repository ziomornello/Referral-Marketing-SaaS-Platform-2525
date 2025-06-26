-- Add admin_created column to submissions table
ALTER TABLE submissions_rh847 
ADD COLUMN IF NOT EXISTS admin_created BOOLEAN DEFAULT false;

-- Add comment
COMMENT ON COLUMN submissions_rh847.admin_created IS 'Flag per indicare se la submission è stata creata dall\'admin';

-- Update existing records to have admin_created = false by default
UPDATE submissions_rh847 
SET admin_created = false 
WHERE admin_created IS NULL;