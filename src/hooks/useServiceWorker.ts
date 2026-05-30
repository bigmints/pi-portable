/**
 * useServiceWorker hook — Service Worker management
 */

import { useEffect, useState, useCallback } from 'react';

interface ServiceWorkerState {
  registered: boolean;
  updating: boolean;
  version: string | null;
  error: string | null;
}

export function useServiceWorker() {
  const [state, setState] = useState<ServiceWorkerState>({
    registered: false,
    updating: false,
    version: null,
    error: null,
  });

  const register = useCallback(async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });

        setState((prev) => ({
          ...prev,
          registered: true,
          version: registration.active?.scriptURL || null,
        }));

        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          setState((prev) => ({ ...prev, updating: true }));

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'activated') {
              setState((prev) => ({ ...prev, updating: false }));
            }
          });
        });

        return registration;
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Registration failed',
        }));
      }
    }
  }, []);

  useEffect(() => {
    register();
  }, [register]);

  const update = useCallback(async () => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      await registration.update();
    }
  }, []);

  return {
    ...state,
    register,
    update,
  };
}
