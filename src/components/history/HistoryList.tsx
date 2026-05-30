'use client';

import { useEffect, useRef } from 'react';
import { useHistoryStore } from '@/store/history';
import PinnedSection from './PinnedSection';
import DayGroup from './DayGroup';
import HistorySkeleton from './HistorySkeleton';
import HistoryEmptyState from './HistoryEmptyState';
import styles from './HistoryList.module.css';

export default function HistoryList() {
  const {
    conversations,
    isLoading,
    pinnedIds,
    getPinnedConversations,
    getGroupedConversations,
  } = useHistoryStore();

  const sentinelRef = useRef<HTMLDivElement>(null);

  const pinned = getPinnedConversations();
  const groups = getGroupedConversations();
  const hasContent = conversations.length > 0;

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          // Trigger load more
          useHistoryStore.getState().loadMore();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  if (isLoading && conversations.length === 0) {
    return <HistorySkeleton />;
  }

  if (!hasContent) {
    return <HistoryEmptyState />;
  }

  return (
    <div className={styles.list}>
      <PinnedSection conversations={pinned} />
      {groups.map((group) => (
        <DayGroup key={group.key} group={group} />
      ))}
      <div ref={sentinelRef} className={styles.sentinel} />
    </div>
  );
}
