'use client';

import { useEffect, useState } from 'react';
import { Save, RotateCcw, Check, AlertCircle } from 'lucide-react';
import { useCliConfigStore, ConfigField } from '@/store/cli-config';
import styles from './CliConfigSection.module.css';

export default function CliConfigSection() {
  const { fields, loading, error, fetchConfig, updateField, saveConfig, resetChanges } = useCliConfigStore();
  const [saved, setSaved] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => { fetchConfig(); }, [fetchConfig]);

  const handleUpdate = (key: string, value: string) => {
    updateField(key, value);
    setHasChanges(true);
    setSaved(false);
  };

  const handleSave = async () => {
    const ok = await saveConfig();
    if (ok) { setSaved(true); setHasChanges(false); setTimeout(() => setSaved(false), 2000); }
  };

  const handleReset = () => { resetChanges(); setHasChanges(false); setSaved(false); };

  const renderField = (field: ConfigField) => {
    if (field.type === 'toggle') {
      return (
        <div key={field.key} className={styles.field}>
          <div className={styles.fieldHeader}>
            <label className={styles.label}>{field.label}</label>
            <span className={styles.description}>{field.description}</span>
          </div>
          <button className={styles.toggle + (field.value === 'true' ? ' ' + styles.on : '')} onClick={() => handleUpdate(field.key, field.value === 'true' ? 'false' : 'true')} role="switch" aria-checked={field.value === 'true'}>
            <span className={styles.toggleKnob} />
          </button>
        </div>
      );
    }
    return (
      <div key={field.key} className={styles.field}>
        <div className={styles.fieldHeader}>
          <label className={styles.label}>{field.label}</label>
          <span className={styles.description}>{field.description}</span>
        </div>
        <input type={field.type === 'number' ? 'number' : 'text'} className={styles.input} value={field.value} onChange={e => handleUpdate(field.key, e.target.value)} step={field.type === 'number' ? '0.1' : undefined} />
      </div>
    );
  };

  if (loading) return <div className={styles.loading}>Loading config...</div>;
  if (error) return <div className={styles.error}><AlertCircle size={16} /> <span>{error}</span></div>;

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <h2>CLI Configuration</h2>
        <div className={styles.actions}>
          <button className={styles.resetBtn} onClick={handleReset} disabled={!hasChanges}><RotateCcw size={14} /> Reset</button>
          <button className={styles.saveBtn} onClick={handleSave} disabled={!hasChanges}>{saved ? <Check size={14} /> : <Save size={14} />} {saved ? 'Saved!' : 'Save'}</button>
        </div>
      </div>
      <div className={styles.fields}>{fields.map(renderField)}</div>
    </div>
  );
}
