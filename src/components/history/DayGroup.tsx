'use client';

import type { HistoryGroup } from '@/store/history';
import ConversationEntry from './ConversationEntry';
import styles from './DayGroup.module.css';

interface DayGroupProps {
  group: HistoryGroup;
}

export default function DayGroup({ group }: DayGroupProps) {
  return (
    <section className={styles.group}>
      <div className={styles.groupHeader}>
        <span className={styles.groupLabel}>{group.label}</span>
        <span className={styles.groupCount}>{group.conversations.length}</span>
      </div>
      <div className={styles.groupList}>
        {group.conversations.map((conv) => (
          <ConversationEntry key={conv.id} conversation={conv} />
        ))}
      </div>
    </section>
  );
}
