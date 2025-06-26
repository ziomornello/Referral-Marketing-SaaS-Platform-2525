-- 🔥 FIX: Aggiorna il constraint della colonna type per permettere i valori corretti

-- Prima rimuovi il constraint esistente se esiste
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'submissions_rh847_type_check'
    ) THEN
        ALTER TABLE submissions_rh847 DROP CONSTRAINT submissions_rh847_type_check;
    END IF;
END $$;

-- Aggiungi il nuovo constraint con tutti i valori validi
ALTER TABLE submissions_rh847 ADD CONSTRAINT submissions_rh847_type_check 
CHECK (type IN ('completion', 'payment', 'admin_update', 'cancelled'));

-- Aggiorna eventuali record esistenti con tipo non valido
UPDATE submissions_rh847 
SET type = 'completion' 
WHERE type NOT IN ('completion', 'payment', 'admin_update', 'cancelled');

-- Aggiungi commento per documentazione
COMMENT ON COLUMN submissions_rh847.type IS 'Tipo di submission: completion (prova completamento), payment (prova pagamento), admin_update (aggiornamento admin), cancelled (annullato)';

-- Verifica che il constraint sia stato applicato correttamente
SELECT constraint_name, check_clause 
FROM information_schema.check_constraints 
WHERE constraint_name = 'submissions_rh847_type_check';