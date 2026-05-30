'use client';

import { Square } from 'lucide-react';
import styles from './StopButton.module.css';

interface StopButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export default function StopButton({ onClick, disabled = false }: StopButtonProps) {
  return (
    <button
      className={styles.button}
      onClick={onClick}
      disabled={disabled}
      aria-label="Stop streaming"
    >
      <Square size={16} strokeWidth={1.5} />
      <span className={styles.label}>Stop</span>
    </button>
  );
}
