import type { GameStatus, Player } from '../../types';

interface GameStatusDisplayProps {
  status: GameStatus;
  winner?: Player;
}

export function GameStatusDisplay({ status, winner }: GameStatusDisplayProps) {
  if (status === 'playing') {
    return null;
  }

  if (status === 'won' && winner) {
    const gradient = winner === 'X'
      ? 'from-cyan-600 to-blue-600'
      : 'from-orange-600 to-red-600';

    return (
      <div className={`${gradient} text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-center animate-pop-in shadow-xl`}>
        <p className="text-2xl sm:text-3xl font-bold mb-1">
          🎉 Victory!
        </p>
        <p className="text-xl sm:text-2xl">
          Player {winner} Wins!
        </p>
      </div>
    );
  }

  if (status === 'draw') {
    return (
      <div className="bg-gradient-to-r from-gray-700 to-gray-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-center animate-pop-in shadow-xl">
        <p className="text-2xl sm:text-3xl font-bold">
          🤝 It's a Draw!
        </p>
        <p className="text-sm text-gray-300 mt-1">
          Well played!
        </p>
      </div>
    );
  }

  return null;
}
