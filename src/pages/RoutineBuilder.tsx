import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Routine, Exercise } from '../data/types';
import { type Filters, emptyFilters } from '../store/useStore';
import { FilterPanel } from '../components/FilterPanel';
import { ExerciseCard } from '../components/ExerciseCard';

interface Props {
  routines: Routine[];
  filterExercises: (filters: Filters) => Exercise[];
  getExercise: (id: string) => Exercise | undefined;
  addExerciseToRoutine: (routineId: string, exerciseId: string) => void;
  removeExerciseFromRoutine: (routineId: string, exerciseId: string) => void;
}

export function RoutineBuilder({ routines, filterExercises, getExercise, addExerciseToRoutine, removeExerciseFromRoutine }: Props) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const routine = routines.find(r => r.id === id);
  const exercises = useMemo(() => filterExercises(filters), [filterExercises, filters]);
  const addedIds = new Set(routine?.exercises.map(e => e.exerciseId) ?? []);

  if (!routine) {
    return (
      <div className="page">
        <p>Routine not found.</p>
        <button className="btn btn-primary" onClick={() => navigate('/')}>Back to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="page builder">
      {/* Top banner - routine preview */}
      <div className="builder-banner">
        <div className="builder-banner-info">
          <button className="btn btn-sm btn-outline" onClick={() => navigate('/')}>← Back</button>
          <h2>{routine.title}</h2>
          <span className="badge">{routine.exercises.length} exercise{routine.exercises.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="builder-banner-actions">
          <button className="btn btn-sm btn-outline" onClick={() => setShowPreview(!showPreview)}>
            {showPreview ? 'Hide' : 'Preview'}
          </button>
          <button className="btn btn-sm btn-primary" onClick={() => navigate(`/routine/${routine.id}`)}>
            Done →
          </button>
        </div>
      </div>

      {/* Expandable preview of added exercises */}
      {showPreview && routine.exercises.length > 0 && (
        <div className="builder-preview">
          {routine.exercises.map((re, i) => {
            const ex = getExercise(re.exerciseId);
            if (!ex) return null;
            return (
              <div key={re.exerciseId} className="builder-preview-item">
                <span className="exercise-order">{i + 1}</span>
                <span>{ex.name}</span>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => removeExerciseFromRoutine(routine.id, re.exerciseId)}
                >×</button>
              </div>
            );
          })}
        </div>
      )}

      {/* Filters */}
      <FilterPanel
        filters={filters}
        onChange={setFilters}
        open={filtersOpen}
        onToggle={() => setFiltersOpen(!filtersOpen)}
      />

      {/* Exercise list */}
      <div className="exercise-list">
        {exercises.length === 0 ? (
          <div className="empty-state small">
            <p>No exercises match your filters.</p>
          </div>
        ) : (
          exercises.map(ex => (
            <ExerciseCard
              key={ex.id}
              exercise={ex}
              added={addedIds.has(ex.id)}
              onAdd={() => addExerciseToRoutine(routine.id, ex.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
