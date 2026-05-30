'use client';
import { useEffect, useState } from 'react';
import { usePushNotificationsStore } from '@/store/push-notifications';
import { subscribeUser, unsubscribeUser } from '@/lib/push-manager';
import styles from './PushPermissionBanner.module.css';

export function PushPermissionBanner() {
  const {
    permissionState,
    hasPrompted,
    setPermissionState,
    setSubscription,
    markPrompted,
    clearSubscription,
  } = usePushNotificationsStore();

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (permissionState === 'granted' || permissionState === 'denied' || hasPrompted) {
      setVisible(false);
    } else {
      setVisible(true);
    }
  }, [permissionState, hasPrompted]);

  if (!visible) return null;

  const handleEnable = async () => {
    try {
      const permission = await Notification.requestPermission();
      setPermissionState(permission);

      if (permission === 'granted') {
        const sub = await subscribeUser();
        setSubscription(sub);
        if (sub) {
          await fetch('/api/push/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sub),
          });
        }
      }
      markPrompted();
      setVisible(false);
    } catch {
      setPermissionState('denied');
      markPrompted();
      setVisible(false);
    }
  };

  const handleDismiss = () => {
    setPermissionState('prompted');
    markPrompted();
    setVisible(false);
  };

  return (
    <div className={styles.banner}>
      <div className={styles.icon}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      </div>
      <p className={styles.text}>Get notified when your jobs finish</p>
      <div className={styles.actions}>
        <button className={styles.btnEnable} onClick={handleEnable}>
          Enable
        </button>
        <button className={styles.btnDismiss} onClick={handleDismiss}>
          Dismiss
        </button>
      </div>
    </div>
  );
}
