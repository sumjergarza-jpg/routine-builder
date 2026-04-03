import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Routine, Exercise, RoutineExercise } from '../data/types';
import { type Filters, emptyFilters } from '../store/useStore';
import { FilterPanel } from '../components/FilterPanel';
import { ExerciseListItem } from '../components/ExerciseListItem';
import { ExerciseDetailModal } from '../components/ExerciseDetailModal';
import { SortablePanelItem } from '../components/SortablePanelItem';
import { usePageTitle } from '../context/NavContext';
import {
  DndContext, closestCenter, PointerSensor,
  KeyboardSensor, useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext, sortableKeyboardCoordinates,
  verticalListSortingStrategy, arrayMove,
} from '@dnd-kit/sortable';

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

function IconLayers() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}

function IconPlayCircle() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polygon points="10 8 16 12 10 16 10 8" />
    </svg>
  );
}

function IconChevronUp() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="18 15 12 9 6 15" />
    </svg>
  );
}

function IconChevronDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export function RoutineBuilder({
  routines,
  filterExercises,
  getExercise,
  addExerciseToRoutine,
  removeExerciseFromRoutine,
  reorderRoutineExercises,
}: Props) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  // Short distance threshold — drag activates immediately on slight movement
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 3 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  usePageTitle('Build Routine');

  const routine = routines.find(r => r.id === id);

  const exercises = useMemo(
    () => [...filterExercises(filters)].sort((a, b) => sortKey(a.name).localeCompare(sortKey(b.name))),
    [filterExercises, filters],
  );
  const addedIds = new Set(routine?.exercises.map(e => e.exerciseId) ?? []);

  const handleDragEnd = (event: DragEndEvent) => {
    if (!routine) return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = routine.exercises.findIndex(e => e.exerciseId === active.id);
    const newIndex = routine.exercises.findIndex(e => e.exerciseId === over.id);
    reorderRoutineExercises(routine.id, arrayMove(routine.exercises, oldIndex, newIndex));
  };

  if (!routine) {
    return (
      <div className="page">
        <p>Routine not found.</p>
        <button className="btn btn-primary" onClick={() => navigate('/')}>Back to Dashboard</button>
      </div>
    );
  }

  const count = routine.exercises.length;

  return (
    <div className="builder-layout">

      {/* ── LEFT PANEL: sequence + next (desktop only) ── */}
      <aside className="builder-sidebar">
        <div className="sequence-section">
          <div className="sequence-header">
            <IconPlayCircle />
            <span>Sequence</span>
            <span className="sequence-count">{count}</span>
          </div>

          {count === 0 ? (
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

        <div className="sequence-next-wrap">
          <button
            className="btn btn-primary sequence-next-btn"
            onClick={() => navigate(`/routine/${routine.id}`)}
          >
            Next →
          </button>
        </div>
      </aside>

      {/* ── RIGHT PANEL: filter + exercise list ── */}
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

      {/* ── BOTTOM SEQUENCE SYSTEM (mobile only) ── */}

      {/* Slide-up panel — always in DOM for smooth CSS animation */}
      <div className={`seq-panel${isPanelOpen ? ' seq-panel-open' : ''}`} aria-hidden={!isPanelOpen}>
        <div className="seq-panel-header" onClick={() => setIsPanelOpen(false)}>
          <span className="seq-panel-title">
            <IconPlayCircle />
            Sequence
            {count > 0 && <span className="sequence-count">{count}</span>}
          </span>
          <IconChevronDown />
        </div>

        <div className="seq-panel-body">
          {count === 0 ? (
            <div className="seq-panel-empty">
              <p>No exercises yet — tap any exercise below to add it.</p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={routine.exercises.map(e => e.exerciseId)}
                strategy={verticalListSortingStrategy}
              >
                <div className="seq-panel-items">
                  {routine.exercises.map((re, i) => {
                    const ex = getExercise(re.exerciseId);
                    if (!ex) return null;
                    return (
                      <SortablePanelItem
                        key={re.exerciseId}
                        id={re.exerciseId}
                        name={ex.name}
                        index={i}
                        onRemove={() => removeExerciseFromRoutine(routine.id, re.exerciseId)}
                      />
                    );
                  })}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>

      </div>

      {/* Sticky bottom bar — always visible on mobile */}
      <div className="seq-bar">
        <button
          className="seq-bar-left"
          onClick={() => setIsPanelOpen(v => !v)}
          aria-expanded={isPanelOpen}
        >
          <span className="seq-bar-count">
            {count} Exercise{count !== 1 ? 's' : ''}
          </span>
          <span className="seq-bar-expand">
            {isPanelOpen ? <IconChevronDown /> : <IconChevronUp />}
          </span>
        </button>
        <button
          className="seq-bar-next"
          onClick={() => navigate(`/routine/${routine.id}`)}
        >
          Next →
        </button>
      </div>

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
