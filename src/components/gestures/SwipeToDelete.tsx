'use client';

import { useRef, useCallback, useState, type ReactNode } from 'react';
import { Trash2 } from 'lucide-react';
import styles from './SwipeToDelete.module.css';

interface SwipeToDeleteProps {
  children: ReactNode;
  onDelete: () => void;
  deleteLabel?: string;
  enabled?: boolean;
}

const SWIPE_THRESHOLD = 80;

export default function SwipeToDelete({
  children,
  onDelete,
  deleteLabel = 'Delete',
  enabled = true,
}: SwipeToDeleteProps) {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const startXRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!enabled) return;
    startXRef.current = e.touches[0].clientX;
    isDraggingRef.current = false;
  }, [enabled]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!enabled || startXRef.current === null) return;

    const currentX = e.touches[0].clientX;
    const diff = startXRef.current - currentX;

    // Only track rightward swipes (swipe left to reveal delete)
    if (diff > 0) {
      isDraggingRef.current = true;
      const clamped = Math.min(diff, SWIPE_THRESHOLD);
      setSwipeOffset(clamped);
    }
  }, [enabled]);

  const handleTouchEnd = useCallback(() => {
    if (swipeOffset > SWIPE_THRESHOLD * 0.6) {
      onDelete();
    }
    setSwipeOffset(0);
    startXRef.current = null;
    isDraggingRef.current = false;
  }, [swipeOffset, onDelete]);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
    setSwipeOffset(0);
  }, [onDelete]);

  const progress = Math.min(swipeOffset / SWIPE_THRESHOLD, 1);

  return (
    <div className={styles.wrapper}>
      <div
        className={styles.deletePanel}
        style={{ width: `${SWIPE_THRESHOLD}px` }}
      >
        <button className={styles.deleteButton} onClick={handleDelete}>
          <Trash2 size={16} strokeWidth={1.5} />
          <span className={styles.deleteLabel}>{deleteLabel}</span>
        </button>
      </div>
      <div
        className={styles.content}
        style={{ transform: `translateX(${swipeOffset}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
}
