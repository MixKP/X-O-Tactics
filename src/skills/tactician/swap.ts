import type { GameState, Player, CellIndex, SkillDefinition } from '../../types';
import { isCellShielded } from '../../utils/effects';
import { validateMP } from '../skill-validator';

/**
 * SWAP (4 MP) - The Tactician [REBALANCED: 5→4 MP]
 * Swap your mark with opponent's mark (shields prevent this)
 */

export const swapSkill: SkillDefinition = {
  name: 'swap',
  description: 'Swap your mark with opponent\'s mark',
  mpCost: 4,
  playerClass: 'tactician',
  requiresTarget: true,

  validate: (gameState: GameState, currentPlayer: Player, target?: CellIndex) => {
    if (target === undefined) {
      return { valid: false, reason: 'Must select a target cell' };
    }

    // Check MP
    const mpCheck = validateMP(gameState, currentPlayer, 4);
    if (!mpCheck.valid) return mpCheck;

    const opponent = currentPlayer === 'X' ? 'O' : 'X';

    // Target must have opponent's mark
    if (gameState.board[target] !== opponent) {
      return { valid: false, reason: 'Target must be opponent\'s mark' };
    }

    // Target must not be shielded
    if (isCellShielded(gameState.effects, target)) {
      return { valid: false, reason: 'Cannot swap with shielded mark' };
    }

    // Must have at least one of your own marks on the board
    const hasOwnMark = gameState.board.some(cell => cell === currentPlayer);
    if (!hasOwnMark) {
      return { valid: false, reason: 'You must have at least one mark to swap' };
    }

    return { valid: true };
  },

  execute: (gameState: GameState, currentPlayer: Player, target?: CellIndex) => {
    if (target === undefined) {
      throw new Error('Swap requires a target');
    }

    const opponent = currentPlayer === 'X' ? 'O' : 'X';

    // Find one of your marks (prefer non-shielded, but use any if all are shielded)
    let sourceCell: CellIndex | undefined;

    // First try to find a non-shielded mark
    for (let i = 0; i < gameState.board.length; i++) {
      const idx = i as CellIndex;
      if (gameState.board[idx] === currentPlayer && !isCellShielded(gameState.effects, idx)) {
        sourceCell = idx;
        break;
      }
    }

    // If all are shielded, just pick the first one
    if (!sourceCell) {
      for (let i = 0; i < gameState.board.length; i++) {
        const idx = i as CellIndex;
        if (gameState.board[idx] === currentPlayer) {
          sourceCell = idx;
          break;
        }
      }
    }

    if (sourceCell === undefined) {
      throw new Error('No mark found to swap');
    }

    // Perform the swap
    const newBoard = [...gameState.board];
    newBoard[sourceCell] = opponent;
    newBoard[target] = currentPlayer;

    // Consume MP
    const newPlayers = {
      ...gameState.players,
      [currentPlayer]: {
        ...gameState.players[currentPlayer],
        mp: gameState.players[currentPlayer].mp - 4,
      },
    };

    return {
      ...gameState,
      board: newBoard,
      players: newPlayers,
    };
  },
};
