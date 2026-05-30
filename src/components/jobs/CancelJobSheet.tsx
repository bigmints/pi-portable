'use client';

import { AlertTriangle } from 'lucide-react';
import styles from './CancelJobSheet.module.css';

interface CancelJobSheetProps {
  jobId: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function CancelJobSheet({ isOpen, onClose, onConfirm }: CancelJobSheetProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <AlertTriangle size={24} strokeWidth={1.5} className={styles.icon} />
          <h2 className={styles.title}>Cancel Job?</h2>
        </div>
        <p className={styles.body}>
          This will permanently stop the job. Any progress made will be lost.
        </p>
        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onClose}>
            Cancel
          </button>
          <button className={styles.stopBtn} onClick={onConfirm}>
            Stop Job
          </button>
        </div>
      </div>
    </div>
  );
}
