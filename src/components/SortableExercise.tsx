import { useState, useRef, useEffect } from 'react';
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

const DELETE_REVEAL_PX = 76; // px at which delete is fully revealed
const SWIPE_MAX_PX    = 90; // maximum overscroll

export function SortableExercise({ id, exercise, index, onRemove }: Props) {
  const {
    attributes, listeners,
    setNodeRef, setActivatorNodeRef,
    transform, transition, isDragging,
  } = useSortable({ id });

  // Swipe-to-delete state
  const [swipeX, setSwipeX]     = useState(0);
  const [revealed, setRevealed] = useState(false);

  const touchStartX    = useRef(0);
  const touchStartY    = useRef(0);
  const touchActiveRef = useRef(false); // suppress transition during active touch
  const directionRef   = useRef<'horiz' | 'vert' | null>(null);

  // Haptic feedback when drag activates
  useEffect(() => {
    if (isDragging && navigator.vibrate) navigator.vibrate(15);
  }, [isDragging]);

  // Reset swipe when drag starts (prevents stale translate)
  useEffect(() => {
    if (isDragging) {
      setSwipeX(0);
      setRevealed(false);
    }
  }, [isDragging]);

  // Outer wrapper gets dnd-kit's transform (moves the whole row while sorting)
  const wrapperStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Inner row slides horizontally for swipe-to-delete
  const innerStyle = {
    transform: `translateX(${swipeX}px)`,
    transition: touchActiveRef.current ? 'none' : 'transform 0.22s ease',
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current  = e.touches[0].clientX;
    touchStartY.current  = e.touches[0].clientY;
    directionRef.current = null;
    touchActiveRef.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = e.touches[0].clientY - touchStartY.current;

    // Determine direction on first meaningful movement
    if (!directionRef.current && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
      directionRef.current = Math.abs(dx) > Math.abs(dy) ? 'horiz' : 'vert';
    }
    if (directionRef.current !== 'horiz') return;

    // Offset from the already-revealed position
    const base   = revealed ? -DELETE_REVEAL_PX : 0;
    const raw    = base + dx;
    const clamped = Math.max(-SWIPE_MAX_PX, Math.min(0, raw));
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

  const handleDelete = () => {
    setSwipeX(0);
    setRevealed(false);
    onRemove();
  };

  const dismissSwipe = () => {
    if (revealed) {
      setSwipeX(0);
      setRevealed(false);
    }
  };

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

      {/* Main row — slides left to expose delete zone */}
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
