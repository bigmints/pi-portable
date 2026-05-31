'use client';
import { Terminal } from 'lucide-react';
import ConnectionStatus from '@/components/common/ConnectionStatus';
import { useProjectStore } from '@/store/projects';
import { NewChatButton } from '@/components/chat/NewChatButton';

export default function Topbar() {
  const activeProject = useProjectStore((s) => s.activeProject);

  return (
    <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-border bg-background/80 backdrop-blur-lg px-4 pt-[env(safe-area-inset-top)]">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-600">
          <Terminal className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
        </div>
        <span className="text-sm font-semibold tracking-tight">
          {activeProject?.name ?? 'pi'}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <NewChatButton iconOnly className="lg:hidden h-8 w-8 rounded-lg bg-violet-600 hover:bg-violet-700 text-white shadow-sm flex items-center justify-center" />
        <ConnectionStatus />
      </div>
    </header>
  );
}

