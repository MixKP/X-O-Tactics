import { describe, it, expect } from 'vitest';
import { checkWinner, checkDraw } from './win-detector';
import type { Board } from '../types';

describe('checkWinner', () => {
  const createBoard = (cells: (null | 'X' | 'O')[]): Board => cells as Board;

  describe('Horizontal wins', () => {
    it('should detect X winning on top row', () => {
      const board = createBoard(['X', 'X', 'X', null, null, null, null, null, null]);
      const result = checkWinner(board);

      expect(result.hasWinner).toBe(true);
      expect(result.winner).toBe('X');
      expect(result.winningLine).toEqual([0, 1, 2]);
    });

    it('should detect O winning on middle row', () => {
      const board = createBoard([null, null, null, 'O', 'O', 'O', null, null, null]);
      const result = checkWinner(board);

      expect(result.hasWinner).toBe(true);
      expect(result.winner).toBe('O');
      expect(result.winningLine).toEqual([3, 4, 5]);
    });

    it('should detect X winning on bottom row', () => {
      const board = createBoard([null, null, null, null, null, null, 'X', 'X', 'X']);
      const result = checkWinner(board);

      expect(result.hasWinner).toBe(true);
      expect(result.winner).toBe('X');
      expect(result.winningLine).toEqual([6, 7, 8]);
    });
  });

  describe('Vertical wins', () => {
    it('should detect X winning on left column', () => {
      const board = createBoard(['X', null, null, 'X', null, null, 'X', null, null]);
      const result = checkWinner(board);

      expect(result.hasWinner).toBe(true);
      expect(result.winner).toBe('X');
      expect(result.winningLine).toEqual([0, 3, 6]);
    });

    it('should detect O winning on middle column', () => {
      const board = createBoard([null, 'O', null, null, 'O', null, null, 'O', null]);
      const result = checkWinner(board);

      expect(result.hasWinner).toBe(true);
      expect(result.winner).toBe('O');
      expect(result.winningLine).toEqual([1, 4, 7]);
    });

    it('should detect X winning on right column', () => {
      const board = createBoard([null, null, 'X', null, null, 'X', null, null, 'X']);
      const result = checkWinner(board);

      expect(result.hasWinner).toBe(true);
      expect(result.winner).toBe('X');
      expect(result.winningLine).toEqual([2, 5, 8]);
    });
  });

  describe('Diagonal wins', () => {
    it('should detect X winning on main diagonal', () => {
      const board = createBoard(['X', null, null, null, 'X', null, null, null, 'X']);
      const result = checkWinner(board);

      expect(result.hasWinner).toBe(true);
      expect(result.winner).toBe('X');
      expect(result.winningLine).toEqual([0, 4, 8]);
    });

    it('should detect O winning on anti-diagonal', () => {
      const board = createBoard([null, null, 'O', null, 'O', null, 'O', null, null]);
      const result = checkWinner(board);

      expect(result.hasWinner).toBe(true);
      expect(result.winner).toBe('O');
      expect(result.winningLine).toEqual([2, 4, 6]);
    });
  });

  describe('No winner scenarios', () => {
    it('should return no winner on empty board', () => {
      const board = createBoard(Array(9).fill(null));
      const result = checkWinner(board);

      expect(result.hasWinner).toBe(false);
      expect(result.winner).toBeUndefined();
    });

    it('should return no winner on incomplete game', () => {
      const board = createBoard(['X', 'O', 'X', null, null, null, null, null, null]);
      const result = checkWinner(board);

      expect(result.hasWinner).toBe(false);
    });

    it('should return no winner on mixed board without three in a row', () => {
      const board = createBoard(['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', null]);
      const result = checkWinner(board);

      expect(result.hasWinner).toBe(false);
    });
  });
});

describe('checkDraw', () => {
  const createBoard = (cells: (null | 'X' | 'O')[]): Board => cells as Board;

  it('should detect draw on full board with no winner', () => {
    const board = createBoard(['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X']);
    const result = checkDraw(board);

    expect(result).toBe(true);
  });

  it('should return false on incomplete board', () => {
    const board = createBoard(['X', 'O', 'X', null, null, null, null, null, null]);
    const result = checkDraw(board);

    expect(result).toBe(false);
  });

  it('should return false on empty board', () => {
    const board = createBoard(Array(9).fill(null));
    const result = checkDraw(board);

    expect(result).toBe(false);
  });

  it('should return false when there is a winner', () => {
    const board = createBoard(['X', 'X', 'X', 'O', 'O', null, null, null, null]);
    const result = checkDraw(board);

    expect(result).toBe(false);
  });
});
