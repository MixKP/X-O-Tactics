-- X/O Tactics - Competitive Multiplayer Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users profile table (extends Supabase auth.users)
CREATE TABLE public.profiles (
id UUID REFERENCES auth.users(id) PRIMARY KEY,
username TEXT UNIQUE NOT NULL,
created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
last_login TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
games_played INTEGER DEFAULT 0 NOT NULL,
games_won INTEGER DEFAULT 0 NOT NULL,
games_lost INTEGER DEFAULT 0 NOT NULL,
games_drawn INTEGER DEFAULT 0 NOT NULL,
current_streak INTEGER DEFAULT 0 NOT NULL,
best_streak INTEGER DEFAULT 0 NOT NULL
);

-- ELO ratings table (one per game mode)
CREATE TABLE public.elo_ratings (
id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
game_mode TEXT NOT NULL,
rating INTEGER DEFAULT 1000 NOT NULL,
peak_rating INTEGER DEFAULT 1000 NOT NULL,
wins INTEGER DEFAULT 0 NOT NULL,
losses INTEGER DEFAULT 0 NOT NULL,
draws INTEGER DEFAULT 0 NOT NULL,
updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
UNIQUE(user_id, game_mode)
);

-- Match history table
CREATE TABLE public.matches (
id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
game_mode TEXT NOT NULL,
player1_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
player2_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
winner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
loser_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
is_draw BOOLEAN DEFAULT FALSE NOT NULL,
player1_rating_before INTEGER NOT NULL,
player2_rating_before INTEGER NOT NULL,
player1_rating_change INTEGER NOT NULL,
player2_rating_change INTEGER NOT NULL,
player1_class TEXT NOT NULL,
player2_class TEXT NOT NULL,
moves JSONB NOT NULL,
duration_seconds INTEGER,
played_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
CHECK (
  (is_draw = TRUE AND winner_id IS NULL AND loser_id IS NULL) OR
  (is_draw = FALSE AND winner_id IS NOT NULL AND loser_id IS NOT NULL)
)
);

