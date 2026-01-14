import { useMemo } from 'react';
import type { Board, Player, CellIndex } from '../types';
import { getWinningLines } from '../utils';

export interface WinResult {
  hasWinner: boolean;
  winner?: Player;
  winningLine?: CellIndex[];
  isDraw?: boolean;
}

/**
 * Custom hook for win detection
 * Memoized to prevent unnecessary recalculations
 * Eliminates duplicated win-checking logic across components
 *
 * @param board - Current game board state
 * @returns Win detection result
 */
export function useWinDetection(board: Board): WinResult {
  return useMemo(() => {
    const lines = getWinningLines();

    // Check for winner
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

    // Check for draw (board full, no winner)
    const isBoardFull = board.every(cell => cell !== null);
    if (isBoardFull) {
      return {
        hasWinner: false,
        isDraw: true,
      };
    }

    return {
      hasWinner: false,
    };
  }, [board]);
}
