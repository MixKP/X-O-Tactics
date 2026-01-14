import { useCallback, useState } from 'react';
import type { GameState, PlayerClass, CellIndex, SkillName } from '../types';
import {
  createInitialState,
  makeMove,
  isValidMove,
  executeSkill,
} from '../core';
import { useWinDetection } from './useWinDetection';

export interface UseGameEngineProps {
  /** Player X's class selection */
  playerXClass?: PlayerClass | null;
  /** Player O's class selection (null if AI mode) */
  playerOClass?: PlayerClass | null;
  /** Whether this is AI mode */
  isAIMode?: boolean;
}

export interface GameEngineReturn {
  /** Current game state */
  gameState: GameState;
  /** Win detection result */
  winResult: ReturnType<typeof useWinDetection>;
  /** Initialize/restart game */
  startGame: () => void;
  /** Handle cell click (move or skill) */
  handleCellClick: (index: number, selectedSkill?: SkillName | null) => void;
  /** Update game state directly */
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
}

/**
 * Custom hook for core game engine logic
 * Encapsulates game state management and move execution
 *
 * @param props - Game configuration
 * @returns Game state and handlers
 */
export function useGameEngine(props: UseGameEngineProps = {}): GameEngineReturn {
  const { playerXClass = null, playerOClass = null, isAIMode = false } = props;

  const [gameState, setGameState] = useState<GameState>(() => {
    const state = createInitialState();
    if (playerXClass) state.playerClasses.X = playerXClass;
    if (playerOClass || isAIMode) {
      state.playerClasses.O = playerOClass || playerXClass;
    }
    return state;
  });

  // Use win detection hook
  const winResult = useWinDetection(gameState.board);

  /**
   * Initialize or restart game
   */
  const startGame = useCallback(() => {
    const newState = createInitialState();
    if (playerXClass) newState.playerClasses.X = playerXClass;
    if (playerOClass || isAIMode) {
      newState.playerClasses.O = playerOClass || playerXClass;
    }
    setGameState(newState);
  }, [playerXClass, playerOClass, isAIMode]);

  /**
   * Handle cell click for move or skill execution
   */
  const handleCellClick = useCallback(
    (index: number, selectedSkill?: SkillName | null) => {
      // Basic validation
      if (index < 0 || index > 8) {
        return;
      }

      // Prevent AI moves during AI turn (handled by caller)
      // Execute move or skill
      let newState: GameState;

      if (selectedSkill) {
        newState = executeSkill(gameState, selectedSkill, index as CellIndex);
      } else {
        if (!isValidMove(gameState, index as CellIndex)) {
          return;
        }
        newState = makeMove(gameState, index as CellIndex);
      }

      setGameState(newState);
    },
    [gameState]
  );

  return {
    gameState,
    winResult,
    startGame,
    handleCellClick,
    setGameState,
  };
}
