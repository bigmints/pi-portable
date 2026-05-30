'use client';

import { RefreshCw, ChevronDown } from 'lucide-react';
import styles from './PullToRefreshIndicator.module.css';

interface PullToRefreshIndicatorProps {
  /** Pull progress 0–1 */
  progress: number;
  /** Whether refresh is actively running */
  isRefreshing: boolean;
}

export default function PullToRefreshIndicator({
  progress,
  isRefreshing,
}: PullToRefreshIndicatorProps) {
  if (progress === 0 && !isRefreshing) return null;

  const rotation = progress * 180;

  return (
    <div className={styles.container}>
      <div
        className={styles.iconCircle}
        style={{
          transform: `translateY(${progress * 40}px)`,
          opacity: Math.min(progress * 2, 1),
        }}
      >
        {isRefreshing ? (
          <RefreshCw size={20} strokeWidth={1.5} className={styles.spinner} />
        ) : (
          <ChevronDown
            size={20}
            strokeWidth={1.5}
            className={styles.chevron}
            style={{ transform: `rotate(${rotation}deg)` }}
          />
        )}
      </div>
    </div>
  );
}
