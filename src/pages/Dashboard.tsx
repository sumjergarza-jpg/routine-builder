import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Routine, Folder } from '../data/types';
import { usePageTitle } from '../context/NavContext';
import { RoutineRow } from '../components/RoutineRow';
import { ConfirmModal } from '../components/ConfirmModal';

interface Props {
  routines: Routine[];
  folders: Folder[];
  onCreateRoutine: (title: string) => Routine;
  onDeleteRoutine: (id: string) => void;
  onCreateFolder: (name: string) => Folder;
  onDeleteFolder: (id: string) => void;
  onRenameFolder: (id: string, name: string) => void;
  onToggleRoutineInFolder: (routineId: string, folderId: string) => void;
}

type PendingDelete =
  | { type: 'routine'; id: string; name: string }
  | { type: 'folder'; id: string; name: string }
  | null;

// ─── Icons ──────────────────────────────────────────────────────────────────

function IconFolder({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function IconFolderPlus() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      <line x1="12" y1="11" x2="12" y2="17" />
      <line x1="9" y1="14" x2="15" y2="14" />
    </svg>
  );
}

function IconChevronDown() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function IconChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
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

function IconPlayCircle({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polygon points="10 8 16 12 10 16 10 8" />
    </svg>
  );
}

// ─── Component ──────────────────────────────────────────────────────────────

