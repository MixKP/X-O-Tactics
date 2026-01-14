import type { GameState, Player, CellIndex, SkillDefinition } from '../../types';
import { addShield } from '../../utils/effects';
import { validateMP } from '../skill-validator';

/**
 * SHIELD (3 MP) - The Tactician [REBALANCED: 2→3 MP]
 * Protect your mark from removal/movement
 */

export const shieldSkill: SkillDefinition = {
  name: 'shield',
  description: 'Protect your mark from removal/movement',
  mpCost: 3,
  playerClass: 'tactician',
  requiresTarget: true,

  validate: (gameState: GameState, currentPlayer: Player, target?: CellIndex) => {
    if (target === undefined) {
      return { valid: false, reason: 'Must select a target cell' };
    }

    // Check MP
    const mpCheck = validateMP(gameState, currentPlayer, 3);
    if (!mpCheck.valid) return mpCheck;

    // Target must have current player's mark
    if (gameState.board[target] !== currentPlayer) {
      return { valid: false, reason: 'Target must be your own mark' };
    }

    // Check if already shielded
    if (gameState.effects.shieldedMarks.has(String(target))) {
      return { valid: false, reason: 'Mark is already shielded' };
    }

    return { valid: true };
  },

  execute: (gameState: GameState, currentPlayer: Player, target?: CellIndex) => {
    if (target === undefined) {
      throw new Error('Shield requires a target');
    }

    // Add shield to the mark
    const newEffects = addShield(gameState.effects, target);

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
      effects: newEffects,
      players: newPlayers,
    };
  },
};
