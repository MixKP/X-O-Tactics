interface TitleScreenProps {
  onStart: () => void;
  onCompetitive: () => void;
  onHowToPlay: () => void;
}

export function TitleScreen({ onStart, onCompetitive, onHowToPlay }: TitleScreenProps) {
  return (
    <div className="h-screen w-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-2xl">
        {/* Title */}
        <h1 className="text-5xl sm:text-7xl font-bold text-white mb-2 animate-fade-in">
          X/O <span className="gradient-shimmer">Tactics</span>
        </h1>
        <p className="text-gray-400 text-lg sm:text-xl mb-8 animate-slide-left">
          Turn-Based Tactical Tic-Tac-Toe
        </p>

        {/* Tagline */}
        <div className="mb-12 p-6 bg-gradient-to-r from-cyan-900/30 to-purple-900/30 rounded-lg border border-cyan-700/50 animate-slide-right">
          <p className="text-cyan-300 text-lg sm:text-xl font-semibold mb-2">
            ⚡ Easy to Learn, Hard to Master ⚡
          </p>
          <p className="text-gray-300 text-sm sm:text-base">
            Classic tic-tac-toe with an energy system and powerful class-based skills.
            <br />
            Outsmart your opponent with timing, strategy, and skill mastery.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <button
            onClick={onStart}
            className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-purple-600 text-white text-xl font-bold rounded-lg hover:from-cyan-500 hover:to-purple-500 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl animate-glow"
          >
            🎮 Local Game
          </button>
          <button
            onClick={onCompetitive}
            className="px-8 py-4 bg-gradient-to-r from-yellow-600 to-orange-600 text-white text-xl font-bold rounded-lg hover:from-yellow-500 hover:to-orange-500 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            ⚔️ Competitive
          </button>
          <button
            onClick={onHowToPlay}
            className="px-8 py-4 bg-gray-700 text-white text-xl font-bold rounded-lg hover:bg-gray-600 transition-all transform hover:scale-105"
          >
            📖 How to Play
          </button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm animate-fade-in">
          <div className="p-4 bg-cyan-900/30 rounded-lg border border-cyan-700/30 hover:border-cyan-600/50 transition-colors">
            <p className="text-cyan-400 font-bold mb-1">⚡ Energy System</p>
            <p className="text-gray-400">Gain MP each turn, spend on powerful skills</p>
          </div>
          <div className="p-4 bg-purple-900/30 rounded-lg border border-purple-700/30 hover:border-purple-600/50 transition-colors">
            <p className="text-purple-400 font-bold mb-1">🎭 Two Classes</p>
            <p className="text-gray-400">Disruptor or Tactician - unique playstyles</p>
          </div>
          <div className="p-4 bg-yellow-900/30 rounded-lg border border-yellow-700/30 hover:border-yellow-600/50 transition-colors">
            <p className="text-yellow-400 font-bold mb-1">⚔️ Competitive</p>
            <p className="text-gray-400">Online multiplayer with ELO rankings</p>
          </div>
          <div className="p-4 bg-orange-900/30 rounded-lg border border-orange-700/30 hover:border-orange-600/50 transition-colors">
            <p className="text-orange-400 font-bold mb-1">🤖 AI Opponent</p>
            <p className="text-gray-400">Easy, Medium, or Hard difficulty</p>
          </div>
        </div>

        {/* Version info */}
        <p className="mt-12 text-gray-600 text-xs">
          v1.2 - Competitive Multiplayer
        </p>
      </div>
    </div>
  );
}
