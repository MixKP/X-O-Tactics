import type { SkillDefinition } from '../../types';

interface SkillButtonProps {
  skill: SkillDefinition;
  currentMP: number;
  isCurrentTurn: boolean;
  isSelected: boolean;
  onSelect: () => void;
}

export function SkillButton({
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
        relative p-2 sm:p-3 rounded-lg text-left transition-all
        ${isSelected
          ? 'ring-2 ring-blue-400 bg-blue-900/50'
          : 'bg-gray-800 hover:bg-gray-700'
        }
        ${isDisabled
          ? 'opacity-50 cursor-not-allowed'
          : 'cursor-pointer active:scale-95'
        }
      `}
      title={skill.description}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-semibold text-white truncate capitalize">
            {skill.name}
          </p>
          <p className="text-xs text-gray-400 truncate hidden sm:block">
            {skill.description}
          </p>
        </div>

        <div
          className={`
            flex-shrink-0 px-2 py-1 rounded text-xs font-bold
            ${canAfford ? 'bg-purple-600 text-white' : 'bg-red-900 text-red-300'}
          `}
        >
          {skill.mpCost} MP
        </div>
      </div>

      {isSelected && (
        <div className="absolute inset-0 ring-2 ring-blue-400 rounded-lg pointer-events-none" />
      )}
    </button>
  );
}
