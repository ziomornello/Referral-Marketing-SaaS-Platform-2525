-- Add category and related_bonus_id to chat messages for categorized chat
ALTER TABLE chat_messages_rh847 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general',
ADD COLUMN IF NOT EXISTS related_bonus_id INTEGER REFERENCES bonuses_rh847(id);

-- Update existing messages to have 'general' category
UPDATE chat_messages_rh847 
SET category = 'general' 
WHERE category IS NULL;

-- Add comment
COMMENT ON COLUMN chat_messages_rh847.category IS 'Categoria del messaggio (general o ID bonus)';
COMMENT ON COLUMN chat_messages_rh847.related_bonus_id IS 'ID del bonus correlato al messaggio (se applicabile)';