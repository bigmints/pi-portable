'use client';

import { useRouter } from 'next/navigation';
import { MessageSquare, ArrowRight } from 'lucide-react';
import styles from './HistoryEmptyState.module.css';

export default function HistoryEmptyState() {
  const router = useRouter();

  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyIcon}>
        <MessageSquare size={48} strokeWidth={1} className={styles.icon} />
      </div>
      <h3 className={styles.emptyTitle}>No conversations yet</h3>
      <p className={styles.emptyText}>
        Start a new chat to build your conversation history.
      </p>
      <button className={styles.emptyCta} onClick={() => router.push('/chat')}>
        Start chatting
        <ArrowRight size={16} strokeWidth={1.5} />
      </button>
    </div>
  );
}
