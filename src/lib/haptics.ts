import { useSettingsStore } from '@/store/settings';

const HAPTIC_PATTERNS: Record<string, number | number[]> = {
  messageSend: 10,
  tabSwitch: 10,
  jobComplete: [10, 30, 10],
  error: [50],
};

function isHapticsEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const stored = localStorage.getItem('pi-settings');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed?.notifications?.haptics !== undefined) {
        return parsed.notifications.haptics;
      }
    }
  } catch {
    // ignore
  }
  return true; // default enabled
}

export function triggerHaptic(event: 'messageSend' | 'tabSwitch' | 'jobComplete' | 'error'): void {
  if (typeof navigator === 'undefined' || !navigator.vibrate) return;
  if (!isHapticsEnabled()) return;
  const pattern = HAPTIC_PATTERNS[event];
  if (pattern !== undefined) {
    navigator.vibrate(pattern);
  }
}
