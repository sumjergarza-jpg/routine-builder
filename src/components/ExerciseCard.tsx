import type { Exercise } from '../data/types';
import { equipmentLabels, difficultyLabels, focusLabels } from '../data/labels';

interface Props {
  exercise: Exercise;
  onAdd?: () => void;
  onRemove?: () => void;
  added?: boolean;
}

function IconLayers() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}

function IconTarget() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="4" />
    </svg>
  );
}

export function ExerciseCard({ exercise, onAdd, onRemove, added }: Props) {
  return (
    <div className="exercise-card">
      <div className="exercise-card-header">
        <h3 className="exercise-card-name">{exercise.name}</h3>
        {onAdd && !added && (
          <button className="exercise-add-btn" onClick={onAdd} title="Add to routine">+</button>
        )}
        {added && !onRemove && (
          <button className="exercise-add-btn added" title="Added">✓</button>
        )}
        {onRemove && (
          <button className="btn btn-sm btn-danger" onClick={onRemove}>Remove</button>
        )}
      </div>

      <p className="exercise-card-desc">{exercise.description}</p>

      <div className="exercise-card-tags">
        <span className="tag tag-equipment">
          <IconLayers />
          {equipmentLabels[exercise.equipment]}
        </span>
        {exercise.focus.map(f => (
          <span key={f} className="tag tag-focus">
            <IconTarget />
            {focusLabels[f]}
          </span>
        ))}
      </div>

      <div className="exercise-card-difficulty">
        {difficultyLabels[exercise.difficulty]}
      </div>
    </div>
  );
}
