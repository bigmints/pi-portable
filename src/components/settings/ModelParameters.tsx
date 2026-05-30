"use client";

import React from 'react';
import { useModelSettingsStore } from '@/store/model-settings';
import { Sliders, HelpCircle } from 'lucide-react';
import styles from './ModelParameters.module.css';

export default function ModelParameters() {
  const { selectedModel, setSelectedModel } = useModelSettingsStore();

  if (!selectedModel) {
    return (
      <div className={styles.container}>
        <p className={styles.noModel}>Please select a model to adjust parameters.</p>
      </div>
    );
  }

  const handleParamChange = (key: 'temperature' | 'topP' | 'maxTokens', value: number) => {
    setSelectedModel({
      ...selectedModel,
      [key]: value,
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <Sliders size={18} className={styles.icon} />
          <div>
            <h3 className={styles.title}>Model Parameters</h3>
            <p className={styles.subtitle}>Fine-tune the model's generation behavior</p>
          </div>
        </div>

        {/* Temperature Slider */}
        <div className={styles.parameterGroup}>
          <div className={styles.parameterHeader}>
            <div className={styles.parameterLabel}>
              <span>Temperature</span>
              <div className={styles.tooltipContainer}>
                <HelpCircle size={13} className={styles.helpIcon} />
                <span className={styles.tooltip}>
                  Controls randomness: higher values increase creativity and variety, lower values make responses more deterministic and focused.
                </span>
              </div>
            </div>
            <span className={styles.valueBadge}>{selectedModel.temperature.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min="0.0"
            max="2.0"
            step="0.1"
            value={selectedModel.temperature}
            onChange={(e) => handleParamChange('temperature', parseFloat(e.target.value))}
            className={styles.rangeInput}
          />
          <div className={styles.rangeLabels}>
            <span>Deterministic</span>
            <span>Creative</span>
          </div>
        </div>

        {/* Top P Slider */}
        <div className={styles.parameterGroup}>
          <div className={styles.parameterHeader}>
            <div className={styles.parameterLabel}>
              <span>Top P</span>
              <div className={styles.tooltipContainer}>
                <HelpCircle size={13} className={styles.helpIcon} />
                <span className={styles.tooltip}>
                  Nucleus sampling: limits the model's choices to a pool of words containing the specified probability mass.
                </span>
              </div>
            </div>
            <span className={styles.valueBadge}>{selectedModel.topP.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0.0"
            max="1.0"
            step="0.05"
            value={selectedModel.topP}
            onChange={(e) => handleParamChange('topP', parseFloat(e.target.value))}
            className={styles.rangeInput}
          />
          <div className={styles.rangeLabels}>
            <span>Focused</span>
            <span>Diverse</span>
          </div>
        </div>

        {/* Max Tokens Slider */}
        <div className={styles.parameterGroup}>
          <div className={styles.parameterHeader}>
            <div className={styles.parameterLabel}>
              <span>Max Output Tokens</span>
              <div className={styles.tooltipContainer}>
                <HelpCircle size={13} className={styles.helpIcon} />
                <span className={styles.tooltip}>
                  Limits the maximum number of tokens generated in a single completion.
                </span>
              </div>
            </div>
            <span className={styles.valueBadge}>{selectedModel.maxTokens}</span>
          </div>
          <input
            type="range"
            min="256"
            max="8192"
            step="256"
            value={selectedModel.maxTokens}
            onChange={(e) => handleParamChange('maxTokens', parseInt(e.target.value, 10))}
            className={styles.rangeInput}
          />
          <div className={styles.rangeLabels}>
            <span>256</span>
            <span>8,192</span>
          </div>
        </div>
      </div>
    </div>
  );
}
