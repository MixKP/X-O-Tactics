import type { GameState, Player, CellIndex } from '../types';
import { isCellShielded } from '../utils/effects';
import { getWinningLines } from '../utils/board';

/**
 * Balance Rules - CRITICAL
 * These rules prevent game-breaking exploits
 */

/**
 * ANTI-LINE-BREAK RULE:
 * Skills cannot remove opponent marks that are part of a 2-in-a-row alignment
 */
export function validateAntiLineBreak(
  board: GameState['board'],
  targetCell: CellIndex,
  opponent: Player
): { valid: boolean; reason?: string } {
  const lines = getWinningLines();

  // Check if target cell is part of any line with 2 aligned opponent marks
  for (const line of lines) {
    if (!line.includes(targetCell)) continue;

    const opponentMarksInLine = line.filter(
      idx => board[idx] === opponent
    ).length;

    if (opponentMarksInLine >= 2) {
      return {
        valid: false,
        reason: 'Cannot break a 2-in-a-row alignment (Anti-Line-Break Rule)',
      };
    }
  }

  return { valid: true };
}

/**
 * LAST STAND RULE:
 * If a player has only one mark left, removal-based Skills cannot be used against them
 */
export function validateLastStand(
  board: GameState['board'],
  opponent: Player
): { valid: boolean; reason?: string } {
  const opponentMarkCount = board.filter(cell => cell === opponent).length;

  if (opponentMarkCount <= 1) {
    return {
      valid: false,
      reason: 'Cannot target opponent with only 1 mark (Last Stand Rule)',
    };
  }

  return { valid: true };
}

/**
 * Check if player has enough MP
 */
export function validateMP(
  gameState: GameState,
  player: Player,
  mpCost: number
): { valid: boolean; reason?: string } {
  if (gameState.players[player].mp < mpCost) {
    return {
      valid: false,
      reason: `Not enough MP (need ${mpCost}, have ${gameState.players[player].mp})`,
    };
  }
  return { valid: true };
}

/**
 * Check if a cell is shielded (for removal/movement skills)
 */
export function validateNotShielded(
  effects: GameState['effects'],
  targetCell: CellIndex
): { valid: boolean; reason?: string } {
  if (isCellShielded(effects, targetCell)) {
    return {
      valid: false,
      reason: 'Cannot target shielded marks',
    };
  }
  return { valid: true };
}

/**
 * Comprehensive validation for removal skills
 * Combines all balance rules
 */
export function validateRemovalSkill(
  gameState: GameState,
  targetCell: CellIndex,
  currentPlayer: Player
): { valid: boolean; reason?: string } {
  const opponent = currentPlayer === 'X' ? 'O' : 'X';

  // Check if target has opponent's mark
  if (gameState.board[targetCell] !== opponent) {
    return {
      valid: false,
      reason: 'Target must be an opponent mark',
    };
  }

  // Check shield
  const shieldCheck = validateNotShielded(gameState.effects, targetCell);
  if (!shieldCheck.valid) {
    return shieldCheck;
  }

  // Last Stand Rule
  const lastStandCheck = validateLastStand(gameState.board, opponent);
  if (!lastStandCheck.valid) {
    return lastStandCheck;
  }

  // Anti-Line-Break Rule
  const antiLineBreakCheck = validateAntiLineBreak(
    gameState.board,
    targetCell,
    opponent
  );
  if (!antiLineBreakCheck.valid) {
    return antiLineBreakCheck;
  }

  return { valid: true };
}
