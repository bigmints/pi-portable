'use client';

import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Settings, Sliders, Cpu, Palette, Sun, Moon, Laptop, Globe, Shield, RefreshCw } from 'lucide-react';
import ModelSettingsPanel from './ModelSettingsPanel';
import { useUIStore } from '@/store/ui';

export default function SettingsDrawer() {
  const { settingsOpen, setSettingsOpen } = useUIStore();
  const [activeTab, setActiveTab] = useState<'general' | 'model' | 'appearance'>('general');
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [language, setLanguage] = useState<string>('en');
  const [autoSave, setAutoSave] = useState<boolean>(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
    if (savedTheme) {
      const timer = setTimeout(() => {
        setTheme(savedTheme);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    
    const root = window.document.documentElement;
    if (newTheme === 'dark') {
      root.classList.add('dark');
    } else if (newTheme === 'light') {
      root.classList.remove('dark');
    } else {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      if (systemTheme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  };

  return (
    <Dialog.Root open={settingsOpen} onOpenChange={setSettingsOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm transition-opacity duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed inset-y-0 right-0 z-50 h-[calc(100dvh-3.5rem)] mt-14 w-full sm:max-w-md border-l border-border bg-card shadow-xl transition-all duration-300 ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right flex flex-col focus:outline-none">
          
          <div className="flex items-center justify-between border-b border-border px-5 py-4 bg-accent/10">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-600/10 text-violet-400">
                <Settings className="h-4 w-4" />
              </div>
              <Dialog.Title className="text-sm font-semibold text-foreground">
                Settings
              </Dialog.Title>
            </div>
            <Dialog.Close asChild>
              <button
                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors outline-none cursor-pointer"
                aria-label="Close settings"
              >
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          <div className="flex border-b border-border px-4 py-2 bg-muted/20 gap-1">
            <button
              onClick={() => setActiveTab('general')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                activeTab === 'general'
                  ? 'bg-violet-600/10 text-violet-400'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/5'
              }`}
            >
              <Sliders className="h-3.5 w-3.5" />
              <span>General</span>
            </button>
            <button
              onClick={() => setActiveTab('model')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                activeTab === 'model'
                  ? 'bg-violet-600/10 text-violet-400'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/5'
              }`}
            >
              <Cpu className="h-3.5 w-3.5" />
              <span>Model</span>
            </button>
            <button
              onClick={() => setActiveTab('appearance')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                activeTab === 'appearance'
                  ? 'bg-violet-600/10 text-violet-400'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/5'
              }`}
            >
              <Palette className="h-3.5 w-3.5" />
              <span>Appearance</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            
            {activeTab === 'general' && (
              <div className="space-y-6">
                
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-2">
                    <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                    Language
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full text-sm rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-violet-500"
                  >
                    <option value="en">English (US)</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                  </select>
                  <p className="text-[11px] text-muted-foreground">Select the preferred interface language.</p>
                </div>

                <div className="flex items-center justify-between border-t border-border pt-4">
                  <div className="space-y-0.5">
                    <label className="text-xs font-semibold text-foreground flex items-center gap-2">
                      <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                      Auto-save Changes
                    </label>
                    <p className="text-[11px] text-muted-foreground">Automatically persist modified workspaces.</p>
                  </div>
                  <button
                    onClick={() => setAutoSave(!autoSave)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      autoSave ? 'bg-violet-600' : 'bg-muted'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        autoSave ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="border-t border-border pt-4 space-y-3">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-2">
                    <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
                    System Recovery
                  </label>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to clear all data and local settings?')) {
                        localStorage.clear();
                        window.location.reload();
                      }
                    }}
                    className="w-full text-xs font-medium bg-red-650 hover:bg-red-700 text-white rounded-lg py-2 border border-transparent transition-colors cursor-pointer"
                  >
                    Clear Local Storage & Reset
                  </button>
                </div>

              </div>
            )}

            {activeTab === 'model' && (
              <div>
                <ModelSettingsPanel />
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-6">
                
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-2">
                    Theme Mode
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleThemeChange('light')}
                      className={`flex flex-col items-center justify-center gap-1.5 py-3 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                        theme === 'light'
                          ? 'border-violet-500 bg-violet-650/5 text-violet-400 font-semibold'
                          : 'border-border bg-background hover:bg-accent text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Sun className="h-4 w-4" />
                      <span>Light</span>
                    </button>
                    <button
                      onClick={() => handleThemeChange('dark')}
                      className={`flex flex-col items-center justify-center gap-1.5 py-3 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                        theme === 'dark'
                          ? 'border-violet-500 bg-violet-650/5 text-violet-400 font-semibold'
                          : 'border-border bg-background hover:bg-accent text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Moon className="h-4 w-4" />
                      <span>Dark</span>
                    </button>
                    <button
                      onClick={() => handleThemeChange('system')}
                      className={`flex flex-col items-center justify-center gap-1.5 py-3 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                        theme === 'system'
                          ? 'border-violet-500 bg-violet-650/5 text-violet-400 font-semibold'
                          : 'border-border bg-background hover:bg-accent text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Laptop className="h-4 w-4" />
                      <span>System</span>
                    </button>
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <p className="text-[11px] text-muted-foreground">
                    Interface transitions, layout responsive components, and sidebar visibility settings adapt automatically based on screen dimension and theme properties.
                  </p>
                </div>

              </div>
            )}

          </div>

        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
