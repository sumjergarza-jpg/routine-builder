import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import type { Routine, Exercise } from '../data/types';
import { type Filters, emptyFilters } from '../store/useStore';
import { FilterPanel } from '../components/FilterPanel';
import { ExerciseCard } from '../components/ExerciseCard';

interface Props {
  routines: Routine[];
  filterExercises: (filters: Filters) => Exercise[];
  getExercise: (id: string) => Exercise | undefined;
  addExerciseToRoutine: (routineId: string, exerciseId: string) => void;
  removeExerciseFromRoutine: (routineId: string, exerciseId: string) => void;
  updateRoutine: (id: string, updates: Partial<Pick<Routine, 'title'>>) => void;
}

function IconPlay() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="white" stroke="none">
      <polygon points="6 3 20 12 6 21 6 3" />
    </svg>
  );
}

function IconDashboard() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function IconCatalog() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}

function IconBuild() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}

function IconSave() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  );
}

function IconPlayCircle() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polygon points="10 8 16 12 10 16 10 8" />
    </svg>
  );
}

function IconLayers() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}

export function RoutineBuilder({
  routines,
  filterExercises,
  getExercise,
  addExerciseToRoutine,
  removeExerciseFromRoutine,
  updateRoutine,
}: Props) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const routine = routines.find(r => r.id === id);
  const [editTitle, setEditTitle] = useState(routine?.title ?? '');
  const [notes, setNotes] = useState('');

  const exercises = useMemo(() => filterExercises(filters), [filterExercises, filters]);
  const addedIds = new Set(routine?.exercises.map(e => e.exerciseId) ?? []);

  if (!routine) {
    return (
      <div className="page">
        <p>Routine not found.</p>
        <button className="btn btn-primary" onClick={() => navigate('/')}>Back to Dashboard</button>
      </div>
    );
  }

  const handleSave = () => {
    if (!editTitle.trim()) return;
    updateRoutine(routine.id, { title: editTitle.trim() });
    navigate(`/routine/${routine.id}`);
  };

  return (
    <div className="builder-layout">
      {/* LEFT SIDEBAR */}
      <aside className="builder-sidebar">
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <IconPlay />
          </div>
          <div className="sidebar-brand-text">
            <span className="sidebar-brand-name">Align Pilates</span>
            <span className="sidebar-brand-sub">Routine Builder</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          <Link to="/" className="sidebar-nav-item">
            <IconDashboard />
            Dashboard
          </Link>
          <button className="sidebar-nav-item" onClick={() => navigate('/')}>
            <IconCatalog />
            Browse Catalog
          </button>
          <button className="sidebar-nav-item active">
            <IconBuild />
            Build Routine
          </button>
        </nav>

        {/* Form */}
        <div className="sidebar-form">
          <h2 className="sidebar-form-title">Build a Routine</h2>
          <p className="sidebar-form-subtitle">Tap + on any exercise to add it.</p>

          <input
            type="text"
            className="routine-name-input"
            placeholder="Routine name..."
            value={editTitle}
            onChange={e => setEditTitle(e.target.value)}
          />

          <textarea
            className="routine-notes-input"
            placeholder="Notes or class intention..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />

          <button
            className="btn btn-primary save-routine-btn"
            onClick={handleSave}
            disabled={!editTitle.trim()}
          >
            <IconSave />
            Save Routine
          </button>
        </div>

        {/* Sequence */}
        <div className="sequence-section">
          <div className="sequence-header">
            <IconPlayCircle />
            <span>Sequence</span>
            <span className="sequence-count">{routine.exercises.length}</span>
          </div>

          {routine.exercises.length === 0 ? (
            <div className="sequence-empty">
              <span className="sequence-empty-icon"><IconLayers /></span>
              <p>No exercises yet. Browse the library on the right and tap + to add them here.</p>
            </div>
          ) : (
            <div className="sequence-items">
              {routine.exercises.map((re, i) => {
                const ex = getExercise(re.exerciseId);
                if (!ex) return null;
                return (
                  <div key={re.exerciseId} className="sequence-item">
                    <span className="sequence-item-num">{i + 1}</span>
                    <span className="sequence-item-name">{ex.name}</span>
                    <button
                      className="sequence-item-remove"
                      onClick={() => removeExerciseFromRoutine(routine.id, re.exerciseId)}
                    >×</button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </aside>

      {/* RIGHT PANEL */}
      <main className="builder-main">
        <FilterPanel
          filters={filters}
          onChange={setFilters}
          open={filtersOpen}
          onToggle={() => setFiltersOpen(!filtersOpen)}
        />

        <div className="catalog-body">
          {exercises.length === 0 ? (
            <div className="empty-state small">
              <p>No exercises match your filters.</p>
            </div>
          ) : (
            <div className="exercise-grid">
              {exercises.map(ex => (
                <ExerciseCard
                  key={ex.id}
                  exercise={ex}
                  added={addedIds.has(ex.id)}
                  onAdd={() => addExerciseToRoutine(routine.id, ex.id)}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
