'use client';

import { useCallback, useEffect, useRef } from 'react';
import {
  Bell,
  CheckCircle,
  AlertCircle,
  XCircle,
  ListChecks,
  MessageSquare,
  X,
  Trash2,
  CheckCheck,
  ChevronRight,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useNotificationsStore, type Notification } from '@/store/notifications';
import { formatRelativeTime } from '@/lib/relative-time';
import styles from './NotificationPanel.module.css';

const TYPE_ICONS: Record<Notification['type'], React.ComponentType<React.ComponentProps<typeof Bell>>> = {
  job_complete: CheckCircle,
  job_error: AlertCircle,
  task_complete: CheckCircle,
  task_failed: XCircle,
  queue_complete: ListChecks,
  system: Bell,
  message: MessageSquare,
};

interface NotificationPanelProps {
  open: boolean;
  onClose: () => void;
}

export function NotificationPanel({ open, onClose }: NotificationPanelProps) {
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    clearAll,
  } = useNotificationsStore();

  // Sort by timestamp descending (newest first)
  const sorted = [...notifications].sort((a, b) => b.timestamp - a.timestamp);

  const handleRowClick = useCallback(
    (notification: Notification) => {
      if (!notification.read) {
        markAsRead(notification.id);
      }
      onClose();
      if (notification.link) {
        router.push(notification.link);
      }
    },
    [markAsRead, onClose, router],
  );

  const handleMarkAllRead = useCallback(() => {
    markAllAsRead();
  }, [markAllAsRead]);

  const handleClearAll = useCallback(() => {
    if (window.confirm('Clear all notifications? This cannot be undone.')) {
      clearAll();
    }
  }, [clearAll]);

  // Focus trap & escape key
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  // Prevent body scroll when panel is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div className={styles.backdrop} onClick={onClose} aria-hidden />

      {/* Panel */}
      <div
        className={styles.panel}
        ref={panelRef}
        role="dialog"
        aria-label="Notifications"
      >
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>Notifications</h2>
          <div className={styles.headerActions}>
            {notifications.length > 0 && (
              <>
                <button
                  className={styles.headerBtn}
                  onClick={handleMarkAllRead}
                  aria-label="Mark all as read"
                >
                  <CheckCheck className={styles.headerBtnIcon} strokeWidth={1.5} />
                  <span className={styles.headerBtnText}>Mark all read</span>
                </button>
                <button
                  className={styles.headerBtn}
                  onClick={handleClearAll}
                  aria-label="Clear all notifications"
                >
                  <Trash2 className={styles.headerBtnIcon} strokeWidth={1.5} />
                  <span className={styles.headerBtnText}>Clear all</span>
                </button>
              </>
            )}
            <button
              className={styles.closeBtn}
              onClick={onClose}
              aria-label="Close notifications"
            >
              <X className={styles.closeIcon} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Notification list */}
        <div className={styles.list}>
          {sorted.length === 0 ? (
            <div className={styles.empty}>
              <Bell className={styles.emptyIcon} strokeWidth={1.5} />
              <p className={styles.emptyText}>No notifications yet</p>
              <p className={styles.emptySubtext}>
                When jobs complete or errors occur, you&apos;ll see them here.
              </p>
            </div>
          ) : (
            sorted.map((notification) => {
              const IconComponent = TYPE_ICONS[notification.type] || Bell;
              return (
                <div
                  key={notification.id}
                  className={`${styles.row} ${!notification.read ? styles.unreadRow : ''}`}
                  onClick={() => handleRowClick(notification)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleRowClick(notification);
                    }
                  }}
                >
                  {/* Unread dot */}
                  {!notification.read && (
                    <span className={styles.unreadDot} aria-label="Unread" />
                  )}

                  {/* Type icon */}
                  <div className={styles.rowIcon}>
                    <IconComponent className={styles.rowIconSvg} strokeWidth={1.5} />
                  </div>

                  {/* Content */}
                  <div className={styles.rowContent}>
                    <div className={styles.rowHeader}>
                      <span className={styles.rowTitle}>{notification.title}</span>
                      <span className={styles.rowTime}>
                        {formatRelativeTime(notification.timestamp)}
                      </span>
                    </div>
                    <p className={styles.rowBody}>{notification.body}</p>
                    {notification.link && notification.linkLabel && (
                      <button
                        className={styles.rowLink}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!notification.read) {
                            markAsRead(notification.id);
                          }
                          router.push(notification.link ?? '/');
                        }}
                      >
                        {notification.linkLabel}
                        <ChevronRight className={styles.rowLinkIcon} strokeWidth={1.5} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
