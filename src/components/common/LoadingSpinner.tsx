'use client';

import styles from './LoadingSpinner.module.css';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export default function LoadingSpinner({ size = 'md', label }: LoadingSpinnerProps) {
  const sizeMap = { sm: 16, md: 24, lg: 32 };
  const px = sizeMap[size];

  return (
    <div className={styles.container}>
      <div className={styles.spinner} style={{ width: px, height: px }} />
      {label && <span className={styles.label}>{label}</span>}
    </div>
  );
}
