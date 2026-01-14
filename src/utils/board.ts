import type { Board, CellIndex, CellValue, Position } from '../types';

/**
 * Board utilities for manipulating and querying the 3x3 game board
 */

export const BOARD_SIZE = 9;
export const ROW_SIZE = 3;

/**
 * Create a new empty board
 */
export function createEmptyBoard(): Board {
  return Array(BOARD_SIZE).fill(null);
}

/**
 * Get cell value at index
 */
export function getCell(board: Board, index: CellIndex): CellValue {
  return board[index];
}

/**
 * Set cell value at index (immutable)
 */
export function setCell(board: Board, index: CellIndex, value: CellValue): Board {
  if (index < 0 || index >= BOARD_SIZE) {
    throw new Error(`Invalid cell index: ${index}`);
  }

  const newBoard = [...board];
  newBoard[index] = value;
  return newBoard;
}

/**
 * Check if a cell is empty
 */
export function isCellEmpty(board: Board, index: CellIndex): boolean {
  return board[index] === null;
}

/**
 * Check if board is full
 */
export function isBoardFull(board: Board): boolean {
  return board.every((cell) => cell !== null);
}

/**
 * Convert cell index to row/col position
 */
export function indexToPosition(index: CellIndex): Position {
  return {
    row: Math.floor(index / ROW_SIZE) as 0 | 1 | 2,
    col: (index % ROW_SIZE) as 0 | 1 | 2,
  };
}

/**
 * Convert row/col position to cell index
 */
export function positionToIndex(row: 0 | 1 | 2, col: 0 | 1 | 2): CellIndex {
  return (row * ROW_SIZE + col) as CellIndex;
}

/**
 * Get all winning lines (rows, columns, diagonals)
 */
export function getWinningLines(): CellIndex[][] {
  return [
    // Rows
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    // Columns
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    // Diagonals
    [0, 4, 8],
    [2, 4, 6],
  ];
}

/**
 * Get all cells belonging to a player
 */
export function getPlayerCells(board: Board, player: 'X' | 'O'): CellIndex[] {
  return board
    .map((cell, index) => (cell === player ? (index as CellIndex) : null))
    .filter((index): index is CellIndex => index !== null);
}

/**
 * Count marks for a player
 */
export function countPlayerMarks(board: Board, player: 'X' | 'O'): number {
  return board.filter((cell) => cell === player).length;
}
