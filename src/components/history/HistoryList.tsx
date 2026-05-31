'use client';

import { useConversationsStore } from '@/store/conversations';
import PinnedSection from './PinnedSection';
import DayGroup from './DayGroup';
import HistoryEmptyState from './HistoryEmptyState';
import styles from './HistoryList.module.css';

export default function HistoryList() {
  const { conversations, getGrouped } = useConversationsStore();

  const grouped = getGrouped();
  const pinned = grouped.pinned;
  const hasContent = conversations.length > 0;

  const groups = [
    { label: 'Today', key: 'today', conversations: grouped.today },
    { label: 'Yesterday', key: 'yesterday', conversations: grouped.yesterday },
    { label: 'This Week', key: 'thisWeek', conversations: grouped.thisWeek },
    { label: 'Older', key: 'older', conversations: grouped.older },
  ].filter((g) => g.conversations.length > 0);

  if (!hasContent) {
    return <HistoryEmptyState />;
  }

  return (
    <div className={styles.list}>
      <PinnedSection conversations={pinned} />
      {groups.map((group) => (
        <DayGroup key={group.key} group={group} />
      ))}
    </div>
  );
}
