'use client';

import { usePathname, useRouter } from 'next/navigation';
import {
  MessageSquare,
  ListOrdered,
  Cpu,
  Clock,
  FileCode,
  Settings,
  ChevronsLeft,
  ChevronsRight,
  FolderOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import NewConversationButton from '@/components/chat/NewConversationButton';
import { useUIStore } from '@/store/ui';
import { cn } from '@/lib/utils';
import ProjectList from '@/components/projects/ProjectList';
import { useConversationsStore } from '@/store/conversations';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
  const { sidebarOpen, toggleSidebar, settingsOpen, toggleSettingsDrawer } = useUIStore();
  const { conversations, selectedId, selectConversation } = useConversationsStore();

  return (
    <aside
      className={cn(
        'fixed top-14 left-0 bottom-0 z-30 hidden lg:flex flex-col',
        'bg-card border-r border-border',
        'transition-[width] duration-200 ease-in-out overflow-hidden',
        sidebarOpen ? 'w-60' : 'w-16'
      )}
    >
      <div className="flex-1 overflow-y-auto p-2 pt-3 space-y-4">
        {/* New Chat Section */}
        <div className="px-1 mb-2">
          {sidebarOpen ? (
            <NewConversationButton className="w-full justify-center rounded-xl bg-violet-600 hover:bg-violet-700 text-white shadow-sm py-5 font-semibold text-sm" />
          ) : (
            <NewConversationButton iconOnly className="w-full h-10 flex items-center justify-center rounded-xl bg-violet-600 hover:bg-violet-700 text-white shadow-sm" />
          )}
        </div>

        {/* Navigation Section */}
        <nav className="space-y-0.5">
          {navItems.map(({ icon: Icon, label, href }) => {
            const active = href === '/settings' 
              ? settingsOpen 
              : (pathname === href || pathname.startsWith(href + '/'));
            return (
              <button
                key={href}
                onClick={() => href === '/settings' ? toggleSettingsDrawer() : router.push(href)}
                title={!sidebarOpen ? label : undefined}
                className={cn(
                  'relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                  active
                    ? 'bg-violet-600/15 text-violet-400'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                  !sidebarOpen && 'justify-center px-0'
                )}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-violet-500 rounded-r-full" />
                )}
                <Icon size={18} strokeWidth={active ? 2 : 1.5} className="shrink-0" />
                {sidebarOpen && <span className="truncate">{label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Conversations Section */}
        <div className="space-y-2">
          {sidebarOpen ? (
            <>
              <div className="px-3 pt-2">
                <div className="h-px bg-border w-full mb-3" />
                <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                  Conversations
                </span>
              </div>
              <div className="px-1 max-h-48 overflow-y-auto space-y-0.5">
                {conversations.length > 0 ? (
                  conversations.map((conv) => {
                    const active = conv.id === selectedId;
                    return (
                      <button
                        key={conv.id}
                        onClick={() => {
                          selectConversation(conv.id);
                          router.push(`/chat/${conv.id}`);
                        }}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all text-left truncate',
                          active
                            ? 'bg-violet-600/15 text-violet-400'
                            : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                        )}
                      >
                        <MessageSquare size={18} strokeWidth={active ? 2 : 1.5} className="shrink-0" />
                        <span className="truncate">{conv.title}</span>
                      </button>
                    );
                  })
                ) : (
                  <div className="px-3 py-2 text-xs text-muted-foreground">
                    No conversations yet
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="h-px bg-border my-2 mx-1" />
              <div className="flex justify-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      title="Conversations"
                      className={cn(
                        'flex items-center justify-center rounded-xl p-2.5 transition-all',
                        'text-muted-foreground hover:bg-accent hover:text-foreground'
                      )}
                    >
                      <MessageSquare size={18} strokeWidth={1.5} className="shrink-0 text-violet-400" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="right" align="start" className="w-56 p-2 bg-card border-border shadow-lg">
                    <DropdownMenuLabel className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase px-2 py-1.5">
                      Conversations
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <div className="max-h-[260px] overflow-y-auto py-1">
                      {conversations.length > 0 ? (
                        conversations.map((conv) => {
                          const active = conv.id === selectedId;
                          return (
                            <button
                              key={conv.id}
                              onClick={() => {
                                selectConversation(conv.id);
                                router.push(`/chat/${conv.id}`);
                              }}
                              className={cn(
                                'flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all text-left truncate',
                                active
                                  ? 'bg-violet-600/15 text-violet-400'
                                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                              )}
                            >
                              <MessageSquare size={18} strokeWidth={1.5} className="shrink-0" />
                              <span className="truncate">{conv.title}</span>
                            </button>
                          );
                        })
                      ) : (
                        <div className="px-2 py-1.5 text-xs text-muted-foreground">
                          No conversations yet
                        </div>
                      )}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </>
          )}
        </div>

        {/* Divider & Projects Section */}
        <div className="space-y-2">
          {sidebarOpen ? (
            <>
              <div className="px-3 pt-2">
                <div className="h-px bg-border w-full mb-3" />
                <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                  Projects
                </span>
              </div>
              <div className="px-1">
                <ProjectList limitHeight />
              </div>
            </>
          ) : (
            <>
              <div className="h-px bg-border my-2 mx-1" />
              <div className="flex justify-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      title="Switch Project"
                      className={cn(
                        'flex items-center justify-center rounded-xl p-2.5 transition-all',
                        'text-muted-foreground hover:bg-accent hover:text-foreground'
                      )}
                    >
                      <FolderOpen size={18} strokeWidth={1.5} className="shrink-0 text-violet-400" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="right" align="start" className="w-56 p-2 bg-card border-border shadow-lg">
                    <DropdownMenuLabel className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase px-2 py-1.5">
                      Projects
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <div className="max-h-[260px] overflow-y-auto py-1">
                      <ProjectList limitHeight />
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Sidebar Footer */}
      <div className="border-t border-border p-2 bg-card">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className={cn('w-full text-muted-foreground hover:text-foreground', !sidebarOpen && 'justify-center')}
          aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {sidebarOpen ? <ChevronsLeft size={16} /> : <ChevronsRight size={16} />}
        </Button>
      </div>
    </aside>
  );
}
