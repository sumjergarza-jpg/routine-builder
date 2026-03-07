import { useParams, useNavigate } from 'react-router-dom';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import type { Routine, Exercise, RoutineExercise } from '../data/types';
import { SortableExercise } from '../components/SortableExercise';

interface Props {
  routines: Routine[];
  getExercise: (id: string) => Exercise | undefined;
  removeExerciseFromRoutine: (routineId: string, exerciseId: string) => void;
  reorderRoutineExercises: (routineId: string, exercises: RoutineExercise[]) => void;
}

export function RoutineView({ routines, getExercise, removeExerciseFromRoutine, reorderRoutineExercises }: Props) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const routine = routines.find(r => r.id === id);

  if (!routine) {
    return (
      <div className="page">
        <p>Routine not found.</p>
        <button className="btn btn-primary" onClick={() => navigate('/')}>Back to Dashboard</button>
      </div>
    );
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = routine.exercises.findIndex(e => e.exerciseId === active.id);
    const newIndex = routine.exercises.findIndex(e => e.exerciseId === over.id);
    const reordered = arrayMove(routine.exercises, oldIndex, newIndex);
    reorderRoutineExercises(routine.id, reordered);
  };

  const totalExercises = routine.exercises.length;
  const difficulties = routine.exercises
    .map(re => getExercise(re.exerciseId))
    .filter(Boolean)
    .map(e => e!.difficulty);
  const focusAreas = [...new Set(
    routine.exercises
      .flatMap(re => getExercise(re.exerciseId)?.focus ?? [])
  )];

  return (
    <div className="page routine-view">
      <header className="routine-view-header">
        <button className="btn btn-sm btn-outline" onClick={() => navigate('/')}>← Dashboard</button>
        <h1>{routine.title}</h1>
        <button className="btn btn-sm btn-primary" onClick={() => navigate(`/build/${routine.id}`)}>
          + Add Exercises
        </button>
      </header>

      {/* Summary */}
      <div className="routine-summary">
        <div className="summary-stat">
          <span className="summary-number">{totalExercises}</span>
          <span className="summary-label">Exercises</span>
        </div>
        {difficulties.length > 0 && (
          <div className="summary-stat">
            <span className="summary-number">{[...new Set(difficulties)].join(', ')}</span>
            <span className="summary-label">Levels</span>
          </div>
        )}
        {focusAreas.length > 0 && (
          <div className="summary-stat">
            <span className="summary-number">{focusAreas.length}</span>
            <span className="summary-label">Focus Areas</span>
          </div>
        )}
      </div>

      {/* Exercise list with drag to reorder */}
      {routine.exercises.length === 0 ? (
        <div className="empty-state small">
          <p>No exercises in this routine yet.</p>
          <button className="btn btn-primary" onClick={() => navigate(`/build/${routine.id}`)}>
            Add Exercises
          </button>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={routine.exercises.map(e => e.exerciseId)}
            strategy={verticalListSortingStrategy}
          >
            <div className="sortable-list">
              {routine.exercises.map((re, index) => {
                const ex = getExercise(re.exerciseId);
                if (!ex) return null;
                return (
                  <SortableExercise
                    key={re.exerciseId}
                    id={re.exerciseId}
                    exercise={ex}
                    index={index}
                    onRemove={() => removeExerciseFromRoutine(routine.id, re.exerciseId)}
                  />
                );
              })}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
