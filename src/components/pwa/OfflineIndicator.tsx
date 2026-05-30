'use client';

import { WifiOff } from 'lucide-react';
import styles from './OfflineIndicator.module.css';
import { usePwaStore } from '@/store/pwa';

export default function OfflineIndicator() {
  const isOnline = usePwaStore((state) => state.isOnline);

  if (isOnline) return null;

  return (
    <div className={styles.indicator} role="alert" aria-live="polite">
      <WifiOff size={14} strokeWidth={1.5} className={styles.icon} />
      <span className={styles.text}>You are offline</span>
    </div>
  );
}
