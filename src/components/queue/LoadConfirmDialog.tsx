/**
 * LoadConfirmDialog — confirmation dialog before replacing unsaved tasks.
 */

'use client';

import { X } from 'lucide-react';
import styles from './LoadConfirmDialog.module.css';

interface Props {
  open: boolean;
  queueName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function LoadConfirmDialog({ open, queueName, onConfirm, onCancel }: Props) {
  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>Replace Current Queue?</h3>
          <button className={styles.closeBtn} onClick={onCancel} aria-label="Close">
            <X size={16} />
          </button>
        </div>
        <p className={styles.message}>
          Loading <strong>{queueName}</strong> will replace your current unsaved tasks.
        </p>
        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onCancel}>
            Cancel
          </button>
          <button className={styles.confirmBtn} onClick={onConfirm}>
            Load Queue
          </button>
        </div>
      </div>
    </div>
  );
}
