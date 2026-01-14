import type { BoardEffects, CellIndex } from '../types';

/**
 * Create empty board effects
 */
export function createEmptyEffects(): BoardEffects {
  return {
    frozenCells: new Map(),
    shieldedMarks: new Set(),
  };
}

/**
 * Check if a cell is frozen
 */
export function isCellFrozen(effects: BoardEffects, cellIndex: CellIndex): boolean {
  return effects.frozenCells.has(String(cellIndex));
}

/**
 * Get remaining turns for a frozen cell
 */
export function getFrozenTurnsRemaining(effects: BoardEffects, cellIndex: CellIndex): number | undefined {
  return effects.frozenCells.get(String(cellIndex));
}

/**
 * Freeze a cell for N turns
 */
export function freezeCell(effects: BoardEffects, cellIndex: CellIndex, turns: number): BoardEffects {
  const newFrozenCells = new Map(effects.frozenCells);
  newFrozenCells.set(String(cellIndex), turns);
  return {
    ...effects,
    frozenCells: newFrozenCells,
  };
}

/**
 * Decrease freeze counters for all frozen cells
 */
export function decrementFreezes(effects: BoardEffects): BoardEffects {
  const newFrozenCells = new Map<string, number>();

  for (const [key, turns] of effects.frozenCells) {
    if (turns > 1) {
      newFrozenCells.set(key, turns - 1);
    }
    // If turns == 1, don't add it back (cell unfreezes)
  }

  return {
    ...effects,
    frozenCells: newFrozenCells,
  };
}

/**
 * Check if a cell is shielded
 */
export function isCellShielded(effects: BoardEffects, cellIndex: CellIndex): boolean {
  return effects.shieldedMarks.has(String(cellIndex));
}

/**
 * Add shield to a cell
 */
export function addShield(effects: BoardEffects, cellIndex: CellIndex): BoardEffects {
  const newShieldedMarks = new Set(effects.shieldedMarks);
  newShieldedMarks.add(String(cellIndex));
  return {
    ...effects,
    shieldedMarks: newShieldedMarks,
  };
}

/**
 * Remove shield from a cell
 */
export function removeShield(effects: BoardEffects, cellIndex: CellIndex): BoardEffects {
  const newShieldedMarks = new Set(effects.shieldedMarks);
  newShieldedMarks.delete(String(cellIndex));
  return {
    ...effects,
    shieldedMarks: newShieldedMarks,
  };
}

/**
 * Get all frozen cells
 */
export function getFrozenCells(effects: BoardEffects): CellIndex[] {
  return Array.from(effects.frozenCells.keys()).map(k => parseInt(k, 10) as CellIndex);
}

/**
 * Get all shielded cells
 */
export function getShieldedCells(effects: BoardEffects): CellIndex[] {
  return Array.from(effects.shieldedMarks.keys()).map(k => parseInt(k, 10) as CellIndex);
}
