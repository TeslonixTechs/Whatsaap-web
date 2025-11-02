-- Enable RLS on assistants and allow users to manage their own rows
-- Safe to run multiple times; enabling RLS is idempotent
ALTER TABLE IF EXISTS public.assistants ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own assistants
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'assistants' 
      AND policyname = 'assistants_select_own'
  ) THEN
    CREATE POLICY "assistants_select_own"
    ON public.assistants
    FOR SELECT
    USING (user_id = auth.uid());
  END IF;
END $$;

-- Allow users to insert assistants for themselves
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'assistants' 
      AND policyname = 'assistants_insert_own'
  ) THEN
    CREATE POLICY "assistants_insert_own"
    ON public.assistants
    FOR INSERT
    WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

-- Optionally allow updates/deletes on own rows (helps future edits)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'assistants' 
      AND policyname = 'assistants_update_own'
  ) THEN
    CREATE POLICY "assistants_update_own"
    ON public.assistants
    FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'assistants' 
      AND policyname = 'assistants_delete_own'
  ) THEN
    CREATE POLICY "assistants_delete_own"
    ON public.assistants
    FOR DELETE
    USING (user_id = auth.uid());
  END IF;
END $$;