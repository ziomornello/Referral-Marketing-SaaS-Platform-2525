-- 🔥 FIX: Rimuovi tutti i constraint esistenti e crea quello corretto

-- Rimuovi constraint esistenti se presenti
DO $$ 
BEGIN
  -- Rimuovi constraint su type se esiste
  IF EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'submissions_rh847_type_check'
  ) THEN
    ALTER TABLE submissions_rh847 DROP CONSTRAINT submissions_rh847_type_check;
  END IF;

  -- Rimuovi constraint su status se esiste
  IF EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'submissions_rh847_status_check'
  ) THEN
    ALTER TABLE submissions_rh847 DROP CONSTRAINT submissions_rh847_status_check;
  END IF;
END $$;

-- Aggiorna eventuali valori non validi esistenti
UPDATE submissions_rh847 
SET status = 'pending' 
WHERE status NOT IN ('pending', 'approved', 'rejected', 'cancelled');

UPDATE submissions_rh847 
SET type = 'completion' 
WHERE type NOT IN ('completion', 'payment', 'admin_update');

-- Aggiungi i constraint corretti
ALTER TABLE submissions_rh847 
ADD CONSTRAINT submissions_rh847_status_check 
CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled'));

ALTER TABLE submissions_rh847 
ADD CONSTRAINT submissions_rh847_type_check 
CHECK (type IN ('completion', 'payment', 'admin_update'));

-- Aggiungi commenti per documentazione
COMMENT ON COLUMN submissions_rh847.status IS 'Stato della submission: pending, approved, rejected, cancelled';
COMMENT ON COLUMN submissions_rh847.type IS 'Tipo di submission: completion, payment, admin_update';

-- Verifica che i constraint siano stati applicati
SELECT 
  constraint_name, 
  check_clause 
FROM information_schema.check_constraints 
WHERE table_name = 'submissions_rh847';