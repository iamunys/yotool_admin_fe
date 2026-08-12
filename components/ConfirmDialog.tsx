"use client";

export function ConfirmDialog({
  title,
  description,
  confirmLabel = "Confirm",
  isConfirming,
  onConfirm,
  onCancel,
}: {
  title: string;
  description: string;
  confirmLabel?: string;
  isConfirming?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      role="presentation"
      onClick={onCancel}
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="card w-full max-w-sm p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="confirm-dialog-title" className="text-base font-bold text-ink">
          {title}
        </h2>
        <p className="mt-2 text-sm font-medium text-muted">{description}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onCancel} disabled={isConfirming} className="dash-btn-secondary min-h-10">
            Cancel
          </button>
          <button type="button" onClick={onConfirm} disabled={isConfirming} className="dash-btn-primary min-h-10">
            {isConfirming ? "Sending…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
