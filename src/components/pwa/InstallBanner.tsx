'use client';

import { Download, X } from 'lucide-react';
import styles from './InstallBanner.module.css';
import { usePwa } from '@/hooks/usePwa';

export default function InstallBanner() {
  const { showInstallBanner, handleInstall, dismissBanner } = usePwa();

  if (!showInstallBanner) return null;

  return (
    <div className={styles.banner}>
      <div className={styles.bannerContent}>
        <Download size={18} strokeWidth={1.5} className={styles.icon} />
        <span className={styles.text}>Install pi-app for a faster experience</span>
      </div>
      <div className={styles.actions}>
        <button
          className={styles.installButton}
          onClick={handleInstall}
          aria-label="Install app"
        >
          Install
        </button>
        <button
          className={styles.dismissButton}
          onClick={dismissBanner}
          aria-label="Dismiss"
        >
          <X size={16} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}
