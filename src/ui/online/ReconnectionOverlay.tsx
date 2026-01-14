interface ReconnectionOverlayProps {
  attemptNumber: number;
  maxAttempts: number;
  onGiveUp?: () => void;
}

export function ReconnectionOverlay({ attemptNumber, maxAttempts, onGiveUp }: ReconnectionOverlayProps) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl border border-yellow-500/50 p-8 max-w-md w-full text-center shadow-2xl">
        {/* Spinner */}
        <div className="mb-6">
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 border-4 border-gray-700 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-yellow-500 rounded-full border-t-transparent animate-spin"></div>
          </div>
        </div>

        {/* Message */}
        <h2 className="text-2xl font-bold text-white mb-2">Connection Lost</h2>
        <p className="text-gray-400 mb-4">
          Attempting to reconnect to the game...
        </p>

        {/* Attempt Counter */}
        <div className="mb-6">
          <div className="flex items-center justify-center gap-2">
            {Array.from({ length: maxAttempts }).map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full ${
                  i < attemptNumber
                    ? 'bg-yellow-500'
                    : 'bg-gray-700'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Attempt {attemptNumber} of {maxAttempts}
          </p>
        </div>

        {/* Give Up Button */}
        {onGiveUp && (
          <button
            onClick={onGiveUp}
            className="w-full py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-500 transition-all"
          >
            Give Up & Forfeit Match
          </button>
        )}

        <p className="text-xs text-gray-500 mt-4">
          Don't close this window! We're trying to restore your game session.
        </p>
      </div>
    </div>
  );
}
