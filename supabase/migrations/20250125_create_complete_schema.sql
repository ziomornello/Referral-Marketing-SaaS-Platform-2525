-- Enable RLS
ALTER DATABASE postgres SET row_security = on;

-- Create users table
CREATE TABLE IF NOT EXISTS users_rh847 (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  role TEXT DEFAULT 'user',
  points INTEGER DEFAULT 0,
  referral_code TEXT UNIQUE,
  password_hash TEXT,
  accept_promotions BOOLEAN DEFAULT false,
  text_size TEXT DEFAULT 'normal',
  profile_image TEXT DEFAULT '',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create bonuses table with ALL required columns
CREATE TABLE IF NOT EXISTS bonuses_rh847 (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  image TEXT NOT NULL,
  description TEXT NOT NULL,
  signup_bonus NUMERIC(10,2) NOT NULL,
  referral_bonus NUMERIC(10,2) NOT NULL,
  expiry_date DATE NOT NULL,
  guide_code TEXT DEFAULT '',
  closure_code TEXT DEFAULT '',
  referral_template TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT true,
  guide_first BOOLEAN DEFAULT false,
  notes TEXT DEFAULT '',
  extra_title TEXT DEFAULT '',
  extra_description TEXT DEFAULT '',
  extra_guide_code TEXT DEFAULT '',
  extra_guide_link TEXT DEFAULT '',
  workflow_states TEXT DEFAULT '',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create rewards table
CREATE TABLE IF NOT EXISTS rewards_rh847 (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  cost INTEGER NOT NULL,
  image TEXT NOT NULL,
  isActive BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create submissions table
CREATE TABLE IF NOT EXISTS submissions_rh847 (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users_rh847(id),
  user_name TEXT NOT NULL,
  bonus_id INTEGER REFERENCES bonuses_rh847(id),
  bonus_name TEXT NOT NULL,
  type TEXT NOT NULL,
  files JSONB DEFAULT '[]',
  notes TEXT DEFAULT '',
  status TEXT DEFAULT 'pending',
  admin_notes TEXT DEFAULT '',
  submitted_at TIMESTAMP DEFAULT NOW(),
  reviewed_at TIMESTAMP DEFAULT NULL
);

-- Create chat messages table
CREATE TABLE IF NOT EXISTS chat_messages_rh847 (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users_rh847(id),
  user_name TEXT NOT NULL,
  message TEXT NOT NULL,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create app config table
CREATE TABLE IF NOT EXISTS app_config_rh847 (
  id SERIAL PRIMARY KEY,
  config_key TEXT UNIQUE NOT NULL,
  config_value BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create approved proofs table
CREATE TABLE IF NOT EXISTS approved_proofs_rh847 (
  id SERIAL PRIMARY KEY,
  bonus_id INTEGER NOT NULL,
  bonus_name TEXT NOT NULL,
  user_name TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  image_url TEXT NOT NULL,
  description TEXT NOT NULL,
  admin_notes TEXT DEFAULT '',
  is_featured BOOLEAN DEFAULT false,
  approved_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE users_rh847 ENABLE ROW LEVEL SECURITY;
ALTER TABLE bonuses_rh847 ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards_rh847 ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions_rh847 ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages_rh847 ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_config_rh847 ENABLE ROW LEVEL SECURITY;
ALTER TABLE approved_proofs_rh847 ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Allow all operations" ON users_rh847 FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON bonuses_rh847 FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON rewards_rh847 FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON submissions_rh847 FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON chat_messages_rh847 FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON app_config_rh847 FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON approved_proofs_rh847 FOR ALL USING (true) WITH CHECK (true);

-- Insert default app config
INSERT INTO app_config_rh847 (config_key, config_value) VALUES 
('points_system_enabled', true),
('rewards_enabled', true),
('chat_enabled', true)
ON CONFLICT (config_key) DO NOTHING;

-- Insert sample data
INSERT INTO bonuses_rh847 (name, image, description, signup_bonus, referral_bonus, expiry_date, guide_code, closure_code, referral_template, is_active, workflow_states) VALUES 
(
  'Revolut', 
  'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400', 
  'Banca digitale con carte gratuite e cambio valuta senza commissioni', 
  25.00, 
  15.00, 
  '2024-12-31',
  'https://guide.efallmo.it/revolut',
  'https://guide.efallmo.it/revolut-closure',
  'https://revolut.com/referral/{CODE}',
  true,
  'not_started,registration,verification,deposit_pending,deposit_received,payment,withdrawal,completed'
),
(
  'N26', 
  'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400', 
  'Conto corrente gratuito 100% digitale con carta Mastercard inclusa', 
  30.00, 
  20.00, 
  '2024-12-31',
  'https://guide.efallmo.it/n26',
  'https://guide.efallmo.it/n26-closure',
  'https://n26.com/r/{CODE}',
  true,
  'not_started,registration,verification,deposit_pending,deposit_received,payment,withdrawal,completed'
)
ON CONFLICT DO NOTHING;