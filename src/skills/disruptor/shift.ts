import type { GameState, Player, CellIndex, SkillDefinition } from '../../types';
import { isCellEmpty, indexToPosition, positionToIndex } from '../../utils/board';
import { isCellFrozen, isCellShielded } from '../../utils/effects';
import { validateMP } from '../skill-validator';

/**
 * SHIFT (3 MP) - The Disruptor [REBALANCED: 2→3 MP]
 * Move one of your marks to an adjacent empty cell
 */

// Get adjacent cells (up, down, left, right) - no diagonals
function getAdjacentCells(cellIndex: CellIndex): CellIndex[] {
  const pos = indexToPosition(cellIndex);
  const adjacent: CellIndex[] = [];

  // Up
  if (pos.row > 0) {
    adjacent.push(positionToIndex((pos.row - 1) as 0 | 1, pos.col));
  }
  // Down
  if (pos.row < 2) {
    adjacent.push(positionToIndex((pos.row + 1) as 1 | 2, pos.col));
  }
  // Left
  if (pos.col > 0) {
    adjacent.push(positionToIndex(pos.row, (pos.col - 1) as 0 | 1));
  }
  // Right
  if (pos.col < 2) {
    adjacent.push(positionToIndex(pos.row, (pos.col + 1) as 1 | 2));
  }

  return adjacent;
}

export const shiftSkill: SkillDefinition = {
  name: 'shift',
  description: 'Move your mark to an adjacent empty cell',
  mpCost: 3,
  playerClass: 'disruptor',
  requiresTarget: true,

  validate: (gameState: GameState, currentPlayer: Player, target?: CellIndex) => {
    if (target === undefined) {
      return { valid: false, reason: 'Must select a target cell' };
    }

    // Check MP
    const mpCheck = validateMP(gameState, currentPlayer, 3);
    if (!mpCheck.valid) return mpCheck;

    // Target must be empty
    if (!isCellEmpty(gameState.board, target)) {
      return { valid: false, reason: 'Target must be empty' };
    }

    // Target must not be frozen
    if (isCellFrozen(gameState.effects, target)) {
      return { valid: false, reason: 'Target cell is frozen' };
    }

    // Find a mark belonging to current player that's adjacent
    const adjacentCells = getAdjacentCells(target);
    const hasAdjacentMark = adjacentCells.some(
      cell => gameState.board[cell] === currentPlayer
    );

    if (!hasAdjacentMark) {
      return { valid: false, reason: 'No adjacent mark to move' };
    }

    return { valid: true };
  },

  execute: (gameState: GameState, currentPlayer: Player, target?: CellIndex) => {
    if (target === undefined) {
      throw new Error('Shift requires a target');
    }

    // Find the adjacent mark to move (prefer non-shielded, but allow if all are shielded)
    const adjacentCells = getAdjacentCells(target);
    let sourceCell: CellIndex | undefined;

    // First try to find a non-shielded adjacent mark
    sourceCell = adjacentCells.find(
      cell => gameState.board[cell] === currentPlayer && !isCellShielded(gameState.effects, cell)
    );

    // If all adjacent marks are shielded, just pick the first one
    // (shielded marks can still be moved by their owner)
    if (!sourceCell) {
      sourceCell = adjacentCells.find(
        cell => gameState.board[cell] === currentPlayer
      );
    }

    if (!sourceCell) {
      throw new Error('No adjacent mark found');
    }

    // Move the mark
    const newBoard = [...gameState.board];
    newBoard[sourceCell] = null;
    newBoard[target] = currentPlayer;

    // Consume MP
    const newPlayers = {
      ...gameState.players,
      [currentPlayer]: {
        ...gameState.players[currentPlayer],
        mp: gameState.players[currentPlayer].mp - 3,
      },
    };

    return {
      ...gameState,
      board: newBoard,
      players: newPlayers,
    };
  },
};
