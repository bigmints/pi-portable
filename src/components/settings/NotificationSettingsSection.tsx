'use client';

import { useCallback, useState } from 'react';
import { Bell, Send } from 'lucide-react';
import { useNotificationSettingsStore } from '@/store/notification-settings';
import NotificationToggle from './NotificationToggle';
import styles from './NotificationSettingsSection.module.css';

export default function NotificationSettingsSection() {
  const { settings, toggleSetting } = useNotificationSettingsStore();
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);

  const handleTest = useCallback(async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/push/test', { method: 'POST' });
      const data = await res.json();
      setTestResult(data.success ? 'Test notification sent!' : data.error || 'Failed to send');
    } catch {
      setTestResult('Failed to send test notification');
    } finally {
      setTesting(false);
    }
  }, []);

  const settingsList: { key: keyof typeof settings; label: string; description: string }[] = [
    { key: 'jobComplete', label: 'Job Complete', description: 'When a job finishes successfully' },
    { key: 'jobError', label: 'Job Error', description: 'When a job fails or errors' },
    { key: 'taskComplete', label: 'Task Complete', description: 'When a task finishes' },
    { key: 'taskFailed', label: 'Task Failed', description: 'When a task fails' },
    { key: 'queueComplete', label: 'Queue Complete', description: 'When all queued jobs finish' },
    { key: 'soundEffects', label: 'Sound Effects', description: 'Play sounds for notifications' },
  ];

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <Bell size={20} className={styles.icon} />
        <h2 className={styles.title}>Notifications</h2>
      </div>
      <div className={styles.toggles}>
        {settingsList.map(({ key, label, description }) => (
          <NotificationToggle
            key={key}
            label={label}
            description={description}
            checked={settings[key]}
            onChange={() => toggleSetting(key)}
          />
        ))}
      </div>
      <div className={styles.testArea}>
        <button
          className={styles.testButton}
          onClick={handleTest}
          disabled={testing}
        >
          <Send size={14} />
          {testing ? 'Sending...' : 'Test Notification'}
        </button>
        {testResult && <span className={styles.result}>{testResult}</span>}
      </div>
    </div>
  );
}
