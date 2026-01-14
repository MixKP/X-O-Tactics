import type { Board, Player, CellIndex } from '../types';
import { getWinningLines } from '../utils/board';

/**
 * Result of checking for a winner
 */
export interface WinResult {
  hasWinner: boolean;
  winner?: Player;
  winningLine?: CellIndex[];
}

/**
 * Check if a player has won
 */
export function checkWinner(board: Board): WinResult {
  const lines = getWinningLines();

  for (const line of lines) {
    const [a, b, c] = line;
    const cellA = board[a];
    const cellB = board[b];
    const cellC = board[c];

    if (cellA && cellA === cellB && cellA === cellC) {
      return {
        hasWinner: true,
        winner: cellA,
        winningLine: line,
      };
    }
  }

  return { hasWinner: false };
}

/**
 * Check if the game is a draw (board full, no winner)
 */
export function checkDraw(board: Board): boolean {
  // If there's a winner, it's not a draw
  const winResult = checkWinner(board);
  if (winResult.hasWinner) {
    return false;
  }

  // Draw if board is full
  return board.every((cell) => cell !== null);
}

/**
 * Check if the game is over (either win or draw)
 */
export function isGameOver(board: Board): boolean {
  return checkWinner(board).hasWinner || checkDraw(board);
}
