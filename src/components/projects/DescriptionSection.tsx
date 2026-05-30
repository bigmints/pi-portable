'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useProjectSettingsStore } from '@/store/project-settings';
import { showToast } from '@/components/common/Toast';
import styles from './DescriptionSection.module.css';

interface DescriptionSectionProps {
  projectId: string;
}

export default function DescriptionSection({ projectId }: DescriptionSectionProps) {
  const { description, updateDescription, markUnsaved, clearUnsaved } = useProjectSettingsStore();
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSavingRef = useRef(false);

  const saveDescription = useCallback(async (value: string) => {
    if (isSavingRef.current) return;
    isSavingRef.current = true;
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: value }),
      });
      if (res.ok) {
        clearUnsaved();
        showToast('Description saved', 'success');
      } else {
        showToast('Failed to save description', 'error');
      }
    } catch {
      showToast('Failed to save description', 'error');
    } finally {
      isSavingRef.current = false;
    }
  }, [projectId, clearUnsaved]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    updateDescription(value);
    markUnsaved();

    // Debounced save on blur — we save immediately on blur, this is for auto-save
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveDescription(value);
    }, 2000);
  };

  const handleBlur = () => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveDescription(description);
  };

  return (
    <div className={styles.section}>
      <label className={styles.label} htmlFor="project-description">
        Description
      </label>
      <textarea
        id="project-description"
        className={styles.textarea}
        rows={6}
        value={description}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="Describe this project…"
      />
    </div>
  );
}
