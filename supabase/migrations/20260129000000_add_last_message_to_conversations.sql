/*
  # Add last message tracking to conversations

  ## Changes
  - Add last_message_content column to conversations table
  - Add last_message_at column to conversations table (if not exists)
  - Create trigger to automatically update these fields when new messages are sent
  - Populate existing conversations with their last message data

  ## Purpose
  This ensures the message preview in the conversations list shows the correct
  last message content and timestamp.
*/

-- Add columns if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'conversations' AND column_name = 'last_message_content') THEN
    ALTER TABLE conversations ADD COLUMN last_message_content TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'conversations' AND column_name = 'last_message_at') THEN
    ALTER TABLE conversations ADD COLUMN last_message_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- Create or replace function to update conversation on new message
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET
    last_message_content = NEW.content,
    last_message_at = NEW.sent_at
  WHERE id = NEW.conversation_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS trigger_update_conversation_last_message ON messages;

-- Create trigger that fires after INSERT on messages
CREATE TRIGGER trigger_update_conversation_last_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_last_message();

-- Populate existing conversations with their last message
UPDATE conversations c
SET
  last_message_content = m.content,
  last_message_at = m.sent_at
FROM (
  SELECT DISTINCT ON (conversation_id)
    conversation_id,
    content,
    sent_at
  FROM messages
  ORDER BY conversation_id, sent_at DESC
) m
WHERE c.id = m.conversation_id
  AND (c.last_message_content IS NULL OR c.last_message_at IS NULL OR c.last_message_at < m.sent_at);
