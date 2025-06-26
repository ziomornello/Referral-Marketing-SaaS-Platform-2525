-- 🔥 FIX DEFINITIVO: Aggiungi colonna admin_created se mancante

-- Verifica se la colonna admin_created esiste e la aggiunge se mancante
DO $$ 
BEGIN
    -- Controlla se la colonna admin_created esiste
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'submissions_rh847' 
        AND column_name = 'admin_created'
    ) THEN
        -- Aggiungi la colonna se non esiste
        ALTER TABLE submissions_rh847 
        ADD COLUMN admin_created BOOLEAN DEFAULT false;
        
        RAISE NOTICE 'Colonna admin_created aggiunta alla tabella submissions_rh847';
    ELSE
        RAISE NOTICE 'Colonna admin_created già presente nella tabella submissions_rh847';
    END IF;
    
    -- Assicurati che tutti i record esistenti abbiano admin_created = false
    UPDATE submissions_rh847 
    SET admin_created = false 
    WHERE admin_created IS NULL;
    
    RAISE NOTICE 'Aggiornati tutti i record con admin_created = false dove era NULL';
END $$;

-- Aggiungi commento per documentazione
COMMENT ON COLUMN submissions_rh847.admin_created IS 'Flag per indicare se la submission è stata creata dall''amministratore (default: false)';

-- Verifica che la colonna sia stata aggiunta correttamente
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default 
FROM information_schema.columns 
WHERE table_name = 'submissions_rh847' 
AND column_name = 'admin_created';

-- Mostra la struttura completa della tabella per debug
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default 
FROM information_schema.columns 
WHERE table_name = 'submissions_rh847' 
ORDER BY ordinal_position;