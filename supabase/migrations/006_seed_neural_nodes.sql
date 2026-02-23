-- ============================================================
-- 006: Seed Neural Network Nodes (Badges)
-- ============================================================

-- Clear legacy badges (Cascade deletes user_badges as well)
TRUNCATE TABLE badges CASCADE;

-- Insert the new 5 Core Neural Nodes
INSERT INTO badges (name, description, emoji, condition_type, condition_value) VALUES
  ('Hello World', 'Iniciaste el sistema con tu primera publicación', '🌐', 'posts_count', 1),
  ('Data Miner', 'Aportaste valor masivo: 50 reacciones recibidas', '⛏️', 'reactions_received', 50),
  ('Algoritmo Desplegado', 'Compilaste tu conocimiento: 1 módulo completado', '🚀', 'modules_completed', 1),
  ('Alta Disponibilidad', 'Servidor estable: 7 días de Uptime (Racha)', '🔥', 'streak_days', 7),
  ('Arquitecto Local', 'Alcanzaste 1,000 Sinapsis en tu red', '🧠', 'xp_total', 1000)
ON CONFLICT DO NOTHING;
