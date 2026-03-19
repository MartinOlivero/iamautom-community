-- Fix handle_new_user trigger: use Insforge's `profile` column
-- instead of Supabase's `raw_user_meta_data` (which doesn't exist in Insforge).
-- This ensures Google sign-up correctly imports avatar_url and full_name.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.profile ->> 'name', NEW.profile ->> 'full_name', ''),
    NEW.profile ->> 'avatar_url'
  );
  RETURN NEW;
END;
$$;

-- Backfill existing users who registered via Google but got empty profiles
UPDATE public.profiles p
SET
  full_name = COALESCE(u.profile->>'name', u.profile->>'full_name', p.full_name),
  avatar_url = COALESCE(p.avatar_url, u.profile->>'avatar_url')
FROM auth.users u
WHERE u.id = p.id
  AND (p.avatar_url IS NULL OR p.full_name = '')
  AND u.profile->>'avatar_url' IS NOT NULL;
