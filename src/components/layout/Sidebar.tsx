'use client';
import { usePathname, useRouter } from 'next/navigation';
import { MessageSquare, ListOrdered, Cpu, Clock, FileCode, Settings, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUIStore } from '@/store/ui';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: MessageSquare, label: 'Chat', href: '/chat' },
  { icon: ListOrdered, label: 'Queue', href: '/queue' },
  { icon: Cpu, label: 'Jobs', href: '/jobs' },
  { icon: Clock, label: 'History', href: '/history' },
  { icon: FileCode, label: 'Artifacts', href: '/artifacts' },
  { icon: Settings, label: 'Settings', href: '/settings' },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useUIStore();

  return (
    <aside className={cn(
      'fixed top-14 left-0 bottom-0 z-30 hidden lg:flex flex-col',
      'bg-card border-r border-border',
      'transition-[width] duration-200 ease-in-out overflow-hidden',
      sidebarOpen ? 'w-60' : 'w-16'
    )}>
      <nav className="flex-1 p-2 pt-3 space-y-0.5">
        {navItems.map(({ icon: Icon, label, href }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <button
              key={href}
              onClick={() => router.push(href)}
              title={!sidebarOpen ? label : undefined}
              className={cn(
                'relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                active ? 'bg-violet-600/15 text-violet-400' : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                !sidebarOpen && 'justify-center px-0'
              )}
            >
              {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-violet-500 rounded-r-full" />}
              <Icon size={18} strokeWidth={active ? 2 : 1.5} className="shrink-0" />
              {sidebarOpen && <span className="truncate">{label}</span>}
            </button>
          );
        })}
      </nav>
      <div className="border-t border-border p-2">
        <Button variant="ghost" size="icon" onClick={toggleSidebar}
          className={cn('w-full text-muted-foreground hover:text-foreground', !sidebarOpen && 'justify-center')}>
          {sidebarOpen ? <ChevronsLeft size={16} /> : <ChevronsRight size={16} />}
        </Button>
      </div>
    </aside>
  );
}
