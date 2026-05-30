"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Check, ChevronDown, Cpu } from 'lucide-react';
import { useModelSettingsStore, ModelConfig } from '@/store/model-settings';
import styles from './ModelSelector.module.css';

export default function ModelSelector() {
  const { selectedModel, models, setSelectedModel } = useModelSettingsStore();
  const [isOpen, setIsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = async (model: ModelConfig) => {
    setSelectedModel(model);
    setIsOpen(false);

    // Call POST API route to store selection
    try {
      const response = await fetch('/api/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modelId: model.id }),
      });
      if (response.ok) {
        setToastMessage(`Selected ${model.name}`);
      } else {
        setToastMessage(`Failed to update backend selection`);
      }
    } catch {
      setToastMessage(`Selected ${model.name} (Offline)`);
    }

    // Auto-clear toast
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  const getProviderClass = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'openai':
        return styles.providerOpenai;
      case 'anthropic':
        return styles.providerAnthropic;
      case 'meta':
        return styles.providerMeta;
      default:
        return styles.providerDefault;
    }
  };

  const formatContextWindow = (limit: number) => {
    if (limit >= 1000) {
      return `${limit / 1000}k`;
    }
    return limit.toString();
  };

  return (
    <div className={styles.container} ref={dropdownRef}>
      <label className={styles.label}>
        <Cpu size={16} className={styles.icon} />
        <span>Model Selection</span>
      </label>

      {/* Toast Notification */}
      {toastMessage && (
        <div className={styles.toast} role="alert">
          {toastMessage}
        </div>
      )}

      {/* Dropdown Trigger */}
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        {selectedModel ? (
          <div className={styles.triggerContent}>
            <span className={`${styles.badge} ${getProviderClass(selectedModel.provider)}`}>
              {selectedModel.provider}
            </span>
            <span className={styles.modelName}>{selectedModel.name}</span>
            <span className={styles.contextInfo}>
              ({formatContextWindow(selectedModel.contextWindow)} ctx)
            </span>
          </div>
        ) : (
          <span className={styles.placeholder}>Select a model...</span>
        )}
        <ChevronDown size={16} className={`${styles.arrow} ${isOpen ? styles.arrowOpen : ''}`} />
      </button>

      {/* Custom Dropdown List */}
      {isOpen && (
        <div className={styles.dropdown} role="listbox">
          <div className={styles.dropdownScroll}>
            {models.map((model) => {
              const isSelected = selectedModel?.id === model.id;
              return (
                <button
                  key={model.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={`${styles.optionCard} ${isSelected ? styles.optionSelected : ''}`}
                  onClick={() => handleSelect(model)}
                >
                  <div className={styles.optionInfo}>
                    <div className={styles.optionHeader}>
                      <span className={`${styles.badge} ${getProviderClass(model.provider)}`}>
                        {model.provider}
                      </span>
                      <span className={styles.optionName}>{model.name}</span>
                    </div>
                    <div className={styles.optionMeta}>
                      Context Window: {model.contextWindow.toLocaleString()} tokens
                    </div>
                  </div>
                  {isSelected && (
                    <div className={styles.checkWrapper}>
                      <Check size={16} className={styles.checkIcon} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
