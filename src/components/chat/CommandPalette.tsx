'use client';

import { useEffect, useRef } from 'react';
import * as Icons from 'lucide-react';
import { useCommandsStore, type Command } from '@/store/commands';
import styles from './CommandPalette.module.css';

const IconMap: Record<string, Icons.LucideIcon> = {
  FileText: Icons.FileText,
  HelpCircle: Icons.HelpCircle,
  Code2: Icons.Code2,
  Bug: Icons.Bug,
  CheckSquare: Icons.CheckSquare,
  BookOpen: Icons.BookOpen,
  Zap: Icons.Zap,
  Sparkles: Icons.Sparkles,
  Languages: Icons.Languages,
  Database: Icons.Database,
  Trash2: Icons.Trash2,
  WrapText: Icons.WrapText,
  Info: Icons.Info,
  PlusCircle: Icons.PlusCircle,
  Activity: Icons.Activity,
  Rocket: Icons.Rocket,
  Settings: Icons.Settings,
  Download: Icons.Download,
  Undo2: Icons.Undo2,
  Redo2: Icons.Redo2,
};

interface CommandPaletteProps {
  filteredCommands: Command[];
  highlightedIndex: number;
  onSelect: (command: Command) => void;
  onClose: () => void;
  onHoverItem: (index: number) => void;
}

export default function CommandPalette({
  filteredCommands,
  highlightedIndex,
  onSelect,
  onClose,
  onHoverItem,
}: CommandPaletteProps) {
  const { isPaletteOpen, filterQuery, setFilterQuery } = useCommandsStore();
  const paletteRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Click outside and escape detection
  useEffect(() => {
    if (!isPaletteOpen) return;

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (paletteRef.current && !paletteRef.current.contains(e.target as Node)) {
        // Only close if we didn't click inside the Composer or palette
        const target = e.target as HTMLElement;
        if (!target.closest('[data-composer]')) {
          onClose();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isPaletteOpen, onClose]);

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const activeItem = listRef.current.children[highlightedIndex] as HTMLElement;
      if (activeItem) {
        activeItem.scrollIntoView({
          block: 'nearest',
        });
      }
    }
  }, [highlightedIndex]);

  if (!isPaletteOpen) return null;

  return (
    <div
      ref={paletteRef}
      className={styles.palette}
      role="listbox"
      aria-label="Commands"
      onMouseDown={(e) => {
        // Prevent blurring of the Composer textarea
        e.preventDefault();
      }}
    >
      {/* Search Input display */}
      <div className={styles.searchContainer}>
        <Icons.Search size={14} className={styles.searchIcon} />
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Filter commands..."
          value={filterQuery}
          onChange={(e) => setFilterQuery(e.target.value)}
          aria-label="Filter commands"
        />
      </div>

      {/* Commands List */}
      <div ref={listRef} className={styles.list}>
        {filteredCommands.length > 0 ? (
          filteredCommands.map((command, index) => {
            const Icon = IconMap[command.icon || 'Code2'] || Icons.Code2;
            const isSelected = index === highlightedIndex;

            return (
              <div
                key={command.id}
                role="option"
                aria-selected={isSelected}
                className={`${styles.item} ${isSelected ? styles.active : ''}`}
                onClick={() => onSelect(command)}
                onMouseEnter={() => onHoverItem(index)}
              >
                <div className={styles.itemLeft}>
                  <div className={styles.iconWrapper}>
                    <Icon size={16} strokeWidth={1.5} />
                  </div>
                  <div className={styles.meta}>
                    <span className={styles.label}>{command.label}</span>
                    <span className={styles.description}>{command.description}</span>
                  </div>
                </div>
                {command.shortcut && (
                  <span className={styles.shortcut}>
                    <kbd>{command.shortcut}</kbd>
                  </span>
                )}
              </div>
            );
          })
        ) : (
          <div className={styles.empty}>No commands found</div>
        )}
      </div>

      {/* Footer / Shortcut hints */}
      <div className={styles.footer}>
        <span className={styles.hint}>
          <kbd>↑</kbd><kbd>↓</kbd> navigate
        </span>
        <span className={styles.hint}>
          <kbd>↵</kbd> select
        </span>
        <span className={styles.hint}>
          <kbd>esc</kbd> dismiss
        </span>
      </div>
    </div>
  );
}
