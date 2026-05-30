'use client';

import { ShortcutsReference } from './ShortcutsReference';
import styles from './ShortcutsSection.module.css';

export default function ShortcutsSection() {
  return (
    <div className={styles.section}>
      <h2 className={styles.title}>Keyboard Shortcuts</h2>
      <ShortcutsReference />
    </div>
  );
}
