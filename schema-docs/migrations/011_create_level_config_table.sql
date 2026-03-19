-- Fix level_config data to match user_level_enum values
-- The table existed but had level_name values that didn't match user_level_enum,
-- causing cast errors in award_xp() when doing v_new_level_name::user_level_enum

-- Create table if it doesn't exist (matches existing schema)
CREATE TABLE IF NOT EXISTS public.level_config (
  level_number INT NOT NULL UNIQUE,
  level_name TEXT NOT NULL UNIQUE,
  min_xp INT NOT NULL,
  color_hex TEXT NOT NULL,
  icon TEXT NOT NULL
);

-- Clear old data and seed with values matching user_level_enum
DELETE FROM level_config;

INSERT INTO level_config (level_number, level_name, min_xp, color_hex, icon) VALUES
  (1, 'novato',          0,    '#9CA3AF', '🌱'),
  (2, 'aprendiz',        100,  '#60A5FA', '📚'),
  (3, 'automatizador',   300,  '#34D399', '⚡'),
  (4, 'experto',         700,  '#A78BFA', '🧠'),
  (5, 'maestro_ia',      1500, '#F59E0B', '👑');

-- Enable RLS (idempotent)
ALTER TABLE level_config ENABLE ROW LEVEL SECURITY;

-- Read policy for authenticated users (skip if policies already exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'level_config' AND policyname = 'Anyone can read level_config'
  ) THEN
    CREATE POLICY "Anyone can read level_config"
      ON level_config FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;
