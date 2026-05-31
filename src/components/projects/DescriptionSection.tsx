'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useProjectSettingsStore } from '@/store/project-settings';
import { showToast } from '@/components/common/Toast';

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
    <div className="flex flex-col gap-2 w-full">
      <label className="text-sm font-semibold text-foreground" htmlFor="project-description">
        Description
      </label>
      <textarea
        id="project-description"
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-violet-500/40 resize-y min-h-[120px]"
        rows={6}
        value={description}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="Describe this project…"
      />
    </div>
  );
}
