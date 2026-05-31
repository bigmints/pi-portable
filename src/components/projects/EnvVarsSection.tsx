'use client';

import { useCallback } from 'react';
import { Plus, X, Save } from 'lucide-react';
import { useProjectSettingsStore, type EnvVar } from '@/store/project-settings';
import { showToast } from '@/components/common/Toast';

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
    <div className="flex flex-col gap-4 w-full">
      <div className="flex items-center justify-between gap-4 border-b border-border pb-3 flex-wrap">
        <label className="text-sm font-semibold text-foreground">Environment Variables</label>
        <div className="flex items-center gap-2">
          <button
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-violet-400 hover:text-violet-300 hover:bg-violet-600/5 rounded-lg border border-violet-500/10 transition-all"
            onClick={addEnvVar}
            aria-label="Add variable"
          >
            <Plus size={14} strokeWidth={1.5} />
            <span>Add Variable</span>
          </button>
          <button
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 disabled:opacity-50 rounded-lg shadow-sm hover:shadow-violet-600/10 transition-all"
            onClick={handleSave}
            disabled={isSaving}
            aria-label="Save variables"
          >
            <Save size={14} strokeWidth={1.5} />
            <span>Save</span>
          </button>
        </div>
      </div>

      {envVars.length === 0 ? (
        <p className="text-xs text-muted-foreground py-2 italic">No environment variables defined.</p>
      ) : (
        <div className="space-y-2 mt-1">
          {envVars.map((env: EnvVar, index: number) => (
            <div key={index} className="flex items-center gap-2 w-full">
              <input
                className="w-1/3 rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-violet-500/40 font-mono"
                type="text"
                value={env.key}
                onChange={(e) => updateEnvVar(index, e.target.value, env.value)}
                placeholder="KEY"
                aria-label={`Variable key ${index + 1}`}
              />
              <input
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-violet-500/40"
                type="text"
                value={env.value}
                onChange={(e) => updateEnvVar(index, env.key, e.target.value)}
                placeholder="value"
                aria-label={`Variable value ${index + 1}`}
              />
              <button
                className="p-2 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-400 transition-colors"
                onClick={() => removeEnvVar(index)}
                aria-label={`Remove variable ${index + 1}`}
              >
                <X size={14} strokeWidth={1.5} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
