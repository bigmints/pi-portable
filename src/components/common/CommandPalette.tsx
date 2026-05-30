/**
 * CommandPalette — modal overlay for searching conversations and commands
 *
 * Opens on Cmd+K / Ctrl+K. Supports keyboard navigation with arrow keys,
 * Enter to select, and Escape to close.
 */

'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Search,
  MessageSquare,
  PlusCircle,
  Settings,
  X,
  ChevronRight,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useShortcutsStore } from '@/store/shortcuts';
import { useConversationsStore } from '@/store/conversations';
import styles from './CommandPalette.module.css';

// ─── Command definitions ────────────────────────────────────────────────────

interface Command {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
}

interface ConversationItem {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  type: 'conversation';
}

type PaletteItem = Command | ConversationItem;

interface PaletteSection {
  title: string;
  items: PaletteItem[];
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function CommandPalette() {
  const { commandPaletteOpen, closeCommandPalette, openShortcutsPanel } =
    useShortcutsStore();
  const { conversations, selectConversation } = useConversationsStore();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Build sections from conversations and commands
  const sections = useCallback((): PaletteSection[] => {
    const sections: PaletteSection[] = [];

    // Commands section
    const commands: Command[] = [
      {
        id: 'cmd-new',
        label: 'New Conversation',
        description: 'Start a new chat',
        icon: <PlusCircle size={16} strokeWidth={1.5} />,
        action: () => {
          closeCommandPalette();
          router.push('/chat');
        },
      },
      {
        id: 'cmd-settings',
        label: 'Settings',
        description: 'Open settings page',
        icon: <Settings size={16} strokeWidth={1.5} />,
        action: () => {
          closeCommandPalette();
          router.push('/settings');
        },
      },
      {
        id: 'cmd-shortcuts',
        label: 'Keyboard Shortcuts',
        description: 'View all keyboard shortcuts',
        icon: <ChevronRight size={16} strokeWidth={1.5} />,
        action: () => {
          closeCommandPalette();
          openShortcutsPanel();
        },
      },
    ];

    if (commands.length > 0) {
      sections.push({ title: 'Commands', items: commands });
    }

    // Conversations section — show recent conversations matching query
    const recentConversations = conversations
      .slice(0, 20)
      .map((conv) => ({
        id: `conv-${conv.id}`,
        label: conv.title,
        description: conv.lastMessagePreview?.slice(0, 40) || '',
        icon: <MessageSquare size={16} strokeWidth={1.5} />,
        action: () => {
          closeCommandPalette();
          selectConversation(conv.id);
          router.push(`/chat/${conv.id}`);
        },
        type: 'conversation' as const,
      }));

    if (recentConversations.length > 0) {
      sections.push({ title: 'Conversations', items: recentConversations });
    }

    return sections;
  }, [conversations, closeCommandPalette, openShortcutsPanel, router, selectConversation]);

  // Filter items based on query
  const filteredSections = useCallback((): PaletteSection[] => {
    const allSections = sections();
    if (!query.trim()) return allSections;

    const lowerQuery = query.toLowerCase();
    return allSections
      .map((section) => ({
        ...section,
        items: section.items.filter(
          (item) =>
            item.label.toLowerCase().includes(lowerQuery) ||
            (item.description &&
              item.description.toLowerCase().includes(lowerQuery))
        ),
      }))
      .filter((section) => section.items.length > 0);
  }, [sections, query]);

  // Flatten all items for keyboard navigation
  const allItems = useCallback((): PaletteItem[] => {
    return filteredSections().flatMap((s) => s.items);
  }, [filteredSections]);

  // Reset selection when query or items change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Focus input on open
  useEffect(() => {
    if (commandPaletteOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [commandPaletteOpen]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const items = allItems();
      if (items.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, items.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < items.length) {
          items[selectedIndex].action();
        }
      } else if (e.key === 'Escape') {
        closeCommandPalette();
      }
    },
    [allItems, selectedIndex, closeCommandPalette]
  );

  // Scroll selected item into view
  useEffect(() => {
    const el = listRef.current?.children[selectedIndex] as HTMLElement;
    el?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  // Close on backdrop click
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        closeCommandPalette();
      }
    },
    [closeCommandPalette]
  );

  if (!commandPaletteOpen) return null;

  const items = allItems();

  return (
    <div className={styles.overlay} onClick={handleBackdropClick}>
      <div className={styles.panel} role="dialog" aria-label="Command palette">
        {/* Search input */}
        <div className={styles.searchBar}>
          <Search size={18} strokeWidth={1.5} className={styles.searchIcon} />
          <input
            ref={inputRef}
            type="text"
            className={styles.searchInput}
            placeholder="Search conversations or commands..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="Search"
          />
          <button
            className={styles.closeButton}
            onClick={closeCommandPalette}
            aria-label="Close"
          >
            <X size={16} strokeWidth={1.5} />
          </button>
        </div>

        {/* Results */}
        <div className={styles.results} ref={listRef}>
          {filteredSections().map((section) => (
            <div key={section.title} className={styles.section}>
              <div className={styles.sectionTitle}>{section.title}</div>
              {section.items.map((item, index) => {
                const globalIndex =
                  filteredSections().slice(0, filteredSections().indexOf(section)).reduce(
                    (sum, s) => sum + s.items.length,
                    0
                  ) + index;
                const isSelected = globalIndex === selectedIndex;

                return (
                  <button
                    key={item.id}
                    className={`${styles.item} ${isSelected ? styles.active : ''}`}
                    onClick={item.action}
                    onMouseEnter={() => setSelectedIndex(globalIndex)}
                    aria-selected={isSelected}
                  >
                    <span className={styles.itemIcon}>{item.icon}</span>
                    <span className={styles.itemLabel}>{item.label}</span>
                    {item.description && (
                      <span className={styles.itemDescription}>
                        {item.description}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}

          {filteredSections().every((s) => s.items.length === 0) && (
            <div className={styles.empty}>No results found</div>
          )}
        </div>

        {/* Footer hint */}
        <div className={styles.footer}>
          <span className={styles.hint}>
            <kbd>↑</kbd><kbd>↓</kbd> to navigate
          </span>
          <span className={styles.hint}>
            <kbd>↵</kbd> to select
          </span>
          <span className={styles.hint}>
            <kbd>esc</kbd> to close
          </span>
        </div>
      </div>
    </div>
  );
}
