'use client';

import { useCallback } from 'react';
import { ChevronLeft } from 'lucide-react';
import styles from './SwipeBackOverlay.module.css';

interface SwipeBackOverlayProps {
  /** Swipe progress 0–1 */
  progress: number;
  /** Whether the overlay is visible */
  visible?: boolean;
  /** Called when the user releases the swipe */
  onRelease?: () => void;
  /** Called when the user cancels the swipe */
  onCancel?: () => void;
}

export default function SwipeBackOverlay({
  progress,
  visible = true,
  onRelease,
  onCancel,
}: SwipeBackOverlayProps) {
  const handleBackdropClick = useCallback(() => {
    onCancel?.();
  }, [onCancel]);

  const handlePointerUp = useCallback(() => {
    if (progress > 0.5) {
      onRelease?.();
    } else {
      onCancel?.();
    }
  }, [progress, onRelease, onCancel]);

  if (!visible) return null;

  const translateX = progress * window.innerWidth;
  const opacity = Math.min(progress * 2, 1);

  return (
    <div
      className={styles.overlay}
      style={{ opacity }}
      onClick={handleBackdropClick}
      onPointerUp={handlePointerUp}
    >
      <div
        className={styles.content}
        style={{ transform: `translateX(${translateX}px)` }}
      >
        <div className={styles.iconWrapper}>
          <ChevronLeft size={24} strokeWidth={1.5} className={styles.icon} />
        </div>
        <span className={styles.label}>Swipe back</span>
      </div>
    </div>
  );
}
