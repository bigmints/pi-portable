'use client';

import { useEffect, useState } from 'react';
import { usePwaStore } from '@/store/pwa';

export default function ServiceWorkerStatus() {
  const [swStatus, setSwStatus] = useState<{
    registered: boolean;
    version: string | null;
    updating: boolean;
  }>({
    registered: false,
    version: null,
    updating: false,
  });

  useEffect(() => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;

    navigator.serviceWorker.ready.then((registration) => {
      const sw = registration.active;
      setSwStatus({
        registered: true,
        version: sw ? 'active' : null,
        updating: false,
      });
    });

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      setSwStatus((prev) => ({ ...prev, registered: true }));
    });
  }, []);

  // Update store when service worker status changes
  useEffect(() => {
    if (swStatus.registered) {
      const current = usePwaStore.getState().capabilities;
      usePwaStore.getState().setCapabilities({
        ...current,
        offlineCapable: true,
      });
    }
  }, [swStatus.registered]);

  // Service worker status is used internally for debugging
  // No UI rendered — status is available via the store
  return null;
}
