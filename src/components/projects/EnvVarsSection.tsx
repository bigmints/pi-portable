'use client';

import { useCallback } from 'react';
import { Plus, X, Save } from 'lucide-react';
import { useProjectSettingsStore, type EnvVar } from '@/store/project-settings';
import { showToast } from '@/components/common/Toast';
import styles from './EnvVarsSection.module.css';

interface EnvVarsSectionProps {
  projectId: string;
}

export default function EnvVarsSection({ projectId }: EnvVarsSectionProps) {
  const { envVars, addEnvVar, removeEnvVar, updateEnvVar, clearUnsaved } = useProjectSettingsStore();
  const isSaving = false;

  const handleSave = useCallback(async () => {
    const record: Record<string, string> = {};
    for (const env of envVars) {
      if (env.key.trim()) {
        record[env.key.trim()] = env.value;
      }
    }
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ envVars: record }),
      });
      if (res.ok) {
        clearUnsaved();
        showToast('Environment variables saved', 'success');
      } else {
        showToast('Failed to save environment variables', 'error');
      }
    } catch {
      showToast('Failed to save environment variables', 'error');
    }
  }, [envVars, projectId, clearUnsaved]);

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <label className={styles.label}>Environment Variables</label>
        <div className={styles.headerActions}>
          <button
            className={styles.addButton}
            onClick={addEnvVar}
            aria-label="Add variable"
          >
            <Plus size={16} strokeWidth={1.5} />
            <span>Add Variable</span>
          </button>
          <button
            className={styles.saveButton}
            onClick={handleSave}
            disabled={isSaving}
            aria-label="Save variables"
          >
            <Save size={16} strokeWidth={1.5} />
            <span>Save</span>
          </button>
        </div>
      </div>

      {envVars.length === 0 ? (
        <p className={styles.empty}>No environment variables defined.</p>
      ) : (
        <div className={styles.list}>
          {envVars.map((env: EnvVar, index: number) => (
            <div key={index} className={styles.row}>
              <input
                className={`${styles.input} ${styles.key}`}
                type="text"
                value={env.key}
                onChange={(e) => updateEnvVar(index, e.target.value, env.value)}
                placeholder="KEY"
                aria-label={`Variable key ${index + 1}`}
              />
              <input
                className={`${styles.input} ${styles.value}`}
                type="text"
                value={env.value}
                onChange={(e) => updateEnvVar(index, env.key, e.target.value)}
                placeholder="value"
                aria-label={`Variable value ${index + 1}`}
              />
              <button
                className={styles.removeButton}
                onClick={() => removeEnvVar(index)}
                aria-label={`Remove variable ${index + 1}`}
              >
                <X size={16} strokeWidth={1.5} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
