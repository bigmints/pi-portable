'use client';

import { useRouter } from 'next/navigation';
import { Pin, PinOff, MessageSquare, Calendar } from 'lucide-react';
import type { Conversation } from '@/types/chat';
import { useHistoryStore } from '@/store/history';
import styles from './ConversationEntry.module.css';

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

interface ConversationEntryProps {
  conversation: Conversation;
}

export default function ConversationEntry({ conversation }: ConversationEntryProps) {
  const router = useRouter();
  const { pinnedIds, pinConversation, unpinConversation } = useHistoryStore();
  const isPinned = pinnedIds.includes(conversation.id);

  const handleTogglePin = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPinned) {
      unpinConversation(conversation.id);
    } else {
      pinConversation(conversation.id);
    }
  };

  const handleNavigate = () => {
    router.push(`/history/${conversation.id}`);
  };

  return (
    <div className={styles.entry} onClick={handleNavigate} role="button" tabIndex={0}>
      <div className={styles.entryContent}>
        <div className={styles.entryHeader}>
          <MessageSquare size={14} strokeWidth={1.5} className={styles.entryIcon} />
          <span className={styles.entryTitle}>{truncate(conversation.title, 28)}</span>
          {conversation.projectColor && (
            <span
              className={styles.colorBadge}
              style={{ backgroundColor: conversation.projectColor }}
            />
          )}
        </div>
        <div className={styles.entryPreview}>
          {truncate(conversation.lastMessagePreview, 40)}
        </div>
      </div>
      <div className={styles.entryMeta}>
        {conversation.model && (
          <span className={styles.modelTag}>{conversation.model}</span>
        )}
        <span className={styles.entryCount}>
          {conversation.messageCount} msg{conversation.messageCount !== 1 ? 's' : ''}
        </span>
        <div className={styles.entryTimeRow}>
          <Calendar size={10} strokeWidth={1.5} />
          <span>{formatRelativeTime(conversation.lastMessageAt)}</span>
        </div>
        <button
          className={`${styles.pinButton} ${isPinned ? styles.pinned : ''}`}
          onClick={handleTogglePin}
          aria-label={isPinned ? 'Unpin conversation' : 'Pin conversation'}
        >
          {isPinned ? <PinOff size={12} strokeWidth={1.5} /> : <Pin size={12} strokeWidth={1.5} />}
        </button>
      </div>
    </div>
  );
}
