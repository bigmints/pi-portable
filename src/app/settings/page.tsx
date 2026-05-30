'use client';

import { useEffect } from 'react';
import {
  SettingsTabs,
  AccountSettings,
  AppearanceSection,
  ShortcutsSection,
  NotificationsSection,
  AdvancedSection,
  ModelSelector,
  AppearanceSettings,
  ModelParameters,
} from '@/components/settings';
import { useModelSettingsStore } from '@/store/model-settings';
import { RotateCcw } from 'lucide-react';

export default function SettingsPage() {
  const { resetToDefaults, setModels } = useModelSettingsStore();

  // Fetch available models on mount
  useEffect(() => {
    async function fetchModels() {
      try {
        const response = await fetch('/api/models');
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            setModels(data);
          }
        }
      } catch (error) {
        console.error('Error fetching models:', error);
      }
    }
    fetchModels();
  }, [setModels]);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <SettingsTabs>
        <AccountSettings />
        <AppearanceSection />
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '24px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>Model & Appearance Settings</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <ModelSelector />
            <AppearanceSettings />
            <ModelParameters />
            <button
              onClick={resetToDefaults}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface-1)',
                color: 'var(--color-text-secondary)',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                width: 'fit-content'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-accent)';
                e.currentTarget.style.color = 'var(--color-text)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border)';
                e.currentTarget.style.color = 'var(--color-text-secondary)';
              }}
            >
              <RotateCcw size={14} />
              <span>Reset to Defaults</span>
            </button>
          </div>
        </div>

        <ShortcutsSection />
        <NotificationsSection />
        <AdvancedSection />
      </SettingsTabs>
    </div>
  );
}
