-- Add last_seen column to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS last_seen TIMESTAMPTZ DEFAULT now();

-- Update last_seen on profile updates if needed (optional, but good for consistency)
-- For now, we will update it from the frontend as requested.
