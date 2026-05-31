'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { X, Settings } from 'lucide-react';
import ModelSettingsPanel from './ModelSettingsPanel';
import { useUIStore } from '@/store/ui';

export default function SettingsDrawer() {
  const { settingsOpen, setSettingsOpen } = useUIStore();

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

          <div className="flex-1 overflow-y-auto p-5">
            <ModelSettingsPanel />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
