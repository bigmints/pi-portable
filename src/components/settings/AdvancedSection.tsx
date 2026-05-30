'use client';

import { Trash2, RotateCcw, Bug, Download } from 'lucide-react';
import styles from './AdvancedSection.module.css';

export default function AdvancedSection() {
  const handleClearCache = () => { localStorage.clear(); alert('Cache cleared'); };
  const handleReset = () => { if (confirm('Reset all settings?')) { localStorage.clear(); alert('Settings reset'); } };
  const handleExport = () => { const data = JSON.stringify(localStorage, null, 2); const blob = new Blob([data], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'pi-settings.json'; a.click(); };

  return (
    <div className={styles.section}>
      <h2 className={styles.title}>Advanced</h2>
      <div className={styles.grid}>
        <button className={styles.card} onClick={handleClearCache}><Trash2 size={20} /><span>Clear Cache</span></button>
        <button className={styles.card} onClick={handleReset}><RotateCcw size={20} /><span>Reset Settings</span></button>
        <button className={styles.card} onClick={() => alert('Debug mode toggled')}><Bug size={20} /><span>Debug Mode</span></button>
        <button className={styles.card} onClick={handleExport}><Download size={20} /><span>Export Data</span></button>
      </div>
    </div>
  );
}
