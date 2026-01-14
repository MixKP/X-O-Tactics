/**
 * AI System Types
 */

export type AIDifficulty = 'easy' | 'medium' | 'hard';

export interface AIMove {
  cellIndex: number;
  skillName?: string;
  score: number;
}

export interface AIPlayer {
  difficulty: AIDifficulty;
  // AI can use skills too
  useSkills: boolean;
}
