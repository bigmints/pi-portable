'use client';

import styles from './HistorySkeleton.module.css';

export default function HistorySkeleton() {
  return (
    <div className={styles.skeletonList} aria-label="Loading history">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className={styles.skeletonItem}>
          <div className={styles.skeletonContent}>
            <div className={styles.skeletonHeader}>
              <div className={styles.skeletonIcon} />
              <div className={styles.skeletonTitle} />
            </div>
            <div className={styles.skeletonPreview} />
          </div>
          <div className={styles.skeletonMeta}>
            <div className={styles.skeletonTime} />
          </div>
        </div>
      ))}
    </div>
  );
}