export function Dashboard({
  routines,
  folders,
  onCreateRoutine,
  onDeleteRoutine,
  onCreateFolder,
  onDeleteFolder,
  onRenameFolder,
  onToggleRoutineInFolder,
}: Props) {
  const navigate = useNavigate();
  usePageTitle('Dashboard');

  // Create modals
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // Folder inline rename
  const [editingFolder, setEditingFolder] = useState<string | null>(null);
  const [editFolderName, setEditFolderName] = useState('');

  // Section expand / collapse
  const [foldersExpanded, setFoldersExpanded] = useState(true);
  const [recentExpanded, setRecentExpanded] = useState(true);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  // Delete confirmation
  const [pendingDelete, setPendingDelete] = useState<PendingDelete>(null);

  // ─── Helpers ──────────────────────────────────────────────────────────────

  const toggleFolderExpand = (id: string) =>
    setExpandedFolders(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const getFolderRoutines = (folder: Folder): Routine[] =>
    folder.routineIds
      .map(id => routines.find(r => r.id === id))
      .filter((r): r is Routine => !!r)
      .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime())
      .slice(0, 10);

  const unfolderedRoutines = routines
    .filter(r => !folders.some(f => f.routineIds.includes(r.id)))
    .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleCreateRoutine = () => {
    const routine = onCreateRoutine('Untitled Routine');
    navigate(`/build/${routine.id}`);
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    onCreateFolder(newFolderName.trim());
    setNewFolderName('');
    setShowCreateFolder(false);
  };

  const handleRenameFolder = (id: string) => {
    if (!editFolderName.trim()) return;
    onRenameFolder(id, editFolderName.trim());
    setEditingFolder(null);
  };

  const handleConfirmDelete = () => {
    if (!pendingDelete) return;
    if (pendingDelete.type === 'routine') {
      onDeleteRoutine(pendingDelete.id);
    } else {
      onDeleteFolder(pendingDelete.id);
    }
    setPendingDelete(null);
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      <div className="dashboard-content">

        {/* ── Hero ── */}
        <div className="dashboard-hero">
          <h1 className="dashboard-hero-title">Design the perfect flow.</h1>
          <p className="dashboard-hero-subtitle">
            Create, manage, and organize your Pilates class routines with our intelligent sequence builder.
          </p>
          <div className="dashboard-hero-actions">
            <button className="hero-btn-primary" onClick={handleCreateRoutine}>
              + New Routine
            </button>
          </div>
        </div>

        {/* ── Folders ── */}
        <div className="dash-section">
          <div className="dash-section-title">
            <IconFolder size={18} />
            <span>Folders</span>
          </div>

          <div className="dash-card">
            {/* Group header — toggles the whole folder list */}
            <div className="dash-group-header" onClick={() => setFoldersExpanded(v => !v)}>
              <IconFolder />
              <span className="dash-group-name">Folders</span>
              <span className="dash-count-badge">{folders.length}</span>
              <div className="dash-spacer" />
              <button
                className="dash-icon-btn"
                title="New folder"
                onClick={e => { e.stopPropagation(); setShowCreateFolder(true); }}
              >
                <IconFolderPlus />
              </button>
              <span className="dash-chevron">
                {foldersExpanded ? <IconChevronDown /> : <IconChevronRight />}
              </span>
            </div>

            {foldersExpanded && folders.map(folder => {
              const isExpanded = expandedFolders.has(folder.id);
              const folderRoutines = getFolderRoutines(folder);
              const routineCount = folder.routineIds.filter(id => routines.some(r => r.id === id)).length;

              return (
                <div key={folder.id} className="dash-folder-group">
                  {/* Folder row */}
                  {editingFolder === folder.id ? (
                    <div className="dash-folder-row">
                      <IconFolder />
                      <input
                        className="dash-inline-edit"
                        value={editFolderName}
                        onChange={e => setEditFolderName(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleRenameFolder(folder.id);
                          if (e.key === 'Escape') setEditingFolder(null);
                        }}
                        onClick={e => e.stopPropagation()}
                        autoFocus
                      />
                      <button className="dash-icon-btn" onClick={() => handleRenameFolder(folder.id)}>✓</button>
                      <button className="dash-icon-btn" onClick={() => setEditingFolder(null)}>✗</button>
                    </div>
                  ) : (
                    <div
                      className="dash-folder-row dash-folder-row-clickable"
                      onClick={() => toggleFolderExpand(folder.id)}
                    >
                      <IconFolder />
                      {/* Folder name — navigates to folder detail page */}
                      <button
                        className="dash-folder-name-link"
                        onClick={e => { e.stopPropagation(); navigate(`/folder/${folder.id}`); }}
                      >
                        {folder.name}
                      </button>
                      <span className="dash-folder-count">{routineCount}</span>
                      <div className="dash-spacer" />
                      <button
                        className="dash-icon-btn"
                        title="Rename"
                        onClick={e => { e.stopPropagation(); setEditingFolder(folder.id); setEditFolderName(folder.name); }}
                      >
                        <IconEdit />
                      </button>
                      <button
                        className="dash-icon-btn dash-icon-btn-danger"
                        title="Delete folder"
                        onClick={e => { e.stopPropagation(); setPendingDelete({ type: 'folder', id: folder.id, name: folder.name }); }}
                      >
                        <IconTrash />
                      </button>
                      <span className="dash-chevron">
                        {isExpanded ? <IconChevronDown /> : <IconChevronRight />}
                      </span>
                    </div>
                  )}

                  {/* Expanded: show routines in this folder (max 10) */}
                  {isExpanded && (
                    <div className="dash-folder-routines">
                      {folderRoutines.length === 0 ? (
                        <div className="dash-empty-row">No routines in this folder yet.</div>
                      ) : (
                        folderRoutines.map(r => (
                          <RoutineRow
                            key={r.id}
                            routine={r}
                            folders={folders}
                            onNavigate={() => navigate(`/routine/${r.id}`)}
                            onDeleteClick={() => setPendingDelete({ type: 'routine', id: r.id, name: r.title })}
                            onToggleFolder={onToggleRoutineInFolder}
                          />
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {foldersExpanded && folders.length === 0 && (
              <div className="dash-empty-row">
                No folders yet — click the <strong>folder+</strong> icon above to create one.
              </div>
            )}
          </div>
        </div>

        {/* ── Recent Routines / Not in a folder ── */}
        <div className="dash-section">
          <div className="dash-section-title">
            <IconPlayCircle size={18} />
            <span>Recent Routines</span>
          </div>

          <div className="dash-card">
            <div className="dash-group-header" onClick={() => setRecentExpanded(v => !v)}>
              <span className="dash-group-name">Not in a folder</span>
              <span className="dash-count-badge">{unfolderedRoutines.length}</span>
              <div className="dash-spacer" />
              <span className="dash-chevron">
                {recentExpanded ? <IconChevronDown /> : <IconChevronRight />}
              </span>
            </div>

            {recentExpanded && unfolderedRoutines.map(r => (
              <RoutineRow
                key={r.id}
                routine={r}
                folders={folders}
                onNavigate={() => navigate(`/routine/${r.id}`)}
                onDeleteClick={() => setPendingDelete({ type: 'routine', id: r.id, name: r.title })}
                onToggleFolder={onToggleRoutineInFolder}
              />
            ))}

            {recentExpanded && unfolderedRoutines.length === 0 && routines.length > 0 && (
              <div className="dash-empty-row">All routines are assigned to at least one folder.</div>
            )}
            {recentExpanded && routines.length === 0 && (
              <div className="dash-empty-row">No routines yet — create one above.</div>
            )}
          </div>
        </div>

      </div>

      {/* ── Create Folder Modal ── */}
      {showCreateFolder && (
        <div className="modal-overlay" onClick={() => setShowCreateFolder(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>New Folder</h2>
            <input
              type="text"
              placeholder="Folder name..."
              value={newFolderName}
              onChange={e => setNewFolderName(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleCreateFolder();
                if (e.key === 'Escape') setShowCreateFolder(false);
              }}
              autoFocus
              className="modal-input"
            />
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setShowCreateFolder(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreateFolder} disabled={!newFolderName.trim()}>Create</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {pendingDelete && (
        <ConfirmModal
          title={pendingDelete.type === 'folder' ? 'Delete Folder?' : 'Delete Routine?'}
          body={
            pendingDelete.type === 'folder' ? (
              <>
                <strong>{pendingDelete.name}</strong> will be deleted. Routines inside will be removed from this folder — they will <strong>not</strong> be deleted.
              </>
            ) : (
              <>
                <strong>{pendingDelete.name}</strong> will be permanently deleted. This cannot be undone.
              </>
            )
          }
          confirmLabel={pendingDelete.type === 'folder' ? 'Delete Folder' : 'Delete Routine'}
          onConfirm={handleConfirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </>
  );
}
