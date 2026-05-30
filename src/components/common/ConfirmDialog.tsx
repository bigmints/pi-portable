'use client';

import { useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import styles from './ConfirmDialog.module.css';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  requireTypedValue?: string;
  typedValue?: string;
  onTypedValueChange?: (value: string) => void;
  confirmVariant?: 'default' | 'danger';
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  requireTypedValue,
  typedValue = '',
  onTypedValueChange,
  confirmVariant = 'default',
}: ConfirmDialogProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel?.();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const isConfirmed = requireTypedValue
    ? typedValue === requireTypedValue
    : true;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      onCancel?.();
    }
  };

  return (
    <div
      ref={overlayRef}
      className={styles.overlay}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div className={styles.dialog}>
        <div className={styles.header}>
          <h2 id="confirm-dialog-title" className={styles.title}>
            {title}
          </h2>
          <button
            className={styles.close}
            onClick={onCancel}
            aria-label="Close"
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>
        <p className={styles.message}>{message}</p>
        {requireTypedValue && (
          <div className={styles.typingSection}>
            <label htmlFor="confirm-typed" className={styles.typingLabel}>
              Type <strong>{requireTypedValue}</strong> to confirm:
            </label>
            <input
              id="confirm-typed"
              className={styles.input}
              type="text"
              value={typedValue}
              onChange={(e) => onTypedValueChange?.(e.target.value)}
              placeholder={requireTypedValue}
              autoFocus
            />
          </div>
        )}
        <div className={styles.actions}>
          <button className={`${styles.button} ${styles.cancel}`} onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            className={`${styles.button} ${styles.confirm} ${
              confirmVariant === 'danger' ? styles.dangerBtn : ''
            }`}
            disabled={!isConfirmed}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
