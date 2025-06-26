-- 🔥 FIX DEFINITIVO: Aggiungi colonna admin_created se mancante e forza refresh schema

-- Step 1: Verifica e aggiungi la colonna se non esiste
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
    ALTER TABLE submissions_rh847 ADD COLUMN admin_created BOOLEAN DEFAULT false;
    RAISE NOTICE 'Colonna admin_created aggiunta alla tabella submissions_rh847';
  ELSE
    RAISE NOTICE 'Colonna admin_created già presente nella tabella submissions_rh847';
  END IF;
END $$;

-- Step 2: Assicurati che tutti i record esistenti abbiano admin_created = false
UPDATE submissions_rh847 
SET admin_created = false 
WHERE admin_created IS NULL;

-- Step 3: Aggiungi constraint per assicurarsi che non sia NULL
ALTER TABLE submissions_rh847 
ALTER COLUMN admin_created SET NOT NULL;

-- Step 4: Aggiungi default constraint
ALTER TABLE submissions_rh847 
ALTER COLUMN admin_created SET DEFAULT false;

-- Step 5: Forza refresh dello schema cache
-- Disabilita e riabilita RLS per forzare refresh
ALTER TABLE submissions_rh847 DISABLE ROW LEVEL SECURITY;
ALTER TABLE submissions_rh847 ENABLE ROW LEVEL SECURITY;

-- Step 6: Ricrea le policy per forzare refresh
DROP POLICY IF EXISTS "Allow all operations" ON submissions_rh847;
CREATE POLICY "Allow all operations" ON submissions_rh847 
FOR ALL USING (true) WITH CHECK (true);

-- Step 7: Aggiungi commento per documentazione
COMMENT ON COLUMN submissions_rh847.admin_created IS 'Flag per indicare se la submission è stata creata dall''amministratore (default: false)';

-- Step 8: Verifica finale della struttura
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'submissions_rh847' 
ORDER BY ordinal_position;

-- Step 9: Test di inserimento per verificare che funzioni
INSERT INTO submissions_rh847 (
  user_id, 
  user_name, 
  bonus_id, 
  bonus_name, 
  type, 
  status,
  admin_created
) VALUES (
  1, 
  'Test User', 
  1, 
  'Test Bonus', 
  'admin_update', 
  'user_declined',
  true
) ON CONFLICT DO NOTHING;

-- Rimuovi il record di test
DELETE FROM submissions_rh847 
WHERE user_name = 'Test User' AND bonus_name = 'Test Bonus';

-- Messaggio finale
DO $$
BEGIN
  RAISE NOTICE '✅ Migrazione completata: colonna admin_created aggiunta e schema refreshed';
END $$;