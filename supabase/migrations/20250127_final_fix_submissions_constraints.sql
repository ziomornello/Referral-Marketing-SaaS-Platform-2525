-- 🔥 FINAL FIX: Elimina TUTTI i constraint e ricrea la tabella submissions con struttura corretta

-- Prima elimina tutti i constraint esistenti
DO $$ 
DECLARE
    constraint_record RECORD;
BEGIN
    -- Loop attraverso tutti i constraint della tabella submissions_rh847
    FOR constraint_record IN 
        SELECT constraint_name 
        FROM information_schema.table_constraints 
        WHERE table_name = 'submissions_rh847' 
        AND constraint_type = 'CHECK'
    LOOP
        EXECUTE 'ALTER TABLE submissions_rh847 DROP CONSTRAINT IF EXISTS ' || constraint_record.constraint_name;
    END LOOP;
END $$;

-- Elimina la tabella esistente e ricreala da zero
DROP TABLE IF EXISTS submissions_rh847 CASCADE;

-- Ricrea la tabella submissions con struttura corretta
CREATE TABLE submissions_rh847 (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users_rh847(id),
    user_name TEXT NOT NULL,
    bonus_id INTEGER REFERENCES bonuses_rh847(id),
    bonus_name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'completion',
    files JSONB DEFAULT '[]',
    notes TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'pending',
    admin_notes TEXT DEFAULT '',
    admin_created BOOLEAN DEFAULT false,
    submitted_at TIMESTAMP DEFAULT NOW(),
    reviewed_at TIMESTAMP DEFAULT NULL
);

-- Abilita RLS
ALTER TABLE submissions_rh847 ENABLE ROW LEVEL SECURITY;

-- Crea policy per accesso pubblico
CREATE POLICY "Allow all operations" ON submissions_rh847 
FOR ALL USING (true) WITH CHECK (true);

-- Aggiungi SOLO i constraint necessari senza valori specifici
ALTER TABLE submissions_rh847 
ADD CONSTRAINT submissions_rh847_status_valid 
CHECK (status IS NOT NULL AND length(status) > 0);

ALTER TABLE submissions_rh847 
ADD CONSTRAINT submissions_rh847_type_valid 
CHECK (type IS NOT NULL AND length(type) > 0);

-- Crea indici per performance
CREATE INDEX IF NOT EXISTS idx_submissions_user_id ON submissions_rh847(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_bonus_id ON submissions_rh847(bonus_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions_rh847(status);

-- Aggiungi commenti
COMMENT ON TABLE submissions_rh847 IS 'Submissions degli utenti per i bonus';
COMMENT ON COLUMN submissions_rh847.status IS 'Stato della submission (flessibile)';
COMMENT ON COLUMN submissions_rh847.type IS 'Tipo di submission (flessibile)';
COMMENT ON COLUMN submissions_rh847.admin_created IS 'Flag per indicare se creata dall admin';

-- Verifica che la tabella sia stata creata correttamente
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable 
FROM information_schema.columns 
WHERE table_name = 'submissions_rh847' 
ORDER BY ordinal_position;