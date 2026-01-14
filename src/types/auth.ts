import type { Profile } from '../lib/supabase';

export type AuthView = 'login' | 'register';
export type GameMode = 'ranked' | 'casual';
export type MatchmakingStatus = 'idle' | 'searching' | 'found' | 'connecting' | 'playing';

export interface AuthState {
  isAuthenticated: boolean;
  user: Profile | null;
  session: any | null;
  loading: boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface OnlineGameState {
  matchId: string | null;
  opponentId: string | null;
  opponentProfile: Profile | null;
  playerNumber: 1 | 2; // Are we player 1 or player 2?
  gameMode: GameMode;
  status: MatchmakingStatus;
}

export interface RankedGameState {
  currentRating: number;
  peakRating: number;
  wins: number;
  losses: number;
  draws: number;
  rank?: number;
}
