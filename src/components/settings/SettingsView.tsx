'use client';

import { useCallback, useState } from 'react';
import {
  Settings as SettingsIcon,
  Moon,
  Sun,
  Monitor,
  Bell,
  Globe,
  Shield,
  Trash2,
  MessageSquare,
  Info,
  RotateCcw,
  Monitor as MonitorIcon,
} from 'lucide-react';
import { useSettingsStore, type ThemeMode, type CodeTheme } from '@/store/settings';
import { usePushNotificationsStore } from '@/store/push-notifications';
import { subscribeUser, unsubscribeUser } from '@/lib/push-manager';
import AccountSettings from './AccountSettings';
import styles from './SettingsView.module.css';
import NotificationSettingsView from './NotificationSettingsView';

// ─── Code Theme Options ──────────────────────────────────────────────────────

const CODE_THEMES: { label: string; value: CodeTheme }[] = [
  { label: 'Vitesse Dark', value: 'vitesse-dark' },
  { label: 'GitHub Dark', value: 'github-dark' },
  { label: 'Monokai', value: 'monokai-sublime' },
  { label: 'One Dark', value: 'one-dark' },
  { label: 'Light', value: 'github' },
];

// ─── Toggle Switch ──────────────────────────────────────────────────────────────

interface ToggleProps {
  checked: boolean;
  onChange: () => void;
  label: string;
}

function Toggle({ checked, onChange, label }: ToggleProps) {
  return (
    <label className={styles.toggle} aria-label={label}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
      />
      <span className={styles.toggleSlider} />
    </label>
  );
}

// ─── Number Input ────────────────────────────────────────────────────────────

interface NumberInputProps {
  value: number;
  onChange: (_value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

function NumberInput({ value, onChange, min = 0, max = 1000, step = 1 }: NumberInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = parseInt(e.target.value, 10);
    if (!isNaN(num)) {
      onChange(Math.min(max, Math.max(min, num)));
    }
  };

  return (
    <div className={styles.numberInput}>
      <button
        type="button"
        className={styles.numberBtn}
        onClick={() => onChange(Math.max(min, value - step))}
        aria-label="Decrease"
      >
        −
      </button>
      <input
        type="number"
        value={value}
        onChange={handleChange}
        min={min}
        max={max}
        className={styles.numberValue}
      />
      <button
        type="button"
        className={styles.numberBtn}
        onClick={() => onChange(Math.min(max, value + step))}
        aria-label="Increase"
      >
        +
      </button>
    </div>
  );
}

// ─── Section Card ──────────────────────────────────────────────────────────────────

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

function Section({ title, icon, children }: SectionProps) {
  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionIcon}>{icon}</span>
        <h2 className={styles.sectionTitle}>{title}</h2>
      </div>
      <div className={styles.sectionBody}>{children}</div>
    </div>
  );
}

// ─── Setting Row ─────────────────────────────────────────────────────────────

interface SettingRowProps {
  label: string;
  description: string;
  control: React.ReactNode;
}

function SettingRow({ label, description, control }: SettingRowProps) {
  return (
    <div className={styles.settingRow}>
      <div className={styles.settingInfo}>
        <span className={styles.settingLabel}>{label}</span>
        <span className={styles.settingDescription}>{description}</span>
      </div>
      <div className={styles.settingControl}>{control}</div>
    </div>
  );
}

// ─── Reset Confirmation Modal ────────────────────────────────────────────────

interface ResetModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

