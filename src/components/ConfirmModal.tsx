import type { ReactNode } from 'react';

interface Props {
  title: string;
  body: ReactNode;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  title,
  body,
  confirmLabel = 'Delete',
  onConfirm,
  onCancel,
}: Props) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>{title}</h2>
        <div className="modal-body">{body}</div>
        <div className="modal-actions">
          <button className="btn btn-outline" onClick={onCancel}>Cancel</button>
          <button className="btn btn-danger-solid" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
