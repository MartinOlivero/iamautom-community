-- ============================================================
-- Development Seed Data
-- Run this in Supabase SQL Editor to populate test data
-- ============================================================

-- First, create a profile for any existing auth user that doesn't have one
INSERT INTO profiles (id, full_name, role, plan_type, subscription_status, xp_points)
SELECT 
  id,
  COALESCE(raw_user_meta_data ->> 'full_name', 'Usuario Admin'),
  'admin',
  'admin',
  'active',
  1000
FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles);

-- Create a sample module
INSERT INTO modules (id, title, description, emoji, order_index, tier_required, is_published)
VALUES 
  (gen_random_uuid(), 'Introducción a la Automatización', 'Aprende los fundamentos de la automatización con IA', '🤖', 1, 'member', true),
  (gen_random_uuid(), 'Make.com Masterclass', 'Domina Make.com de principio a fin', '⚡', 2, 'member', true),
  (gen_random_uuid(), 'IA Avanzada', 'Técnicas avanzadas de Inteligencia Artificial', '🧠', 3, 'inner_circle', true);

-- Create sample lessons for the first module
INSERT INTO lessons (module_id, title, description, youtube_url, duration_minutes, order_index)
SELECT 
  m.id,
  'Bienvenida al curso',
  'Introducción y objetivos del curso',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  10,
  1
FROM modules m WHERE m.title = 'Introducción a la Automatización';

INSERT INTO lessons (module_id, title, description, youtube_url, duration_minutes, order_index)
SELECT 
  m.id,
  'Configuración inicial',
  'Prepara tu entorno de trabajo',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  15,
  2
FROM modules m WHERE m.title = 'Introducción a la Automatización';

-- Create sample posts
INSERT INTO posts (author_id, content, channel)
SELECT 
  p.id,
  '¡Hola comunidad! Bienvenidos a IamAutom. Este es un espacio para aprender y compartir sobre automatización e IA.',
  'general'
FROM profiles p
LIMIT 1;

-- Create sample events
INSERT INTO events (title, description, event_date, duration_minutes, tier_required, meeting_url)
VALUES 
  ('Sesión de Q&A', 'Preguntas y respuestas sobre automatización', NOW() + INTERVAL '7 days', 60, 'member', 'https://zoom.us/example'),
  ('Workshop Inner Circle', 'Taller exclusivo para miembros Inner Circle', NOW() + INTERVAL '14 days', 90, 'inner_circle', 'https://zoom.us/example');
