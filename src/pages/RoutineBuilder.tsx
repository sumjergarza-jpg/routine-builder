import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Routine, Exercise } from '../data/types';
import { type Filters, emptyFilters } from '../store/useStore';
import { FilterPanel } from '../components/FilterPanel';
import { ExerciseCard } from '../components/ExerciseCard';
import { usePageTitle } from '../context/NavContext';

interface Props {
  routines: Routine[];
  filterExercises: (filters: Filters) => Exercise[];
  getExercise: (id: string) => Exercise | undefined;
  addExerciseToRoutine: (routineId: string, exerciseId: string) => void;
  removeExerciseFromRoutine: (routineId: string, exerciseId: string) => void;
  updateRoutine: (id: string, updates: Partial<Pick<Routine, 'title'>>) => void;
  updateDescription: (routineId: string, description: string) => void;
}

function IconPlayCircle() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polygon points="10 8 16 12 10 16 10 8" />
    </svg>
  );
}

function IconLayers() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}

export function RoutineBuilder({
  routines,
  filterExercises,
  getExercise,
  addExerciseToRoutine,
  removeExerciseFromRoutine,
  updateRoutine,
  updateDescription,
}: Props) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const routine = routines.find(r => r.id === id);
  const [editTitle, setEditTitle] = useState(routine?.title ?? '');
  const [notes, setNotes] = useState(routine?.description ?? '');
  usePageTitle('Build Routine');

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

  const handleSave = () => {
    if (!editTitle.trim()) return;
    updateRoutine(routine.id, { title: editTitle.trim() });
    updateDescription(routine.id, notes);
    navigate(`/routine/${routine.id}`);
  };

  return (
    <div className="builder-layout">
      {/* LEFT PANEL — form + sequence (no nav links, those are in TopNav) */}
      <aside className="builder-sidebar">
        <div className="sidebar-form">
          <h2 className="sidebar-form-title">Build a Routine</h2>
          <p className="sidebar-form-subtitle">Tap + on any exercise to add it.</p>

          <input
            type="text"
            className="routine-name-input"
            placeholder="Routine name..."
            value={editTitle}
            onChange={e => setEditTitle(e.target.value)}
          />

          <textarea
            className="routine-notes-input"
            placeholder="Notes or class intention..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />

          <button
            className="btn btn-primary save-routine-btn"
            onClick={handleSave}
            disabled={!editTitle.trim()}
          >
            Next →
          </button>
        </div>

        {/* Sequence */}
        <div className="sequence-section">
          <div className="sequence-header">
            <IconPlayCircle />
            <span>Sequence</span>
            <span className="sequence-count">{routine.exercises.length}</span>
          </div>

          {routine.exercises.length === 0 ? (
            <div className="sequence-empty">
              <span className="sequence-empty-icon"><IconLayers /></span>
              <p>No exercises yet. Browse the library on the right and tap + to add them here.</p>
            </div>
          ) : (
            <div className="sequence-items">
              {routine.exercises.map((re, i) => {
                const ex = getExercise(re.exerciseId);
                if (!ex) return null;
                return (
                  <div key={re.exerciseId} className="sequence-item">
                    <span className="sequence-item-num">{i + 1}</span>
                    <span className="sequence-item-name">{ex.name}</span>
                    <button
                      className="sequence-item-remove"
                      onClick={() => removeExerciseFromRoutine(routine.id, re.exerciseId)}
                    >×</button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </aside>

      {/* RIGHT PANEL */}
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
            <div className="exercise-grid">
              {exercises.map(ex => (
                <ExerciseCard
                  key={ex.id}
                  exercise={ex}
                  added={addedIds.has(ex.id)}
                  onAdd={() => addExerciseToRoutine(routine.id, ex.id)}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
