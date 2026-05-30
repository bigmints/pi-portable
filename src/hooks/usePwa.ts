'use client';

import { useEffect, useCallback, useState } from 'react';
import { usePwaStore } from '@/store/pwa';
import type { PwaInstallPrompt, PwaCapabilities } from '@/types/pwa';

// ─── BeforeInstallPromptEvent type ───────────────────────────────────────────

declare global {
  // eslint-disable-next-line no-unused-vars
  interface WindowEventMap {
    'beforeinstallprompt': BeforeInstallPromptEvent;
  }

  interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
  }
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function usePwa() {
  const {
    installStatus,
    capabilities,
    deferredPrompt,
    isOnline,
    setInstallStatus,
    setCapabilities,
    setDeferredPrompt,
    setIsOnline,
  } = usePwaStore();

  const [showInstallBanner, setShowInstallBanner] = useState(false);

  // Detect PWA capabilities
  useEffect(() => {
    const detectCapabilities = () => {
      const displayMode =
        (window.matchMedia('(display-mode: standalone)').matches && 'standalone') ||
        (window.matchMedia('(display-mode: fullscreen)').matches && 'fullscreen') ||
        (window.matchMedia('(display-mode: minimal-ui)').matches && 'minimal-ui') ||
        'browser';

      const touchCapable = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

      const caps: PwaCapabilities = {
        installable: installStatus === 'available' || installStatus === 'prompting',
        displayMode: displayMode as any,
        offlineCapable: 'serviceWorker' in navigator,
        touchCapable,
      };

      setCapabilities(caps);
    };

    detectCapabilities();

    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    mediaQuery.addEventListener('change', detectCapabilities);

    return () => {
      mediaQuery.removeEventListener('change', detectCapabilities);
    };
  }, [installStatus, setCapabilities]);

  // Listen for beforeinstallprompt event
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e as unknown as PwaInstallPrompt);
      setInstallStatus('available');
      setShowInstallBanner(true);
    };

    const handleAppInstalled = () => {
      setInstallStatus('installed');
      setDeferredPrompt(null);
      setShowInstallBanner(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as any);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as any);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [setDeferredPrompt, setInstallStatus]);

  // Detect if already installed (standalone mode)
  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstallStatus('installed');
    }
  }, [setInstallStatus]);

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setIsOnline]);

  // Install handler
  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;

    setInstallStatus('prompting');
    setShowInstallBanner(false);

    try {
      await (deferredPrompt as any).prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        setInstallStatus('installed');
      } else {
        setInstallStatus('available');
      }
    } catch {
      setInstallStatus('available');
    }

    setDeferredPrompt(null);
  }, [deferredPrompt, setInstallStatus, setDeferredPrompt]);

  const dismissBanner = useCallback(() => {
    setShowInstallBanner(false);
  }, []);

  return {
    installStatus,
    capabilities,
    isOnline,
    showInstallBanner,
    handleInstall,
    dismissBanner,
  };
}
