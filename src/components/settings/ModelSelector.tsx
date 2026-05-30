'use client';

import { useState, useEffect } from 'react';
import { Cpu, ChevronDown, Zap, Check, Sparkles } from 'lucide-react';
import { useModelSelectorStore } from '@/store/model-selector';
import styles from './ModelSelector.module.css';

const PROVIDER_COLORS: Record<string, string> = {
  OpenAI: '#10a95c',
  Anthropic: '#d97706',
  Google: '#4285f4',
  Meta: '#0668e1',
};

function formatContextWindow(tokens: number): string {
  if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(1)}M`;
  if (tokens >= 1_000) return `${(tokens / 1_000).toFixed(0)}K`;
  return `${tokens}`;
}

export default function ModelSelector() {
  const { models, selectedModelId, loading, fetchModels, selectModel } = useModelSelectorStore();
  const [open, setOpen] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);

  useEffect(() => {
    if (models.length === 0) fetchModels();
  }, [models.length, fetchModels]);

  const selected = models.find((m) => m.id === selectedModelId);

  const handleSelect = async (modelId: string) => {
    setPendingId(modelId);
    setOpen(false);
    await selectModel(modelId);
    setPendingId(null);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Cpu size={18} strokeWidth={1.5} />
        <span>Model</span>
      </div>

      {/* Selected model display */}
      <button
        type="button"
        className={styles.selectButton}
        onClick={() => setOpen(!open)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <div className={styles.selectContent}>
          {loading && !selected ? (
            <div className={styles.loadingState}>
              <Sparkles size={16} strokeWidth={1.5} className={styles.spin} />
              <span>Loading models...</span>
            </div>
          ) : selected ? (
            <>
              <div className={styles.modelInfo}>
                <span className={styles.modelName}>{selected.name}</span>
                <span
                  className={styles.providerBadge}
                  style={{ background: PROVIDER_COLORS[selected.provider] || '#888' }}
                >
                  {selected.provider}
                </span>
              </div>
              <span className={styles.contextWindow}>
                <Zap size={12} strokeWidth={1.5} />
                {formatContextWindow(selected.contextWindow)} context
              </span>
            </>
          ) : (
            <span>No models available</span>
          )}
        </div>
        <ChevronDown size={16} strokeWidth={1.5} className={styles.chevron} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className={styles.dropdown} role="listbox">
          {models.map((model) => {
            const isSelected = model.id === selectedModelId;
            const isPending = model.id === pendingId;
            return (
              <button
                key={model.id}
                type="button"
                role="option"
                aria-selected={isSelected}
                className={`${styles.option} ${isSelected ? styles.selected : ''} ${isPending ? styles.pending : ''}`}
                onClick={() => handleSelect(model.id)}
              >
                <div className={styles.optionLeft}>
                  <span
                    className={styles.optionProviderBadge}
                    style={{ background: PROVIDER_COLORS[model.provider] || '#888' }}
                  >
                    {model.provider}
                  </span>
                  <span className={styles.optionName}>{model.name}</span>
                </div>
                <div className={styles.optionRight}>
                  <span className={styles.optionContext}>
                    <Zap size={12} strokeWidth={1.5} />
                    {formatContextWindow(model.contextWindow)}
                  </span>
                  {isSelected && <Check size={14} strokeWidth={2} className={styles.checkIcon} />}
                  {isPending && <Sparkles size={14} strokeWidth={1.5} className={styles.spin} />}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Click outside to close */}
      {open && <div className={styles.overlay} onClick={() => setOpen(false)} />}
    </div>
  );
}
