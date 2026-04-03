import type { Exercise } from '../data/types';
import { equipmentLabels, focusLabels, difficultyLabels } from '../data/labels';

interface Props {
  exercise: Exercise;
  added: boolean;
  onToggle: () => void;
  onInfo: () => void;
}

function IconCheck() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconInfo() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

export function ExerciseListItem({ exercise, added, onToggle, onInfo }: Props) {
  return (
    <div
      className={`exl-item${added ? ' exl-item-added' : ''}`}
      onClick={onToggle}
      role="checkbox"
      aria-checked={added}
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' || e.key === ' ' ? (e.preventDefault(), onToggle()) : undefined}
    >
      {/* Fixed-width selection column — always present to prevent layout shift */}
      <span className="exl-check-col" aria-hidden="true">
        {added && <IconCheck />}
      </span>

      {/* Name */}
      <span className="exl-name">{exercise.name}</span>

      {/* Tags */}
      <div className="exl-tags">
        <span className="exl-tag exl-tag-equipment">
          {equipmentLabels[exercise.equipment]}
        </span>
        {exercise.focus.slice(0, 2).map(f => (
          <span key={f} className="exl-tag exl-tag-focus">
            {focusLabels[f]}
          </span>
        ))}
        <span className="exl-difficulty">{difficultyLabels[exercise.difficulty]}</span>
      </div>

      {/* Info icon */}
      <button
        className="exl-info-btn"
        onClick={e => { e.stopPropagation(); onInfo(); }}
        title="View details"
        aria-label={`View details for ${exercise.name}`}
        tabIndex={-1}
      >
        <IconInfo />
      </button>
    </div>
  );
}
