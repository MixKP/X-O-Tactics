import type { GameState, Player, CellIndex, SkillDefinition } from '../../types';
import { validateMP, validateRemovalSkill } from '../skill-validator';

/**
 * VANISH (5 MP) - The Disruptor [REBALANCED: 4→5 MP]
 * Remove one opponent mark (with Anti-Line-Break and Last Stand restrictions)
 */

export const vanishSkill: SkillDefinition = {
  name: 'vanish',
  description: 'Remove one opponent mark',
  mpCost: 5,
  playerClass: 'disruptor',
  requiresTarget: true,

  validate: (gameState: GameState, currentPlayer: Player, target?: CellIndex) => {
    if (target === undefined) {
      return { valid: false, reason: 'Must select a target cell' };
    }

    // Check MP
    const mpCheck = validateMP(gameState, currentPlayer, 5);
    if (!mpCheck.valid) return mpCheck;

    // Use comprehensive removal validation (includes all balance rules)
    return validateRemovalSkill(gameState, target, currentPlayer);
  },

  execute: (gameState: GameState, currentPlayer: Player, target?: CellIndex) => {
    if (target === undefined) {
      throw new Error('Vanish requires a target');
    }

    // Validate one more time before execution
    const validation = validateRemovalSkill(gameState, target, currentPlayer);
    if (!validation.valid) {
      throw new Error(validation.reason || 'Invalid vanish target');
    }

    // Remove the opponent's mark
    const newBoard = [...gameState.board];
    newBoard[target] = null;

    // Consume MP
    const newPlayers = {
      ...gameState.players,
      [currentPlayer]: {
        ...gameState.players[currentPlayer],
        mp: gameState.players[currentPlayer].mp - 5,
      },
    };

    return {
      ...gameState,
      board: newBoard,
      players: newPlayers,
    };
  },
};
