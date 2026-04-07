import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { NavContext, usePageTitle } from '../context/NavContext';
import { ExerciseDetailModal } from '../components/ExerciseDetailModal';
import type { Routine, Exercise } from '../data/types';

interface Props {
  routines: Routine[];
  getExercise: (id: string) => Exercise | undefined;
}

function formatReps(reps: string | undefined): string {
  if (!reps || reps.trim() === '') return '';
  const trimmed = reps.trim();
  return /^\d+$/.test(trimmed) ? `×${trimmed}` : trimmed;
}

export function RoutineViewFinal({ routines, getExercise }: Props) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { setRightSlot } = useContext(NavContext);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  usePageTitle('Routine View');

  useEffect(() => {
    setRightSlot(
      <button
        className="top-nav-dashboard-link"
        onClick={() => navigate(`/routine/${id}`)}
      >
        Edit Routine
      </button>,
    );
    return () => setRightSlot(null);
  }, [id, navigate, setRightSlot]);

  const routine = routines.find(r => r.id === id);

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
    <>
      <div className="routine-view-page">
        <div className="routine-view-header">
          <h1 className="routine-view-title">{routine.title}</h1>
          <p className="routine-view-count">{count} exercise{count !== 1 ? 's' : ''}</p>
        </div>

        {routine.description && (
          <p className="routine-view-description">{routine.description}</p>
        )}

        {count === 0 ? (
          <div className="empty-state small">
            <p>No exercises in this routine.</p>
            <button className="btn btn-outline" onClick={() => navigate(`/routine/${id}`)}>
              Edit Routine
            </button>
          </div>
        ) : (
          <ol className="routine-view-list">
            {routine.exercises.map((re, index) => {
              const ex = getExercise(re.exerciseId);
              if (!ex) return null;
              const repsDisplay = formatReps(re.reps);
              return (
                <li
                  key={re.exerciseId}
                  className="routine-view-item"
                  onClick={() => setSelectedExercise(ex)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && setSelectedExercise(ex)}
                >
                  <span className="routine-view-num">{index + 1}</span>
                  <span className="routine-view-name">{ex.name}</span>
                  {repsDisplay && (
                    <span className="routine-view-reps">{repsDisplay}</span>
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </div>

      {selectedExercise && (
        <ExerciseDetailModal
          exercise={selectedExercise}
          added={true}
          onAdd={() => {}}
          onClose={() => setSelectedExercise(null)}
        />
      )}
    </>
  );
}
