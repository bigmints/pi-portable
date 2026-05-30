'use client';

import { Settings } from 'lucide-react';
import { useNotificationSettingsStore } from '@/store/notification-settings';
import { ToggleSwitch } from './ToggleSwitch';
import styles from './NotificationSettingsView.module.css';

export default function NotificationSettingsView() {
  const { settings, updateSettings, resetSettings, toggleChannel } = useNotificationSettingsStore();

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <Settings size={20} />
        <h2>Notifications</h2>
      </div>

      <div className={styles.toggleRow}>
        <ToggleSwitch
          checked={settings.enabled}
          onChange={(v) => updateSettings({ enabled: v })}
          label="Enable notifications"
        />
      </div>

      <div className={styles.toggleRow}>
        <ToggleSwitch
          checked={settings.sound}
          onChange={(v) => updateSettings({ sound: v })}
          label="Sound alerts"
        />
      </div>

      <div className={styles.toggleRow}>
        <ToggleSwitch
          checked={settings.desktop}
          onChange={(v) => updateSettings({ desktop: v })}
          label="Desktop notifications"
        />
      </div>

      <div className={styles.toggleRow}>
        <ToggleSwitch
          checked={settings.email}
          onChange={(v) => updateSettings({ email: v })}
          label="Email notifications"
        />
      </div>

      <div className={styles.frequencyGroup}>
        <label>Frequency</label>
        <div className={styles.radioGroup}>
          {(['instant', 'batched', 'digest'] as const).map((freq) => (
            <label key={freq} className={styles.radioLabel}>
              <input
                type="radio"
                name="frequency"
                checked={settings.frequency === freq}
                onChange={() => updateSettings({ frequency: freq })}
              />
              {freq === 'instant' ? 'Instant' : freq === 'batched' ? 'Batched' : 'Daily digest'}
            </label>
          ))}
        </div>
      </div>

      <div className={styles.quietHours}>
        <ToggleSwitch
          checked={settings.quietHours.enabled}
          onChange={(v) => updateSettings({ quietHours: { ...settings.quietHours, enabled: v } })}
          label="Quiet hours"
        />
        {settings.quietHours.enabled && (
          <div className={styles.timePickers}>
            <input
              type="time"
              value={settings.quietHours.start}
              onChange={(e) => updateSettings({ quietHours: { ...settings.quietHours, start: e.target.value } })}
            />
            <span>to</span>
            <input
              type="time"
              value={settings.quietHours.end}
              onChange={(e) => updateSettings({ quietHours: { ...settings.quietHours, end: e.target.value } })}
            />
          </div>
        )}
      </div>

      <div className={styles.channelGrid}>
        {Object.entries(settings.channels).map(([key, value]) => (
          <ToggleSwitch
            key={key}
            checked={value}
            onChange={() => toggleChannel(key as keyof typeof settings.channels)}
            label={key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}
          />
        ))}
      </div>

      <button className={styles.resetButton} onClick={resetSettings}>
        Reset to defaults
      </button>
    </section>
  );
}
