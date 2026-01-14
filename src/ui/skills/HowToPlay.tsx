interface HowToPlayProps {
  onClose: () => void;
}

export function HowToPlay({ onClose }: HowToPlayProps) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-white">How to Play</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-4 text-sm sm:text-base text-gray-300">
          {/* Basic Rules */}
          <section className="bg-gray-700/50 p-3 rounded-lg">
            <h3 className="text-lg font-bold text-cyan-400 mb-2">🎯 Basic Rules</h3>
            <ul className="space-y-1 list-disc list-inside">
              <li>Get 3 in a row (horizontal, vertical, or diagonal) to win</li>
              <li>Each turn, place a mark OR use a Skill</li>
              <li>Normal placement: <span className="text-green-400 font-bold">+1 MP</span> (max 5)</li>
              <li>Using a Skill: <span className="text-red-400 font-bold">consumes MP</span>, no MP gain that turn</li>
            </ul>
          </section>

          {/* How MP Works */}
          <section className="bg-gray-700/50 p-3 rounded-lg">
            <h3 className="text-lg font-bold text-yellow-400 mb-2">⚡ Energy (MP) System</h3>
            <ul className="space-y-1 list-disc list-inside">
              <li>Both players start with <span className="text-white font-bold">0 MP</span></li>
              <li>Each normal placement gives <span className="text-green-400 font-bold">+1 MP</span></li>
              <li>MP caps at <span className="text-purple-400 font-bold">5</span></li>
              <li>Skills cost MP to use (2-5 MP depending on skill)</li>
            </ul>
          </section>

          {/* The Disruptor Skills */}
          <section className="bg-cyan-900/30 p-3 rounded-lg border border-cyan-700">
            <h3 className="text-lg font-bold text-cyan-400 mb-2">⚡ The Disruptor Skills</h3>
            <div className="space-y-2">
              <div className="bg-gray-800/50 p-2 rounded">
                <p className="font-bold text-cyan-300">Shift (2 MP)</p>
                <p className="text-xs text-gray-400">Move your mark to an adjacent empty cell</p>
              </div>
              <div className="bg-gray-800/50 p-2 rounded">
                <p className="font-bold text-cyan-300">Freeze (3 MP)</p>
                <p className="text-xs text-gray-400">Lock an empty cell for 2 turns (❄️)</p>
              </div>
              <div className="bg-gray-800/50 p-2 rounded">
                <p className="font-bold text-cyan-300">Vanish (4 MP)</p>
                <p className="text-xs text-gray-400">Remove one opponent mark (can't break 2-in-a-row or last mark)</p>
              </div>
            </div>
          </section>

          {/* The Tactician Skills */}
          <section className="bg-orange-900/30 p-3 rounded-lg border border-orange-700">
            <h3 className="text-lg font-bold text-orange-400 mb-2">🛡️ The Tactician Skills</h3>
            <div className="space-y-2">
              <div className="bg-gray-800/50 p-2 rounded">
                <p className="font-bold text-orange-300">Double Step (3 MP)</p>
                <p className="text-xs text-gray-400">Place a mark, but skip MP gain next turn</p>
              </div>
              <div className="bg-gray-800/50 p-2 rounded">
                <p className="font-bold text-orange-300">Shield (2 MP)</p>
                <p className="text-xs text-gray-400">Protect your mark from removal/movement (🛡️)</p>
              </div>
              <div className="bg-gray-800/50 p-2 rounded">
                <p className="font-bold text-orange-300">Swap (5 MP)</p>
                <p className="text-xs text-gray-400">Swap your mark with opponent's mark</p>
              </div>
            </div>
          </section>

          {/* Board Effects */}
          <section className="bg-gray-700/50 p-3 rounded-lg">
            <h3 className="text-lg font-bold text-blue-400 mb-2">🎨 Board Effects</h3>
            <ul className="space-y-1 list-disc list-inside">
              <li>❄️ <span className="text-blue-300">Frozen cells</span> - Can't place marks there</li>
              <li>🛡️ <span className="text-green-300">Shielded marks</span> - Can't be removed or moved</li>
            </ul>
          </section>

          {/* How to Use Skills */}
          <section className="bg-purple-900/30 p-3 rounded-lg border border-purple-700">
            <h3 className="text-lg font-bold text-purple-400 mb-2">🎮 How to Use Skills</h3>
            <ol className="space-y-1 list-decimal list-inside">
              <li>Click a skill button when you have enough MP</li>
              <li>The skill button will highlight when selected</li>
              <li>Click a cell on the board to target the skill</li>
              <li>Press ESC or click Cancel to deselect</li>
            </ol>
          </section>

          {/* Tips */}
          <section className="bg-yellow-900/30 p-3 rounded-lg border border-yellow-700">
            <h3 className="text-lg font-bold text-yellow-400 mb-2">💡 Tips</h3>
            <ul className="space-y-1 list-disc list-inside">
              <li>Save MP for关键时刻 (critical moments)</li>
              <li>Shields protect your important marks</li>
              <li>Freeze can block opponent's winning moves</li>
              <li>Timing is everything!</li>
            </ul>
          </section>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700"
        >
          Got it!
        </button>
      </div>
    </div>
  );
}
