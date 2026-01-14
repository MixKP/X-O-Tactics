import type { GameState, Player, CellIndex, Move } from '../types';
import { createEmptyBoard, setCell, isCellEmpty } from '../utils/board';
import { checkWinner, checkDraw } from './win-detector';
import { addMP, MP_GAIN_PER_TURN } from './mp-manager';
import { createEmptyEffects, decrementFreezes, isCellFrozen } from '../utils/effects';
import { getSkillByName } from '../skills/skill-registry';

/**
 * Create initial game state
 */
export function createInitialState(): GameState {
  return {
    board: createEmptyBoard(),
    currentPlayer: 'X',
    players: {
      X: { mp: 0 },
      O: { mp: 0 },
    },
    status: 'playing',
    moveHistory: [],
    effects: createEmptyEffects(),
    playerClasses: {
      X: null,
      O: null,
    },
  };
}

/**
 * Get the next player
 */
export function getNextPlayer(currentPlayer: Player): Player {
  return currentPlayer === 'X' ? 'O' : 'X';
}

/**
 * Decrement freeze counters and update board effects
 */
export function processTurnEnd(gameState: GameState): GameState {
  const newEffects = decrementFreezes(gameState.effects);

  return {
    ...gameState,
    effects: newEffects,
  };
}

/**
 * Make a move (place a mark on the board)
 */
export function makeMove(gameState: GameState, cellIndex: CellIndex): GameState {
  // Validate game is still active
  if (gameState.status !== 'playing') {
    throw new Error('Game is already over');
  }

  // Validate cell is empty
  if (!isCellEmpty(gameState.board, cellIndex)) {
    throw new Error(`Cell ${cellIndex} is already occupied`);
  }

  // Check if cell is frozen
  if (isCellFrozen(gameState.effects, cellIndex)) {
    throw new Error(`Cell ${cellIndex} is frozen`);
  }

  const currentPlayer = gameState.currentPlayer;

  // Place the mark
  const newBoard = setCell(gameState.board, cellIndex, currentPlayer);

  // Create move record
  const move: Move = {
    player: currentPlayer,
    cell: cellIndex,
    timestamp: Date.now(),
    type: 'place',
  };

  // Add MP to current player (unless skipMpGain is set)
  const playerState = gameState.players[currentPlayer];
  let updatedPlayer = playerState;

  if (playerState.skipMpGain) {
    // Skip MP gain and clear the flag
    updatedPlayer = {
      ...playerState,
      skipMpGain: false,
    };
  } else {
    // Normal MP gain
    updatedPlayer = addMP(playerState, MP_GAIN_PER_TURN);
  }

  // Process turn end (decrement freezes)
  const newState = processTurnEnd({
    ...gameState,
    board: newBoard,
    players: {
      ...gameState.players,
      [currentPlayer]: updatedPlayer,
    },
    moveHistory: [...gameState.moveHistory, move],
  });

  // Check for winner
  const winResult = checkWinner(newBoard);
  if (winResult.hasWinner) {
    return {
      ...newState,
      status: 'won',
      winner: winResult.winner,
    };
  }

  // Check for draw
  if (checkDraw(newBoard)) {
    return {
      ...newState,
      status: 'draw',
      winner: undefined,
    };
  }

  // Switch to next player
  return {
    ...newState,
    currentPlayer: getNextPlayer(currentPlayer),
  };
}

/**
 * Execute a skill
 */
export function executeSkill(
  gameState: GameState,
  skillName: string,
  target?: CellIndex
): GameState {
  // Validate game is still active
  if (gameState.status !== 'playing') {
    throw new Error('Game is already over');
  }

  const currentPlayer = gameState.currentPlayer;

  // Get skill definition
  const skill = getSkillByName(skillName as any);

  // Validate skill can be used
  const validation = skill.validate(gameState, currentPlayer, target);
  if (!validation.valid) {
    throw new Error(validation.reason || 'Invalid skill usage');
  }

  // Execute the skill
  const newStateAfterSkill = skill.execute(gameState, currentPlayer, target);

  // Create move record
  const move: Move = {
    player: currentPlayer,
    cell: target ?? 0,
    timestamp: Date.now(),
    type: 'skill',
    skillName: skillName,
  };

  // Process turn end (decrement freezes)
  const newState = processTurnEnd({
    ...newStateAfterSkill,
    moveHistory: [...newStateAfterSkill.moveHistory, move],
  });

  // Check for winner (some skills can win the game, e.g., by placing marks)
  const winResult = checkWinner(newState.board);
  if (winResult.hasWinner) {
    return {
      ...newState,
      status: 'won',
      winner: winResult.winner,
    };
  }

  // Check for draw
  if (checkDraw(newState.board)) {
    return {
      ...newState,
      status: 'draw',
      winner: undefined,
    };
  }

  // Switch to next player (skills always end turn)
  return {
    ...newState,
    currentPlayer: getNextPlayer(currentPlayer),
  };
}

/**
 * Restart the game
 */
export function restartGame(): GameState {
  return createInitialState();
}

/**
 * Check if a move is valid
 */
export function isValidMove(gameState: GameState, cellIndex: CellIndex): boolean {
  if (gameState.status !== 'playing') {
    return false;
  }
  return isCellEmpty(gameState.board, cellIndex) && !isCellFrozen(gameState.effects, cellIndex);
}
