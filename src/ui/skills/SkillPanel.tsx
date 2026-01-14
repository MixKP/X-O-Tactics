import type { SkillDefinition } from '../../types';

interface SkillButtonProps {
  skill: SkillDefinition;
  currentMP: number;
  isCurrentTurn: boolean;
  isSelected: boolean;
  onSelect: () => void;
}

function SkillButton({
  skill,
  currentMP,
  isCurrentTurn,
  isSelected,
  onSelect,
}: SkillButtonProps) {
  const canAfford = currentMP >= skill.mpCost;
  const isDisabled = !isCurrentTurn || !canAfford;

  return (
    <button
      onClick={onSelect}
      disabled={isDisabled}
      className={`
        relative w-full p-3 rounded-lg text-left transition-all
        ${isSelected
          ? 'ring-2 ring-blue-400 bg-blue-900/50'
          : 'bg-gray-700 hover:bg-gray-600'
        }
        ${isDisabled
          ? 'opacity-50 cursor-not-allowed'
          : 'cursor-pointer active:scale-98'
        }
      `}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          {/* Skill name with cost */}
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-semibold text-white capitalize">
              {skill.name}
            </p>
            <div
              className={`px-2 py-0.5 rounded text-xs font-bold flex-shrink-0
                ${canAfford ? 'bg-purple-600 text-white' : 'bg-red-900 text-red-300'}
              `}
            >
              {skill.mpCost} MP
            </div>
          </div>

          {/* Skill description */}
          <p className="text-xs text-gray-300">
            {skill.description}
          </p>
        </div>

        {/* Selected indicator */}
        {isSelected && (
          <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs">✓</span>
          </div>
        )}
      </div>

      {/* MP bars */}
      <div className="flex items-center gap-1 mt-2">
        <span className="text-xs text-gray-400">MP:</span>
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`w-3 h-1.5 rounded-full ${
                i < skill.mpCost ? 'bg-purple-400' : 'bg-gray-600'
              }`}
            />
          ))}
        </div>
      </div>
    </button>
  );
}

interface SkillPanelProps {
  skills: SkillDefinition[];
  currentMP: number;
  isCurrentTurn: boolean;
  selectedSkill: string | null;
  onSkillSelect: (skillName: string) => void;
}

export function SkillPanel({
  skills,
  currentMP,
  isCurrentTurn,
  selectedSkill,
  onSkillSelect,
}: SkillPanelProps) {
  if (skills.length === 0) {
    return (
      <div className="bg-gray-800 p-3 rounded-lg text-center text-gray-400 text-sm">
        No skills available
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 p-3 rounded-lg flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-gray-300">Skills</p>
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-400">Your MP:</span>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i < currentMP ? 'bg-green-400' : 'bg-gray-600'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-white font-bold">{currentMP}/5</span>
        </div>
      </div>

      {/* Skills list - vertical */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {skills.map((skill) => (
          <SkillButton
            key={skill.name}
            skill={skill}
            currentMP={currentMP}
            isCurrentTurn={isCurrentTurn}
            isSelected={selectedSkill === skill.name}
            onSelect={() => onSkillSelect(skill.name)}
          />
        ))}
      </div>

      {/* Selected skill message */}
      {selectedSkill && (
        <div className="mt-3 p-2 bg-purple-900/50 rounded-lg border border-purple-500">
          <p className="text-xs text-purple-200 text-center">
            🔮 {selectedSkill} - Click a cell to use
          </p>
          <button
            onClick={() => onSkillSelect('')}
            className="w-full mt-1 text-xs text-purple-300 underline hover:text-purple-100"
          >
            Cancel (ESC)
          </button>
        </div>
      )}

      {/* Not your turn message */}
      {!isCurrentTurn && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500 text-xs text-center">
            Wait for your turn...
          </p>
        </div>
      )}
    </div>
  );
}
