/**
 * Core game state types for X/O Tactics
 */

export type Player = 'X' | 'O';
export type CellValue = Player | null;
export type GameStatus = 'playing' | 'won' | 'draw';
export type GamePhase = 'title' | 'auth' | 'dashboard' | 'matchmaking' | 'leaderboard' | 'classSelect' | 'playing' | 'gameOver' | 'onlinePlaying' | 'onlineGameOver';

export type Board = CellValue[];

export interface PlayerState {
  mp: number;
  skipMpGain?: boolean; // Set by Double Step skill
}

export interface BoardEffects {
  frozenCells: Map<string, number>; // cell -> turns remaining
  shieldedMarks: Set<string>; // cell positions (as "row,col" strings)
}

export interface GameState {
  board: Board;
  currentPlayer: Player;
  players: {
    X: PlayerState;
    O: PlayerState;
  };
  status: GameStatus;
  winner?: Player;
  moveHistory: Move[];
  effects: BoardEffects;
  playerClasses: {
    X: PlayerClass | null;
    O: PlayerClass | null;
  };
}

export type CellIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface Move {
  player: Player;
  playerClass?: PlayerClass;
  cell: CellIndex;
  timestamp: number;
  type: 'place' | 'skill';
  skillName?: string;
}

export interface Position {
  row: 0 | 1 | 2;
  col: 0 | 1 | 2;
}

export type PlayerClass = 'disruptor' | 'tactician';

// Skill-related types

export interface SkillDefinition {
  name: string;
  description: string;
  mpCost: number;
  playerClass: PlayerClass;
  requiresTarget: boolean;
  validate: (gameState: GameState, currentPlayer: Player, target?: CellIndex) => SkillValidationResult;
  execute: (gameState: GameState, currentPlayer: Player, target?: CellIndex) => GameState;
}

export interface SkillValidationResult {
  valid: boolean;
  reason?: string;
}

export type SkillName = 'shift' | 'freeze' | 'vanish' | 'doubleStep' | 'shield' | 'swap';

// Helper type for frozen cells
export interface FrozenCell {
  cellIndex: CellIndex;
  turnsRemaining: number;
}

// Helper type for skill target
export type SkillTarget = CellIndex | null;
