import { useEffect, useState, useCallback } from 'react';
import type { GameState, AIDifficulty, AIMove } from '../types';
import { getEasyAIMove, getMediumAIMove, getHardAIMove } from '../ai';

export interface UseAIPlayerProps {
  /** Current game state */
  gameState: GameState;
  /** AI difficulty level */
  difficulty?: AIDifficulty | null;
  /** Whether AI should make moves automatically */
  enabled?: boolean;
  /** Delay before AI moves (ms) */
  moveDelay?: number;
  /** Callback when AI makes a move */
  onAIMove?: (move: AIMove) => void;
}

export interface AIPlayerReturn {
  /** Whether AI is currently "thinking" */
  isThinking: boolean;
  /** Trigger AI move manually */
  triggerAIMove: () => void;
}

/**
 * Custom hook for AI opponent logic
 * Handles AI turn timing and move execution
 *
 * @param props - AI configuration
 * @returns AI state and handlers
 */
export function useAIPlayer(props: UseAIPlayerProps): AIPlayerReturn {
  const { gameState, difficulty, enabled = true, moveDelay = 800, onAIMove } = props;

  const [isThinking, setIsThinking] = useState(false);

  /**
   * Execute AI move
   */
  const triggerAIMove = useCallback(() => {
    if (!enabled || !difficulty || gameState.status !== 'playing') {
      return;
    }

    setIsThinking(true);

    // Simulate "thinking" delay
    setTimeout(() => {
      try {
        // Get AI move based on difficulty
        let aiMove: AIMove;
        switch (difficulty) {
          case 'easy':
            aiMove = getEasyAIMove(gameState);
            break;
          case 'medium':
            aiMove = getMediumAIMove(gameState);
            break;
          case 'hard':
            aiMove = getHardAIMove(gameState);
            break;
        }

        // Notify caller of AI move
        if (onAIMove) {
          onAIMove(aiMove);
        }

        setIsThinking(false);
      } catch (error) {
        console.error('AI move error:', error);
        setIsThinking(false);
      }
    }, moveDelay);
  }, [gameState, difficulty, enabled, moveDelay, onAIMove]);

  /**
   * Auto-trigger AI move when it's O's turn
   */
  useEffect(() => {
    if (
      enabled &&
      difficulty &&
      gameState.currentPlayer === 'O' &&
      gameState.status === 'playing' &&
      !isThinking
    ) {
      const timer = setTimeout(() => {
        triggerAIMove();
      }, moveDelay);

      return () => { clearTimeout(timer); };
    }
  }, [gameState.currentPlayer, gameState.status, enabled, difficulty, isThinking, triggerAIMove, moveDelay]);

  return {
    isThinking,
    triggerAIMove,
  };
}
