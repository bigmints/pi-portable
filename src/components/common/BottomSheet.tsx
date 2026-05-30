'use client';

import { useRef, useEffect, useCallback, type RefObject, type ReactNode } from 'react';
import { X } from 'lucide-react';
import styles from './BottomSheet.module.css';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  triggerRef?: RefObject<HTMLElement | null>;
}

export default function BottomSheet({ isOpen, onClose, title, children, triggerRef }: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const prevActiveElement = useRef<HTMLElement | null>(null);
  const dragStartY = useRef(0);
  const dragStartTop = useRef(0);
  const isDragging = useRef(false);
  const dismissThreshold = 0.4; // 40% of sheet height

  // Focus management
  useEffect(() => {
    if (isOpen) {
      prevActiveElement.current = document.activeElement as HTMLElement | null;

      // Focus first focusable element in the sheet
      const focusable = sheetRef.current?.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement | null;
      if (focusable) {
        focusable.focus();
      } else {
        sheetRef.current?.focus();
      }
    }

    return () => {
      if (!isOpen) {
        triggerRef?.current?.focus();
      }
    };
  }, [isOpen, triggerRef]);

  // Restore focus on close
  useEffect(() => {
    if (!isOpen && prevActiveElement.current) {
      prevActiveElement.current.focus();
    }
  }, [isOpen]);

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Focus trap
  useEffect(() => {
    if (!isOpen) return;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const sheet = sheetRef.current;
      if (!sheet) return;

      const focusable = sheet.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleTab);
    return () => window.removeEventListener('keydown', handleTab);
  }, [isOpen]);

  // Touch drag handler
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    dragStartY.current = touch.clientY;
    dragStartTop.current = 0;
    isDragging.current = true;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current) return;
    const touch = e.touches[0];
    const deltaY = touch.clientY - dragStartY.current;
    if (deltaY > 0) {
      e.preventDefault();
      const sheet = sheetRef.current;
      if (sheet) {
        sheet.style.transform = `translateY(${deltaY}px)`;
        sheet.style.transition = 'none';
      }
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;

    const sheet = sheetRef.current;
    if (!sheet) return;

    const deltaY = parseInt(sheet.style.transform.replace('translateY(', '').replace('px)', '') || '0', 10);
    const sheetHeight = sheet.offsetHeight;

    if (deltaY > sheetHeight * dismissThreshold) {
      // Dismiss with spring-like animation
      sheet.style.transition = 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      sheet.style.transform = 'translateY(100%)';
      setTimeout(onClose, 300);
    } else {
      // Snap back
      sheet.style.transition = 'transform 0.25s ease-out';
      sheet.style.transform = 'translateY(0)';
    }
  }, [onClose]);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={handleBackdropClick}>
      <div
        ref={sheetRef}
        className={styles.sheet}
        role="dialog"
        aria-modal="true"
        aria-label={title || 'Bottom sheet'}
      >
        <div
          ref={handleRef}
          className={styles.handle}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          aria-hidden="true"
        />
        {title && (
          <div className={styles.header}>
            <h2 className={styles.title}>{title}</h2>
            <button
              className={styles.closeButton}
              onClick={onClose}
              aria-label="Close"
            >
              <X size={18} strokeWidth={1.5} />
            </button>
          </div>
        )}
        <div className={styles.content}>
          {children}
        </div>
      </div>
    </div>
  );
}
