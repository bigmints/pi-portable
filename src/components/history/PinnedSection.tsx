'use client';

import type { Conversation } from '@/types/chat';
import ConversationEntry from './ConversationEntry';
import styles from './PinnedSection.module.css';

interface PinnedSectionProps {
  conversations: Conversation[];
}

export default function PinnedSection({ conversations }: PinnedSectionProps) {
  if (conversations.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionIcon}>📌</span>
        <span className={styles.sectionLabel}>Pinned</span>
      </div>
      <div className={styles.sectionList}>
        {conversations.map((conv) => (
          <ConversationEntry key={conv.id} conversation={conv} />
        ))}
      </div>
    </section>
  );
}
