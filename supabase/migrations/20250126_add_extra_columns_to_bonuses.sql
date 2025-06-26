-- Add missing extra columns to bonuses table
ALTER TABLE bonuses_rh847 
ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS extra_title TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS extra_description TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS extra_guide_code TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS extra_guide_link TEXT DEFAULT '';

-- Update existing records to have empty strings instead of null
UPDATE bonuses_rh847 
SET 
  notes = COALESCE(notes, ''),
  extra_title = COALESCE(extra_title, ''),
  extra_description = COALESCE(extra_description, ''),
  extra_guide_code = COALESCE(extra_guide_code, ''),
  extra_guide_link = COALESCE(extra_guide_link, '')
WHERE 
  notes IS NULL 
  OR extra_title IS NULL 
  OR extra_description IS NULL 
  OR extra_guide_code IS NULL 
  OR extra_guide_link IS NULL;

-- Add comment to table
COMMENT ON COLUMN bonuses_rh847.notes IS 'Note aggiuntive per il bonus (opzionale)';
COMMENT ON COLUMN bonuses_rh847.extra_title IS 'Titolo per sezione bonus extra (opzionale)';
COMMENT ON COLUMN bonuses_rh847.extra_description IS 'Descrizione per sezione bonus extra (opzionale)';
COMMENT ON COLUMN bonuses_rh847.extra_guide_code IS 'Link guida per bonus extra (opzionale)';
COMMENT ON COLUMN bonuses_rh847.extra_guide_link IS 'Link diretto per bonus extra (opzionale)';