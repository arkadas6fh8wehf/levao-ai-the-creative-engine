-- Enable required extensions for cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create function to delete old conversations
CREATE OR REPLACE FUNCTION public.delete_old_conversations()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete messages from conversations older than 1 month
  DELETE FROM public.messages
  WHERE conversation_id IN (
    SELECT id FROM public.conversations
    WHERE updated_at < NOW() - INTERVAL '1 month'
  );
  
  -- Delete conversations older than 1 month
  DELETE FROM public.conversations
  WHERE updated_at < NOW() - INTERVAL '1 month';
END;
$$;

-- Schedule the cleanup to run daily at midnight UTC
SELECT cron.schedule(
  'cleanup-old-conversations',
  '0 0 * * *',
  'SELECT public.delete_old_conversations()'
);