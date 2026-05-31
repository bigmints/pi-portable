'use client';

import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import PwaProvider from '@/components/pwa/PwaProvider';
import Topbar from './Topbar';
import Sidebar from './Sidebar';
import BottomNav from '@/components/pwa/BottomNav';
import { usePathname } from 'next/navigation';
import { SettingsDrawer } from '@/components/settings';

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 5 * 60 * 1000 } } });

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <QueryClientProvider client={queryClient}>
      <PwaProvider>
        <div className="flex flex-col h-[100dvh] min-h-screen bg-background">
          <Topbar />
          <div className="flex flex-1 overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto pb-16 lg:pb-0">
              {children}
            </main>
          </div>
          <BottomNav pathname={pathname} />
          <SettingsDrawer />
        </div>
      </PwaProvider>
    </QueryClientProvider>
  );
}

