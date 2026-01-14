import type { Player } from '../../types';

interface OnlineGameOverProps {
  winner: Player | null;
  isDraw: boolean;
  playerSymbol: 'X' | 'O';
  opponentUsername: string;
  gameMode: 'ranked' | 'casual';
  playerRatingChange?: number;
  opponentRatingChange?: number;
  onPlayAgain?: () => void;
  onReturnToMenu?: () => void;
}

export function OnlineGameOver({
  winner,
  isDraw,
  playerSymbol,
  opponentUsername,
  gameMode,
  playerRatingChange,
  opponentRatingChange,
  onPlayAgain,
  onReturnToMenu,
}: OnlineGameOverProps) {
  const playerWon = winner === playerSymbol;

  const getResultEmoji = (): string => {
    if (isDraw) return '🤝';
    if (playerWon) return '🎉';
    return '😔';
  };

  const getResultText = (): string => {
    if (isDraw) return "It's a Draw!";
    if (playerWon) return 'You Won!';
    return `${opponentUsername} Won`;
  };

  const getResultColor = (): string => {
    if (isDraw) return 'text-yellow-400';
    if (playerWon) return 'text-green-400';
    return 'text-red-400';
  };

  const getRatingChangeColor = (change: number): string => {
    if (change > 0) return 'text-green-400';
    if (change < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  const getRatingChangeText = (change: number): string => {
    if (change > 0) return `+${change}`;
    return change.toString();
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl border border-purple-500/30 p-8 max-w-md w-full text-center shadow-2xl animate-pop-in">
        {/* Result Emoji */}
        <div className="text-6xl mb-4">{getResultEmoji()}</div>

        {/* Result Text */}
        <h2 className={`text-4xl font-bold mb-2 ${getResultColor()}`}>
          {getResultText()}
        </h2>

        {/* Game Mode Badge */}
        {gameMode === 'ranked' && (
          <div className="mb-6">
            <span className="px-4 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm font-bold">
              ⭐ RANKED MATCH
            </span>
          </div>
        )}

        {/* ELO Rating Changes */}
        {gameMode === 'ranked' && playerRatingChange !== undefined && opponentRatingChange !== undefined && (
          <div className="bg-gray-900/50 rounded-lg p-4 mb-6">
            <p className="text-gray-400 text-sm mb-3">Rating Changes</p>

            <div className="space-y-2">
              {/* Your Rating Change */}
              <div className="flex items-center justify-between">
                <span className="text-white font-bold">You</span>
                <span className={`text-xl font-bold ${getRatingChangeColor(playerRatingChange)}`}>
                  {getRatingChangeText(playerRatingChange)}
                </span>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-700"></div>

              {/* Opponent Rating Change */}
              <div className="flex items-center justify-between">
                <span className="text-white font-bold">{opponentUsername}</span>
                <span className={`text-xl font-bold ${getRatingChangeColor(opponentRatingChange)}`}>
                  {getRatingChangeText(opponentRatingChange)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Stats Summary */}
        <div className="grid grid-cols-2 gap-4 mb-6 text-left">
          <div className="bg-gray-900/50 rounded-lg p-3">
            <p className="text-gray-400 text-xs mb-1">Result</p>
            <p className={`text-lg font-bold ${getResultColor()}`}>
              {isDraw ? 'Draw' : playerWon ? 'Victory' : 'Defeat'}
            </p>
          </div>

          <div className="bg-gray-900/50 rounded-lg p-3">
            <p className="text-gray-400 text-xs mb-1">Playing As</p>
            <p className="text-lg font-bold text-white">{playerSymbol}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {onPlayAgain && (
            <button
              onClick={onPlayAgain}
              className="w-full py-4 bg-gradient-to-r from-cyan-600 to-purple-600 text-white text-xl font-bold rounded-lg hover:from-cyan-500 hover:to-purple-500 transition-all transform hover:scale-[1.02] shadow-lg"
            >
              🎮 Play Again
            </button>
          )}

          {onReturnToMenu && (
            <button
              onClick={onReturnToMenu}
              className="w-full py-3 bg-gray-700 text-white font-bold rounded-lg hover:bg-gray-600 transition-all"
            >
              📋 Return to Menu
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
