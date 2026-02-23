-- ============================================================
-- IamAutom Community Platform — Migration 005
-- Gamification Engine (The Automation Neural Network)
-- ============================================================

-- ── 1. GAMIFICATION EVENTS ──────────────────────────────────
-- Table to track all synapse-awarding events (e.g. daily ping, post created)
CREATE TABLE IF NOT EXISTS gamification_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL, -- e.g., 'daily_uptime', 'post_creation', 'lesson_completion'
    synapse_amount INTEGER NOT NULL DEFAULT 0,
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS for Gamification Events
ALTER TABLE gamification_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own gamification events"
    ON gamification_events FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Service role full access on gamification events"
    ON gamification_events
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ── 2. NEURAL NETWORK NODES (BADGES) ─────────────────────────
-- Table to store achievements/badges earned by users
CREATE TABLE IF NOT EXISTS user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    badge_id TEXT NOT NULL, -- e.g., 'hello_world', 'data_miner'
    earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, badge_id)
);

-- RLS for User Badges
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Badges are viewable by everyone"
    ON user_badges FOR SELECT
    USING (true);

CREATE POLICY "Service role full access on user badges"
    ON user_badges
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ── 3. AUTOMATIC LEVEL CALCULATION TRIGGER ───────────────────
-- Function to automatically calculate Processing Power (Level)
-- based on total Synapses (xp_points)
CREATE OR REPLACE FUNCTION calculate_user_level()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Determine level based on xp_points (Synapses)
    -- Levels: novato (0-99), aprendiz (100-499), automatizador (500-1999), experto (2000-4999), maestro_ia (5000+)
    IF NEW.xp_points >= 5000 THEN
        NEW.level := 'maestro_ia';
    ELSIF NEW.xp_points >= 2000 THEN
        NEW.level := 'experto';
    ELSIF NEW.xp_points >= 500 THEN
        NEW.level := 'automatizador';
    ELSIF NEW.xp_points >= 100 THEN
        NEW.level := 'aprendiz';
    ELSE
        NEW.level := 'novato';
    END IF;

    RETURN NEW;
END;
$$;

-- Apply trigger to profiles table BEFORE UPDATE
DROP TRIGGER IF EXISTS trigger_update_user_level ON profiles;
CREATE TRIGGER trigger_update_user_level
    BEFORE UPDATE OF xp_points ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION calculate_user_level();

-- Let's also enforce it on INSERT just in case
DROP TRIGGER IF EXISTS trigger_insert_user_level ON profiles;
CREATE TRIGGER trigger_insert_user_level
    BEFORE INSERT ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION calculate_user_level();
