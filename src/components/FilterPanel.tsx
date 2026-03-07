import type { Filters } from '../store/useStore';
import type { Equipment, Position, Difficulty, MuscleGroup, Contraindication } from '../data/types';
import { equipmentLabels, positionLabels, difficultyLabels, focusLabels, contraindicationLabels } from '../data/labels';

interface Props {
  filters: Filters;
  onChange: (filters: Filters) => void;
  open: boolean;
  onToggle: () => void;
}

function IconFilter() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="8" y1="12" x2="16" y2="12" />
      <line x1="11" y1="18" x2="13" y2="18" />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function IconChevron({ open }: { open: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export function FilterPanel({ filters, onChange, open, onToggle }: Props) {
  const set = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    onChange({ ...filters, [key]: value });

  const toggleContra = (c: Contraindication) => {
    const next = filters.contraindications.includes(c)
      ? filters.contraindications.filter(x => x !== c)
      : [...filters.contraindications, c];
    set('contraindications', next);
  };

  const hasActiveFilters = filters.equipment || filters.position || filters.difficulty || filters.focus || filters.contraindications.length > 0;

  return (
    <>
      <div className="catalog-header">
        <button
          className={`catalog-filter-btn${open ? ' active' : ''}`}
          onClick={onToggle}
        >
          <IconFilter />
          Filter Exercises
          {hasActiveFilters && (
            <span style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: 'var(--color-primary)',
              display: 'inline-block',
              marginLeft: 2,
            }} />
          )}
        </button>

        <div className="catalog-search">
          <span className="catalog-search-icon"><IconSearch /></span>
          <input
            type="text"
            className="catalog-search-input"
            placeholder="Search exercises..."
            value={filters.search}
            onChange={e => set('search', e.target.value)}
          />
        </div>

        <button className="catalog-chevron-btn" onClick={onToggle}>
          <IconChevron open={open} />
        </button>
      </div>

      {open && (
        <div className="catalog-filter-body">
          <div className="filter-group">
            <label>Equipment</label>
            <select value={filters.equipment} onChange={e => set('equipment', e.target.value as Equipment | '')}>
              <option value="">All Equipment</option>
              {Object.entries(equipmentLabels).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Position</label>
            <select value={filters.position} onChange={e => set('position', e.target.value as Position | '')}>
              <option value="">All Positions</option>
              {Object.entries(positionLabels).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Difficulty</label>
            <select value={filters.difficulty} onChange={e => set('difficulty', e.target.value as Difficulty | '')}>
              <option value="">All Levels</option>
              {Object.entries(difficultyLabels).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Muscle Focus</label>
            <select value={filters.focus} onChange={e => set('focus', e.target.value as MuscleGroup | '')}>
              <option value="">All</option>
              {Object.entries(focusLabels).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>

          <div className="filter-group" style={{ gridColumn: 'span 2' }}>
            <label>Exclude (injuries/conditions)</label>
            <div className="contra-chips">
              {Object.entries(contraindicationLabels).map(([k, v]) => (
                <button
                  key={k}
                  className={`chip ${filters.contraindications.includes(k as Contraindication) ? 'chip-active' : ''}`}
                  onClick={() => toggleContra(k as Contraindication)}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {hasActiveFilters && (
            <div className="catalog-filter-actions">
              <button
                className="btn btn-outline btn-sm"
                onClick={() => onChange({ ...filters, equipment: '', position: '', difficulty: '', focus: '', contraindications: [] })}
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
