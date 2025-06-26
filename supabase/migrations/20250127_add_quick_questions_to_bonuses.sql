-- Add quick_questions column to bonuses table for storing chat quick questions
ALTER TABLE bonuses_rh847 
ADD COLUMN IF NOT EXISTS quick_questions TEXT DEFAULT '';

-- Update existing records
UPDATE bonuses_rh847 
SET quick_questions = '' 
WHERE quick_questions IS NULL;

-- Add comment
COMMENT ON COLUMN bonuses_rh847.quick_questions IS 'Domande rapide per la chat in formato JSON';