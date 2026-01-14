interface HeaderProps {
  onHowToPlay: () => void;
}

export function Header({ onHowToPlay }: HeaderProps) {
  return (
    <div className="flex-shrink-0 text-center mb-2 sm:mb-4">
      <h1 className="text-2xl sm:text-4xl font-bold text-white mb-1">X/O Tactics</h1>
      <p className="text-gray-400 text-xs sm:text-sm mb-2">Phase 2: Skill System</p>
      <button
        onClick={onHowToPlay}
        className="px-3 py-1 bg-purple-600 text-white text-xs sm:text-sm rounded hover:bg-purple-700 transition-colors"
      >
        📖 How to Play
      </button>
    </div>
  );
}
