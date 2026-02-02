-- Add is_visible and show_activity_status columns to profiles table if they don't exist

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'is_visible') THEN
        ALTER TABLE public.profiles ADD COLUMN is_visible BOOLEAN DEFAULT true;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'show_activity_status') THEN
        ALTER TABLE public.profiles ADD COLUMN show_activity_status BOOLEAN DEFAULT true;
    END IF;
END $$;
