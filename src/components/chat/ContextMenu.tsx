/**
 * ContextMenu — Floating context menu for conversation items
 * Positioned near the trigger item. Dismissed on outside click, Escape, or action.
 */

'use client';

import { useEffect, useRef } from 'react';
import { Pin, Edit, Download, Trash2 } from 'lucide-react';
import styles from './ContextMenu.module.css';

interface ContextMenuProps {
  x: number;
  y: number;
  conversationId: string;
  isPinned: boolean;
  onClose: () => void;
  onRename: (_conversationId: string) => void;
  onPin: (_conversationId: string) => void;
  onDelete: (_conversationId: string) => void;
  onExport: (_conversationId: string) => void;
}

export default function ContextMenu({
  x,
  y,
  conversationId,
  isPinned,
  onClose,
  onRename,
  onPin,
  onDelete,
  onExport,
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    // Small delay to avoid immediate dismissal
    const timer = setTimeout(() => {
      window.addEventListener('mousedown', handleOutsideClick);
    }, 100);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [onClose]);

  const handleAction = (action: () => void) => {
    action();
    onClose();
  };

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div
        ref={menuRef}
        className={styles.menu}
        style={{ top: y, left: x }}
        role="menu"
      >
        <button
          className={styles.menuItem}
          onClick={() => handleAction(() => onPin(conversationId))}
          role="menuitem"
        >
          <Pin size={14} strokeWidth={1.5} />
          {isPinned ? 'Unpin' : 'Pin'}
        </button>
        <button
          className={styles.menuItem}
          onClick={() => handleAction(() => onRename(conversationId))}
          role="menuitem"
        >
          <Edit size={14} strokeWidth={1.5} />
          Rename
        </button>
        <button
          className={styles.menuItem}
          onClick={() => handleAction(() => onExport(conversationId))}
          role="menuitem"
        >
          <Download size={14} strokeWidth={1.5} />
          Export
        </button>
        <div className={styles.divider} />
        <button
          className={`${styles.menuItem} ${styles.menuItemDelete}`}
          onClick={() => handleAction(() => onDelete(conversationId))}
          role="menuitem"
        >
          <Trash2 size={14} strokeWidth={1.5} />
          Delete
        </button>
      </div>
    </>
  );
}
