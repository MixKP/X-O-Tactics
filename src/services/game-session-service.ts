import type { Player, PlayerClass, GameState, Move } from '../types';
import { createInitialState } from '../core/game-engine';
import { supabase } from '../lib/supabase';

export interface OnlineGameSession {
  id: string;
  player1_id: string;
  player2_id: string;
  player1_class: PlayerClass;
  player2_class: PlayerClass;
  player1_symbol: 'X' | 'O';
  player2_symbol: 'X' | 'O';
  board: (Player | null)[];
  current_player: Player;
  players: {
    X: { mp: number; skipMpGain?: boolean };
    O: { mp: number; skipMpGain?: boolean };
  };
  effects: {
    frozenCells: Record<string, number>;
    shieldedMarks: string[];
  };
  status: 'playing' | 'won' | 'draw' | 'abandoned';
  winner?: Player;
  move_history: Move[];
  game_mode: 'ranked' | 'casual';
  created_at: string;
  updated_at: string;
  last_activity_at: string;
  completed_at?: string;
  player1_connected: boolean;
  player2_connected: boolean;
}

export interface CreateSessionParams {
  player1Id: string;
  player2Id: string;
  player1Class: PlayerClass;
  player2Class: PlayerClass;
  gameMode: 'ranked' | 'casual';
}

/**
 * Create a new online game session
 */
export async function createOnlineGameSession(params: CreateSessionParams): Promise<string> {
  const { player1Id, player2Id, player1Class, player2Class, gameMode } = params;

  // Initialize game state
  const initialState = createInitialState();
  initialState.playerClasses.X = player1Class;
  initialState.playerClasses.O = player2Class;

  const { data, error } = await supabase
    .from('game_sessions')
    .insert({
      player1_id: player1Id,
      player2_id: player2Id,
      player1_class: player1Class,
      player2_class: player2Class,
      player1_symbol: 'X',
      player2_symbol: 'O',
      board: initialState.board,
      current_player: initialState.currentPlayer,
      players: initialState.players,
      effects: serializeEffects(initialState.effects),
      move_history: [],
      game_mode: gameMode,
      status: 'playing',
    })
    .select('id')
    .single();

  if (error) {
    console.error('Failed to create game session:', error);
    throw new Error('Failed to create game session');
  }

  console.log('Created game session:', data.id);
  return data.id;
}

/**
 * Get a game session by ID
 */
export async function getGameSession(sessionId: string): Promise<OnlineGameSession | null> {
  const { data, error } = await supabase
    .from('game_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (error) {
    console.error('Failed to get game session:', error);
    return null;
  }

  return data as OnlineGameSession;
}

/**
 * Update game state after a move
 */
export async function updateGameState(
  sessionId: string,
  gameState: GameState,
  move: Move
): Promise<void> {
  const { error } = await supabase
    .from('game_sessions')
    .update({
      board: gameState.board,
      current_player: gameState.currentPlayer,
      players: gameState.players,
      effects: serializeEffects(gameState.effects),
      status: gameState.status === 'playing' ? 'playing' : gameState.status,
      winner: gameState.winner,
      move_history: [...gameState.moveHistory, move],
    })
    .eq('id', sessionId);

  if (error) {
    console.error('Failed to update game state:', error);
    throw new Error('Failed to update game state');
  }
}

/**
 * Save a move to the game_moves table
 */
export async function saveMove(
  sessionId: string,
  playerId: string,
  player: Player,
  moveNumber: number,
  move: Move
): Promise<void> {
  const { error } = await supabase
    .from('game_moves')
    .insert({
      game_session_id: sessionId,
      player_id: playerId,
      player: player,
      move_number: moveNumber,
      type: move.type,
      cell_index: move.cell,
      skill_name: move.skillName,
      move_data: move,
    });

  if (error) {
    console.error('Failed to save move:', error);
    // Don't throw - move saving is non-critical
  }
}

/**
 * Get move history for a session (for reconnection)
 */
export async function getMoveHistory(sessionId: string): Promise<Move[]> {
  const { data, error } = await supabase
    .from('game_moves')
    .select('move_data')
    .eq('game_session_id', sessionId)
    .order('move_number', { ascending: true });

  if (error) {
    console.error('Failed to get move history:', error);
    return [];
  }

  return data.map((row: any) => row.move_data as Move);
}

/**
 * Complete a game and update ELO
 */
export async function completeGame(
  sessionId: string,
  winner: Player | null,
  isDraw: boolean,
  abandoned: boolean = false
): Promise<void> {
  const { error } = await supabase.rpc('complete_online_game', {
    p_session_id: sessionId,
    p_winner: winner || '',
    p_is_draw: isDraw,
    p_abandoned: abandoned,
  });

  if (error) {
    console.error('Failed to complete game:', error);
    throw new Error('Failed to complete game');
  }
}

/**
 * Abandon a session (player disconnected)
 */
export async function abandonSession(sessionId: string): Promise<void> {
  const { error } = await supabase
    .from('game_sessions')
    .update({
      status: 'abandoned',
      completed_at: new Date().toISOString(),
    })
    .eq('id', sessionId);

  if (error) {
    console.error('Failed to abandon session:', error);
    throw new Error('Failed to abandon session');
  }
}

/**
 * Update player connection status
 */
export async function updatePlayerConnection(
  sessionId: string,
  playerNumber: 1 | 2,
  connected: boolean
): Promise<void> {
  const field = playerNumber === 1 ? 'player1_connected' : 'player2_connected';

  const { error } = await supabase
    .from('game_sessions')
    .update({ [field]: connected })
    .eq('id', sessionId);

  if (error) {
    console.error('Failed to update connection status:', error);
    // Non-critical, don't throw
  }
}

/**
 * Helper: Serialize effects for JSON storage
 */
function serializeEffects(effects: any): any {
  return {
    frozenCells: effects.frozenCells || {},
    shieldedMarks: Array.from(effects.shieldedMarks || []),
  };
}

/**
 * Helper: Deserialize effects from JSON storage
 */
export function deserializeEffects(data: any): any {
  return {
    frozenCells: data.frozenCells || {},
    shieldedMarks: new Set(data.shieldedMarks || []),
  };
}

/**
 * Check if a session is abandoned
 */
export async function isSessionAbandoned(sessionId: string): Promise<boolean> {
  const session = await getGameSession(sessionId);
  return session?.status === 'abandoned';
}
