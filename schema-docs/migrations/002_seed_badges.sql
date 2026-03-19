-- ============================================================
-- 002: Seed achievement badges
-- Run in Supabase Dashboard → SQL Editor
-- ============================================================

INSERT INTO badges (name, description, emoji, condition_type, condition_value) VALUES
  -- Post milestones
  ('Primera Publicación', 'Publicaste tu primer post en la comunidad', '✍️', 'posts_count', 1),
  ('Creador Activo', 'Publicaste 10 posts en la comunidad', '📝', 'posts_count', 10),

  -- Comment milestones
  ('Comentarista', 'Dejaste 10 comentarios en posts', '💬', 'comments_count', 10),
  ('Conversador', 'Dejaste 50 comentarios en posts', '🗣️', 'comments_count', 50),

  -- Reaction milestones
  ('Popular', 'Recibiste 50 reacciones en tus posts', '🔥', 'reactions_received', 50),

  -- Module milestones
  ('Primer Módulo', 'Completaste tu primer módulo', '📚', 'modules_completed', 1),
  ('Sabio', 'Completaste 5 módulos', '🎓', 'modules_completed', 5),

  -- Streak milestones
  ('Racha 7 Días', 'Mantuviste una racha de 7 días seguidos', '🔥', 'streak_days', 7),
  ('Racha 30 Días', 'Mantuviste una racha de 30 días seguidos', '⚡', 'streak_days', 30),

  -- XP milestones
  ('Centenario', 'Alcanzaste 1.000 XP', '💎', 'xp_total', 1000),
  ('Élite', 'Alcanzaste 5.000 XP', '🏆', 'xp_total', 5000),

  -- Special
  ('Inner Circle', 'Te uniste al Inner Circle', '👑', 'plan_type', 1)
ON CONFLICT DO NOTHING;
