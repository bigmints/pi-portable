'use client';

import styles from './CancelConfirmDialog.module.css';

export default function CancelConfirmDialog({
  open,
  onConfirm,
  onDismiss,
}: {
  open: boolean;
  onConfirm: () => void;
  onDismiss: () => void;
}) {
  if (!open) return null;

  return (
    <div className={styles.dialog}>
      <p>Cancel all pending tasks?</p>
      <div className={styles.actions}>
        <button className={styles.confirm} onClick={onConfirm}>
          Confirm
        </button>
        <button className={styles.dismiss} onClick={onDismiss}>
          Dismiss
        </button>
      </div>
    </div>
  );
}
