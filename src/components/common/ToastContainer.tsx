'use client';

import { useToastStore } from '@/store/toast';
import ToastItem from './ToastItem';
import styles from './ToastContainer.module.css';

/**
 * ToastContainer — renders all active toasts and manages screen reader announcements.
 * Positioned bottom-right on desktop, bottom-center on mobile.
 */
export default function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts);

  return (
    <div className={styles.container}>
      {/* Screen reader announcements */}
      <div
        className={styles['sr-only-region']}
        aria-live="polite"
        aria-atomic="true"
        role="status"
      >
        {toasts.length > 0
          ? toasts.map((t) => `${t.message}`).join('. ')
          : ''}
      </div>

      {/* Visible toast items */}
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
