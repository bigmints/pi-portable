'use client';
import { Bell } from 'lucide-react';
import { useNotificationsStore } from '@/store/notifications';
import styles from './NotificationBell.module.css';

interface NotificationBellProps {
  onClick: () => void;
}

export function NotificationBell({ onClick }: NotificationBellProps) {
  const unreadCount = useNotificationsStore((s) => s.unreadCount());

  return (
    <button
      className={styles.bell}
      onClick={onClick}
      aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
    >
      <Bell className={styles.icon} strokeWidth={1.5} />
      {unreadCount > 0 && (
        <span className={styles.badge}>
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
}
