import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Routine, Exercise, RoutineExercise } from '../data/types';
import { type Filters, emptyFilters } from '../store/useStore';
import { FilterPanel } from '../components/FilterPanel';
import { ExerciseListItem } from '../components/ExerciseListItem';
import { ExerciseDetailModal } from '../components/ExerciseDetailModal';
import { usePageTitle } from '../context/NavContext';

/** Sort key that ignores leading "The" for alphabetical ordering. */
const sortKey = (name: string) => name.replace(/^the\s+/i, '').toLowerCase();

interface Props {
  routines: Routine[];
  filterExercises: (filters: Filters) => Exercise[];
  getExercise: (id: string) => Exercise | undefined;
  addExerciseToRoutine: (routineId: string, exerciseId: string) => void;
  removeExerciseFromRoutine: (routineId: string, exerciseId: string) => void;
  reorderRoutineExercises: (routineId: string, exercises: RoutineExercise[]) => void;
}

export function RoutineBuilder({
  routines,
  filterExercises,
  addExerciseToRoutine,
  removeExerciseFromRoutine,
}: Props) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  usePageTitle('Build Routine');

  const routine = routines.find(r => r.id === id);

  const exercises = useMemo(
    () => [...filterExercises(filters)].sort((a, b) => sortKey(a.name).localeCompare(sortKey(b.name))),
    [filterExercises, filters],
  );

  if (!routine) {
    return (
      <div className="page">
        <p>Routine not found.</p>
        <button className="btn btn-primary" onClick={() => navigate('/')}>Back to Dashboard</button>
      </div>
    );
  }

  // Build a map from exerciseId → 1-based selection index (order they were added)
  const selectionIndexMap = new Map(
    routine.exercises.map((re, i) => [re.exerciseId, i + 1])
  );

  const count = routine.exercises.length;

  return (
    <div className="builder-layout">

      {/* ── CATALOG ── */}
      <main className="builder-main">
        <FilterPanel
          filters={filters}
          onChange={setFilters}
          open={filtersOpen}
          onToggle={() => setFiltersOpen(!filtersOpen)}
        />

        <div className="catalog-body">
          {exercises.length === 0 ? (
            <div className="empty-state small">
              <p>No exercises match your filters.</p>
            </div>
          ) : (
            <div className="exercise-list">
              {exercises.map(ex => (
                <ExerciseListItem
                  key={ex.id}
                  exercise={ex}
                  added={selectionIndexMap.has(ex.id)}
                  selectionIndex={selectionIndexMap.get(ex.id)}
                  onToggle={() =>
                    selectionIndexMap.has(ex.id)
                      ? removeExerciseFromRoutine(routine.id, ex.id)
                      : addExerciseToRoutine(routine.id, ex.id)
                  }
                  onInfo={() => setSelectedExercise(ex)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* ── STICKY BOTTOM BAR ── */}
      <div className="seq-bar">
        <span className="seq-bar-count">
          {count} Exercise{count !== 1 ? 's' : ''}
        </span>
        <button
          className="seq-bar-next"
          onClick={() => navigate(`/routine/${routine.id}`)}
        >
          Review &rsaquo;
        </button>
      </div>

      {/* Exercise detail modal */}
      {selectedExercise && (
        <ExerciseDetailModal
          exercise={selectedExercise}
          added={selectionIndexMap.has(selectedExercise.id)}
          onAdd={() => addExerciseToRoutine(routine.id, selectedExercise.id)}
          onClose={() => setSelectedExercise(null)}
        />
      )}
    </div>
  );
}
