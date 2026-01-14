import type { GameState, CellIndex } from '../types';
import { isValidMove } from '../core/game-engine';
import { checkWinner } from '../core/win-detector';
import type { AIMove, AIDifficulty } from '../types/ai';

/**
 * Easy AI: Makes random valid moves
 */
export function getEasyAIMove(gameState: GameState): AIMove {
  const validMoves = getValidMoves(gameState);

  if (validMoves.length === 0) {
    throw new Error('No valid moves available');
  }

  // Pick a random move
  const randomIndex = Math.floor(Math.random() * validMoves.length);
  return {
    cellIndex: validMoves[randomIndex],
    score: 0,
  };
}

/**
 * Medium AI: Uses basic heuristics
 * - Takes winning moves
 * - Blocks opponent wins
 * - Prefers center
 * - Otherwise random
 */
export function getMediumAIMove(gameState: GameState): AIMove {
  const validMoves = getValidMoves(gameState);
  const opponent = gameState.currentPlayer === 'X' ? 'O' : 'X';

  // 1. Check if we can win
  for (const move of validMoves) {
    const testBoard = [...gameState.board];
    testBoard[move] = gameState.currentPlayer;
    const result = checkWinner(testBoard);
    if (result.hasWinner && result.winner === gameState.currentPlayer) {
      return { cellIndex: move, score: 100 };
    }
  }

  // 2. Block opponent wins
  for (const move of validMoves) {
    const testBoard = [...gameState.board];
    testBoard[move] = opponent;
    const result = checkWinner(testBoard);
    if (result.hasWinner && result.winner === opponent) {
      return { cellIndex: move, score: 90 };
    }
  }

  // 3. Take center if available
  if (validMoves.includes(4)) {
    return { cellIndex: 4, score: 50 };
  }

  // 4. Take corners
  const corners = [0, 2, 6, 8].filter(i => validMoves.includes(i as CellIndex));
  if (corners.length > 0) {
    const randomCorner = corners[Math.floor(Math.random() * corners.length)];
    return { cellIndex: randomCorner, score: 30 };
  }

  // 5. Random move
  const randomIndex = Math.floor(Math.random() * validMoves.length);
  return { cellIndex: validMoves[randomIndex], score: 10 };
}

/**
 * Hard AI: Uses Minimax with Alpha-Beta Pruning
 */
export function getHardAIMove(gameState: GameState): AIMove {
  const validMoves = getValidMoves(gameState);

  if (validMoves.length === 0) {
    throw new Error('No valid moves available');
  }

  // Use Minimax to find the best move
  let bestScore = -Infinity;
  let bestMove = validMoves[0];

  for (const move of validMoves) {
    const newBoard = [...gameState.board];
    newBoard[move] = gameState.currentPlayer;

    const score = minimax(
      newBoard,
      5, // depth
      false,
      gameState.currentPlayer,
      -Infinity,
      Infinity
    );

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return { cellIndex: bestMove, score: bestScore };
}

/**
 * Minimax algorithm with Alpha-Beta pruning
 */
function minimax(
  board: GameState['board'],
  depth: number,
  isMaximizing: boolean,
  aiPlayer: 'X' | 'O',
  alpha: number,
  beta: number
): number {
  // Check terminal states
  const result = checkWinner(board);
  if (result.hasWinner) {
    return result.winner === aiPlayer ? 10 + depth : -10 - depth;
  }

  // Check for draw
  const isFull = board.every(cell => cell !== null);
  if (isFull) {
    return 0;
  }

  // Depth limit
  if (depth === 0) {
    return evaluateBoard(board, aiPlayer);
  }

  const validMoves = getValidMovesForBoard(board);
  const currentPlayer = isMaximizing ? aiPlayer : (aiPlayer === 'X' ? 'O' : 'X');

  if (isMaximizing) {
    let maxScore = -Infinity;
    for (const move of validMoves) {
      const newBoard = [...board];
      newBoard[move] = currentPlayer;
      const score = minimax(newBoard, depth - 1, false, aiPlayer, alpha, beta);
      maxScore = Math.max(maxScore, score);
      alpha = Math.max(alpha, score);
      if (beta <= alpha) break; // Alpha-Beta pruning
    }
    return maxScore;
  } else {
    let minScore = Infinity;
    for (const move of validMoves) {
      const newBoard = [...board];
      newBoard[move] = currentPlayer;
      const score = minimax(newBoard, depth - 1, true, aiPlayer, alpha, beta);
      minScore = Math.min(minScore, score);
      beta = Math.min(beta, score);
      if (beta <= alpha) break; // Alpha-Beta pruning
    }
    return minScore;
  }
}

/**
 * Evaluate board position for AI
 */
function evaluateBoard(board: GameState['board'], aiPlayer: 'X' | 'O'): number {
  let score = 0;

  // Center is valuable
  if (board[4] === aiPlayer) score += 3;
  if (board[4] !== null && board[4] !== aiPlayer) score -= 3;

  // Corners are valuable
  const corners = [0, 2, 6, 8];
  for (const corner of corners) {
    if (board[corner] === aiPlayer) score += 1;
    if (board[corner] !== null && board[corner] !== aiPlayer) score -= 1;
  }

  return score;
}

/**
 * Get all valid moves for a board state
 */
function getValidMoves(gameState: GameState): number[] {
  const validMoves: number[] = [];
  for (let i = 0; i < gameState.board.length; i++) {
    if (isValidMove(gameState, i as CellIndex)) {
      validMoves.push(i);
    }
  }
  return validMoves;
}

/**
 * Get valid moves for a board (not full game state)
 */
function getValidMovesForBoard(board: GameState['board']): number[] {
  const validMoves: number[] = [];
  for (let i = 0; i < board.length; i++) {
    if (board[i] === null) {
      validMoves.push(i);
    }
  }
  return validMoves;
}

/**
 * Main AI function - delegates to appropriate difficulty
 */
export function getAIMove(gameState: GameState, difficulty: AIDifficulty): AIMove {
  switch (difficulty) {
    case 'easy':
      return getEasyAIMove(gameState);
    case 'medium':
      return getMediumAIMove(gameState);
    case 'hard':
      return getHardAIMove(gameState);
  }
}