-- Matchmaking queue table (for real-time matchmaking)
CREATE TABLE public.matchmaking_queue (
id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
game_mode TEXT NOT NULL,
min_rating INTEGER DEFAULT 0 NOT NULL,
max_rating INTEGER DEFAULT 9999 NOT NULL,
player_class TEXT NOT NULL,
status TEXT DEFAULT 'waiting' NOT NULL,
created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Create indexes for performance
CREATE INDEX idx_elo_ratings_user_id ON public.elo_ratings(user_id);
CREATE INDEX idx_matches_player1_id ON public.matches(player1_id);
CREATE INDEX idx_matches_player2_id ON public.matches(player2_id);
CREATE INDEX idx_matches_winner_id ON public.matches(winner_id);
CREATE INDEX idx_matches_played_at ON public.matches(played_at DESC);
CREATE INDEX idx_matchmaking_queue_user_id ON public.matchmaking_queue(user_id);
CREATE INDEX idx_matchmaking_queue_status ON public.matchmaking_queue(status) WHERE status = 'waiting';

-- Row Level Security (RLS) policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.elo_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matchmaking_queue ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read all profiles, update only their own
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- ELO ratings: Read all, update only through functions
CREATE POLICY "ELO ratings are viewable by everyone" ON public.elo_ratings FOR SELECT USING (true);

-- Matches: Read all, insert only after game completion
CREATE POLICY "Matches are viewable by everyone" ON public.matches FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create matches" ON public.matches FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Matchmaking queue: Full access for authenticated users
CREATE POLICY "Users can view matchmaking queue" ON public.matchmaking_queue FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can join matchmaking queue" ON public.matchmaking_queue FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own queue entries" ON public.matchmaking_queue FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own queue entries" ON public.matchmaking_queue FOR DELETE USING (auth.uid() = user_id);

-- Function to create user profile automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
INSERT INTO public.profiles (id, username)
VALUES (
  NEW.id,
  COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
);

INSERT INTO public.elo_ratings (user_id, game_mode)
VALUES (NEW.id, 'ranked');

RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- Function to update user stats after match
CREATE OR REPLACE FUNCTION public.update_user_stats(
p_user_id UUID,
p_won BOOLEAN,
p_is_draw BOOLEAN
)
RETURNS VOID AS $$
BEGIN
UPDATE public.profiles
SET
  games_played = games_played + 1,
  games_won = CASE WHEN p_won THEN games_won + 1 ELSE games_won END,
  games_lost = CASE WHEN NOT p_won AND NOT p_is_draw THEN games_lost + 1 ELSE games_lost END,
  games_drawn = CASE WHEN p_is_draw THEN games_drawn + 1 ELSE games_drawn END,
  current_streak = CASE
    WHEN p_won THEN current_streak + 1
    WHEN p_is_draw THEN current_streak
    ELSE 0
  END,
  best_streak = CASE
    WHEN p_won AND current_streak + 1 > best_streak THEN current_streak + 1
    ELSE best_streak
  END,
  last_login = NOW()
WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate and update ELO after match (trigger version)
CREATE OR REPLACE FUNCTION public.update_elo_after_match_trigger()
RETURNS TRIGGER AS $$
DECLARE
v_player1_id UUID;
v_player2_id UUID;
v_winner_id UUID;
v_is_draw BOOLEAN;
v_player1_rating INTEGER;
v_player2_rating INTEGER;
v_player1_new_rating INTEGER;
v_player2_new_rating INTEGER;
v_k_factor INTEGER := 32;
v_expected1 FLOAT;
v_expected2 FLOAT;
v_score1 FLOAT;
v_score2 FLOAT;
BEGIN
v_player1_id := NEW.player1_id;
v_player2_id := NEW.player2_id;
v_winner_id := NEW.winner_id;
v_is_draw := NEW.is_draw;
v_player1_rating := NEW.player1_rating_before;
v_player2_rating := NEW.player2_rating_before;

v_expected1 := 1.0 / (1.0 + POWER(10.0, (v_player2_rating - v_player1_rating) / 400.0));
v_expected2 := 1.0 / (1.0 + POWER(10.0, (v_player1_rating - v_player2_rating) / 400.0));

IF v_is_draw THEN
  v_score1 := 0.5;
  v_score2 := 0.5;
ELSIF v_winner_id = v_player1_id THEN
  v_score1 := 1.0;
  v_score2 := 0.0;
ELSE
  v_score1 := 0.0;
  v_score2 := 1.0;
END IF;

v_player1_new_rating := v_player1_rating + ROUND(v_k_factor * (v_score1 - v_expected1));
v_player2_new_rating := v_player2_rating + ROUND(v_k_factor * (v_score2 - v_expected2));

UPDATE public.matches
SET
  player1_rating_change = v_player1_new_rating - v_player1_rating,
  player2_rating_change = v_player2_new_rating - v_player2_rating
WHERE id = NEW.id;

UPDATE public.elo_ratings
SET
  rating = v_player1_new_rating,
  peak_rating = GREATEST(peak_rating, v_player1_new_rating),
  wins = wins + CASE WHEN v_score1 = 1.0 THEN 1 ELSE 0 END,
  losses = losses + CASE WHEN v_score1 = 0.0 THEN 1 ELSE 0 END,
  draws = draws + CASE WHEN v_score1 = 0.5 THEN 1 ELSE 0 END,
  updated_at = NOW()
WHERE user_id = v_player1_id AND game_mode = 'ranked';

UPDATE public.elo_ratings
SET
  rating = v_player2_new_rating,
  peak_rating = GREATEST(peak_rating, v_player2_new_rating),
  wins = wins + CASE WHEN v_score2 = 1.0 THEN 1 ELSE 0 END,
  losses = losses + CASE WHEN v_score2 = 0.0 THEN 1 ELSE 0 END,
  draws = draws + CASE WHEN v_score2 = 0.5 THEN 1 ELSE 0 END,
  updated_at = NOW()
WHERE user_id = v_player2_id AND game_mode = 'ranked';

PERFORM public.update_user_stats(v_player1_id, v_winner_id = v_player1_id, v_is_draw);
PERFORM public.update_user_stats(v_player2_id, v_winner_id = v_player2_id, v_is_draw);

RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically update ELO after match
CREATE TRIGGER on_match_completed
AFTER INSERT ON public.matches
FOR EACH ROW
EXECUTE FUNCTION public.update_elo_after_match_trigger();

-- Function to clean up expired matchmaking entries
CREATE OR REPLACE FUNCTION public.cleanup_expired_queue()
RETURNS VOID AS $$
BEGIN
DELETE FROM public.matchmaking_queue
WHERE expires_at < NOW() OR status = 'cancelled';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to find match (called by matchmaking system)
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
SELECT id INTO v_match_id
FROM public.matchmaking_queue
WHERE
  status = 'waiting'
  AND game_mode = p_game_mode
  AND user_id != p_user_id
  AND created_at > NOW() - INTERVAL '5 minutes'
  AND EXISTS (
    SELECT 1 FROM public.elo_ratings er
    WHERE er.user_id = matchmaking_queue.user_id
    AND er.game_mode = p_game_mode
    AND ABS(er.rating - (
      SELECT rating FROM public.elo_ratings
      WHERE user_id = p_user_id AND game_mode = p_game_mode
    )) <= p_rating_tolerance
  )
ORDER BY created_at ASC
LIMIT 1;

RETURN v_match_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- ONLINE MULTIPLAYER: Game Sessions & Real-time Play
-- ============================================================================

-- Game sessions table - Track active online games
CREATE TABLE public.game_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  player1_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  player2_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  player1_class TEXT NOT NULL,
  player2_class TEXT NOT NULL,
  player1_symbol TEXT NOT NULL CHECK (player1_symbol IN ('X', 'O')),
  player2_symbol TEXT NOT NULL CHECK (player2_symbol IN ('X', 'O')),

  -- Game state (serialized)
  board JSONB NOT NULL DEFAULT '[null,null,null,null,null,null,null,null,null]',
  current_player TEXT NOT NULL CHECK (current_player IN ('X', 'O')) DEFAULT 'X',
  players JSONB NOT NULL DEFAULT '{"X":{"mp":0},"O":{"mp":0}}',
  effects JSONB NOT NULL DEFAULT '{"frozenCells":{},"shieldedMarks":[]}',
  status TEXT NOT NULL DEFAULT 'playing' CHECK (status IN ('playing', 'won', 'draw', 'abandoned')),
  winner TEXT CHECK (winner IN ('X', 'O')),
  move_history JSONB NOT NULL DEFAULT '[]',

  -- Session management
  game_mode TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  player1_connected BOOLEAN DEFAULT TRUE,
  player2_connected BOOLEAN DEFAULT TRUE,

  -- Check for valid symbols
  CHECK (player1_symbol != player2_symbol)
);

