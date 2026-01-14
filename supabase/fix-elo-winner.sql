-- Fix for ELO calculation bug where winner was losing points
-- Run this in your Supabase SQL Editor

CREATE OR REPLACE FUNCTION public.complete_online_game(
  p_session_id UUID,
  p_winner TEXT,
  p_is_draw BOOLEAN,
  p_abandoned BOOLEAN DEFAULT FALSE
)
RETURNS VOID AS $$
DECLARE
  v_session RECORD;
  v_player1_rating INTEGER;
  v_player2_rating INTEGER;
BEGIN
  -- Get session data
  SELECT * INTO v_session
  FROM public.game_sessions
  WHERE id = p_session_id;

  -- Get current ELO ratings
  SELECT rating INTO v_player1_rating
  FROM public.elo_ratings
  WHERE user_id = v_session.player1_id AND game_mode = v_session.game_mode;

  SELECT rating INTO v_player2_rating
  FROM public.elo_ratings
  WHERE user_id = v_session.player2_id AND game_mode = v_session.game_mode;

  -- Create match record (triggers ELO update)
  -- FIXED: Now correctly determines winner/loser based on p_winner and symbols
  INSERT INTO public.matches (
    game_mode,
    player1_id,
    player2_id,
    winner_id,
    loser_id,
    is_draw,
    player1_rating_before,
    player2_rating_before,
    player1_rating_change,
    player2_rating_change,
    player1_class,
    player2_class,
    moves,
    duration_seconds
  ) VALUES (
    v_session.game_mode,
    v_session.player1_id,
    v_session.player2_id,
    CASE WHEN p_is_draw THEN NULL ELSE
      CASE
        WHEN p_winner = 'X' THEN (CASE WHEN v_session.player1_symbol = 'X' THEN v_session.player1_id ELSE v_session.player2_id END)
        WHEN p_winner = 'O' THEN (CASE WHEN v_session.player1_symbol = 'O' THEN v_session.player1_id ELSE v_session.player2_id END)
        ELSE NULL
      END
    END,
    CASE WHEN p_is_draw THEN NULL ELSE
      CASE
        WHEN p_winner = 'X' THEN (CASE WHEN v_session.player1_symbol = 'X' THEN v_session.player2_id ELSE v_session.player1_id END)
        WHEN p_winner = 'O' THEN (CASE WHEN v_session.player1_symbol = 'O' THEN v_session.player2_id ELSE v_session.player1_id END)
        ELSE NULL
      END
    END,
    p_is_draw,
    v_player1_rating,
    v_player2_rating,
    0, -- Will be updated by trigger
    0, -- Will be updated by trigger
    v_session.player1_class,
    v_session.player2_class,
    v_session.move_history,
    EXTRACT(EPOCH FROM (NOW() - v_session.created_at))
  );

  -- Update session status
  UPDATE public.game_sessions
  SET
    status = CASE
      WHEN p_abandoned THEN 'abandoned'
      WHEN p_is_draw THEN 'draw'
      ELSE 'won'
    END,
    winner = CASE WHEN p_is_draw THEN NULL ELSE p_winner END,
    completed_at = NOW()
  WHERE id = p_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
