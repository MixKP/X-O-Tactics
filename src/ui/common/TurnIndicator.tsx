import type { Player, PlayerClass } from '../../types';

export interface TurnIndicatorProps {
  currentPlayer: Player;
  playerClass: PlayerClass | null;
  isOnline?: boolean;
  opponentUsername?: string;
}

/**
 * Reusable turn indicator component
 * Displays whose turn it is with styling
 */
export function TurnIndicator({
  currentPlayer,
  playerClass,
  isOnline = false,
  opponentUsername,
}: TurnIndicatorProps) {
  const playerColor = currentPlayer === 'X' ? 'cyan' : 'orange';
  const className = currentPlayer === 'X' ? 'The Disruptor' : 'The Tactician';

  return (
    <div
      className={`
        flex items-center gap-3 p-4 rounded-lg
        bg-${playerColor}-900/30 ring-2 ring-${playerColor}-400
        animate-pulse
      `}
    >
      <div
        className={`
          w-12 h-12 flex items-center justify-center text-2xl font-bold rounded-lg
          ${currentPlayer === 'X' ? 'bg-cyan-600 text-white' : 'bg-orange-600 text-white'}
        `}
      >
        {currentPlayer}
      </div>

      <div className="flex flex-col">
        <span className="text-white text-lg font-bold">Player {currentPlayer}'s Turn</span>
        {playerClass && (
          <span className="text-sm text-gray-300">{className}</span>
        )}
        {isOnline && opponentUsername && (
          <span className="text-xs text-gray-400">vs {opponentUsername}</span>
        )}
      </div>
    </div>
  );
}
