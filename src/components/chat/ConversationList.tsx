'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, MessageSquare, Trash2, Download, Edit, Pin } from 'lucide-react';
import { useConversationsStore } from '@/store/conversations';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { SwipeToDelete, PullToRefreshIndicator } from '@/components/gestures';
import type { Conversation, ConversationGroup } from '@/types/chat';
import styles from './ConversationList.module.css';

const GROUP_LABELS: Record<ConversationGroup, string> = {
  pinned: 'Pinned',
  today: 'Today',
  yesterday: 'Yesterday',
  thisWeek: 'This Week',
  older: 'Older',
};

function formatRelativeTime(timestamp: number): string {
  const diffMs = Date.now() - timestamp;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function truncate(text: string, max: number): string {
  return text.length > max ? text.slice(0, max) + '\u2026' : text;
}

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onSelect: (_id: string) => void;
  onDelete: (_id: string) => void;
  onTogglePin: (_conv: Conversation) => void;
  onExport: (_id: string) => void;
}

function ConversationItem({
  conversation,
  isSelected,
  onSelect,
  onDelete,
  onTogglePin,
  onExport,
}: ConversationItemProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handlePointerDown = useCallback(() => {
    longPressTimer.current = setTimeout(() => {
      setMenuOpen(true);
    }, 500);
  }, []);

  const handlePointerUp = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  return (
    <div className={styles.itemWrapper}>
      <button
        className={`${styles.item} ${isSelected ? styles.selected : ''}`}
        onClick={() => onSelect(conversation.id)}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <div className={styles.itemContent}>
          <div className={styles.itemHeader}>
            <MessageSquare size={14} strokeWidth={1.5} className={styles.itemIcon} />
            <span className={styles.itemTitle}>{truncate(conversation.title, 28)}</span>
          </div>
          <div className={styles.itemPreview}>
            {truncate(conversation.lastMessagePreview, 40)}
          </div>
        </div>
        <span className={styles.itemTime}>
          {formatRelativeTime(conversation.lastMessageAt)}
        </span>
      </button>
      {menuOpen && (
        <>
          <div className={styles.overlay} onClick={() => setMenuOpen(false)} />
          <div className={styles.contextMenu}>
            <button
              className={styles.contextMenuItem}
              onClick={() => {
                onTogglePin(conversation);
                setMenuOpen(false);
              }}
            >
              <Pin size={14} strokeWidth={1.5} />
              {conversation.isPinned ? 'Unpin' : 'Pin'}
            </button>
            <button className={styles.contextMenuItem} onClick={() => setMenuOpen(false)}>
              <Edit size={14} strokeWidth={1.5} />
              Rename
            </button>
            <button
              className={styles.contextMenuItem}
              onClick={() => {
                onExport(conversation.id);
                setMenuOpen(false);
              }}
            >
              <Download size={14} strokeWidth={1.5} />
              Export
            </button>
            <button
              className={`${styles.contextMenuItem} ${styles.contextMenuDelete}`}
              onClick={() => {
                onDelete(conversation.id);
                setMenuOpen(false);
              }}
            >
              <Trash2 size={14} strokeWidth={1.5} />
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function ConversationList() {
  const router = useRouter();
  const { conversations, selectedId, selectConversation, removeConversation, updateConversation, clearSelection, setConversations } =
    useConversationsStore();
  const { getGrouped } = useConversationsStore.getState();
  const grouped = getGrouped();

  // Pull-to-refresh integration
  const { pullProgress, isRefreshing, setRefreshing, setScrollElementRef } = usePullToRefresh({
    threshold: 64,
    onRelease: async () => {
      setRefreshing(true);
      // Simulate a brief refresh delay
      await new Promise((r) => setTimeout(r, 600));
      // Re-read conversations from store (in production, fetch from API)
      setConversations(conversations);
      setRefreshing(false);
    },
    enabled: true,
  });

  const handleNewChat = useCallback(() => {
    clearSelection();
    router.push('/chat');
  }, [clearSelection, router]);

  const handleDelete = useCallback(
    (id: string) => {
      removeConversation(id);
    },
    [removeConversation]
  );

  const handleTogglePin = useCallback(
    (conv: Conversation) => {
      updateConversation(conv.id, { isPinned: !conv.isPinned });
    },
    [updateConversation]
  );

  const handleExport = useCallback(
    (id: string) => {
      const conv = conversations.find((c) => c.id === id);
      if (!conv) return;
      const blob = new Blob([JSON.stringify(conv, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${conv.title}.json`;
      a.click();
      URL.revokeObjectURL(url);
    },
    [conversations]
  );

  const renderGroup = useCallback(
    (label: string, items: Conversation[]) => {
      if (items.length === 0) return null;
      return (
        <div key={label} className={styles.group}>
          <div className={styles.groupLabel}>{label}</div>
          {items.map((conv) => (
            <SwipeToDelete
              key={conv.id}
              onDelete={() => handleDelete(conv.id)}
              deleteLabel="Delete"
            >
              <ConversationItem
                conversation={conv}
                isSelected={conv.id === selectedId}
                onSelect={selectConversation}
                onDelete={handleDelete}
                onTogglePin={handleTogglePin}
                onExport={handleExport}
              />
            </SwipeToDelete>
          ))}
        </div>
      );
    },
    [selectedId, selectConversation, handleDelete, handleTogglePin, handleExport]
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.newChatButton} onClick={handleNewChat}>
          <Plus size={16} strokeWidth={1.5} />
          New Chat
        </button>
      </div>
      <div className={styles.list}>
        {renderGroup(GROUP_LABELS.pinned, grouped.pinned)}
        {renderGroup(GROUP_LABELS.today, grouped.today)}
        {renderGroup(GROUP_LABELS.yesterday, grouped.yesterday)}
        {renderGroup(GROUP_LABELS.thisWeek, grouped.thisWeek)}
        {renderGroup(GROUP_LABELS.older, grouped.older)}
      </div>
    </div>
  );
}
