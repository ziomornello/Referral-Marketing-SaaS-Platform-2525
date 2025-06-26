-- 🔥 FIX DEFINITIVO: Rimuovi TUTTI i constraint e ricrea correttamente

-- Disabilita temporaneamente RLS per permettere modifiche
ALTER TABLE submissions_rh847 DISABLE ROW LEVEL SECURITY;

-- 1. Rimuovi TUTTI i constraint check esistenti sulla tabella submissions
DO $$ 
DECLARE
    constraint_rec RECORD;
BEGIN
    -- Trova tutti i constraint check sulla tabella submissions_rh847
    FOR constraint_rec IN 
        SELECT constraint_name 
        FROM information_schema.table_constraints 
        WHERE table_name = 'submissions_rh847' 
        AND constraint_type = 'CHECK'
    LOOP
        EXECUTE format('ALTER TABLE submissions_rh847 DROP CONSTRAINT IF EXISTS %I', constraint_rec.constraint_name);
        RAISE NOTICE 'Dropped constraint: %', constraint_rec.constraint_name;
    END LOOP;
END $$;

-- 2. Aggiorna tutti i valori esistenti per essere sicuri che siano validi
UPDATE submissions_rh847 
SET status = CASE 
    WHEN status IN ('pending', 'approved', 'rejected', 'cancelled') THEN status 
    ELSE 'pending' 
END;

UPDATE submissions_rh847 
SET type = CASE 
    WHEN type IN ('completion', 'payment', 'admin_update') THEN type 
    ELSE 'completion' 
END;

-- 3. Aggiungi i constraint corretti con nomi espliciti
ALTER TABLE submissions_rh847 
ADD CONSTRAINT chk_submissions_status 
CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled'));

ALTER TABLE submissions_rh847 
ADD CONSTRAINT chk_submissions_type 
CHECK (type IN ('completion', 'payment', 'admin_update'));

-- 4. Riabilita RLS
ALTER TABLE submissions_rh847 ENABLE ROW LEVEL SECURITY;

-- 5. Aggiungi commenti
COMMENT ON COLUMN submissions_rh847.status IS 'Status: pending, approved, rejected, cancelled';
COMMENT ON COLUMN submissions_rh847.type IS 'Type: completion, payment, admin_update';

-- 6. Verifica che i constraint siano stati applicati
SELECT 
    constraint_name, 
    check_clause, 
    is_deferrable, 
    initially_deferred 
FROM information_schema.check_constraints 
WHERE table_name = 'submissions_rh847'
ORDER BY constraint_name;

-- 7. Test dei valori
SELECT DISTINCT status, COUNT(*) as count 
FROM submissions_rh847 
GROUP BY status;

SELECT DISTINCT type, COUNT(*) as count 
FROM submissions_rh847 
GROUP BY type;