import type { GameStatus } from '../../types';

interface GameControlsProps {
  status: GameStatus;
  onRestart: () => void;
}

export function GameControls({ status, onRestart }: GameControlsProps) {
  return (
    <div className="flex gap-2 sm:gap-4">
      {(status === 'won' || status === 'draw') && (
        <button
          onClick={onRestart}
          className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 active:scale-95 transition-all text-sm sm:text-base"
        >
          Play Again
        </button>
      )}

      {status === 'playing' && (
        <button
          onClick={onRestart}
          className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 active:scale-95 transition-all text-xs sm:text-sm"
        >
          Restart
        </button>
      )}
    </div>
  );
}
