import type { GameState, Move, Player, PlayerClass } from './state';

/**
 * Online game metadata
 */
export interface OnlineGameMetadata {
  sessionId: string;
  playerNumber: 1 | 2; // 1 = X (Player 1), 2 = O (Player 2)
  opponentId: string;
  opponentUsername: string;
  playerSymbol: 'X' | 'O';
  opponentSymbol: 'X' | 'O';
  gameMode: 'ranked' | 'casual';
  playerClass: PlayerClass;
  opponentClass: PlayerClass;
}

/**
 * Extended game state for online play
 */
export interface OnlineGameState extends GameState {
  onlineMetadata: OnlineGameMetadata;
}

/**
 * Connection status for online game
 */
export type OnlineConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'reconnecting';

/**
 * Online match information
 */
export interface OnlineMatch {
  sessionId: string;
  player1Id: string;
  player2Id: string;
  player1Username: string;
  player2Username: string;
  player1Class: PlayerClass;
  player2Class: PlayerClass;
  gameMode: 'ranked' | 'casual';
}

/**
 * Realtime event payloads
 */
export interface MoveBroadcastPayload {
  type: 'move_made';
  move: Move;
  gameState: GameState;
  playerNumber: 1 | 2;
}

export interface PlayerConnectedPayload {
  type: 'player_connected';
  playerNumber: 1 | 2;
  playerId: string;
  connected: boolean;
}

export interface RequestResyncPayload {
  type: 'request_resync';
  playerId: string;
  playerNumber: 1 | 2;
}

export interface GameEndedPayload {
  type: 'game_ended';
  result: GameEndResult;
}

export interface GameEndResult {
  winner: Player | null;
  isDraw: boolean;
  reason: 'won' | 'draw' | 'abandoned' | 'disconnect';
  player1RatingChange?: number;
  player2RatingChange?: number;
}

/**
 * Reconnection state
 */
export interface ReconnectionState {
  attempting: boolean;
  attemptNumber: number;
  lastAttempt: number;
}
