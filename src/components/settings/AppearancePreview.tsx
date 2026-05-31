'use client';

import { useAppearanceStore } from '@/store/appearance';
import styles from './AppearancePreview.module.css';

export function AppearancePreview() {
  const { settings } = useAppearanceStore();
  return (
    <div className={styles.previewCard}>
      <h4 className={styles.previewTitle}>Preview</h4>
      <p className={styles.previewText}>
        This is sample text that reflects your current font size, theme, and density settings.
      </p>
      <pre className={styles.codeBlock}>
        <code>{`const greeting = "Hello, world!";\nconsole.log(greeting);`}</code>
      </pre>
    </div>
  );
}
