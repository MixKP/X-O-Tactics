import { describe, it, expect } from 'vitest';
import { createInitialState, makeMove, isValidMove, getNextPlayer } from './game-engine';

describe('createInitialState', () => {
  it('should create empty board with correct initial state', () => {
    const state = createInitialState();

    // Board should be empty
    expect(state.board).toEqual(Array(9).fill(null));

    // X goes first
    expect(state.currentPlayer).toBe('X');

    // Both players start with 0 MP
    expect(state.players.X.mp).toBe(0);
    expect(state.players.O.mp).toBe(0);

    // Game should be in playing status
    expect(state.status).toBe('playing');

    // Move history should be empty
    expect(state.moveHistory).toEqual([]);

    // No classes selected yet
    expect(state.playerClasses.X).toBeNull();
    expect(state.playerClasses.O).toBeNull();
  });
});

describe('makeMove', () => {
  it('should place mark and switch turn', () => {
    const state = createInitialState();
    const newState = makeMove(state, 0);

    // X should be placed at index 0
    expect(newState.board[0]).toBe('X');

    // Turn should switch to O
    expect(newState.currentPlayer).toBe('O');

    // X should gain 1 MP
    expect(newState.players.X.mp).toBe(1);

    // Move should be recorded in history
    expect(newState.moveHistory).toHaveLength(1);
  });

  it('should allow O to place mark after X', () => {
    let state = createInitialState();
    state = makeMove(state, 0); // X places at 0
    state = makeMove(state, 1); // O places at 1

    expect(state.board[0]).toBe('X');
    expect(state.board[1]).toBe('O');
    expect(state.currentPlayer).toBe('X');
  });

  it('should not allow placing mark on occupied cell', () => {
    let state = createInitialState();
    state = makeMove(state, 0); // X places at 0

    expect(() => makeMove(state, 0)).toThrow();
  });
});

describe('isValidMove', () => {
  it('should validate moves on empty cells', () => {
    const state = createInitialState();
    expect(isValidMove(state, 0)).toBe(true);
    expect(isValidMove(state, 8)).toBe(true);
  });

  it('should reject moves on occupied cells', () => {
    let state = createInitialState();
    state = makeMove(state, 0);

    expect(isValidMove(state, 0)).toBe(false);
  });

  it('should reject moves when game is not playing', () => {
    const state = createInitialState();
    state.status = 'won';
    expect(isValidMove(state, 0)).toBe(false);

    state.status = 'draw';
    expect(isValidMove(state, 0)).toBe(false);
  });
});

describe('getNextPlayer', () => {
  it('should switch from X to O', () => {
    expect(getNextPlayer('X')).toBe('O');
  });

  it('should switch from O to X', () => {
    expect(getNextPlayer('O')).toBe('X');
  });
});

describe('Game State Immutability', () => {
  it('should not mutate original state when making move', () => {
    const originalState = createInitialState();
    const newState = makeMove(originalState, 0);

    // Original state should be unchanged
    expect(originalState.board[0]).toBeNull();
    expect(originalState.currentPlayer).toBe('X');

    // New state should have changes
    expect(newState.board[0]).toBe('X');
    expect(newState.currentPlayer).toBe('O');
  });
});
