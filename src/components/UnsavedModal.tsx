interface Props {
  onSaveAndLeave: () => void;
  onLeaveWithoutSaving: () => void;
  onCancel: () => void;
}

function IconX() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export function UnsavedModal({ onSaveAndLeave, onLeaveWithoutSaving, onCancel }: Props) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal unsaved-modal" onClick={e => e.stopPropagation()}>
        <div className="unsaved-modal-header">
          <h2>Unsaved changes</h2>
          <button className="unsaved-modal-close" onClick={onCancel} aria-label="Dismiss">
            <IconX />
          </button>
        </div>
        <div className="modal-body">
          You have unsaved changes to this routine.
        </div>
        <div className="unsaved-modal-actions">
          <button className="btn btn-primary" onClick={onSaveAndLeave}>
            Save &amp; Leave
          </button>
          <button className="btn btn-outline" onClick={onLeaveWithoutSaving}>
            Leave Without Saving
          </button>
        </div>
      </div>
    </div>
  );
}
