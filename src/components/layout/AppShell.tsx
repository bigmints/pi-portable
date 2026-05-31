'use client';
import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import PwaProvider from '@/components/pwa/PwaProvider';
import Topbar from './Topbar';
import Sidebar from './Sidebar';
import BottomNav from '@/components/pwa/BottomNav';
import { usePathname } from 'next/navigation';
import { useUIStore } from '@/store/ui';
import { cn } from '@/lib/utils';
import { SettingsDrawer } from '@/components/settings';

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 5 * 60 * 1000 } } });

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { sidebarOpen } = useUIStore();

  return (
    <QueryClientProvider client={queryClient}>
      <PwaProvider>
        <Topbar />
        <Sidebar />
        <main
          className={cn(
            'overflow-y-auto bg-background transition-[margin] duration-200',
            sidebarOpen ? 'lg:ml-60' : 'lg:ml-16',
            'mt-14',
            'h-[calc(100dvh-3.5rem)]'
          )}
        >
          {children}
        </main>
        <BottomNav pathname={pathname} />
        <SettingsDrawer />
      </PwaProvider>
    </QueryClientProvider>
  );
}
