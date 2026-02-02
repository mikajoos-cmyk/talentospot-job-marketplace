-- Create a function to allow users to delete their own account
CREATE OR REPLACE FUNCTION delete_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  requesting_user_id uuid;
BEGIN
  -- Get the ID of the user executing the function
  requesting_user_id := auth.uid();

  -- Ensure the user is logged in
  IF requesting_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Delete the user from auth.users (this will cascade to profiles if configured, otherwise we might need to delete from profiles manually first)
  -- Deleting from auth.users requires elevated privileges usually, so this function is SECURITY DEFINER
  -- BUT we must be careful.
  -- Supabase auth.users deletion usually triggers cascade delete on public.profiles if foreign key is set up with ON DELETE CASCADE.
  
  -- Delete existing profile first to be safe/clean if no cascade
  DELETE FROM public.profiles WHERE id = requesting_user_id;

  -- Delete from auth.users
  -- NOTE: Direct deletion from auth.users via SQL function requires the function to run as a superuser or a role with appropriate permissions.
  -- In Supabase, postgres role often can do this.
  
  DELETE FROM auth.users WHERE id = requesting_user_id;
END;
$$;
