-- Fix column name mismatches in trigger functions that prevented posting
--
-- Issues found:
-- 1. trigger_post_published_xp() used NEW.user_id but column is author_id
-- 2. award_xp() inserted into notifications with columns 'message' and 'metadata'
--    but the table uses 'body' and has no 'metadata' column
-- 3. update_challenge_progress() same issue with 'message' and 'metadata'
-- 4. notify_realtime_notification() referenced NEW.metadata which doesn't exist
-- 5. is_suspicious_completion() inserted 'metadata' into notifications
-- 6. Missing enum values 'level_up' and 'challenge_completed' in notification_type_enum

-- Add missing notification types
ALTER TYPE notification_type_enum ADD VALUE IF NOT EXISTS 'level_up';
ALTER TYPE notification_type_enum ADD VALUE IF NOT EXISTS 'challenge_completed';

-- Fix 1: trigger_post_published_xp - use author_id instead of user_id
CREATE OR REPLACE FUNCTION public.trigger_post_published_xp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  PERFORM award_xp(
    NEW.author_id, 3, 'post_published',
    'Publicaste un post en la comunidad', NEW.id, 'post'
  );
  PERFORM check_and_award_badges(NEW.author_id);
  PERFORM update_challenge_progress(NEW.author_id, 'posts_published', 1);
  RETURN NEW;
END;
$function$;

-- Fix 2: award_xp - use 'body' instead of 'message', remove 'metadata'
CREATE OR REPLACE FUNCTION public.award_xp(p_user_id uuid, p_points integer, p_event_type text, p_description text, p_reference_id uuid DEFAULT NULL::uuid, p_reference_type text DEFAULT NULL::text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_new_total int;
  v_old_level int;
  v_new_level int;
  v_new_level_name text;
  v_coins_to_award int;
BEGIN
  v_coins_to_award := CASE p_event_type
    WHEN 'post_published'           THEN 3
    WHEN 'post_reaction_received'   THEN 1
    WHEN 'comment_posted'           THEN 1
    WHEN 'lesson_completed'         THEN 2
    WHEN 'daily_streak'             THEN 1
    WHEN 'streak_bonus_7'           THEN 5
    WHEN 'streak_bonus_30'          THEN 15
    ELSE 0
  END;

  SELECT level_number INTO v_old_level
  FROM level_config
  WHERE level_name = (SELECT level::text FROM profiles WHERE id = p_user_id);

  INSERT INTO gamification_events
    (user_id, event_type, points, description, reference_id, reference_type)
  VALUES
    (p_user_id, p_event_type, p_points, p_description, p_reference_id, p_reference_type);

  UPDATE profiles
  SET
    xp_points = xp_points + p_points,
    coins = coins + v_coins_to_award,
    updated_at = NOW()
  WHERE id = p_user_id
  RETURNING xp_points INTO v_new_total;

  SELECT level_number, level_name
  INTO v_new_level, v_new_level_name
  FROM level_config
  WHERE min_xp <= v_new_total
  ORDER BY min_xp DESC
  LIMIT 1;

  IF v_new_level > v_old_level THEN
    UPDATE profiles
    SET level = v_new_level_name::user_level_enum
    WHERE id = p_user_id;

    INSERT INTO notifications (user_id, type, title, body)
    VALUES (
      p_user_id,
      'level_up',
      '¡Subiste de nivel! 🎉',
      'Ahora eres ' || v_new_level_name
    );
  END IF;

  PERFORM update_challenge_progress(p_user_id, 'xp_gained', p_points);
END;
$function$;

-- Fix 3: update_challenge_progress - use 'body' instead of 'message', remove 'metadata'
CREATE OR REPLACE FUNCTION public.update_challenge_progress(p_user_id uuid, p_challenge_type text, p_increment integer DEFAULT 1)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_challenge RECORD;
  v_new_value int;
BEGIN
  FOR v_challenge IN
    SELECT c.*, cp.id as participant_id, cp.current_value, cp.completed
    FROM challenges c
    JOIN challenge_participants cp ON cp.challenge_id = c.id
    WHERE c.challenge_type = p_challenge_type
      AND c.is_active = true
      AND c.starts_at <= NOW()
      AND c.ends_at >= NOW()
      AND cp.user_id = p_user_id
      AND cp.completed = false
  LOOP
    v_new_value := v_challenge.current_value + p_increment;

    UPDATE challenge_participants
    SET current_value = v_new_value
    WHERE id = v_challenge.participant_id;

    IF v_new_value >= v_challenge.target_value THEN
      UPDATE challenge_participants
      SET
        completed = true,
        completed_at = NOW()
      WHERE id = v_challenge.participant_id;

      IF v_challenge.reward_coins > 0 THEN
        UPDATE profiles
        SET coins = coins + v_challenge.reward_coins
        WHERE id = p_user_id;
      END IF;

      IF v_challenge.reward_badge_id IS NOT NULL THEN
        INSERT INTO user_badges (user_id, badge_id, earned_at)
        VALUES (p_user_id, v_challenge.reward_badge_id, NOW())
        ON CONFLICT DO NOTHING;
      END IF;

      INSERT INTO notifications (user_id, type, title, body)
      VALUES (
        p_user_id,
        'challenge_completed',
        '¡Desafío completado! ' || v_challenge.emoji,
        '¡Completaste "' || v_challenge.title || '"! Ganaste 💎 ' || v_challenge.reward_coins || ' Sinapsis.'
      );
    END IF;
  END LOOP;
END;
$function$;

-- Fix 4: notify_realtime_notification - remove NEW.metadata reference
CREATE OR REPLACE FUNCTION public.notify_realtime_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  PERFORM realtime.publish(
    'gamification:' || NEW.user_id::text,
    'notification_inserted',
    jsonb_build_object(
      'id', NEW.id,
      'type', NEW.type,
      'title', NEW.title,
      'body', NEW.body,
      'created_at', NEW.created_at
    )
  );
  RETURN NEW;
END;
$function$;

-- Fix 5: is_suspicious_completion - remove 'metadata' column reference
CREATE OR REPLACE FUNCTION public.is_suspicious_completion(p_user_id uuid, p_lesson_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_completions_last_hour int;
BEGIN
  SELECT COUNT(*) INTO v_completions_last_hour
  FROM lesson_progress
  WHERE user_id = p_user_id
    AND completed = true
    AND updated_at >= NOW() - INTERVAL '1 hour';

  IF v_completions_last_hour >= 10 THEN
    INSERT INTO notifications (user_id, type, title, body)
    VALUES (
      (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1),
      'announcement',
      '⚠️ Actividad sospechosa',
      'Un usuario completó más de 10 lecciones en 1 hora. User ID: ' || p_user_id::text
    );
    RETURN true;
  END IF;

  RETURN false;
END;
$function$;
