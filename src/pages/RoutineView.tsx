import { useState, useEffect, useCallback, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { NavContext, usePageTitle } from '../context/NavContext';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext, sortableKeyboardCoordinates,
  verticalListSortingStrategy, arrayMove,
} from '@dnd-kit/sortable';
import type { Routine, Exercise, RoutineExercise } from '../data/types';
import { SortableExercise } from '../components/SortableExercise';
import { UnsavedModal } from '../components/UnsavedModal';

interface Props {
  routines: Routine[];
  getExercise: (id: string) => Exercise | undefined;
  removeExerciseFromRoutine: (routineId: string, exerciseId: string) => void;
  reorderRoutineExercises: (routineId: string, exercises: RoutineExercise[]) => void;
  updateRoutine: (id: string, updates: Partial<Pick<Routine, 'title'>>) => void;
  updateDescription: (routineId: string, description: string) => void;
}

function IconCheck() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconLayers() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}

export function RoutineView({
  routines,
  getExercise,
  removeExerciseFromRoutine,
  reorderRoutineExercises,
  updateRoutine,
  updateDescription,
}: Props) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { setRightSlot, navInterceptorRef } = useContext(NavContext);

  usePageTitle('Routine Review');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { delay: 180, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const routine = routines.find(r => r.id === id);

  const [editTitle, setEditTitle] = useState(routine?.title ?? '');
  const [editDesc, setEditDesc] = useState(routine?.description ?? '');
  // isSaved starts false — user should actively save
  const [isSaved, setIsSaved] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [pendingNavigate, setPendingNavigate] = useState<(() => void) | null>(null);

  // Sync fields when the routine id changes (e.g. first load)
  useEffect(() => {
    if (routine) {
      setEditTitle(routine.title);
      setEditDesc(routine.description ?? '');
      setIsSaved(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routine?.id]);

  // ── Save logic ──────────────────────────────────────────────────────────
  const doSave = useCallback(() => {
    if (!routine || !editTitle.trim()) return;
    updateRoutine(routine.id, { title: editTitle.trim() });
    updateDescription(routine.id, editDesc);
    setIsSaved(true);
  }, [routine, editTitle, editDesc, updateRoutine, updateDescription]);

  // ── Navigation guard ────────────────────────────────────────────────────
  const handleNavRequest = useCallback((proceed: () => void) => {
    if (isSaved) {
      proceed();
    } else {
      setPendingNavigate(() => proceed);
      setShowUnsavedModal(true);
    }
  }, [isSaved]);

  // Register/update the interceptor whenever handleNavRequest changes
  useEffect(() => {
    navInterceptorRef.current = handleNavRequest;
    return () => { navInterceptorRef.current = null; };
  }, [handleNavRequest, navInterceptorRef]);

  // Inject "Dashboard" into TopNav right zone; update when isSaved changes
  useEffect(() => {
    setRightSlot(
      <button
        className="top-nav-dashboard-link"
        onClick={() => handleNavRequest(() => navigate('/'))}
      >
        Dashboard
      </button>,
    );
    return () => setRightSlot(null);
  }, [handleNavRequest, navigate, setRightSlot]);

  // ── Modal actions ────────────────────────────────────────────────────────
  const handleSaveAndLeave = () => {
    doSave();
    setShowUnsavedModal(false);
    pendingNavigate?.();
    setPendingNavigate(null);
  };

  const handleLeaveWithoutSaving = () => {
    setShowUnsavedModal(false);
    pendingNavigate?.();
    setPendingNavigate(null);
  };

  const handleCancelModal = () => {
    setShowUnsavedModal(false);
    setPendingNavigate(null);
  };

  // ── Not found ────────────────────────────────────────────────────────────
  if (!routine) {
    return (
      <div className="page">
        <p>Routine not found.</p>
        <button className="btn btn-primary" onClick={() => navigate('/')}>Back to Dashboard</button>
      </div>
    );
  }

  // ── Field change handlers (each marks dirty) ─────────────────────────────
  const handleTitleChange = (v: string) => { setEditTitle(v); setIsSaved(false); };
  const handleDescChange = (v: string) => { setEditDesc(v); setIsSaved(false); };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = routine.exercises.findIndex(e => e.exerciseId === active.id);
    const newIndex = routine.exercises.findIndex(e => e.exerciseId === over.id);
    const reordered = arrayMove(routine.exercises, oldIndex, newIndex);
    reorderRoutineExercises(routine.id, reordered);
    setIsSaved(false);
  };

  const handleRemove = (exerciseId: string) => {
    removeExerciseFromRoutine(routine.id, exerciseId);
    setIsSaved(false);
  };

  // ── Derived metadata ─────────────────────────────────────────────────────
  const totalExercises = routine.exercises.length;
  const focusAreas = [...new Set(
    routine.exercises.flatMap(re => getExercise(re.exerciseId)?.focus ?? []),
  )];
  const levels = [...new Set(
    routine.exercises
      .map(re => getExercise(re.exerciseId)?.difficulty)
      .filter(Boolean) as string[],
  )];

  return (
    <>
      <div className="review-page">
        {/* Editable title */}
        <input
          className="review-title-input"
          value={editTitle}
          onChange={e => handleTitleChange(e.target.value)}
          placeholder="Routine title..."
        />

        {/* Editable description */}
        <textarea
          className="review-desc-input"
          value={editDesc}
          onChange={e => handleDescChange(e.target.value)}
          placeholder="Add a class intention or description..."
          rows={2}
        />

        {/* Metadata row */}
        <div className="review-meta">
          <div className="review-meta-stat">
            <IconLayers />
            <span>{totalExercises} exercise{totalExercises !== 1 ? 's' : ''}</span>
          </div>

          {levels.length > 0 && (
            <>
              <div className="review-meta-divider" />
              {levels.map(l => (
                <span key={l} className="review-tag review-tag-level">{l}</span>
              ))}
            </>
          )}

          {focusAreas.length > 0 && (
            <>
              <div className="review-meta-divider" />
              {focusAreas.map(f => (
                <span key={f} className="review-tag review-tag-focus">{f}</span>
              ))}
            </>
          )}
        </div>

        {/* Exercise list */}
        {routine.exercises.length === 0 ? (
          <div className="empty-state small">
            <p>No exercises in this routine yet.</p>
            <button className="btn btn-primary" onClick={() => navigate(`/build/${routine.id}`)}>
              Add Exercises
            </button>
          </div>
        ) : (
          <>
            <div className="review-section-label">Exercise Sequence</div>
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
                        onRemove={() => handleRemove(re.exerciseId)}
                      />
                    );
                  })}
                </div>
              </SortableContext>
            </DndContext>
          </>
        )}

        {/* Single bottom CTA */}
        <div className="review-actions">
          {isSaved ? (
            <button className="btn btn-saved" disabled>
              <IconCheck />
              Routine Saved
            </button>
          ) : (
            <button
              className="btn btn-primary"
              onClick={doSave}
              disabled={!editTitle.trim()}
            >
              Save Routine
            </button>
          )}
        </div>
      </div>

      {/* Unsaved changes modal */}
      {showUnsavedModal && (
        <UnsavedModal
          onSaveAndLeave={handleSaveAndLeave}
          onLeaveWithoutSaving={handleLeaveWithoutSaving}
          onCancel={handleCancelModal}
        />
      )}
    </>
  );
}
