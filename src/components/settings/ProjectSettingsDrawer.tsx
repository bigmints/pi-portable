/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Cpu, Folder, Sliders, FileText } from 'lucide-react';
import { useProjectSettingsStore } from '@/store/project-settings';
import { showToast } from '@/components/common/Toast';
import styles from './ProjectSettingsDrawer.module.css';

const MODEL_OPTIONS = [
  { value: 'default', label: 'Default Model' },
  { value: 'gpt-4', label: 'GPT-4' },
  { value: 'gpt-3.5', label: 'GPT-3.5' },
  { value: 'claude', label: 'Claude 3.5 Sonnet' },
  { value: 'gemini', label: 'Gemini 3.5 Flash' },
];

export default function ProjectSettingsDrawer() {
  const {
    name: storeName,
    description: storeDescription,
    directory: storeDirectory,
    model: storeModel,
    temperature: storeTemperature,
    systemPrompt: storeSystemPrompt,
    isDrawerOpen,
    closeDrawer,
    updateSettings,
  } = useProjectSettingsStore();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [directory, setDirectory] = useState('');
  const [model, setModel] = useState('default');
  const [temperature, setTemperature] = useState(0.7);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const drawerRef = useRef<HTMLDivElement>(null);

  // Sync state with store values when the drawer is opened
  useEffect(() => {
    if (isDrawerOpen) {
      setName(storeName || 'My Pi Project');
      setDescription(storeDescription || 'Project workspace for managing components and tools.');
      setDirectory(storeDirectory || '/home/bigmints/Projects/pi-app');
      setModel(storeModel || 'default');
      setTemperature(storeTemperature ?? 0.7);
      setSystemPrompt(storeSystemPrompt || 'You are an advanced agentic coding assistant.');
    }
  }, [
    isDrawerOpen,
    storeName,
    storeDescription,
    storeDirectory,
    storeModel,
    storeTemperature,
    storeSystemPrompt,
  ]);

  // Handle escape key to close drawer
  useEffect(() => {
    if (!isDrawerOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeDrawer();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDrawerOpen, closeDrawer]);

  // Focus trap inside the drawer
  useEffect(() => {
    if (!isDrawerOpen) return;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const drawer = drawerRef.current;
      if (!drawer) return;

      const focusable = drawer.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleTab);
    return () => {
      window.removeEventListener('keydown', handleTab);
    };
  }, [isDrawerOpen]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeDrawer();
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Simulate API or persistence call duration
      await new Promise((resolve) => setTimeout(resolve, 800));

      updateSettings({
        name,
        description,
        directory,
        model,
        temperature,
        systemPrompt,
      });

      showToast('Project settings saved successfully', 'success');
      closeDrawer();
    } catch {
      showToast('Failed to save project settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div
        className={`${styles.overlay} ${isDrawerOpen ? styles.open : ''}`}
        onClick={handleBackdropClick}
        aria-hidden="true"
      />
      <div
        ref={drawerRef}
        className={`${styles.drawer} ${isDrawerOpen ? styles.open : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
      >
        <div className={styles.header}>
          <div className={styles.titleContainer}>
            <h2 id="drawer-title" className={styles.title}>
              Project Settings
            </h2>
            <span className={styles.subtitle}>
              {name || 'Configure project parameters'}
            </span>
          </div>
          <button
            className={styles.closeButton}
            onClick={closeDrawer}
            disabled={isSaving}
            aria-label="Close settings drawer"
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        <form onSubmit={handleSave} className={styles.form}>
          <div className={styles.content}>
            {/* Project Name */}
            <div className={styles.field}>
              <label htmlFor="project-name" className={styles.label}>
                Project Name
              </label>
              <input
                id="project-name"
                type="text"
                className={styles.input}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter project name..."
                required
                disabled={isSaving}
              />
            </div>

            {/* Description */}
            <div className={styles.field}>
              <label htmlFor="project-desc" className={styles.label}>
                Description
              </label>
              <textarea
                id="project-desc"
                className={styles.textarea}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe this project..."
                rows={3}
                disabled={isSaving}
              />
            </div>

            {/* Directory */}
            <div className={styles.field}>
              <label htmlFor="project-dir" className={styles.label}>
                <Folder size={16} strokeWidth={1.5} />
                <span>Project Directory</span>
              </label>
              <input
                id="project-dir"
                type="text"
                className={styles.input}
                value={directory}
                onChange={(e) => setDirectory(e.target.value)}
                placeholder="Enter absolute path..."
                required
                disabled={isSaving}
              />
              <span className={styles.hint}>
                E.g., /home/user/project (browse files inside target workspace)
              </span>
            </div>

            {/* Model Selection */}
            <div className={styles.field}>
              <label htmlFor="project-model" className={styles.label}>
                <Cpu size={16} strokeWidth={1.5} />
                <span>Model Selection</span>
              </label>
              <select
                id="project-model"
                className={styles.select}
                value={model}
                onChange={(e) => setModel(e.target.value)}
                disabled={isSaving}
              >
                {MODEL_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Temperature Slider */}
            <div className={styles.field}>
              <label htmlFor="project-temp" className={styles.label}>
                <Sliders size={16} strokeWidth={1.5} />
                <span>Temperature</span>
              </label>
              <div className={styles.sliderContainer}>
                <input
                  id="project-temp"
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  className={styles.slider}
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  disabled={isSaving}
                />
                <span className={styles.sliderValue}>
                  {temperature.toFixed(1)}
                </span>
              </div>
              <span className={styles.hint}>
                Controls randomness: 0 is highly focused, 1 is creative.
              </span>
            </div>

            {/* System Prompt */}
            <div className={styles.field}>
              <label htmlFor="project-prompt" className={styles.label}>
                <FileText size={16} strokeWidth={1.5} />
                <span>System Prompt</span>
              </label>
              <textarea
                id="project-prompt"
                className={styles.textarea}
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                placeholder="Instructions for the agent..."
                rows={5}
                disabled={isSaving}
              />
            </div>
          </div>

          <div className={styles.footer}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={closeDrawer}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.saveButton}
              disabled={isSaving || !name.trim() || !directory.trim()}
            >
              {isSaving && (
                <svg
                  className={styles.spinner}
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              )}
              <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
