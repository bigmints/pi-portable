'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, MessageSquare } from 'lucide-react';
import { useConversationsStore } from '@/store/conversations';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import SwipeToDelete from '@/components/gestures/SwipeToDelete';
import PullToRefreshIndicator from '@/components/gestures/PullToRefreshIndicator';
import type { Conversation } from '@/types/chat';
import styles from './ConversationList.module.css';

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
}

function ConversationItem({
  conversation,
  isSelected,
  onSelect,
}: ConversationItemProps) {
  return (
    <div className={styles.itemWrapper}>
      <button
        className={`${styles.item} ${isSelected ? styles.selected : ''}`}
        onClick={() => onSelect(conversation.id)}
      >
        <div className={styles.itemContent}>
          <div className={styles.itemHeader}>
            <MessageSquare size={14} strokeWidth={1.5} className={styles.itemIcon} />
            <span className={styles.itemTitle}>
              {truncate(conversation.title, 50)}
            </span>
          </div>
          <div className={styles.itemPreview}>
            {truncate(conversation.lastMessagePreview, 50)}
          </div>
        </div>
        <span className={styles.itemTime}>
          {formatRelativeTime(conversation.lastMessageAt)}
        </span>
      </button>
    </div>
  );
}

export default function ConversationList() {
  const router = useRouter();
  const {
    conversations,
    selectedId,
    selectConversation,
    deleteConversation,
    clearSelection,
    refetchConversations,
  } = useConversationsStore();

  // Pull-to-refresh integration
  const { pullProgress, isRefreshing, setRefreshing, setScrollElementRef } = usePullToRefresh({
    threshold: 64,
    onRelease: async () => {
      setRefreshing(true);
      await refetchConversations();
      setRefreshing(false);
    },
    enabled: true,
  });

  // Sync scroll element ref for pull-to-refresh
  const handleListRef = useCallback(
    (el: HTMLDivElement | null) => {
      setScrollElementRef(el);
    },
    [setScrollElementRef],
  );

  const handleSelectConversation = useCallback(
    (id: string) => {
      selectConversation(id);
      router.push(`/chat/${id}`);
    },
    [selectConversation, router],
  );

  const handleDeleteConversation = useCallback(
    (id: string) => {
      deleteConversation(id);
    },
    [deleteConversation],
  );

  const handleNewChat = useCallback(() => {
    clearSelection();
    router.push('/chat');
  }, [clearSelection, router]);

  // Group conversations
  const grouped = useConversationsStore.getState().getGrouped();

  const renderGroup = useCallback(
    (label: string, items: Conversation[]) => {
      if (items.length === 0) return null;
      return (
        <div key={label} className={styles.group}>
          <div className={styles.groupLabel}>{label}</div>
          {items.map((conv) => (
            <SwipeToDelete
              key={conv.id}
              onDelete={() => handleDeleteConversation(conv.id)}
              deleteLabel="Delete"
            >
              <ConversationItem
                conversation={conv}
                isSelected={conv.id === selectedId}
                onSelect={handleSelectConversation}
              />
            </SwipeToDelete>
          ))}
        </div>
      );
    },
    [selectedId, handleSelectConversation, handleDeleteConversation],
  );

  const hasConversations = conversations.length > 0;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.newChatButton} onClick={handleNewChat}>
          <Plus size={16} strokeWidth={1.5} />
          New Chat
        </button>
      </div>

      <div className={styles.list} ref={handleListRef}>
        {/* Pull-to-refresh indicator */}
        <PullToRefreshIndicator progress={pullProgress} isRefreshing={isRefreshing} />

        {hasConversations ? (
          <>
            {renderGroup('Pinned', grouped.pinned)}
            {renderGroup('Today', grouped.today)}
            {renderGroup('Yesterday', grouped.yesterday)}
            {renderGroup('This Week', grouped.thisWeek)}
            {renderGroup('Older', grouped.older)}
          </>
        ) : (
          <div className={styles.emptyState}>
            <MessageSquare size={48} strokeWidth={1} className={styles.emptyIcon} />
            <h3 className={styles.emptyTitle}>No conversations yet</h3>
            <p className={styles.emptyDescription}>
              Start a new conversation to begin chatting.
            </p>
            <button className={styles.emptyCta} onClick={handleNewChat}>
              Start a conversation
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
