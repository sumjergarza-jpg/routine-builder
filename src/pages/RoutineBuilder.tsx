import { useState, useMemo, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Routine, Exercise } from '../data/types';
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
}

function IconPlayCircle() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

function IconArrowUp() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="19" x2="12" y2="5" />
      <polyline points="5 12 12 5 19 12" />
    </svg>
  );
}

export function RoutineBuilder({
  routines,
  filterExercises,
  getExercise,
  addExerciseToRoutine,
  removeExerciseFromRoutine,
}: Props) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [showStickyBar, setShowStickyBar] = useState(false);

  const sequenceRef = useRef<HTMLDivElement>(null);

  usePageTitle('Build Routine');

  const routine = routines.find(r => r.id === id);

  const exercises = useMemo(
    () => [...filterExercises(filters)].sort((a, b) => sortKey(a.name).localeCompare(sortKey(b.name))),
    [filterExercises, filters],
  );
  const addedIds = new Set(routine?.exercises.map(e => e.exerciseId) ?? []);

  // Sticky bar: show when sequence section scrolls above visible area (mobile)
  useEffect(() => {
    const scrollEl = document.querySelector('.app-content');
    if (!scrollEl) return;

    const check = () => {
      if (!sequenceRef.current) return;
      const rect = sequenceRef.current.getBoundingClientRect();
      // 54px = TopNav height; hide bar if sequence is still on screen
      setShowStickyBar(rect.bottom < 54);
    };

    scrollEl.addEventListener('scroll', check, { passive: true });
    return () => scrollEl.removeEventListener('scroll', check);
  }, []);

  const scrollToSequence = () => {
    sequenceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (!routine) {
    return (
      <div className="page">
        <p>Routine not found.</p>
        <button className="btn btn-primary" onClick={() => navigate('/')}>Back to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="builder-layout">
      {/* LEFT PANEL — sequence + next action */}
      <aside className="builder-sidebar">

        {/* Sequence card */}
        <div className="sequence-section" ref={sequenceRef}>
          <div className="sequence-header">
            <IconPlayCircle />
            <span>Sequence</span>
            <span className="sequence-count">{routine.exercises.length}</span>
          </div>

          {routine.exercises.length === 0 ? (
            <div className="sequence-empty">
              <span className="sequence-empty-icon"><IconLayers /></span>
              <p>Tap any exercise to add it to your sequence.</p>
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
                      aria-label={`Remove ${ex.name}`}
                    >×</button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Next action — lives directly under sequence */}
        <div className="sequence-next-wrap">
          <button
            className="btn btn-primary sequence-next-btn"
            onClick={() => navigate(`/routine/${routine.id}`)}
          >
            Next →
          </button>
        </div>

      </aside>

      {/* RIGHT PANEL — filter + exercise list */}
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
                  added={addedIds.has(ex.id)}
                  onToggle={() =>
                    addedIds.has(ex.id)
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

      {/* Sticky sequence bar — mobile only, shown when sequence scrolls off screen */}
      {showStickyBar && (
        <button className="sequence-sticky-bar" onClick={scrollToSequence}>
          <IconPlayCircle />
          <span>
            Sequence
            {routine.exercises.length > 0 && (
              <strong> ({routine.exercises.length})</strong>
            )}
          </span>
          <span className="sequence-sticky-tap">
            <IconArrowUp />
            Tap to view
          </span>
        </button>
      )}

      {/* Exercise detail modal */}
      {selectedExercise && (
        <ExerciseDetailModal
          exercise={selectedExercise}
          added={addedIds.has(selectedExercise.id)}
          onAdd={() => addExerciseToRoutine(routine.id, selectedExercise.id)}
          onClose={() => setSelectedExercise(null)}
        />
      )}
    </div>
  );
}
