'use client';

import { useEffect, useRef, useCallback } from 'react';
import type { LucideIcon } from 'lucide-react';
import styles from './ContextMenu.module.css';

export interface ContextMenuItem {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  danger?: boolean;
}

interface ContextMenuProps {
  items: ContextMenuItem[];
  position: { x: number; y: number };
  onClose: () => void;
}

export default function ContextMenu({ items, position, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  useEffect(() => {
    // Ensure menu stays within viewport
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const viewportW = window.innerWidth;
      const viewportH = window.innerHeight;
      if (rect.right > viewportW) {
        menuRef.current.style.left = `${viewportW - rect.width - 8}px`;
        menuRef.current.style.right = 'auto';
      }
      if (rect.bottom > viewportH) {
        menuRef.current.style.top = `${viewportH - rect.height - 8}px`;
        menuRef.current.style.bottom = 'auto';
      }
    }
  }, []);

  const handleItemClick = useCallback(
    (onClick: () => void) => {
      onClick();
      onClose();
    },
    [onClose]
  );

  return (
    <div
      ref={menuRef}
      className={`${styles.menu} ${styles.menuVisible}`}
      style={{ left: position.x, top: position.y }}
    >
      {items.map((item, i) => {
        const Icon = item.icon;
        return (
          <button
            key={i}
            className={`${styles.menuItem} ${item.danger ? styles.menuItemDanger : ''}`}
            onClick={() => handleItemClick(item.onClick)}
          >
            <Icon size={14} strokeWidth={1.5} className={styles.menuIcon} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * Hook to handle context menu triggering on both desktop (right-click) and mobile (long-press).
 */
export function useContextMenu(
  onTrigger: (position: { x: number; y: number }) => void
) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      onTrigger({ x: e.clientX, y: e.clientY });
    },
    [onTrigger]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      timerRef.current = setTimeout(() => {
        const touch = e.changedTouches?.[0] || { clientX: window.innerWidth / 2, clientY: window.innerHeight / 2 };
        onTrigger({ x: touch.clientX, y: touch.clientY });
      }, 500);
    },
    [onTrigger]
  );

  const handleTouchEnd = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handleTouchMove = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  return {
    onContextMenu: handleContextMenu,
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
    onTouchMove: handleTouchMove,
  };
}
