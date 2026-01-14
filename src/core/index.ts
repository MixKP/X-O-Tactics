/**
 * Core game engine exports
 */

export { createInitialState, makeMove, isValidMove, executeSkill, getNextPlayer, processTurnEnd } from './game-engine';
export { checkWinner, checkDraw } from './win-detector';
export { addMP, consumeMP, hasEnoughMP, resetMP, MP_MIN, MP_MAX, MP_GAIN_PER_TURN } from './mp-manager';
export type { WinResult } from './win-detector';
