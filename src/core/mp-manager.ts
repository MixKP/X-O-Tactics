import type { PlayerState } from '../types';

/**
 * MP system constants
 */
export const MP_MIN = 0;
export const MP_MAX = 5;
export const MP_GAIN_PER_TURN = 1;

/**
 * Add MP to a player (respecting max cap)
 */
export function addMP(playerState: PlayerState, amount: number = MP_GAIN_PER_TURN): PlayerState {
  const newMP = Math.min(playerState.mp + amount, MP_MAX);
  return {
    ...playerState,
    mp: newMP,
  };
}

/**
 * Consume MP from a player (for skills)
 */
export function consumeMP(playerState: PlayerState, amount: number): PlayerState {
  if (playerState.mp < amount) {
    throw new Error(`Not enough MP: need ${amount}, have ${playerState.mp}`);
  }

  return {
    ...playerState,
    mp: playerState.mp - amount,
  };
}

/**
 * Check if player has enough MP
 */
export function hasEnoughMP(playerState: PlayerState, amount: number): boolean {
  return playerState.mp >= amount;
}

/**
 * Reset MP to initial value
 */
export function resetMP(): PlayerState {
  return { mp: 0 };
}
