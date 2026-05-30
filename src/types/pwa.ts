// ─── PWA Types ───────────────────────────────────────────────────────────────

export type PwaInstallStatus = 'available' | 'prompting' | 'installed' | 'not-supported';

export interface PwaInstallPrompt {
  prompt: Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface PwaCapabilities {
  installable: boolean;
  displayMode: DisplayMode | 'browser';
  offlineCapable: boolean;
  touchCapable: boolean;
}

export type DisplayMode = 'fullscreen' | 'standalone' | 'minimal-ui' | 'browser';

export interface MobileGesture {
  type: 'swipe-left' | 'swipe-right' | 'pull-down';
  action: string;
}

// ─── Notification Types ──────────────────────────────────────────────────────

export type NotificationPermission = 'default' | 'granted' | 'denied';

export interface PwaNotificationSettings {
  enabled: boolean;
  permission: NotificationPermission;
  jobCompletion: boolean;
  jobFailure: boolean;
  sound: boolean;
  desktop: boolean;
}

// ─── Service Worker Types ────────────────────────────────────────────────────

export interface ServiceWorkerStatus {
  registered: boolean;
  version: string | null;
  updating: boolean;
  message: string;
}

// ─── Background Sync Types ───────────────────────────────────────────────────

export interface SyncQueueItem {
  id: string;
  type: string;
  payload: unknown;
  timestamp: number;
  retryCount: number;
}
