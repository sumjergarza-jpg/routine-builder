import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface Props {
  onRename: () => void;
  onDelete: () => void;
}

function IconMore() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <circle cx="5" cy="12" r="1.8" />
      <circle cx="12" cy="12" r="1.8" />
      <circle cx="19" cy="12" r="1.8" />
    </svg>
  );
}

function IconEdit() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
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

/** "⋯" overflow button that opens a Rename / Delete menu (portal-rendered). */
export function FolderActionsMenu({ onRename, onDelete }: Props) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({ visibility: 'hidden' });

  const close = useCallback(() => setOpen(false), []);

  const position = useCallback(() => {
    const btn = btnRef.current;
    const menu = menuRef.current;
    if (!btn || !menu) return;
    const r = btn.getBoundingClientRect();
    const h = menu.offsetHeight;
    const w = menu.offsetWidth;
    const GAP = 6;
    const spaceBelow = window.innerHeight - r.bottom - GAP;
    const top = spaceBelow >= h || spaceBelow >= r.top - GAP ? r.bottom + GAP : r.top - GAP - h;
    let left = r.right - w;
    if (left < 8) left = 8;
    if (left + w > window.innerWidth - 8) left = window.innerWidth - 8 - w;
    setStyle({ position: 'fixed', top, left, visibility: 'visible' });
  }, []);

  useEffect(() => {
    if (!open) return;
    position();
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!menuRef.current?.contains(t) && !btnRef.current?.contains(t)) close();
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    window.addEventListener('scroll', position, true);
    window.addEventListener('resize', position);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('scroll', position, true);
      window.removeEventListener('resize', position);
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, position, close]);

  const choose = (action: () => void) => (e: React.MouseEvent) => {
    e.stopPropagation();
    close();
    action();
  };

  return (
    <>
      <button
        ref={btnRef}
        className={`dash-icon-btn${open ? ' dash-icon-btn-active' : ''}`}
        title="Folder options"
        aria-label="Folder options"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={e => { e.stopPropagation(); setOpen(v => !v); }}
      >
        <IconMore />
      </button>

      {open && createPortal(
        // stopPropagation: React bubbles portal events to the folder row, which would toggle it
        <div className="dash-popover dash-menu" ref={menuRef} style={style} role="menu" onClick={e => e.stopPropagation()}>
          <button className="dash-popover-item dash-menu-item" role="menuitem" onClick={choose(onRename)}>
            <IconEdit />
            Rename
          </button>
          <button className="dash-popover-item dash-menu-item dash-menu-item-danger" role="menuitem" onClick={choose(onDelete)}>
            <IconTrash />
            Delete folder
          </button>
        </div>,
        document.body,
      )}
    </>
  );
}
