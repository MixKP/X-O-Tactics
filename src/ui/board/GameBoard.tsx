import { useState } from 'react';
import type { CellValue, BoardEffects } from '../../types';
import { getFrozenCells, getShieldedCells } from '../../utils/effects';

interface GameBoardProps {
  board: CellValue[];
  effects: BoardEffects;
  onCellClick: (index: number) => void;
  disabled?: boolean;
  winningLine?: number[];
  selectedSkill?: string | null;
}

export function GameBoard({
  board,
  effects,
  onCellClick,
  disabled,
  winningLine,
  selectedSkill,
}: GameBoardProps) {
  const [lastPlaced, setLastPlaced] = useState<number | null>(null);

  // Track newly placed marks for animation
  const getAnimationClass = (index: number) => {
    if (lastPlaced === index) {
      return 'animate-pop-in';
    }
    if (board[index] !== null) {
      return 'animate-fade-in';
    }
    return '';
  };

  const handleCellClick = (index: number) => {
    setLastPlaced(index);
    onCellClick(index);
  };

  const frozenCells = getFrozenCells(effects).map(i => i as number);
  const shieldedCells = getShieldedCells(effects).map(i => i as number);

  return (
    <div className="grid grid-cols-3 gap-2 bg-gray-800 p-3 sm:p-4 rounded-lg w-full aspect-square">
      {board.map((cell, index) => {
        const isWinningCell = winningLine?.includes(index);
        const isFrozen = frozenCells.includes(index);
        const isShielded = shieldedCells.includes(index);
        const animationClass = getAnimationClass(index);

        return (
          <button
            key={index}
            onClick={() => handleCellClick(index)}
            disabled={disabled}
            className={`
              relative flex items-center justify-center
              font-bold rounded-lg aspect-square
              transition-all duration-200
              ${cell === null && !disabled && !isFrozen
                ? 'bg-gray-700 hover:bg-gray-600 active:scale-95 cursor-pointer'
                : 'bg-gray-700 cursor-not-allowed'
              }
              ${cell === 'X' ? 'text-cyan-400' : 'text-orange-400'}
              ${isWinningCell ? 'ring-2 sm:ring-4 ring-yellow-400 scale-105' : ''}
              ${isFrozen ? 'opacity-50' : ''}
              ${selectedSkill && cell === null && !isFrozen ? 'ring-2 ring-purple-400' : ''}
              ${animationClass}
            `}
            style={{
              fontSize: 'clamp(2rem, 6vw, 4rem)',
              lineHeight: '1',
            }}
          >
            <span className="select-none">{cell}</span>

            {/* Frozen overlay */}
            {isFrozen && (
              <div className="absolute inset-0 flex items-center justify-center bg-blue-500/30 rounded-lg pointer-events-none">
                <span className="text-xl sm:text-2xl" style={{ fontSize: 'clamp(1rem, 3vw, 1.5rem)' }}>
                  ❄️
                </span>
              </div>
            )}

            {/* Shield indicator */}
            {isShielded && cell !== null && (
              <div className="absolute -top-1 -right-1 bg-green-500 rounded-full border-2 border-white flex items-center justify-center z-10"
                   style={{ width: 'clamp(1rem, 2.5vw, 1.25rem)', height: 'clamp(1rem, 2.5vw, 1.25rem)' }}>
                <span style={{ fontSize: 'clamp(0.5rem, 1.5vw, 0.75rem)' }}>🛡️</span>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
