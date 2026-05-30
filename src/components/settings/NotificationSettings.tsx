"use client";

import { useNotificationSettingsStore, NotificationPreferences } from '@/store/notification-settings';
import { Bell, Moon, Volume2, BadgePercent, Settings, RotateCcw } from 'lucide-react';
import styles from './NotificationSettings.module.css';

interface ToggleRowProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}

function ToggleRow({ icon, label, description, checked, onChange }: ToggleRowProps) {
  return (
    <label className={styles.toggleRow}>
      <div className={styles.toggleLeft}>
        <span className={styles.toggleIcon}>{icon}</span>
        <div>
          <span className={styles.toggleLabel}>{label}</span>
          <span className={styles.toggleDesc}>{description}</span>
        </div>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        className={styles.toggleButton}
        onClick={onChange}
      >
        <span className={styles.toggleKnob} style={{ transform: checked ? 'translateX(20px)' : 'translateX(0)' }} />
      </button>
    </label>
  );
}

export default function NotificationSettings() {
  const { preferences, setPreference, resetToDefaults } = useNotificationSettingsStore();

  const toggle = (key: keyof NotificationPreferences) => () =>
    setPreference(key, !preferences[key]);

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <Bell size={20} />
        <h2>Notification Settings</h2>
      </div>

      <div className={styles.group}>
        <h3>General</h3>
        <ToggleRow
          icon={<Volume2 size={16} />}
          label="Sound"
          description="Play sound for notifications"
          checked={preferences.soundEnabled}
          onChange={toggle('soundEnabled')}
        />
        <ToggleRow
          icon={<Bell size={16} />}
          label="Desktop notifications"
          description="Show browser notification popups"
          checked={preferences.desktopNotifications}
          onChange={toggle('desktopNotifications')}
        />
        <ToggleRow
          icon={<BadgePercent size={16} />}
          label="Badge"
          description="Show unread count badge"
          checked={preferences.showBadge}
          onChange={toggle('showBadge')}
        />
      </div>

      <div className={styles.group}>
        <h3>Do Not Disturb</h3>
        <ToggleRow
          icon={<Moon size={16} />}
          label="Do Not Disturb"
          description={`Quiet hours: ${preferences.dndStartHour}:00 - ${preferences.dndEndHour}:00`}
          checked={preferences.doNotDisturb}
          onChange={toggle('doNotDisturb')}
        />
        {preferences.doNotDisturb && (
          <div className={styles.timePickers}>
            <label>
              From
              <input
                type="time"
                value={`${String(preferences.dndStartHour).padStart(2, '0')}:00`}
                onChange={(e) => setPreference('dndStartHour', parseInt(e.target.value.split(':')[0]))}
                className={styles.timeInput}
              />
            </label>
            <label>
              To
              <input
                type="time"
                value={`${String(preferences.dndEndHour).padStart(2, '0')}:00`}
                onChange={(e) => setPreference('dndEndHour', parseInt(e.target.value.split(':')[0]))}
                className={styles.timeInput}
              />
            </label>
          </div>
        )}
      </div>

      <div className={styles.group}>
        <h3>Notification Sources</h3>
        <ToggleRow
          icon={<Bell size={16} />}
          label="Job notifications"
          description="Notify when jobs complete or fail"
          checked={preferences.jobNotifications}
          onChange={toggle('jobNotifications')}
        />
        <ToggleRow
          icon={<Bell size={16} />}
          label="Queue notifications"
          description="Notify about task queue events"
          checked={preferences.queueNotifications}
          onChange={toggle('queueNotifications')}
        />
        <ToggleRow
          icon={<Bell size={16} />}
          label="Message notifications"
          description="Notify for new messages"
          checked={preferences.messageNotifications}
          onChange={toggle('messageNotifications')}
        />
      </div>

      <div className={styles.group}>
        <h3>Delivery</h3>
        <ToggleRow
          icon={<Bell size={16} />}
          label="Batch notifications"
          description="Group notifications instead of showing each individually"
          checked={preferences.batchNotifications}
          onChange={toggle('batchNotifications')}
        />
      </div>

      <button className={styles.resetButton} onClick={resetToDefaults}>
        <RotateCcw size={14} />
        Reset to defaults
      </button>
    </section>
  );
}
