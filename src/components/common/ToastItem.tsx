'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Info, CheckCircle, AlertTriangle, XCircle, X } from 'lucide-react';
import type { Toast, ToastVariant } from '@/store/toast';
import { useToastStore } from '@/store/toast';
import styles from './ToastContainer.module.css';

const ICON_MAP: Record<ToastVariant, React.ReactNode> = {
  info: <Info size={18} strokeWidth={1.5} />,
  success: <CheckCircle size={18} strokeWidth={1.5} />,
  warning: <AlertTriangle size={18} strokeWidth={1.5} />,
  error: <XCircle size={18} strokeWidth={1.5} />,
};

interface ToastItemProps {
  toast: Toast;
}

export default function ToastItem({ toast }: ToastItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDismissing, setIsDismissing] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dismissToast = useToastStore((state) => state.dismissToast);

  const handleDismiss = useCallback(() => {
    setIsDismissing(true);
    // Wait for slide-out animation before removing from store
    setTimeout(() => {
      dismissToast(toast.id);
    }, 250);
  }, [dismissToast, toast.id]);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    // Resume timer with remaining time
    const elapsed = Date.now() - toast.createdAt;
    const remaining = toast.duration - elapsed;
    if (remaining > 0) {
      timerRef.current = setTimeout(() => {
        handleDismiss();
      }, remaining);
    }
  }, [toast.createdAt, toast.duration, handleDismiss]);

  useEffect(() => {
    // Auto-dismiss timer — only starts if not hovered
    if (!isHovered) {
      timerRef.current = setTimeout(() => {
        handleDismiss();
      }, toast.duration);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [toast.duration, isHovered, handleDismiss]);

  return (
    <div
      className={`${styles.toast} ${styles[`variant-${toast.variant}`]} ${isDismissing ? styles.dismissing : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="alert"
    >
      <div className={`${styles['icon-wrapper']} ${styles[toast.variant]}`}>
        {ICON_MAP[toast.variant]}
      </div>
      <div className={styles.content}>
        <span className={styles.message}>{toast.message}</span>
      </div>
      <button
        className={styles['dismiss-btn']}
        onClick={handleDismiss}
        aria-label="Dismiss notification"
      >
        <X size={14} strokeWidth={1.5} />
      </button>
    </div>
  );
}
