'use client';

import React from 'react';
import { Settings as SettingsIcon, RotateCcw } from 'lucide-react';
import { useNotificationSettingsStore } from '@/store/notification-settings';
import ToggleSwitch from './ToggleSwitch';
import styles from './NotificationSettingsView.module.css';

export default function NotificationSettingsView() {
  const { settings, updateSettings, resetSettings, toggleChannel } = useNotificationSettingsStore();

  const handleToggleEnabled = (checked: boolean) => {
    updateSettings({ enabled: checked });
  };

  const handleToggleSound = (checked: boolean) => {
    updateSettings({ sound: checked });
  };

  const handleToggleDesktop = (checked: boolean) => {
    updateSettings({ desktop: checked });
  };

  const handleToggleEmail = (checked: boolean) => {
    updateSettings({ email: checked });
  };

  const handleFrequencyChange = (frequency: 'instant' | 'batched' | 'digest') => {
    updateSettings({ frequency });
  };

  const handleToggleQuietHours = (checked: boolean) => {
    updateSettings({ quietHours: { ...settings.quietHours, enabled: checked } });
  };

  const handleQuietHoursStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({ quietHours: { ...settings.quietHours, start: e.target.value } });
  };

  const handleQuietHoursEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({ quietHours: { ...settings.quietHours, end: e.target.value } });
  };

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <SettingsIcon className={styles.sectionIcon} size={18} strokeWidth={1.5} />
        <h2 className={styles.sectionTitle}>Notifications (Advanced)</h2>
      </div>

      <div className={styles.sectionBody}>
        {/* Enable Notifications */}
        <div className={styles.toggleRow}>
          <div className={styles.settingInfo}>
            <span className={styles.settingLabel}>Enable Notifications</span>
            <span className={styles.settingDescription}>Master switch for all notifications</span>
          </div>
          <ToggleSwitch
            checked={settings.enabled}
            onChange={handleToggleEnabled}
            label="Enable all notifications"
          />
        </div>

        {/* Dependent Settings */}
        <div className={`${styles.dependentSettings} ${!settings.enabled ? styles.disabled : ''}`}>
          {/* Sound, Desktop, Email toggles */}
          <div className={styles.toggleRow}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>Sound Alerts</span>
              <span className={styles.settingDescription}>Play a sound when notifications arrive</span>
            </div>
            <ToggleSwitch
              checked={settings.sound && settings.enabled}
              onChange={handleToggleSound}
              disabled={!settings.enabled}
              label="Sound alerts"
            />
          </div>

          <div className={styles.toggleRow}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>Desktop Notifications</span>
              <span className={styles.settingDescription}>Show system notification banners</span>
            </div>
            <ToggleSwitch
              checked={settings.desktop && settings.enabled}
              onChange={handleToggleDesktop}
              disabled={!settings.enabled}
              label="Desktop notifications"
            />
          </div>

          <div className={styles.toggleRow}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>Email Notifications</span>
              <span className={styles.settingDescription}>Receive periodic summaries via email</span>
            </div>
            <ToggleSwitch
              checked={settings.email && settings.enabled}
              onChange={handleToggleEmail}
              disabled={!settings.enabled}
              label="Email notifications"
            />
          </div>

          {/* Frequency Selector */}
          <div className={styles.frequencySection}>
            <span className={styles.settingLabel}>Delivery Frequency</span>
            <span className={styles.settingDescription}>Choose how often you want to receive notification updates</span>
            <div className={styles.frequencyGroup}>
              {(['instant', 'batched', 'digest'] as const).map((freq) => (
                <label
                  key={freq}
                  className={`${styles.frequencyLabel} ${
                    settings.frequency === freq ? styles.activeFrequency : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="frequency"
                    value={freq}
                    checked={settings.frequency === freq}
                    disabled={!settings.enabled}
                    onChange={() => handleFrequencyChange(freq)}
                    className={styles.radioInput}
                  />
                  <span className={styles.frequencyText}>
                    {freq === 'instant'
                      ? 'Instant'
                      : freq === 'batched'
                      ? 'Batched'
                      : 'Daily Digest'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Quiet Hours */}
          <div className={styles.quietHoursSection}>
            <div className={styles.toggleRow}>
              <div className={styles.settingInfo}>
                <span className={styles.settingLabel}>Quiet Hours</span>
                <span className={styles.settingDescription}>Mute notifications during a specific time range</span>
              </div>
              <ToggleSwitch
                checked={settings.quietHours.enabled && settings.enabled}
                onChange={handleToggleQuietHours}
                disabled={!settings.enabled}
                label="Quiet hours toggle"
              />
            </div>

            {settings.quietHours.enabled && settings.enabled && (
              <div className={styles.quietHours}>
                <div className={styles.timePickerContainer}>
                  <label className={styles.timePickerLabel}>
                    Start
                    <input
                      type="time"
                      value={settings.quietHours.start}
                      onChange={handleQuietHoursStartChange}
                      disabled={!settings.enabled || !settings.quietHours.enabled}
                      className={styles.timeInput}
                    />
                  </label>
                  <label className={styles.timePickerLabel}>
                    End
                    <input
                      type="time"
                      value={settings.quietHours.end}
                      onChange={handleQuietHoursEndChange}
                      disabled={!settings.enabled || !settings.quietHours.enabled}
                      className={styles.timeInput}
                    />
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Channel Toggles */}
          <div className={styles.channelsSection}>
            <span className={styles.settingLabel}>Notification Channels</span>
            <span className={styles.settingDescription}>Configure settings for specific notification types</span>
            <div className={styles.channelGrid}>
              <div className={styles.channelItem}>
                <ToggleSwitch
                  checked={settings.channels.jobComplete && settings.enabled}
                  onChange={() => toggleChannel('jobComplete')}
                  disabled={!settings.enabled}
                  label="Job complete channel"
                />
                <span className={styles.channelLabel}>Job Complete</span>
              </div>
              <div className={styles.channelItem}>
                <ToggleSwitch
                  checked={settings.channels.jobError && settings.enabled}
                  onChange={() => toggleChannel('jobError')}
                  disabled={!settings.enabled}
                  label="Job error channel"
                />
                <span className={styles.channelLabel}>Job Error</span>
              </div>
              <div className={styles.channelItem}>
                <ToggleSwitch
                  checked={settings.channels.taskComplete && settings.enabled}
                  onChange={() => toggleChannel('taskComplete')}
                  disabled={!settings.enabled}
                  label="Task complete channel"
                />
                <span className={styles.channelLabel}>Task Complete</span>
              </div>
              <div className={styles.channelItem}>
                <ToggleSwitch
                  checked={settings.channels.taskFailed && settings.enabled}
                  onChange={() => toggleChannel('taskFailed')}
                  disabled={!settings.enabled}
                  label="Task failed channel"
                />
                <span className={styles.channelLabel}>Task Failed</span>
              </div>
              <div className={styles.channelItem}>
                <ToggleSwitch
                  checked={settings.channels.queueComplete && settings.enabled}
                  onChange={() => toggleChannel('queueComplete')}
                  disabled={!settings.enabled}
                  label="Queue complete channel"
                />
                <span className={styles.channelLabel}>Queue Complete</span>
              </div>
              <div className={styles.channelItem}>
                <ToggleSwitch
                  checked={settings.channels.messageResponse && settings.enabled}
                  onChange={() => toggleChannel('messageResponse')}
                  disabled={!settings.enabled}
                  label="Message response channel"
                />
                <span className={styles.channelLabel}>Message Response</span>
              </div>
            </div>
          </div>
        </div>

        {/* Reset Button */}
        <div className={styles.resetContainer}>
          <button
            type="button"
            className={styles.resetButton}
            onClick={resetSettings}
          >
            <RotateCcw size={14} strokeWidth={1.5} />
            Reset to Defaults
          </button>
        </div>
      </div>
    </div>
  );
}
