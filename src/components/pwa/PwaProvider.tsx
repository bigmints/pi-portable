'use client';

import { useEffect } from 'react';
import { useServiceWorker } from '@/hooks/useServiceWorker';
import { usePwa } from '@/hooks/usePwa';
import InstallBanner from './InstallBanner';
import OfflineIndicator from './OfflineIndicator';
import ServiceWorkerStatus from './ServiceWorkerStatus';

interface PwaProviderProps {
  children: React.ReactNode;
}

export default function PwaProvider({ children }: PwaProviderProps) {
  useServiceWorker();
  const { showInstallBanner } = usePwa();

  // Register service worker for background sync
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;

    const registerSync = async () => {
      try {
        const registration = await navigator.serviceWorker.ready;
        // @ts-expect-error - sync API is not in TypeScript types yet
        if (registration.sync) {
          // @ts-expect-error - sync API is not in TypeScript types yet
          await registration.sync.register('sync-messages');
          // @ts-expect-error - sync API is not in TypeScript types yet
          await registration.sync.register('sync-settings');
        }
      } catch {
        // Background sync not supported — continue without it
      }
    };

    registerSync();
  }, []);

  return (
    <>
      <ServiceWorkerStatus />
      {showInstallBanner && (
        <div data-pwa-install-banner>
          <InstallBanner />
        </div>
      )}
      <OfflineIndicator />
      {children}
    </>
  );
}
