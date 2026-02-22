-- ============================================================
-- IamAutom Community Platform — Initial Database Schema
-- ============================================================
-- Run this migration via Supabase SQL Editor or CLI.
-- Creates all tables, enums, RLS policies, and triggers.
-- ============================================================

-- ── ENUMS ──────────────────────────────────────────────────

CREATE TYPE plan_type_enum AS ENUM ('member', 'inner_circle', 'admin', 'none');
CREATE TYPE subscription_status_enum AS ENUM ('active', 'past_due', 'canceled', 'trialing', 'none');
CREATE TYPE user_level_enum AS ENUM ('novato', 'aprendiz', 'automatizador', 'experto', 'maestro_ia');
CREATE TYPE channel_enum AS ENUM ('general', 'proyectos', 'soporte', 'off_topic', 'inner_circle_vip');
CREATE TYPE tier_enum AS ENUM ('member', 'inner_circle');
CREATE TYPE role_enum AS ENUM ('member', 'admin');
CREATE TYPE notification_type_enum AS ENUM ('new_module', 'event_reminder', 'badge_earned', 'reply', 'announcement');


-- ── PROFILES ───────────────────────────────────────────────

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  bio TEXT,
  plan_type plan_type_enum NOT NULL DEFAULT 'none',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  subscription_status subscription_status_enum NOT NULL DEFAULT 'none',
  xp_points INTEGER NOT NULL DEFAULT 0,
  level user_level_enum NOT NULL DEFAULT 'novato',
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_active_date DATE,
  role role_enum NOT NULL DEFAULT 'member',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Everyone can read public profile fields
CREATE POLICY "Public profiles are viewable by authenticated users"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Service role can do anything (for webhooks)
CREATE POLICY "Service role full access"
  ON profiles
  TO service_role
  USING (true)
  WITH CHECK (true);


-- ── AUTO-CREATE PROFILE ON SIGNUP ──────────────────────────

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
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ── POSTS ──────────────────────────────────────────────────

CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  media_urls TEXT[],
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  is_announcement BOOLEAN NOT NULL DEFAULT false,
  channel channel_enum NOT NULL DEFAULT 'general',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Read: authenticated users can see non-VIP channels;
-- VIP channel requires inner_circle or admin
CREATE POLICY "Read posts based on channel access"
  ON posts FOR SELECT
  TO authenticated
  USING (
    channel != 'inner_circle_vip'
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.plan_type = 'inner_circle' OR profiles.plan_type = 'admin' OR profiles.role = 'admin')
    )
  );

-- Insert: active subscribers can create posts
CREATE POLICY "Active subscribers can create posts"
  ON posts FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = author_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.subscription_status = 'active' OR profiles.role = 'admin')
    )
  );

-- Update/Delete: own posts or admin
CREATE POLICY "Users can update own posts"
  ON posts FOR UPDATE
  TO authenticated
  USING (
    author_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

CREATE POLICY "Users can delete own posts"
  ON posts FOR DELETE
  TO authenticated
  USING (
    author_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );


-- ── POST REACTIONS ─────────────────────────────────────────

CREATE TABLE post_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id, emoji)
);

ALTER TABLE post_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read reactions"
  ON post_reactions FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can manage own reactions"
  ON post_reactions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reactions"
  ON post_reactions FOR DELETE TO authenticated
  USING (auth.uid() = user_id);


-- ── COMMENTS ───────────────────────────────────────────────

CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read comments"
  ON comments FOR SELECT TO authenticated USING (true);

CREATE POLICY "Active subscribers can create comments"
  ON comments FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = author_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.subscription_status = 'active' OR profiles.role = 'admin')
    )
  );

CREATE POLICY "Users can delete own comments"
  ON comments FOR DELETE TO authenticated
  USING (
    author_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );


-- ── MODULES ────────────────────────────────────────────────

CREATE TABLE modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  emoji TEXT NOT NULL DEFAULT '📦',
  order_index INTEGER NOT NULL DEFAULT 0,
  tier_required tier_enum NOT NULL DEFAULT 'member',
  is_published BOOLEAN NOT NULL DEFAULT false,
  release_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE modules ENABLE ROW LEVEL SECURITY;

-- Users can see published modules they have access to
CREATE POLICY "Users can view accessible modules"
  ON modules FOR SELECT
  TO authenticated
  USING (
    is_published = true
    AND (
      tier_required = 'member'
      OR EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND (profiles.plan_type = 'inner_circle' OR profiles.plan_type = 'admin' OR profiles.role = 'admin')
      )
    )
  );

