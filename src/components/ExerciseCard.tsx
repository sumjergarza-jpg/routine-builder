import type { Exercise } from '../data/types';
import { equipmentLabels, difficultyLabels, focusLabels } from '../data/labels';

interface Props {
  exercise: Exercise;
  onAdd?: () => void;
  onRemove?: () => void;
  added?: boolean;
}

const difficultyColors: Record<string, string> = {
  beginner: '#22c55e',
  intermediate: '#f59e0b',
  advanced: '#ef4444',
};

export function ExerciseCard({ exercise, onAdd, onRemove, added }: Props) {
  return (
    <div className="exercise-card">
      <div className="exercise-card-header">
        <h3 className="exercise-card-name">{exercise.name}</h3>
        {onAdd && !added && (
          <button className="btn btn-sm btn-primary" onClick={onAdd}>+ Add</button>
        )}
        {onRemove && (
          <button className="btn btn-sm btn-danger" onClick={onRemove}>Remove</button>
        )}
        {added && !onRemove && (
          <span className="badge badge-added">Added</span>
        )}
      </div>
      <p className="exercise-card-desc">{exercise.description}</p>
      <div className="exercise-card-tags">
        <span className="tag tag-equipment">{equipmentLabels[exercise.equipment]}</span>
        <span className="tag" style={{ backgroundColor: difficultyColors[exercise.difficulty], color: '#fff' }}>
          {difficultyLabels[exercise.difficulty]}
        </span>
        {exercise.focus.map(f => (
          <span key={f} className="tag tag-focus">{focusLabels[f]}</span>
        ))}
      </div>
    </div>
  );
}
