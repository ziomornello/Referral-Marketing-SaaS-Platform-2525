-- Create user notifications table
CREATE TABLE IF NOT EXISTS user_notifications_rh847 (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users_rh847(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP DEFAULT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_notifications_rh847 ENABLE ROW LEVEL SECURITY;

-- Create policy for public access
CREATE POLICY "Allow all operations" ON user_notifications_rh847 
FOR ALL USING (true) WITH CHECK (true);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON user_notifications_rh847(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_is_read ON user_notifications_rh847(is_read);
CREATE INDEX IF NOT EXISTS idx_user_notifications_created_at ON user_notifications_rh847(created_at);

-- Add comment
COMMENT ON TABLE user_notifications_rh847 IS 'Notifiche per gli utenti del sistema';