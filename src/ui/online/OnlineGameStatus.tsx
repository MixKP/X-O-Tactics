import type { PlayerClass } from '../../types';

interface OnlineGameStatusProps {
  opponentUsername: string;
  playerNumber: 1 | 2;
  playerSymbol: 'X' | 'O';
  opponentSymbol: 'X' | 'O';
  playerClass: PlayerClass;
  opponentClass: PlayerClass;
  isPlayerTurn: boolean;
  opponentConnected: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'reconnecting';
  gameMode: 'ranked' | 'casual';
}

export function OnlineGameStatus({
  opponentUsername,
  playerNumber,
  playerSymbol,
  opponentSymbol,
  playerClass,
  opponentClass,
  isPlayerTurn,
  opponentConnected,
  connectionStatus,
  gameMode,
}: OnlineGameStatusProps) {
  const getClassEmoji = (className: PlayerClass): string => {
    return className === 'disruptor' ? '🌀' : '🎯';
  };

  const getConnectionColor = (): string => {
    switch (connectionStatus) {
      case 'connected':
        return opponentConnected ? 'bg-green-500' : 'bg-yellow-500';
      case 'connecting':
      case 'reconnecting':
        return 'bg-yellow-500 animate-pulse';
      case 'disconnected':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getConnectionText = (): string => {
    if (connectionStatus === 'connecting') return 'Connecting...';
    if (connectionStatus === 'reconnecting') return 'Reconnecting...';
    if (connectionStatus === 'disconnected') return 'Disconnected';
    return opponentConnected ? 'Opponent Online' : 'Opponent Away';
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-purple-500/30 p-4 mb-4">
      {/* Connection Status Bar */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${getConnectionColor()}`}></div>
          <span className="text-xs text-gray-400">{getConnectionText()}</span>
        </div>
        {gameMode === 'ranked' && (
          <span className="text-xs font-bold text-yellow-400">⭐ RANKED</span>
        )}
      </div>

      {/* Players Info */}
      <div className="grid grid-cols-2 gap-4">
        {/* You */}
        <div className={`p-3 rounded-lg ${isPlayerTurn ? 'bg-cyan-500/20 border border-cyan-500/50' : 'bg-gray-900/50'}`}>
          <p className="text-xs text-gray-400 mb-1">You ({playerSymbol})</p>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{getClassEmoji(playerClass)}</span>
            <div>
              <p className="text-sm font-bold text-white">Player {playerNumber}</p>
              <p className="text-xs text-gray-400 capitalize">{playerClass}</p>
            </div>
          </div>
        </div>

        {/* Opponent */}
        <div className={`p-3 rounded-lg ${!isPlayerTurn ? 'bg-purple-500/20 border border-purple-500/50' : 'bg-gray-900/50'}`}>
          <p className="text-xs text-gray-400 mb-1">Opponent ({opponentSymbol})</p>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{getClassEmoji(opponentClass)}</span>
            <div>
              <p className="text-sm font-bold text-white">{opponentUsername}</p>
              <p className="text-xs text-gray-400 capitalize">{opponentClass}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Turn Indicator */}
      <div className="mt-3 text-center">
        <p className={`text-lg font-bold ${isPlayerTurn ? 'text-cyan-400' : 'text-gray-400'}`}>
          {isPlayerTurn ? "Your Turn" : `${opponentUsername}'s Turn`}
        </p>
      </div>
    </div>
  );
}
