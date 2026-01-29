/*
  # Fix Message Read Status and Blocking

  ## Changes
  1. Add helper function to check if users are blocked (bidirectional)
  2. Add RLS policies to prevent blocked users from messaging each other
  3. Ensure messages table has proper is_read column
  4. Add policy for users to view blocks where they are blocked (for UI)

  ## Purpose
  - Fix message read status tracking
  - Prevent blocked users from sending messages
  - Allow both users to see block status
*/

-- Ensure messages table has is_read column
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'messages' AND column_name = 'is_read') THEN
    ALTER TABLE messages ADD COLUMN is_read BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Add policy for users to see blocks where they are the blocked party
-- This allows UI to show "You are blocked" message
DROP POLICY IF EXISTS "Users can view blocks where they are blocked" ON user_blocks;
CREATE POLICY "Users can view blocks where they are blocked"
  ON user_blocks FOR SELECT
  USING (auth.uid() = blocked_id OR auth.uid() = blocker_id);

-- Add policy to allow deletion (for unblocking)
DROP POLICY IF EXISTS "Users can delete their own blocks" ON user_blocks;
CREATE POLICY "Users can delete their own blocks"
  ON user_blocks FOR DELETE
  USING (auth.uid() = blocker_id);

-- Create function to check if users are blocked (bidirectional)
CREATE OR REPLACE FUNCTION are_users_blocked(user1_id UUID, user2_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_blocks
    WHERE (blocker_id = user1_id AND blocked_id = user2_id)
       OR (blocker_id = user2_id AND blocked_id = user1_id)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add RLS policy to prevent blocked users from sending messages
-- This needs to be added to the messages table
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can send messages if not blocked" ON messages;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can insert messages" ON messages;

-- Users can only send messages if they're not blocked
CREATE POLICY "Users can send messages if not blocked"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND NOT are_users_blocked(
      sender_id,
      (SELECT CASE
        WHEN c.participant_1 = sender_id THEN c.participant_2
        ELSE c.participant_1
      END
      FROM conversations c
      WHERE c.id = conversation_id)
    )
  );

-- Users can view messages in conversations they're part of
CREATE POLICY "Users can view messages in their conversations"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_id
        AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
    )
  );

-- Users can update read status of messages sent to them
DROP POLICY IF EXISTS "Users can update message read status" ON messages;
CREATE POLICY "Users can update message read status"
  ON messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_id
        AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
        AND sender_id != auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_id
        AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
        AND sender_id != auth.uid()
    )
  );
