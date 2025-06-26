-- 🔥 MIGRAZIONE DEFINITIVA PER AGGIUNGERE COLONNE EXTRA AI BONUS

-- Verifica se le colonne esistono e le aggiunge se mancanti
DO $$ 
BEGIN
    -- Aggiungi colonna notes se non esiste
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bonuses_rh847' AND column_name = 'notes'
    ) THEN
        ALTER TABLE bonuses_rh847 ADD COLUMN notes TEXT DEFAULT '';
    END IF;

    -- Aggiungi colonna extra_title se non esiste
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bonuses_rh847' AND column_name = 'extra_title'
    ) THEN
        ALTER TABLE bonuses_rh847 ADD COLUMN extra_title TEXT DEFAULT '';
    END IF;

    -- Aggiungi colonna extra_description se non esiste
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bonuses_rh847' AND column_name = 'extra_description'
    ) THEN
        ALTER TABLE bonuses_rh847 ADD COLUMN extra_description TEXT DEFAULT '';
    END IF;

    -- Aggiungi colonna extra_guide_code se non esiste
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bonuses_rh847' AND column_name = 'extra_guide_code'
    ) THEN
        ALTER TABLE bonuses_rh847 ADD COLUMN extra_guide_code TEXT DEFAULT '';
    END IF;

    -- Aggiungi colonna extra_guide_link se non esiste
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bonuses_rh847' AND column_name = 'extra_guide_link'
    ) THEN
        ALTER TABLE bonuses_rh847 ADD COLUMN extra_guide_link TEXT DEFAULT '';
    END IF;
END $$;

-- Aggiorna i record esistenti per assicurarsi che non abbiano valori NULL
UPDATE bonuses_rh847 
SET 
    notes = COALESCE(notes, ''),
    extra_title = COALESCE(extra_title, ''),
    extra_description = COALESCE(extra_description, ''),
    extra_guide_code = COALESCE(extra_guide_code, ''),
    extra_guide_link = COALESCE(extra_guide_link, '')
WHERE 
    notes IS NULL OR 
    extra_title IS NULL OR 
    extra_description IS NULL OR 
    extra_guide_code IS NULL OR 
    extra_guide_link IS NULL;

-- Aggiungi commenti alla tabella per documentazione
COMMENT ON COLUMN bonuses_rh847.notes IS 'Note aggiuntive per il bonus (opzionale)';
COMMENT ON COLUMN bonuses_rh847.extra_title IS 'Titolo per sezione bonus extra (opzionale)';
COMMENT ON COLUMN bonuses_rh847.extra_description IS 'Descrizione per sezione bonus extra (opzionale)';
COMMENT ON COLUMN bonuses_rh847.extra_guide_code IS 'Link guida per bonus extra (opzionale)';
COMMENT ON COLUMN bonuses_rh847.extra_guide_link IS 'Link diretto per bonus extra (opzionale)';

-- Verifica che le colonne siano state aggiunte correttamente
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'bonuses_rh847' 
AND column_name IN ('notes', 'extra_title', 'extra_description', 'extra_guide_code', 'extra_guide_link')
ORDER BY ordinal_position;