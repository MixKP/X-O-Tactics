import type { GameState, Player, CellIndex, SkillDefinition } from '../../types';
import { isCellEmpty } from '../../utils/board';
import { freezeCell, isCellFrozen } from '../../utils/effects';
import { validateMP } from '../skill-validator';

/**
 * FREEZE (3 MP) - The Disruptor
 * Lock an empty cell for 2 turns (no one can place there)
 */

export const freezeSkill: SkillDefinition = {
  name: 'freeze',
  description: 'Lock an empty cell for 2 turns',
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

    // Target must not already be frozen
    if (isCellFrozen(gameState.effects, target)) {
      return { valid: false, reason: 'Cell is already frozen' };
    }

    return { valid: true };
  },

  execute: (gameState: GameState, currentPlayer: Player, target?: CellIndex) => {
    if (target === undefined) {
      throw new Error('Freeze requires a target');
    }

    // Freeze the cell for 2 turns
    const newEffects = freezeCell(gameState.effects, target, 2);

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
