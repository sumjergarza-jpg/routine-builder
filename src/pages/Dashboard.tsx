import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Routine } from '../data/types';

interface Props {
  routines: Routine[];
  onCreateRoutine: (title: string) => Routine;
  onDeleteRoutine: (id: string) => void;
  getExercise: (id: string) => { name: string } | undefined;
}

export function Dashboard({ routines, onCreateRoutine, onDeleteRoutine, getExercise }: Props) {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');

  const handleCreate = () => {
    if (!title.trim()) return;
    const routine = onCreateRoutine(title.trim());
    setTitle('');
    setShowModal(false);
    navigate(`/build/${routine.id}`);
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  };

  return (
    <div className="page dashboard">
      <header className="dashboard-header">
        <div>
          <h1>My Routines</h1>
          <p className="subtitle">Build balanced Pilates workouts in seconds</p>
        </div>
        <button className="btn btn-primary btn-lg" onClick={() => setShowModal(true)}>
          + New Routine
        </button>
      </header>

      {routines.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🧘</div>
          <h2>No routines yet</h2>
          <p>Create your first routine to get started.</p>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            Create Routine
          </button>
        </div>
      ) : (
        <div className="routine-grid">
          {routines.map(r => (
            <div key={r.id} className="routine-card" onClick={() => navigate(`/routine/${r.id}`)}>
              <div className="routine-card-header">
                <h3>{r.title}</h3>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={e => { e.stopPropagation(); onDeleteRoutine(r.id); }}
                >
                  Delete
                </button>
              </div>
              <p className="routine-card-date">{formatDate(r.createdDate)}</p>
              <p className="routine-card-count">{r.exercises.length} exercise{r.exercises.length !== 1 ? 's' : ''}</p>
              {r.exercises.length > 0 && (
                <ul className="routine-card-preview">
                  {r.exercises.slice(0, 3).map(e => {
                    const ex = getExercise(e.exerciseId);
                    return ex ? <li key={e.exerciseId}>{ex.name}</li> : null;
                  })}
                  {r.exercises.length > 3 && <li className="more">+{r.exercises.length - 3} more</li>}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>New Routine</h2>
            <input
              type="text"
              placeholder="e.g. Morning Flow, Beginner Mat Class..."
              value={title}
              onChange={e => setTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              autoFocus
              className="modal-input"
            />
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreate} disabled={!title.trim()}>Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
