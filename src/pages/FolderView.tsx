import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Routine, Folder } from '../data/types';
import { usePageTitle } from '../context/NavContext';
import { RoutineRow } from '../components/RoutineRow';
import { ConfirmModal } from '../components/ConfirmModal';

interface Props {
  routines: Routine[];
  folders: Folder[];
  onDeleteRoutine: (id: string) => void;
  onToggleRoutineInFolder: (routineId: string, folderId: string) => void;
  onCreateRoutine: (title: string) => Routine;
}

type PendingDelete = { id: string; name: string } | null;

export function FolderView({ routines, folders, onDeleteRoutine, onToggleRoutineInFolder, onCreateRoutine }: Props) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pendingDelete, setPendingDelete] = useState<PendingDelete>(null);

  const folder = folders.find(f => f.id === id);
  usePageTitle(folder?.name ?? 'Folder');

  if (!folder) {
    return (
      <div className="page">
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 16 }}>Folder not found.</p>
        <button className="btn btn-primary" onClick={() => navigate('/')}>Back to Dashboard</button>
      </div>
    );
  }

  const folderRoutines: Routine[] = folder.routineIds
    .map(rid => routines.find(r => r.id === rid))
    .filter((r): r is Routine => !!r)
    .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());

  const handleConfirmDelete = () => {
    if (!pendingDelete) return;
    onDeleteRoutine(pendingDelete.id);
    setPendingDelete(null);
  };

  const handleCreateRoutine = () => {
    if (!folder) return;
    const routine = onCreateRoutine('Untitled Routine');
    onToggleRoutineInFolder(routine.id, folder.id);
    navigate(`/build/${routine.id}`);
  };

  return (
    <>
      <div className="page folder-view">

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
          <button className="btn btn-primary" onClick={handleCreateRoutine}>
            + New Routine
          </button>
        </div>

        {folderRoutines.length === 0 ? (
          <div className="empty-state small">
            <p>No routines in this folder yet.</p>
            <button className="btn btn-primary" onClick={() => navigate('/')}>
              Go to Dashboard
            </button>
          </div>
        ) : (
          <div className="dash-card">
            {folderRoutines.map(r => (
              <RoutineRow
                key={r.id}
                routine={r}
                folders={folders}
                onNavigate={() => navigate(`/routine/${r.id}`)}
                onDeleteClick={() => setPendingDelete({ id: r.id, name: r.title })}
                onToggleFolder={onToggleRoutineInFolder}
              />
            ))}
          </div>
        )}
      </div>

      {pendingDelete && (
        <ConfirmModal
          title="Delete Routine?"
          body={
            <>
              <strong>{pendingDelete.name}</strong> will be permanently deleted. This cannot be undone.
            </>
          }
          confirmLabel="Delete Routine"
          onConfirm={handleConfirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </>
  );
}
