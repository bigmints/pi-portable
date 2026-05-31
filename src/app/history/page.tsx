'use client';

import HistoryList from '@/components/history/HistoryList';
import styles from './page.module.css';

export default function HistoryPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>History</h1>
        <p className={styles.description}>Your past pi conversations</p>
      </div>
      <div className={styles.content}>
        <HistoryList />
      </div>
    </div>
  );
}
