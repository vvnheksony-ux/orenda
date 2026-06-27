-- Add thumbs feedback to chat messages
ALTER TABLE public.ai_chat_messages
  ADD COLUMN IF NOT EXISTS thumbs text CHECK (thumbs IN ('up', 'down'));
