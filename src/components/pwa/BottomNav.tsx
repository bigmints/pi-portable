'use client';

import Link from 'next/link';
import { MessageSquare, ListOrdered, Clock, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomNavProps {
  pathname: string;
}

const navItems = [
  { href: '/chat', icon: MessageSquare, label: 'Chat' },
  { href: '/queue', icon: ListOrdered, label: 'Queue' },
  { href: '/history', icon: Clock, label: 'History' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

export default function BottomNav({ pathname }: BottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex items-center border-t border-border bg-background/95 backdrop-blur-sm lg:hidden"
      style={{ paddingBottom: 'var(--safe-area-inset-bottom)' }}
    >
      {navItems.map(({ href, icon: Icon, label }) => {
        const isActive = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium transition-colors',
              isActive ? 'text-violet-400' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
