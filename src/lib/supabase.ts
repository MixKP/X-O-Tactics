import { createClient } from '@supabase/supabase-js';

// These will be loaded from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce', // Use PKCE flow for better security
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Database types based on our schema
export interface Profile {
  id: string;
  username: string;
  email: string;
  created_at: string;
  last_login: string;
  games_played: number;
  games_won: number;
  games_lost: number;
  games_drawn: number;
  current_streak: number;
  best_streak: number;
}

export interface EloRating {
  id: string;
  user_id: string;
  game_mode: string;
  rating: number;
  peak_rating: number;
  wins: number;
  losses: number;
  draws: number;
  updated_at: string;
}

export interface Match {
  id: string;
  game_mode: string;
  player1_id: string | null;
  player2_id: string | null;
  winner_id: string | null;
  loser_id: string | null;
  is_draw: boolean;
  player1_rating_before: number;
  player2_rating_before: number;
  player1_rating_change: number;
  player2_rating_change: number;
  player1_class: string;
  player2_class: string;
  moves: any[];
  duration_seconds: number | null;
  played_at: string;
}

export interface MatchmakingQueueEntry {
  id: string;
  user_id: string;
  game_mode: string;
  min_rating: number;
  max_rating: number;
  player_class: string;
  status: 'waiting' | 'matched' | 'cancelled';
  created_at: string;
  expires_at: string;
}

// Helper functions for authentication
export const authHelpers = {
  // Sign up with email, username, and password
  signUp: async (email: string, username: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
      },
    });
    return { data, error };
  },

  // Sign in with username and password
  signIn: async (username: string, password: string) => {
    // Get the user's email from the profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('email')
      .eq('username', username)
      .single();

    if (profileError || !profileData || !profileData.email) {
      return { data: { user: null }, error: { message: 'User not found' } };
    }

    // Sign in with the email we found
    const { data, error } = await supabase.auth.signInWithPassword({
      email: profileData.email,
      password,
    });
    return { data, error };
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Get current user
  getCurrentUser: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  // Get current session
  getCurrentSession: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },

  // Listen to auth changes
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback);
  },
};

// Helper functions for profiles
export const profileHelpers = {
  // Get profile by ID
  getProfile: async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    return { data, error };
  },

  // Get profile by username
  getProfileByUsername: async (username: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .single();
    return { data, error };
  },

  // Create profile (client-side fallback)
  createProfile: async (userId: string, username: string, email?: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        username: username,
        email: email,
      })
      .select()
      .single();

    // Also create ELO rating
    if (!error) {
      await supabase
        .from('elo_ratings')
        .insert({
          user_id: userId,
          game_mode: 'ranked',
          rating: 1000,
          peak_rating: 1000,
        });
    }

    return { data, error };
  },

  // Update profile
  updateProfile: async (userId: string, updates: Partial<Profile>) => {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    return { data, error };
  },

  // Get leaderboard
  getLeaderboard: async (gameMode: string = 'ranked', limit: number = 100) => {
    const { data, error } = await supabase
      .from('elo_ratings')
      .select(`
        *,
        profiles:user_id (
          username,
          games_played,
          games_won
        )
      `)
      .eq('game_mode', gameMode)
      .order('rating', { ascending: false })
      .limit(limit);
    return { data, error };
  },
};

// Helper functions for ELO ratings
export const eloHelpers = {
  // Get user's ELO rating
  getUserRating: async (userId: string, gameMode: string = 'ranked') => {
    const { data, error } = await supabase
      .from('elo_ratings')
      .select('*')
      .eq('user_id', userId)
      .eq('game_mode', gameMode)
      .single();
    return { data, error };
  },

  // Get user's match history
  getMatchHistory: async (userId: string, limit: number = 20) => {
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .or(`player1_id.eq.${userId},player2_id.eq.${userId}`)
      .order('played_at', { ascending: false })
      .limit(limit);
    return { data, error };
  },
};

// Helper functions for matchmaking
export const matchmakingHelpers = {
  // Join matchmaking queue
  joinQueue: async (
    userId: string,
    gameMode: string,
    playerClass: string,
    rating: number,
    ratingTolerance: number = 100
  ) => {
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    const { data, error } = await supabase
      .from('matchmaking_queue')
      .insert({
        user_id: userId,
        game_mode: gameMode,
        player_class: playerClass,
        min_rating: rating - ratingTolerance,
        max_rating: rating + ratingTolerance,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    return { data, error };
  },

  // Leave matchmaking queue
  leaveQueue: async (userId: string) => {
    const { error } = await supabase
      .from('matchmaking_queue')
      .update({ status: 'cancelled' })
      .eq('user_id', userId)
      .eq('status', 'waiting');

    return { error };
  },

  // Find match using RPC function
  findMatch: async (userId: string, gameMode: string, playerClass: string) => {
    const { data, error } = await supabase.rpc('find_match', {
      p_user_id: userId,
      p_game_mode: gameMode,
      p_player_class: playerClass,
      p_rating_tolerance: 100,
    });

    return { data, error };
  },

  // Subscribe to matchmaking queue changes
  subscribeToQueue: (callback: (payload: any) => void) => {
    return supabase
      .channel('matchmaking_queue_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matchmaking_queue',
        },
        callback
      )
      .subscribe();
  },
};

// Helper functions for matches
export const matchHelpers = {
  // Create match record after game completion
  createMatch: async (matchData: {
    game_mode: string;
    player1_id: string;
    player2_id: string;
    winner_id: string | null;
    loser_id: string | null;
    is_draw: boolean;
    player1_rating_before: number;
    player2_rating_before: number;
    player1_class: string;
    player2_class: string;
    moves: any[];
    duration_seconds?: number;
  }) => {
    const { data, error } = await supabase
      .from('matches')
      .insert(matchData)
      .select()
      .single();

    return { data, error };
  },

  // Get recent matches
  getRecentMatches: async (limit: number = 50) => {
    const { data, error } = await supabase
      .from('matches')
      .select(`
        *,
        player1:player1_id(id, username),
        player2:player2_id(id, username),
        winner:winner_id(id, username)
      `)
      .order('played_at', { ascending: false })
      .limit(limit);

    return { data, error };
  },
};
