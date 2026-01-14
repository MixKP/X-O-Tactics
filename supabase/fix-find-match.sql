-- Fix for matchmaking: ensure function can access queue table and authenticated users can call it
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT EXECUTE ON FUNCTION public.find_match(UUID, TEXT, TEXT, INTEGER) TO authenticated;

-- Simplified find_match that works for ALL cases
CREATE OR REPLACE FUNCTION public.find_match(
  p_user_id UUID,
  p_game_mode TEXT,
  p_player_class TEXT,
  p_rating_tolerance INTEGER DEFAULT 100
)
RETURNS UUID AS $$
DECLARE
  v_match_id UUID;
BEGIN
  -- Find ANY waiting opponent with same game_mode
  SELECT id INTO v_match_id
  FROM public.matchmaking_queue
  WHERE
    status = 'waiting'
    AND game_mode = p_game_mode
    AND user_id != p_user_id
    AND created_at > NOW() - INTERVAL '5 minutes'
  ORDER BY created_at ASC
  LIMIT 1;

  RETURN v_match_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
