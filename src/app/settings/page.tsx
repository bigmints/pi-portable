'use client';

import ModelSettingsPanel from '@/components/settings/ModelSettingsPanel';

export default function SettingsPage() {
  return (
    <div className="h-full flex flex-col bg-background">
      <div className="mx-auto w-full max-w-2xl px-4 py-8 flex-1">
        <ModelSettingsPanel />
      </div>
    </div>
  );
}
