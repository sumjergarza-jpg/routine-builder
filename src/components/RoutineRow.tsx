import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import type { Routine, Folder } from '../data/types';

interface Props {
  routine: Routine;
  folders: Folder[];
  onNavigate: () => void;
  onDeleteClick: () => void;
  onToggleFolder: (routineId: string, folderId: string) => void;
}

// ─── Icons ──────────────────────────────────────────────────────────────────

function IconPlayCircle() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polygon points="10 8 16 12 10 16 10 8" />
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

function IconFolder() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

// ─── Popover portal ──────────────────────────────────────────────────────────

interface PopoverProps {
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  folders: Folder[];
  routineId: string;
  onToggleFolder: (routineId: string, folderId: string) => void;
  onClose: () => void;
}

function FolderPopover({ anchorRef, folders, routineId, onToggleFolder, onClose }: PopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({ visibility: 'hidden' });

  const position = useCallback(() => {
    const btn = anchorRef.current;
    const pop = popoverRef.current;
    if (!btn || !pop) return;

    const btnRect = btn.getBoundingClientRect();
    const popH = pop.offsetHeight;
    const popW = pop.offsetWidth;
    const vp = { w: window.innerWidth, h: window.innerHeight };
    const GAP = 6;

    // Prefer below; flip above if not enough room
    let top: number;
    const spaceBelow = vp.h - btnRect.bottom - GAP;
    const spaceAbove = btnRect.top - GAP;
    if (spaceBelow >= popH || spaceBelow >= spaceAbove) {
      top = btnRect.bottom + GAP;
    } else {
      top = btnRect.top - GAP - popH;
    }

    // Align right edge with button right; clamp to viewport
    let left = btnRect.right - popW;
    if (left < 8) left = 8;
    if (left + popW > vp.w - 8) left = vp.w - 8 - popW;

    setStyle({ position: 'fixed', top, left, visibility: 'visible' });
  }, [anchorRef]);

  // Position on mount and whenever layout shifts (scroll, resize)
  useEffect(() => {
    position();
    window.addEventListener('scroll', position, true);
    window.addEventListener('resize', position);
    return () => {
      window.removeEventListener('scroll', position, true);
      window.removeEventListener('resize', position);
    };
  }, [position]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        popoverRef.current && !popoverRef.current.contains(e.target as Node) &&
        anchorRef.current && !anchorRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [anchorRef, onClose]);

  return createPortal(
    <div className="dash-popover" ref={popoverRef} style={style}>
      <div className="dash-popover-title">Add to folder</div>
      {folders.length === 0 ? (
        <div className="dash-popover-empty">No folders yet — create one first.</div>
      ) : (
        folders.map(f => (
          <label key={f.id} className="dash-popover-item">
            <input
              type="checkbox"
              checked={f.routineIds.includes(routineId)}
              onChange={() => onToggleFolder(routineId, f.id)}
              onClick={e => e.stopPropagation()}
            />
            <span>{f.name}</span>
          </label>
        ))
      )}
    </div>,
    document.body,
  );
}

// ─── Component ──────────────────────────────────────────────────────────────

export function RoutineRow({ routine, folders, onNavigate, onDeleteClick, onToggleFolder }: Props) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div
      className="dash-routine-row dash-routine-row-clickable"
      onClick={onNavigate}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onNavigate()}
    >
      <div className="dash-routine-play-icon">
        <IconPlayCircle />
      </div>

      <div className="dash-routine-info">
        <div className="dash-routine-meta-line">
          <span className="dash-routine-title">{routine.title}</span>
          <span className="dash-routine-stats">
            <IconLayers />
            {routine.exercises.length}
          </span>
          <span className="dash-routine-date">{formatDate(routine.createdDate)}</span>
        </div>
        {routine.description && (
          <div className="dash-routine-desc">{routine.description}</div>
        )}
      </div>

      <div className="dash-routine-actions">
        {/* Folder assignment — popover rendered via portal to escape overflow:hidden */}
        <button
          ref={btnRef}
          className={`dash-icon-btn${popoverOpen ? ' dash-icon-btn-active' : ''}`}
          title="Assign to folders"
          onClick={e => { e.stopPropagation(); setPopoverOpen(v => !v); }}
        >
          <IconFolder />
        </button>

        {popoverOpen && (
          <FolderPopover
            anchorRef={btnRef}
            folders={folders}
            routineId={routine.id}
            onToggleFolder={onToggleFolder}
            onClose={() => setPopoverOpen(false)}
          />
        )}

        <button
          className="dash-icon-btn dash-icon-btn-danger"
          title="Delete routine"
          onClick={e => { e.stopPropagation(); onDeleteClick(); }}
        >
          <IconTrash />
        </button>
      </div>
    </div>
  );
}
