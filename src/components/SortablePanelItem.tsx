import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Props {
  id: string;
  name: string;
  index: number;
  onRemove: () => void;
}

function IconGrip() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
      <circle cx="4" cy="3" r="1.2" />
      <circle cx="4" cy="7" r="1.2" />
      <circle cx="4" cy="11" r="1.2" />
      <circle cx="10" cy="3" r="1.2" />
      <circle cx="10" cy="7" r="1.2" />
      <circle cx="10" cy="11" r="1.2" />
    </svg>
  );
}

export function SortablePanelItem({ id, name, index, onRemove }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`seq-panel-item${isDragging ? ' seq-panel-item-dragging' : ''}`}
      {...attributes}
    >
      {/* Drag zone — left ~25% of row, larger than the grip dots */}
      <span
        ref={setActivatorNodeRef}
        className="seq-panel-drag-zone"
        {...listeners}
        aria-label="Drag to reorder"
      >
        <IconGrip />
      </span>

      {/* Index + name — no drag listeners here, stays scroll-safe */}
      <span className="seq-panel-item-num">{index + 1}</span>
      <span className="seq-panel-item-name">{name}</span>

      {/* Remove — pointer events isolated so tap doesn't start a drag */}
      <button
        className="seq-panel-item-remove"
        onPointerDown={e => e.stopPropagation()}
        onClick={e => { e.stopPropagation(); onRemove(); }}
        aria-label={`Remove ${name}`}
      >
        ×
      </button>
    </div>
  );
}
