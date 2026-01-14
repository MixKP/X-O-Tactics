import type { GameState, Player, CellIndex, SkillDefinition } from '../../types';
import { isCellEmpty } from '../../utils/board';
import { validateMP } from '../skill-validator';

/**
 * DOUBLE STEP (2 MP) - The Tactician [REBALANCED: 3→2 MP]
 * Place two marks, but skip MP gain next turn
 */

export const doubleStepSkill: SkillDefinition = {
  name: 'doubleStep',
  description: 'Place two marks (skip MP gain next turn)',
  mpCost: 2,
  playerClass: 'tactician',
  requiresTarget: true,

  validate: (gameState: GameState, currentPlayer: Player, target?: CellIndex) => {
    if (target === undefined) {
      return { valid: false, reason: 'Must select a target cell' };
    }

    // Check MP
    const mpCheck = validateMP(gameState, currentPlayer, 2);
    if (!mpCheck.valid) return mpCheck;

    // Target must be empty
    if (!isCellEmpty(gameState.board, target)) {
      return { valid: false, reason: 'Target must be empty' };
    }

    return { valid: true };
  },

  execute: (gameState: GameState, currentPlayer: Player, target?: CellIndex) => {
    if (target === undefined) {
      throw new Error('Double Step requires a target');
    }

    // Place the first mark
    const newBoard = [...gameState.board];
    newBoard[target] = currentPlayer;

    // Consume MP
    const newPlayers = {
      ...gameState.players,
      [currentPlayer]: {
        ...gameState.players[currentPlayer],
        mp: gameState.players[currentPlayer].mp - 2,
        skipMpGain: true, // Skip MP gain on next turn
      },
    };

    return {
      ...gameState,
      board: newBoard,
      players: newPlayers,
    };
  },
};
