import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Exercise } from '../data/types';
import { equipmentLabels, difficultyLabels } from '../data/labels';

interface Props {
  id: string;
  exercise: Exercise;
  index: number;
  onRemove: () => void;
}

export function SortableExercise({ id, exercise, index, onRemove }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="sortable-exercise">
      <div className="sortable-handle" {...attributes} {...listeners}>
        <span className="drag-icon">⠿</span>
        <span className="exercise-order">{index + 1}</span>
      </div>
      <div className="sortable-content">
        <div className="sortable-name">{exercise.name}</div>
        <div className="sortable-meta">
          {equipmentLabels[exercise.equipment]} · {difficultyLabels[exercise.difficulty]}
        </div>
      </div>
      <button className="btn btn-sm btn-danger" onClick={onRemove}>×</button>
    </div>
  );
}
