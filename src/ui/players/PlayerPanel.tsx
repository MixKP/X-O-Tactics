import type { Player, PlayerClass } from '../../types';
import type { SkillDefinition } from '../../types';
import { PlayerStatus } from '../status/PlayerStatus';
import { SkillPanel } from '../skills/SkillPanel';

interface PlayerPanelProps {
  player: Player;
  playerClass: PlayerClass | null;
  mp: number;
  isCurrentTurn: boolean;
  skills: SkillDefinition[];
  selectedSkill: string | null;
  onSkillSelect: (skillName: string) => void;
}

export function PlayerPanel({
  player,
  playerClass,
  mp,
  isCurrentTurn,
  skills,
  selectedSkill,
  onSkillSelect,
}: PlayerPanelProps) {
  const playerColor = player === 'X' ? 'cyan' : 'orange';
  const classIcon = playerClass === 'disruptor' ? '⚡' : '🛡️';
  const className = playerClass === 'disruptor' ? 'Disruptor' : 'Tactician';

  return (
    <div className="flex flex-col h-full p-2 sm:p-4 bg-gray-800/50 rounded-lg">
      {/* Player Header */}
      <div className={`p-3 rounded-lg mb-3 ${isCurrentTurn ? `bg-${playerColor}-900/50 ring-2 ring-${playerColor}-500` : 'bg-gray-700'}`}>
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-2xl font-bold rounded ${player === 'X' ? 'bg-cyan-600 text-white' : 'bg-orange-600 text-white'}`}>
            {player}
          </div>
          <div>
            <p className="text-white font-bold text-sm sm:text-base">Player {player}</p>
            {playerClass && (
              <p className={`text-xs ${isCurrentTurn ? `text-${playerColor}-300` : 'text-gray-400'}`}>
                {classIcon} {className}
              </p>
            )}
          </div>
        </div>
        <PlayerStatus
          player={player}
          mp={mp}
          isCurrentTurn={isCurrentTurn}
        />
      </div>

      {/* Skills */}
      {isCurrentTurn && (
        <div className="flex-1 overflow-y-auto">
          <SkillPanel
            skills={skills}
            currentMP={mp}
            isCurrentTurn={isCurrentTurn}
            selectedSkill={selectedSkill}
            onSkillSelect={onSkillSelect}
          />
        </div>
      )}

      {/* Not my turn indicator */}
      {!isCurrentTurn && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500 text-sm text-center">
            Waiting for opponent...
          </p>
        </div>
      )}
    </div>
  );
}
