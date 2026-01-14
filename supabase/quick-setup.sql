-- Quick setup for X/O Tactics
-- Run this in your Supabase SQL Editor

-- 1. Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
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

-- 2. Create ELO ratings table
CREATE TABLE IF NOT EXISTS public.elo_ratings (
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

-- 3. Create matches table
CREATE TABLE IF NOT EXISTS public.matches (
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
  played_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create matchmaking queue table
CREATE TABLE IF NOT EXISTS public.matchmaking_queue (
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

-- 5. Create game sessions table
CREATE TABLE IF NOT EXISTS public.game_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  player1_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  player2_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  player1_class TEXT NOT NULL,
  player2_class TEXT NOT NULL,
  player1_symbol TEXT NOT NULL CHECK (player1_symbol IN ('X', 'O')),
  player2_symbol TEXT NOT NULL CHECK (player2_symbol IN ('X', 'O')),
  board JSONB NOT NULL DEFAULT '[null,null,null,null,null,null,null,null,null]',
  current_player TEXT NOT NULL CHECK (current_player IN ('X', 'O')) DEFAULT 'X',
  players JSONB NOT NULL DEFAULT '{"X":{"mp":0,"skipMpGain":false},"O":{"mp":0,"skipMpGain":false}',
  effects JSONB NOT NULL DEFAULT '{"frozenCells":{},"shieldedMarks":[]}',
  status TEXT NOT NULL DEFAULT 'playing' CHECK (status IN ('playing', 'won', 'draw', 'abandoned')),
  winner TEXT CHECK (winner IN ('X', 'O')),
  move_history JSONB NOT NULL DEFAULT '[]',
  game_mode TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  player1_connected BOOLEAN DEFAULT TRUE,
  player2_connected BOOLEAN DEFAULT TRUE,
  CHECK (player1_symbol != player2_symbol)
);

-- 6. Create game moves table
CREATE TABLE IF NOT EXISTS public.game_moves (
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

-- 7. Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.elo_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matchmaking_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_moves ENABLE ROW LEVEL SECURITY;

-- 8. Create RLS policies

-- Profiles: Everyone can read, users can insert their own
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- ELO ratings: Everyone can read
CREATE POLICY "ELO ratings are viewable by everyone"
  ON public.elo_ratings FOR SELECT USING (true);

-- Matches: Everyone can read, authenticated can create
CREATE POLICY "Matches are viewable by everyone"
  ON public.matches FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create matches"
  ON public.matches FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Matchmaking queue: Full access for authenticated users
CREATE POLICY "Users can view matchmaking queue"
  ON public.matchmaking_queue FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can join matchmaking queue"
  ON public.matchmaking_queue FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own queue entries"
  ON public.matchmaking_queue FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own queue entries"
  ON public.matchmaking_queue FOR DELETE USING (auth.uid() = user_id);

-- Game sessions: Players can view their own games
CREATE POLICY "Players can view their own game sessions"
  ON public.game_sessions FOR SELECT USING (auth.uid() = player1_id OR auth.uid() = player2_id);

CREATE POLICY "Authenticated users can create game sessions"
  ON public.game_sessions FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Players can update their own game sessions"
  ON public.game_sessions FOR UPDATE USING (auth.uid() = player1_id OR auth.uid() = player2_id);

-- Game moves: Players can view moves from their sessions
CREATE POLICY "Players can view moves from their sessions"
  ON public.game_moves FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.game_sessions
      WHERE id = game_moves.game_session_id
      AND (player1_id = auth.uid() OR player2_id = auth.uid())
    )
);

-- 9. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_elo_ratings_user_id ON public.elo_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_matches_player1_id ON public.matches(player1_id);
CREATE INDEX IF NOT EXISTS idx_matches_player2_id ON public.matches(player2_id);
CREATE INDEX IF NOT EXISTS idx_matches_winner_id ON public.matches(winner_id);
CREATE INDEX IF NOT EXISTS idx_matches_played_at ON public.matches(played_at DESC);
CREATE INDEX IF NOT EXISTS idx_matchmaking_queue_user_id ON public.matchmaking_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_matchmaking_queue_status ON public.matchmaking_queue(status) WHERE status = 'waiting';
CREATE INDEX IF NOT EXISTS idx_game_sessions_player1 ON public.game_sessions(player1_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_player2 ON public.game_sessions(player2_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_status ON public.game_sessions(status) WHERE status = 'playing';
CREATE INDEX IF NOT EXISTS idx_game_sessions_created_at ON public.game_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_game_sessions_last_activity ON public.game_sessions(last_activity_at);
CREATE INDEX IF NOT EXISTS idx_game_moves_session ON public.game_moves(game_session_id, move_number);
CREATE INDEX IF NOT EXISTS idx_game_moves_player ON public.game_moves(player_id);

-- 10. Function to handle new user signup
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

-- 11. Trigger to auto-create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Done! Your database is now ready for X/O Tactics
