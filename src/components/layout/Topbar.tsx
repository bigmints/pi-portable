'use client';
import { Terminal } from 'lucide-react';
import ConnectionStatus from '@/components/common/ConnectionStatus';
import { useProjectStore } from '@/store/projects';

export default function Topbar() {
  const activeProject = useProjectStore((s) => s.activeProject);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background/95 backdrop-blur-sm px-4">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-600">
          <Terminal className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
        </div>
        <span className="text-sm font-semibold tracking-tight">
          {activeProject?.name ?? 'pi'}
        </span>
      </div>
      <ConnectionStatus />
    </header>
  );
}
