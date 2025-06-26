-- 🔥 AGGIORNA CONSTRAINT PER SUPPORTARE NUOVI STATI BONUS

-- Rimuovi constraint esistenti se presenti
DO $$ 
BEGIN 
  -- Rimuovi constraint su status se esiste
  IF EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'submissions_rh847_status_check'
  ) THEN
    ALTER TABLE submissions_rh847 DROP CONSTRAINT submissions_rh847_status_check;
  END IF;
END $$;

-- Aggiungi il nuovo constraint con tutti gli stati supportati
ALTER TABLE submissions_rh847 
ADD CONSTRAINT submissions_rh847_status_check 
CHECK (status IN (
  'pending', 
  'approved', 
  'rejected', 
  'cancelled',
  'blocked',      -- 🔥 NUOVO: Admin blocca il bonus per l'utente
  'user_declined', -- 🔥 NUOVO: Utente non vuole fare il bonus
  'hidden'        -- 🔥 NUOVO: Admin nasconde il bonus per l'utente
));

-- Aggiungi commento aggiornato
COMMENT ON COLUMN submissions_rh847.status IS 'Stato della submission: pending, approved, rejected, cancelled, blocked, user_declined, hidden';

-- Verifica che il constraint sia stato applicato
SELECT constraint_name, check_clause 
FROM information_schema.check_constraints 
WHERE constraint_name = 'submissions_rh847_status_check';

-- Test dei valori esistenti
SELECT DISTINCT status, COUNT(*) as count 
FROM submissions_rh847 
GROUP BY status 
ORDER BY status;