'use client';

import React, { useEffect } from 'react';
import { useSettingsStore } from '@/store/settings';

export default function ThemeProvider() {
  const theme = useSettingsStore((s) => s.theme);

  useEffect(() => {
    requestAnimationFrame(() => {
      const root = document.documentElement;
      if (theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        root.setAttribute('data-theme', systemTheme);
        
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e: MediaQueryListEvent) => {
          if (useSettingsStore.getState().theme === 'system') {
            root.setAttribute('data-theme', e.matches ? 'dark' : 'light');
          }
        };
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
      } else {
        root.setAttribute('data-theme', theme);
      }
    });
  }, [theme]);

  return null;
}
