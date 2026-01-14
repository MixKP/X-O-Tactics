import type { PlayerClass, AIDifficulty } from '../../types';

interface ClassCardProps {
  playerClass: PlayerClass;
  icon: string;
  name: string;
  description: string;
  skills: string[];
  color: string;
  isSelected: boolean;
  isDisabled: boolean;
  onSelect: () => void;
}

function ClassCard({
  playerClass,
  icon,
  name,
  description,
  skills,
  color,
  isSelected,
  isDisabled,
  onSelect,
}: ClassCardProps) {
  return (
    <button
      onClick={onSelect}
      disabled={isDisabled}
      className={`
        relative p-4 rounded-lg text-left transition-all transform
        ${isSelected
          ? `ring-4 ${color} scale-105 shadow-xl`
          : 'bg-gray-800 hover:bg-gray-700 hover:scale-102'
        }
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {isSelected && (
        <div className={`absolute -top-2 -right-2 w-8 h-8 ${color.replace('bg-', 'bg-').replace('500', '600')} rounded-full flex items-center justify-center`}>
          ✓
        </div>
      )}

      <div className="flex items-center gap-3 mb-3">
        <div className="text-4xl">{icon}</div>
        <div>
          <h3 className={`text-xl font-bold ${isSelected ? color.replace('bg-', 'text-') : 'text-white'}`}>
            {name}
          </h3>
          <p className="text-xs text-gray-400 capitalize">{playerClass}</p>
        </div>
      </div>

      <p className="text-sm text-gray-300 mb-3">{description}</p>

      <div className="space-y-1">
        <p className="text-xs text-gray-400 font-semibold">Skills:</p>
        {skills.map((skill) => (
          <p key={skill} className="text-xs text-gray-300">• {skill}</p>
        ))}
      </div>
    </button>
  );
}

interface DifficultyButtonProps {
  difficulty: AIDifficulty;
  isSelected: boolean;
  onSelect: () => void;
}

function DifficultyButton({ difficulty, isSelected, onSelect }: DifficultyButtonProps) {
  const colors = {
    easy: 'bg-green-600 hover:bg-green-500',
    medium: 'bg-yellow-600 hover:bg-yellow-500',
    hard: 'bg-red-600 hover:bg-red-500',
  };

  const labels = {
    easy: '🟢 Easy',
    medium: '🟡 Medium',
    hard: '🔴 Hard',
  };

  return (
    <button
      onClick={onSelect}
      className={`
        px-4 py-2 rounded-lg font-bold transition-all transform hover:scale-105
        ${isSelected ? colors[difficulty] + ' ring-4 ring-white' : colors[difficulty]}
      `}
    >
      {labels[difficulty]}
    </button>
  );
}

interface ClassSelectionProps {
  playerXClass: PlayerClass | null;
  playerOClass: PlayerClass | null;
  onPlayerXSelect: (playerClass: PlayerClass) => void;
  onPlayerOSelect: (playerClass: PlayerClass) => void;
  onStartGame: () => void;
  onBack: () => void;
  aiDifficulty: AIDifficulty | null;
  onAIDifficultySelect: (difficulty: AIDifficulty) => void;
  isAIMode: boolean;
  onAIModeToggle: () => void;
}

export function ClassSelection({
  playerXClass,
  playerOClass,
  onPlayerXSelect,
  onPlayerOSelect,
  onStartGame,
  onBack,
  aiDifficulty,
  onAIDifficultySelect,
  isAIMode,
  onAIModeToggle,
}: ClassSelectionProps) {
  const canStart = isAIMode
    ? playerXClass && aiDifficulty
    : playerXClass && playerOClass;

  return (
    <div className="h-screen w-screen bg-gray-900 flex flex-col items-center justify-center p-4 overflow-y-auto">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Choose Your Class</h1>
          <p className="text-gray-400">Each class has 3 unique skills and a different playstyle</p>
        </div>

        {/* Game Mode Selection */}
        <div className="mb-6 flex justify-center gap-4">
          <button
            onClick={() => { onAIModeToggle(); }}
            className={`
              px-6 py-3 rounded-lg font-bold transition-all transform hover:scale-105
              ${!isAIMode
                ? 'bg-cyan-600 hover:bg-cyan-500 ring-4 ring-cyan-300'
                : 'bg-gray-700 hover:bg-gray-600'
              }
            `}
          >
            👥 PvP (2 Players)
          </button>
          <button
            onClick={() => { onAIModeToggle(); }}
            className={`
              px-6 py-3 rounded-lg font-bold transition-all transform hover:scale-105
              ${isAIMode
                ? 'bg-purple-600 hover:bg-purple-500 ring-4 ring-purple-300'
                : 'bg-gray-700 hover:bg-gray-600'
              }
            `}
          >
            🤖 vs AI
          </button>
        </div>

        {/* AI Difficulty Selection */}
        {isAIMode && (
          <div className="mb-6 bg-purple-900/30 p-4 rounded-lg border border-purple-700">
            <h3 className="text-lg font-bold text-purple-400 mb-3 text-center">Select AI Difficulty</h3>
            <div className="flex gap-3 justify-center">
              <DifficultyButton
                difficulty="easy"
                isSelected={aiDifficulty === 'easy'}
                onSelect={() => { onAIDifficultySelect('easy'); }}
              />
              <DifficultyButton
                difficulty="medium"
                isSelected={aiDifficulty === 'medium'}
                onSelect={() => { onAIDifficultySelect('medium'); }}
              />
              <DifficultyButton
                difficulty="hard"
                isSelected={aiDifficulty === 'hard'}
                onSelect={() => { onAIDifficultySelect('hard'); }}
              />
            </div>
            <p className="text-xs text-gray-400 text-center mt-2">
              {aiDifficulty === 'easy' && 'Random moves - Good for learning'}
              {aiDifficulty === 'medium' && 'Blocks wins, takes wins - A challenge'}
              {aiDifficulty === 'hard' && 'Minimax algorithm - Very difficult!'}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Player X Selection */}
          <div className="bg-cyan-900/20 p-4 rounded-lg border border-cyan-700">
            <h2 className="text-xl font-bold text-cyan-400 mb-3 text-center">
              🔵 Player X {isAIMode ? '(You)' : ''}
            </h2>
            <div className="space-y-3">
              <ClassCard
                playerClass="disruptor"
                icon="⚡"
                name="The Disruptor"
                description="Control the battlefield with interference and tactical removal"
                skills={[
                  'Shift (2 MP): Move your mark',
                  'Freeze (3 MP): Lock cells',
                  'Vanish (4 MP): Remove opponent mark',
                ]}
                color="bg-cyan-500"
                isSelected={playerXClass === 'disruptor'}
                isDisabled={false}
                onSelect={() => { onPlayerXSelect('disruptor'); }}
              />
              <ClassCard
                playerClass="tactician"
                icon="🛡️"
                name="The Tactician"
                description="Master of planning, combos, and defensive strategies"
                skills={[
                  'Double Step (3 MP): Place two marks',
                  'Shield (2 MP): Protect your mark',
                  'Swap (5 MP): Swap positions',
                ]}
                color="bg-cyan-500"
                isSelected={playerXClass === 'tactician'}
                isDisabled={false}
                onSelect={() => { onPlayerXSelect('tactician'); }}
              />
            </div>
          </div>

          {/* Player O Selection */}
          {!isAIMode ? (
            <div className="bg-orange-900/20 p-4 rounded-lg border border-orange-700">
              <h2 className="text-xl font-bold text-orange-400 mb-3 text-center">🟠 Player O</h2>
              <div className="space-y-3">
                <ClassCard
                  playerClass="disruptor"
                  icon="⚡"
                  name="The Disruptor"
                  description="Control the battlefield with interference and tactical removal"
                  skills={[
                    'Shift (2 MP): Move your mark',
                    'Freeze (3 MP): Lock cells',
                    'Vanish (4 MP): Remove opponent mark',
                  ]}
                  color="bg-orange-500"
                  isSelected={playerOClass === 'disruptor'}
                  isDisabled={false}
                  onSelect={() => { onPlayerOSelect('disruptor'); }}
                />
                <ClassCard
                  playerClass="tactician"
                  icon="🛡️"
                  name="The Tactician"
                  description="Master of planning, combos, and defensive strategies"
                  skills={[
                    'Double Step (3 MP): Place two marks',
                    'Shield (2 MP): Protect your mark',
                    'Swap (5 MP): Swap positions',
                  ]}
                  color="bg-orange-500"
                  isSelected={playerOClass === 'tactician'}
                  isDisabled={false}
                  onSelect={() => { onPlayerOSelect('tactician'); }}
                />
              </div>
            </div>
          ) : (
            <div className="bg-purple-900/20 p-4 rounded-lg border border-purple-700">
              <h2 className="text-xl font-bold text-purple-400 mb-3 text-center">🤖 AI Opponent</h2>
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <p className="text-6xl mb-4">🤖</p>
                  <p className="text-gray-300">
                    AI will play as: <span className="font-bold text-purple-300">{playerOClass || '...'}</span>
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    Difficulty: <span className="font-bold text-white">{aiDifficulty || 'Not selected'}</span>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onBack}
            className="px-6 py-3 bg-gray-700 text-white font-bold rounded-lg hover:bg-gray-600 transition-all"
          >
            ← Back
          </button>
          <button
            onClick={onStartGame}
            disabled={!canStart}
            className={`
              px-8 py-3 text-white font-bold rounded-lg transition-all transform hover:scale-105
              ${canStart
                ? 'bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 shadow-lg'
                : 'bg-gray-600 cursor-not-allowed opacity-50'
              }
            `}
          >
            🎮 Start Battle
          </button>
        </div>

        {!canStart && (
          <p className="text-center text-gray-400 mt-3 text-sm">
            {isAIMode
              ? 'Select your class and AI difficulty to start'
              : 'Both players must select a class to start'
            }
          </p>
        )}
      </div>
    </div>
  );
}
