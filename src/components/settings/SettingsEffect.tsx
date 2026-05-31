'use client';

import { useEffect } from 'react';
import { useSettingsStore } from '@/store/settings';

export const SettingsEffect = () => {
  const theme = useSettingsStore((state) => state.theme);

  useEffect(() => {
    const applyTheme = () => {
      document.documentElement.setAttribute('data-theme', theme);
    };

    requestAnimationFrame(applyTheme);
  }, [theme]);

  return null;
};