-- Admin full CRUD
CREATE POLICY "Admin full access on modules"
  ON modules FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );


-- ── LESSONS ────────────────────────────────────────────────

CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  youtube_url TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 0,
  order_index INTEGER NOT NULL DEFAULT 0,
  attachments JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

-- Users can see lessons for modules they can access
CREATE POLICY "Users can view accessible lessons"
  ON lessons FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM modules
      WHERE modules.id = lessons.module_id
      AND modules.is_published = true
      AND (
        modules.tier_required = 'member'
        OR EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
          AND (profiles.plan_type = 'inner_circle' OR profiles.plan_type = 'admin' OR profiles.role = 'admin')
        )
      )
    )
  );

CREATE POLICY "Admin full access on lessons"
  ON lessons FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );


-- ── LESSON PROGRESS ────────────────────────────────────────

CREATE TABLE lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, lesson_id)
);

ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own progress"
  ON lesson_progress FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ── POLLS ──────────────────────────────────────────────────

CREATE TABLE polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]',
  ends_at TIMESTAMPTZ NOT NULL,
  channel TEXT NOT NULL DEFAULT 'general',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE polls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read polls"
  ON polls FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin can manage polls"
  ON polls FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );


-- ── POLL VOTES ─────────────────────────────────────────────

CREATE TABLE poll_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  option_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(poll_id, user_id)
);

ALTER TABLE poll_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read votes"
  ON poll_votes FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can cast own vote"
  ON poll_votes FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);


-- ── EVENTS ─────────────────────────────────────────────────

CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  event_date TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  tier_required tier_enum NOT NULL DEFAULT 'member',
  meeting_url TEXT,
  recording_url TEXT,
  max_spots INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view accessible events"
  ON events FOR SELECT
  TO authenticated
  USING (
    tier_required = 'member'
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.plan_type = 'inner_circle' OR profiles.plan_type = 'admin' OR profiles.role = 'admin')
    )
  );

CREATE POLICY "Admin full access on events"
  ON events FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );


-- ── EVENT REGISTRATIONS ────────────────────────────────────

CREATE TABLE event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);

ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view event registrations"
  ON event_registrations FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can register themselves"
  ON event_registrations FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unregister themselves"
  ON event_registrations FOR DELETE TO authenticated
  USING (auth.uid() = user_id);


-- ── BADGES ─────────────────────────────────────────────────

CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  emoji TEXT NOT NULL DEFAULT '🏅',
  condition_type TEXT NOT NULL,
  condition_value INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can read badges"
  ON badges FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin can manage badges"
  ON badges FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );


-- ── USER BADGES ────────────────────────────────────────────

CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can read user badges"
  ON user_badges FOR SELECT TO authenticated USING (true);

CREATE POLICY "Service role can insert badges"
  ON user_badges
  TO service_role
  USING (true)
  WITH CHECK (true);


-- ── CHAT MESSAGES ──────────────────────────────────────────

CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel TEXT NOT NULL DEFAULT 'general',
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Read: filter by channel access
CREATE POLICY "Read chat based on channel"
  ON chat_messages FOR SELECT
  TO authenticated
  USING (
    channel != 'inner_circle_vip'
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.plan_type = 'inner_circle' OR profiles.plan_type = 'admin' OR profiles.role = 'admin')
    )
  );

CREATE POLICY "Active subscribers can send messages"
  ON chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = author_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.subscription_status = 'active' OR profiles.role = 'admin')
    )
  );


-- ── NOTIFICATIONS ──────────────────────────────────────────

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type notification_type_enum NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  read BOOLEAN NOT NULL DEFAULT false,
  link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can insert notifications"
  ON notifications
  TO service_role
  USING (true)
  WITH CHECK (true);


-- ── INDEXES for performance ────────────────────────────────

CREATE INDEX idx_posts_channel ON posts(channel);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_comments_post ON comments(post_id);
CREATE INDEX idx_reactions_post ON post_reactions(post_id);
CREATE INDEX idx_lessons_module ON lessons(module_id, order_index);
CREATE INDEX idx_lesson_progress_user ON lesson_progress(user_id);
CREATE INDEX idx_chat_messages_channel ON chat_messages(channel, created_at DESC);
CREATE INDEX idx_notifications_user ON notifications(user_id, read, created_at DESC);
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_profiles_stripe ON profiles(stripe_customer_id);


-- ── ENABLE REALTIME for chat ───────────────────────────────

ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE posts;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
