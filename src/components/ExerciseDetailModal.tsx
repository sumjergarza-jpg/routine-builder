import { createPortal } from 'react-dom';
import type { Exercise } from '../data/types';
import {
  equipmentLabels, positionLabels, difficultyLabels,
  focusLabels, contraindicationLabels,
} from '../data/labels';

interface Props {
  exercise: Exercise;
  added: boolean;
  onAdd: () => void;
  onClose: () => void;
}

function IconX() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

const DIFFICULTY_COLOR: Record<string, string> = {
  beginner: 'exl-detail-badge-beginner',
  intermediate: 'exl-detail-badge-intermediate',
  advanced: 'exl-detail-badge-advanced',
};

export function ExerciseDetailModal({ exercise, added, onAdd, onClose }: Props) {
  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal exl-detail-modal" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="exl-detail-header">
          <h2 className="exl-detail-title">{exercise.name}</h2>
          <button className="unsaved-modal-close" onClick={onClose} aria-label="Close">
            <IconX />
          </button>
        </div>

        {/* Meta badges */}
        <div className="exl-detail-badges">
          <span className="exl-detail-badge exl-detail-badge-equipment">
            {equipmentLabels[exercise.equipment]}
          </span>
          <span className="exl-detail-badge exl-detail-badge-position">
            {positionLabels[exercise.position]}
          </span>
          <span className={`exl-detail-badge ${DIFFICULTY_COLOR[exercise.difficulty]}`}>
            {difficultyLabels[exercise.difficulty]}
          </span>
        </div>

        {/* Description */}
        <p className="exl-detail-desc">{exercise.description}</p>

        {/* Focus areas */}
        {exercise.focus.length > 0 && (
          <div className="exl-detail-section">
            <div className="exl-detail-section-label">Focus</div>
            <div className="exl-detail-tags">
              {exercise.focus.map(f => (
                <span key={f} className="exl-tag exl-tag-focus">{focusLabels[f]}</span>
              ))}
            </div>
          </div>
        )}

        {/* Contraindications */}
        {exercise.contraindications.length > 0 && (
          <div className="exl-detail-section">
            <div className="exl-detail-section-label">Contraindications</div>
            <div className="exl-detail-tags">
              {exercise.contraindications.map(c => (
                <span key={c} className="exl-tag exl-tag-contra">{contraindicationLabels[c]}</span>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="exl-detail-footer">
          {added ? (
            <button className="btn btn-saved" disabled>
              <IconCheck />
              Added to Routine
            </button>
          ) : (
            <button className="btn btn-primary" onClick={() => { onAdd(); onClose(); }}>
              + Add to Routine
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
