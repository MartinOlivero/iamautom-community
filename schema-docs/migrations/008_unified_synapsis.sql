-- ============================================================
-- IamAutom Community Platform — Migration 008
-- Unified Synapsis System (Option A)
--
-- CONCEPT:
--   xp_points = total earned (never decreases, determines level)
--   coins     = spendable balance (goes up and down)
--   Both are "Sinapsis" — one currency, two views.
-- ============================================================

-- ── 1. ENSURE coins COLUMN EXISTS ─────────────────────────────
-- (may already exist if created manually in the DB)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles' AND column_name = 'coins'
    ) THEN
        ALTER TABLE profiles ADD COLUMN coins INTEGER NOT NULL DEFAULT 0;
    END IF;
END $$;

-- ── 2. SYNC: Set coins = xp_points for all existing users ────
-- One-time migration so existing users have spendable balance
-- NOTE: Use coins < xp_points to catch partial syncs too
UPDATE profiles SET coins = xp_points WHERE coins < xp_points;

-- ── 3. ADD unlock_cost TO MODULES ─────────────────────────────
-- NULL = free access (tier-based), number = requires X accumulated sinapsis
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'modules' AND column_name = 'unlock_cost'
    ) THEN
        ALTER TABLE modules ADD COLUMN unlock_cost INTEGER DEFAULT NULL;
    END IF;
END $$;

-- ── 4. MODULE UNLOCKS TABLE ──────────────────────────────────
-- Tracks which modules a user has unlocked with sinapsis
CREATE TABLE IF NOT EXISTS module_unlocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    coins_spent INTEGER NOT NULL,
    unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, module_id)
);

ALTER TABLE module_unlocks ENABLE ROW LEVEL SECURITY;

-- Users can see their own unlocks
CREATE POLICY "Users can view own module unlocks"
    ON module_unlocks FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_module_unlocks_user ON module_unlocks(user_id);

-- ── 5. FIX redeem_reward RPC ─────────────────────────────────
-- Properly validates coins balance and creates redemption
CREATE OR REPLACE FUNCTION redeem_reward(
    p_user_id UUID,
    p_reward_id UUID,
    p_user_message TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_cost INTEGER;
    v_stock INTEGER;
    v_user_coins INTEGER;
    v_reward_title TEXT;
BEGIN
    -- Get reward info
    SELECT cost_coins, stock, title
    INTO v_cost, v_stock, v_reward_title
    FROM rewards
    WHERE id = p_reward_id AND is_active = true;

    IF v_cost IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Recompensa no encontrada o inactiva');
    END IF;

    -- Check stock
    IF v_stock IS NOT NULL AND v_stock <= 0 THEN
        RETURN jsonb_build_object('success', false, 'error', 'Sin stock disponible');
    END IF;

    -- Get user coins (spendable balance)
    SELECT coins INTO v_user_coins
    FROM profiles
    WHERE id = p_user_id;

    IF v_user_coins IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Usuario no encontrado');
    END IF;

    -- Check balance
    IF v_user_coins < v_cost THEN
        RETURN jsonb_build_object('success', false, 'error', 'Sinapsis insuficientes. Necesitas ' || v_cost || ' pero tienes ' || v_user_coins);
    END IF;

    -- Deduct coins (spendable balance only, xp_points stays)
    UPDATE profiles
    SET coins = coins - v_cost,
        updated_at = now()
    WHERE id = p_user_id;

    -- Decrease stock if limited
    IF v_stock IS NOT NULL THEN
        UPDATE rewards SET stock = stock - 1 WHERE id = p_reward_id;
    END IF;

    -- Create redemption record
    INSERT INTO reward_redemptions (user_id, reward_id, coins_spent, status, user_message, requested_at)
    VALUES (p_user_id, p_reward_id, v_cost, 'pending', p_user_message, now());

    RETURN jsonb_build_object('success', true);
END;
$$;

-- ── 6. FIX refund_coins RPC ──────────────────────────────────
CREATE OR REPLACE FUNCTION refund_coins(
    p_user_id UUID,
    p_amount INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE profiles
    SET coins = coins + p_amount,
        updated_at = now()
    WHERE id = p_user_id;
END;
$$;

-- ── 7. UNLOCK MODULE RPC ─────────────────────────────────────
-- Spends coins to permanently unlock a module
CREATE OR REPLACE FUNCTION unlock_module(
    p_user_id UUID,
    p_module_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_cost INTEGER;
    v_user_coins INTEGER;
    v_already_unlocked BOOLEAN;
BEGIN
    -- Check if already unlocked
    SELECT EXISTS(
        SELECT 1 FROM module_unlocks
        WHERE user_id = p_user_id AND module_id = p_module_id
    ) INTO v_already_unlocked;

    IF v_already_unlocked THEN
        RETURN jsonb_build_object('success', false, 'error', 'Ya tienes este modulo desbloqueado');
    END IF;

    -- Get module unlock cost
    SELECT unlock_cost INTO v_cost
    FROM modules
    WHERE id = p_module_id AND is_published = true;

    IF v_cost IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Modulo no requiere desbloqueo o no existe');
    END IF;

    -- Get user coins
    SELECT coins INTO v_user_coins
    FROM profiles WHERE id = p_user_id;

    IF v_user_coins < v_cost THEN
        RETURN jsonb_build_object('success', false, 'error', 'Sinapsis insuficientes. Necesitas ' || v_cost || ' pero tienes ' || v_user_coins);
    END IF;

    -- Deduct coins
    UPDATE profiles
    SET coins = coins - v_cost,
        updated_at = now()
    WHERE id = p_user_id;

    -- Record unlock
    INSERT INTO module_unlocks (user_id, module_id, coins_spent)
    VALUES (p_user_id, p_module_id, v_cost);

    RETURN jsonb_build_object('success', true);
END;
$$;

-- ── 8. GRANT EXECUTE TO authenticated ────────────────────────
GRANT EXECUTE ON FUNCTION redeem_reward(UUID, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION refund_coins(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION unlock_module(UUID, UUID) TO authenticated;