-- Indexes for game sessions
CREATE INDEX idx_game_sessions_player1 ON public.game_sessions(player1_id);
CREATE INDEX idx_game_sessions_player2 ON public.game_sessions(player2_id);
CREATE INDEX idx_game_sessions_status ON public.game_sessions(status) WHERE status = 'playing';
CREATE INDEX idx_game_sessions_created_at ON public.game_sessions(created_at DESC);
CREATE INDEX idx_game_sessions_last_activity ON public.game_sessions(last_activity_at);

-- RLS for game sessions
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players can view their own game sessions" ON public.game_sessions
FOR SELECT USING (auth.uid() = player1_id OR auth.uid() = player2_id);

CREATE POLICY "Authenticated users can create game sessions" ON public.game_sessions
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Players can update their own game sessions" ON public.game_sessions
FOR UPDATE USING (auth.uid() = player1_id OR auth.uid() = player2_id);

-- Function to update last_activity_at timestamp
CREATE OR REPLACE FUNCTION public.update_game_session_activity()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_activity_at = NOW();
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_game_session_update
BEFORE UPDATE ON public.game_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_game_session_activity();

-- Game moves table - Track individual moves for reconnection sync
CREATE TABLE public.game_moves (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  game_session_id UUID REFERENCES public.game_sessions(id) ON DELETE CASCADE NOT NULL,
  player_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  player TEXT NOT NULL CHECK (player IN ('X', 'O')),
  move_number INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('place', 'skill')),
  cell_index INTEGER NOT NULL CHECK (cell_index >= 0 AND cell_index <= 8),
  skill_name TEXT,
  move_data JSONB NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for game moves
CREATE INDEX idx_game_moves_session ON public.game_moves(game_session_id, move_number);
CREATE INDEX idx_game_moves_player ON public.game_moves(player_id);

-- RLS for game moves
ALTER TABLE public.game_moves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players can view moves from their sessions" ON public.game_moves
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.game_sessions
    WHERE id = game_moves.game_session_id
    AND (player1_id = auth.uid() OR player2_id = auth.uid())
  )
);

CREATE POLICY "Players can insert moves in their sessions" ON public.game_moves
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.game_sessions
    WHERE id = game_moves.game_session_id
    AND (player1_id = auth.uid() OR player2_id = auth.uid())
  )
);

-- Function to auto-abandon inactive sessions (call via cron or manually)
CREATE OR REPLACE FUNCTION public.abandon_inactive_sessions()
RETURNS VOID AS $$
BEGIN
  UPDATE public.game_sessions
  SET
    status = 'abandoned',
    completed_at = NOW()
  WHERE
    status = 'playing'
    AND last_activity_at < NOW() - INTERVAL '10 minutes';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to complete an online game and update ELO
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
