import type { Player } from '../../types';

interface PlayerStatusProps {
  player: Player;
  mp: number;
  isCurrentTurn: boolean;
}

export function PlayerStatus({ player, mp, isCurrentTurn }: PlayerStatusProps) {
  const playerColor = player === 'X' ? 'cyan' : 'orange';

  return (
    <div
      className={`
        flex items-center gap-2 sm:gap-4 p-2 sm:p-4 rounded-lg
        ${isCurrentTurn ? `bg-${playerColor}-900/50 ring-1 sm:ring-2 ring-${playerColor}-400` : 'bg-gray-800'}
      `}
    >
      <div
        className={`
          w-8 h-8 sm:w-12 sm:h-12 flex items-center justify-center text-lg sm:text-2xl font-bold rounded
          ${player === 'X' ? 'bg-cyan-600 text-white' : 'bg-orange-600 text-white'}
        `}
      >
        {player}
      </div>

      <div className="flex flex-col">
        <span className="text-gray-300 text-xs sm:text-sm font-medium">Player {player}</span>
        <div className="flex items-center gap-1 sm:gap-2">
          <span className="text-gray-400 text-xs sm:text-sm">MP:</span>
          <div className="flex gap-0.5 sm:gap-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${
                  i < mp ? `bg-${playerColor}-400` : 'bg-gray-600'
                }`}
              />
            ))}
          </div>
          <span className="text-white text-sm sm:text-base font-bold">{mp}/5</span>
        </div>
      </div>

      {isCurrentTurn && (
        <span className="ml-auto text-xs text-gray-400 animate-pulse hidden sm:inline">Thinking...</span>
      )}
    </div>
  );
}
