import { useMemo } from 'react';

export interface MPBarProps {
  /** Current MP value */
  current: number;
  /** Maximum MP value (default: 5) */
  max?: number;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Color variant */
  color?: 'cyan' | 'orange' | 'purple' | 'green' | 'gray';
  /** Show numeric value */
  showValue?: boolean;
  /** Label to display */
  label?: string;
  /** Orientation */
  orientation?: 'horizontal' | 'vertical';
}

/**
 * Reusable MP bar component for displaying magic points
 * Used across PlayerStatus, SkillPanel, and OnlineGame components
 */
export function MPBar({
  current,
  max = 5,
  size = 'md',
  color = 'cyan',
  showValue = true,
  label,
  orientation = 'horizontal',
}: MPBarProps) {
  // Memoize dots array to prevent recreation on every render
  const dots = useMemo(() => Array.from({ length: max }, (_, i) => i), [max]);

  // Size classes
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  // Color classes
  const colorClasses = {
    cyan: 'bg-cyan-400',
    orange: 'bg-orange-400',
    purple: 'bg-purple-400',
    green: 'bg-green-400',
    gray: 'bg-gray-400',
  };

  const inactiveClass = 'bg-gray-600';

  return (
    <div
      className={`flex items-center gap-1 ${
        orientation === 'vertical' ? 'flex-col' : 'flex-row'
      }`}
    >
      {label && (
        <span className="text-xs text-gray-400 whitespace-nowrap">{label}</span>
      )}

      <div className={`flex gap-0.5 ${orientation === 'vertical' ? 'flex-col' : 'flex-row'}`}>
        {dots.map((i) => (
          <div
            key={i}
            className={`${sizeClasses[size]} rounded-full ${
              i < current ? colorClasses[color] : inactiveClass
            }`}
          />
        ))}
      </div>

      {showValue && (
        <span className="text-white text-sm font-bold whitespace-nowrap">
          {current}/{max}
        </span>
      )}
    </div>
  );
}
