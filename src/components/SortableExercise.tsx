import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Exercise } from '../data/types';
import { equipmentLabels, difficultyLabels } from '../data/labels';

interface Props {
  id: string;
  exercise: Exercise;
  index: number;
  reps?: string;
  onRemove: () => void;
  onRepsChange: (reps: string) => void;
}

function IconGrip() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" aria-hidden="true">
      <rect x="2" y="4"  width="14" height="2" rx="1" />
      <rect x="2" y="8"  width="14" height="2" rx="1" />
      <rect x="2" y="12" width="14" height="2" rx="1" />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  );
}

const DELETE_REVEAL_PX = 76;
const SWIPE_MAX_PX    = 90;

/** "8" → "×8", "30 sec" → "30 sec" (non-numeric shown as-is) */
function formatReps(reps: string): string {
  return /^\d+$/.test(reps.trim()) ? `×${reps.trim()}` : reps.trim();
}

export function SortableExercise({ id, exercise, index, reps, onRemove, onRepsChange }: Props) {
  const {
    attributes, listeners,
    setNodeRef, setActivatorNodeRef,
    transform, transition, isDragging,
  } = useSortable({ id });

  // ── Swipe-to-delete ───────────────────────────────────────────────────────
  const [swipeX, setSwipeX]     = useState(0);
  const [revealed, setRevealed] = useState(false);

  const touchStartX    = useRef(0);
  const touchStartY    = useRef(0);
  const touchActiveRef = useRef(false);
  const directionRef   = useRef<'horiz' | 'vert' | null>(null);

  // ── Inline reps editing ───────────────────────────────────────────────────
  const [editingReps, setEditingReps] = useState(false);
  const [localReps, setLocalReps]     = useState(reps ?? '');
  const repsInputRef                  = useRef<HTMLInputElement>(null);
  // Tracks Escape key so onBlur knows not to commit
  const escapingRef                   = useRef(false);

  // Sync from prop ONLY when the reps prop itself changes (not on editingReps toggle).
  // This prevents prematurely clearing localReps before the store has propagated
  // the new value — which would cause a flash from "×8" → "Add reps" → "×8".
  useEffect(() => {
    if (!editingReps) setLocalReps(reps ?? '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reps]);

  // Select all text immediately after entering edit mode (runs before paint).
  useLayoutEffect(() => {
    if (editingReps) repsInputRef.current?.select();
  }, [editingReps]);

  // Activate edit mode via natural browser focus — no programmatic .focus() call needed.
  // iOS keyboard opens because the user's own tap triggers focus synchronously.
  const handleRepsFocus = () => {
    setLocalReps(reps ?? '');
    setEditingReps(true);
  };

  const handleRepsBlur = () => {
    if (escapingRef.current) {
      // Escape: discard changes and restore committed value
      escapingRef.current = false;
      setLocalReps(reps ?? '');
      setEditingReps(false);
      return;
    }
    const trimmed = localReps.trim();
    setEditingReps(false);
    if (trimmed !== (reps ?? '')) {
      onRepsChange(trimmed);
    }
  };

  const handleRepsKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter')  { e.preventDefault(); repsInputRef.current?.blur(); }
    if (e.key === 'Escape') { escapingRef.current = true; repsInputRef.current?.blur(); }
  };

  // ── Haptics + drag cleanup ────────────────────────────────────────────────
  useEffect(() => {
    if (isDragging && navigator.vibrate) navigator.vibrate(15);
  }, [isDragging]);

  useEffect(() => {
    if (isDragging) {
      setSwipeX(0);
      setRevealed(false);
      setEditingReps(false);
    }
  }, [isDragging]);

  // ── dnd-kit styles ────────────────────────────────────────────────────────
  const wrapperStyle = { transform: CSS.Transform.toString(transform), transition };

  const innerStyle = {
    transform: `translateX(${swipeX}px)`,
    transition: touchActiveRef.current ? 'none' : 'transform 0.22s ease',
  };

  // ── Swipe handlers ────────────────────────────────────────────────────────
  const handleTouchStart = (e: React.TouchEvent) => {
    if (editingReps) return;
    touchStartX.current    = e.touches[0].clientX;
    touchStartY.current    = e.touches[0].clientY;
    directionRef.current   = null;
    touchActiveRef.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = e.touches[0].clientY - touchStartY.current;

    if (!directionRef.current && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
      directionRef.current = Math.abs(dx) > Math.abs(dy) ? 'horiz' : 'vert';
    }
    if (directionRef.current !== 'horiz') return;

    const clamped = Math.max(-SWIPE_MAX_PX, Math.min(0, (revealed ? -DELETE_REVEAL_PX : 0) + dx));
    setSwipeX(clamped);
  };

  const handleTouchEnd = () => {
    touchActiveRef.current = false;
    if (directionRef.current !== 'horiz') return;

    if (swipeX < -(DELETE_REVEAL_PX / 2)) {
      setSwipeX(-DELETE_REVEAL_PX);
      setRevealed(true);
    } else {
      setSwipeX(0);
      setRevealed(false);
    }
  };

  const handleDelete = () => { setSwipeX(0); setRevealed(false); onRemove(); };
  const dismissSwipe = () => { if (revealed) { setSwipeX(0); setRevealed(false); } };

  return (
    <div
      ref={setNodeRef}
      style={wrapperStyle}
      className={`sortable-exercise-wrapper${isDragging ? ' is-dragging' : ''}`}
    >
      {/* Delete zone revealed on left-swipe */}
      <div className="swipe-delete-bg" aria-hidden="true">
        <button className="swipe-delete-btn" onClick={handleDelete} tabIndex={revealed ? 0 : -1}>
          <IconTrash />
          <span>Delete</span>
        </button>
      </div>

      {/* Main row */}
      <div
        className="sortable-exercise"
        style={innerStyle}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={dismissSwipe}
      >
        {/* Left: sequence number */}
        <span className="exercise-order">{index + 1}</span>

        {/* Center: name + meta */}
        <div className="sortable-content">
          <div className="sortable-name">{exercise.name}</div>
          <div className="sortable-meta">
            {equipmentLabels[exercise.equipment]} · {difficultyLabels[exercise.difficulty]}
          </div>
        </div>

        {/*
          Single always-mounted <input> that acts as both chip and text field.
          – Display mode: styled as a pill chip, shows formatted value or placeholder
          – Edit mode: underline style, shows raw value for editing
          Using a single element means the user's tap naturally focuses it,
          which opens the iOS keyboard synchronously (no programmatic .focus() needed).
        */}
        <input
          ref={repsInputRef}
          type="text"
          inputMode="numeric"
          className={`reps-input${editingReps ? ' reps-input--editing' : (localReps ? ' reps-input--set' : '')}`}
          value={editingReps ? localReps : (localReps ? formatReps(localReps) : '')}
          placeholder={editingReps ? 'e.g. 8' : 'reps'}
          onFocus={handleRepsFocus}
          onChange={e => { if (editingReps) setLocalReps(e.target.value); }}
          onBlur={handleRepsBlur}
          onKeyDown={handleRepsKeyDown}
          onClick={e => e.stopPropagation()}
          aria-label={localReps ? `Reps: ${localReps}. Tap to edit` : 'Add reps'}
        />

        {/* Right: drag handle */}
        <div
          className="sortable-handle"
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder"
        >
          <IconGrip />
        </div>
      </div>
    </div>
  );
}
