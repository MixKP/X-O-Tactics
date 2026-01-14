import type { Player, PlayerClass } from '../../types';
import { MPBar } from './MPBar';

export interface PlayerInfoProps {
  player: Player;
  username?: string;
  playerClass: PlayerClass | null;
  mp: number;
  isCurrentTurn: boolean;
  isOnline?: boolean;
  showTurnIndicator?: boolean;
}

/**
 * Reusable player info panel component
 * Consolidates player display, MP, and turn status
 */
export function PlayerInfo({
  player,
  username,
  playerClass,
  mp,
  isCurrentTurn,
  isOnline = false,
  showTurnIndicator = true,
}: PlayerInfoProps) {
  const playerColor = player === 'X' ? 'cyan' : 'orange';
  const className = playerClass === 'disruptor' ? 'The Disruptor' : 'The Tactician';

  return (
    <div
      className={`
        flex items-center gap-3 p-3 rounded-lg transition-all
        ${isCurrentTurn
          ? `bg-${playerColor}-900/50 ring-2 ring-${playerColor}-400`
          : 'bg-gray-800'
        }
      `}
    >
      {/* Player symbol */}
      <div
        className={`
          w-10 h-10 flex items-center justify-center text-xl font-bold rounded
          ${player === 'X' ? 'bg-cyan-600 text-white' : 'bg-orange-600 text-white'}
        `}
      >
        {player}
      </div>

      {/* Player info */}
      <div className="flex flex-col flex-1">
        <span className="text-white text-sm font-semibold">
          {username || `Player ${player}`}
        </span>
        {playerClass && (
          <span className="text-xs text-gray-400">{className}</span>
        )}
      </div>

      {/* MP bar */}
      <MPBar
        current={mp}
        max={5}
        color={player === 'X' ? 'cyan' : 'orange'}
        size="sm"
      />

      {/* Turn indicator */}
      {showTurnIndicator && isCurrentTurn && (
        <span className="text-xs text-gray-400 animate-pulse whitespace-nowrap">
          {isOnline ? 'Your Turn' : 'Thinking...'}
        </span>
      )}
    </div>
  );
}