function ResetModal({ onConfirm, onCancel }: ResetModalProps) {
  return (
    <div className={styles.modalOverlay} onClick={onCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.modalTitle}>Reset Settings</h3>
        <p className={styles.modalDescription}>
          This will restore all settings to their default values. Your conversations and data will not be affected.
        </p>
        <div className={styles.modalActions}>
          <button
            type="button"
            className={styles.modalCancel}
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className={styles.modalConfirm}
            onClick={onConfirm}
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function SettingsView() {
  const {
    settings,
    setTheme,
    setNotification,
    setConnection,
    setChat,
    setData,
    resetSettings,
    clearAllData,
  } = useSettingsStore();

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [savedToast, setSavedToast] = useState(false);

  const showSaved = useCallback(() => {
    setSavedToast(true);
    const timer = setTimeout(() => setSavedToast(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleClearData = useCallback(() => {
    if (confirm('Clear all local data? This will remove all conversations and settings. This cannot be undone.')) {
      clearAllData();
    }
  }, [clearAllData]);

  const handleResetSettings = useCallback(() => {
    resetSettings();
    setShowResetConfirm(false);
    showSaved();
  }, [resetSettings, showSaved]);

  const applyTheme = (theme: ThemeMode) => {
    setTheme(theme);
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <SettingsIcon size={24} strokeWidth={1.5} className={styles.headerIcon} />
        <h1 className={styles.headerTitle}>Settings</h1>
      </div>

      {/* Saved Toast */}
      {savedToast && (
        <div className={styles.toast}>
          <span>Saved</span>
        </div>
      )}

      {/* Appearance */}
      <Section title="Appearance" icon={<Monitor size={18} strokeWidth={1.5} />}>
        <SettingRow
          label="Theme"
          description="Choose your preferred color scheme"
          control={
            <div className={styles.themeSelector}>
              {(['dark', 'light', 'system'] as ThemeMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  className={`${styles.themeButton} ${settings.theme === mode ? styles.active : ''}`}
                  onClick={() => applyTheme(mode)}
                >
                  {mode === 'dark' ? <Moon size={14} strokeWidth={1.5} /> : mode === 'light' ? <Sun size={14} strokeWidth={1.5} /> : <MonitorIcon size={14} strokeWidth={1.5} />}
                  <span>{mode.charAt(0).toUpperCase() + mode.slice(1)}</span>
                </button>
              ))}
            </div>
          }
        />
      </Section>

      {/* Notifications */}
      <Section title="Notifications" icon={<Bell size={18} strokeWidth={1.5} />}>
        <SettingRow
          label="Job Completion"
          description="Get notified when jobs complete successfully"
          control={
            <Toggle
              checked={settings.notifications.jobCompletion}
              onChange={() => {
                setNotification('jobCompletion', !settings.notifications.jobCompletion);
                showSaved();
              }}
              label="Toggle job completion notifications"
            />
          }
        />
        <SettingRow
          label="Job Failure"
          description="Get notified when jobs fail"
          control={
            <Toggle
              checked={settings.notifications.jobFailure}
              onChange={() => {
                setNotification('jobFailure', !settings.notifications.jobFailure);
                showSaved();
              }}
              label="Toggle job failure notifications"
            />
          }
        />
        <SettingRow
          label="Sound"
          description="Play a sound for notifications"
          control={
            <Toggle
              checked={settings.notifications.sound}
              onChange={() => {
                setNotification('sound', !settings.notifications.sound);
                showSaved();
              }}
              label="Toggle notification sound"
            />
          }
        />
        <SettingRow
          label="Desktop Notifications"
          description="Show system notification badges"
          control={
            <Toggle
              checked={settings.notifications.desktop}
              onChange={() => {
                setNotification('desktop', !settings.notifications.desktop);
                showSaved();
              }}
              label="Toggle desktop notifications"
            />
          }
        />
        <SettingRow
          label="Haptic Feedback"
          description="Vibrate on actions like sending messages"
          control={
            <Toggle
              checked={settings.notifications.haptics}
              onChange={() => {
                setNotification('haptics', !settings.notifications.haptics);
                showSaved();
              }}
              label="Toggle haptic feedback"
            />
          }
        />
      </Section>

      {/* Connection */}
      <Section title="Connection" icon={<Globe size={18} strokeWidth={1.5} />}>
        <SettingRow
          label="Auto-connect"
          description="Automatically connect to the WebSocket server on load"
          control={
            <Toggle
              checked={settings.connection.autoConnect}
              onChange={() => {
                setConnection('autoConnect', !settings.connection.autoConnect);
                showSaved();
              }}
              label="Toggle auto-connect"
            />
          }
        />
        <SettingRow
          label="Reconnect Interval"
          description="Time between reconnection attempts (ms)"
          control={
            <NumberInput
              value={settings.connection.reconnectInterval}
              onChange={(value) => {
                setConnection('reconnectInterval', value);
                showSaved();
              }}
              min={1000}
              max={30000}
              step={500}
            />
          }
        />
        <SettingRow
          label="Max Reconnect Attempts"
          description="Number of reconnection attempts before giving up"
          control={
            <NumberInput
              value={settings.connection.maxReconnectAttempts}
              onChange={(value) => {
                setConnection('maxReconnectAttempts', value);
                showSaved();
              }}
              min={1}
              max={50}
              step={1}
            />
          }
        />
      </Section>

      {/* Chat */}
      <Section title="Chat" icon={<MessageSquare size={18} strokeWidth={1.5} />}>
        <SettingRow
          label="Font Size"
          description="Size of message text in pixels"
          control={
            <NumberInput
              value={settings.chat.fontSize}
              onChange={(value) => {
                setChat('fontSize', value);
                showSaved();
              }}
              min={10}
              max={24}
              step={1}
            />
          }
        />
        <SettingRow
          label="Code Block Theme"
          description="Color scheme for code blocks"
          control={
            <select
              className={styles.select}
              value={settings.chat.codeTheme}
              onChange={(e) => {
                setChat('codeTheme', e.target.value as CodeTheme);
                showSaved();
              }}
            >
              {CODE_THEMES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          }
        />
        <SettingRow
          label="Markdown Rendering"
          description="Render markdown formatting in responses"
          control={
            <Toggle
              checked={settings.chat.markdownEnabled}
              onChange={() => {
                setChat('markdownEnabled', !settings.chat.markdownEnabled);
                showSaved();
              }}
              label="Toggle markdown rendering"
            />
          }
        />
        <SettingRow
          label="Auto-scroll"
          description="Automatically scroll to new messages"
          control={
            <Toggle
              checked={settings.chat.autoScroll}
              onChange={() => {
                setChat('autoScroll', !settings.chat.autoScroll);
                showSaved();
              }}
              label="Toggle auto-scroll"
            />
          }
        />
      </Section>

      {/* Data */}
      <Section title="Data" icon={<Shield size={18} strokeWidth={1.5} />}>
        <SettingRow
          label="Auto-save"
          description="Automatically save conversations to local storage"
          control={
            <Toggle
              checked={settings.data.autoSave}
              onChange={() => {
                setData('autoSave', !settings.data.autoSave);
                showSaved();
              }}
              label="Toggle auto-save"
            />
          }
        />
        <SettingRow
          label="Max History"
          description="Maximum number of conversations to keep locally"
          control={
            <NumberInput
              value={settings.data.maxHistory}
              onChange={(value) => {
                setData('maxHistory', value);
                showSaved();
              }}
              min={10}
              max={500}
              step={10}
            />
          }
        />
        <div className={styles.dangerZone}>
          <div className={styles.dangerHeader}>
            <Trash2 size={16} strokeWidth={1.5} />
            <span>Danger Zone</span>
          </div>
          <p className={styles.dangerDescription}>
            Clearing data will remove all locally stored conversations and messages. This cannot be undone.
          </p>
          <button
            type="button"
            className={styles.dangerButton}
            onClick={handleClearData}
          >
            <Trash2 size={14} strokeWidth={1.5} />
            Clear All Data
          </button>
        </div>
      </Section>

      {/* Advanced Notifications */}
      <NotificationSettingsView />

      {/* Reset */}
      <div className={styles.resetSection}>
        <button
          type="button"
          className={styles.resetButton}
          onClick={() => setShowResetConfirm(true)}
        >
          <RotateCcw size={14} strokeWidth={1.5} />
          Reset All Settings
        </button>
      </div>

      {/* About */}
      <Section title="About" icon={<Info size={18} strokeWidth={1.5} />}>
        <div className={styles.aboutGrid}>
          <div className={styles.aboutItem}>
            <span className={styles.aboutLabel}>Version</span>
            <span className={styles.aboutValue}>1.0.0</span>
          </div>
          <div className={styles.aboutItem}>
            <span className={styles.aboutLabel}>Framework</span>
            <span className={styles.aboutValue}>Next.js 14</span>
          </div>
          <div className={styles.aboutItem}>
            <span className={styles.aboutLabel}>Runtime</span>
            <span className={styles.aboutValue}>Node.js</span>
          </div>
          <div className={styles.aboutItem}>
            <span className={styles.aboutLabel}>License</span>
            <span className={styles.aboutValue}>MIT</span>
          </div>
        </div>
      </Section>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <ResetModal
          onConfirm={handleResetSettings}
          onCancel={() => setShowResetConfirm(false)}
        />
      )}
    </div>
  );
}
