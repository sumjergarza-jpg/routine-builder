import type { Filters } from '../store/useStore';
import type { Equipment, Position, Difficulty, MuscleGroup, Contraindication } from '../data/types';
import { equipmentLabels, positionLabels, difficultyLabels, focusLabels, contraindicationLabels } from '../data/labels';

interface Props {
  filters: Filters;
  onChange: (filters: Filters) => void;
  open: boolean;
  onToggle: () => void;
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
    <div className="filter-panel">
      <div className="filter-panel-header">
        <button className="btn btn-outline filter-toggle" onClick={onToggle}>
          Filters {hasActiveFilters && <span className="filter-dot" />}
        </button>
        <div className="search-wrapper">
          <input
            type="text"
            placeholder="Search exercises..."
            value={filters.search}
            onChange={e => set('search', e.target.value)}
            className="search-input"
          />
        </div>
      </div>
      {open && (
        <div className="filter-panel-body">
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
          <div className="filter-group">
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
            <button className="btn btn-outline btn-sm" onClick={() => onChange({ ...filters, equipment: '', position: '', difficulty: '', focus: '', contraindications: [] })}>
              Clear Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
