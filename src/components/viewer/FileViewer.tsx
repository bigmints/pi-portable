/**
 * FileViewer — modal overlay for viewing file contents
 *
 * Desktop (≥768px): centered modal with backdrop.
 * Mobile (<768px): full-screen overlay.
 * Supports Escape to close and focus trap.
 */

'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useFileViewerStore, type ViewerFile } from '@/store/file-viewer';
import FileViewerHeader from './FileViewerHeader';
import FileViewerContent from './FileViewerContent';
import styles from './FileViewer.module.css';

export default function FileViewer() {
  const { isOpen, closeFile, file } = useFileViewerStore();
  const overlayRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Focus trap: save previously focused element and restore on close
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      overlayRef.current?.focus();
    } else if (previousActiveElement.current) {
      previousActiveElement.current.focus();
    }
  }, [isOpen]);

  // Keyboard handler — Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        closeFile();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeFile]);

  // Close on backdrop click
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        closeFile();
      }
    },
    [closeFile]
  );

  if (!isOpen || !file) return null;

  return (
    <div
      ref={overlayRef}
      className={styles.overlay}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label={`Viewing ${file.path}`}
      tabIndex={-1}
    >
      <div className={styles.container}>
        <FileViewerHeader file={file} />
        <FileViewerContent file={file} />
      </div>
    </div>
  );
}
