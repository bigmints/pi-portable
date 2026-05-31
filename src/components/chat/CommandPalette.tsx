'use client';

import { cn } from '@/lib/utils';

export interface Command {
  id: string;
  label: string;
  description: string;
  icon: string;
  insertText: string;
}

export const COMMANDS: Command[] = [
  { id: 'help', label: '/help', description: 'Show help and available commands', icon: '❓', insertText: '/help ' },
  { id: 'clear', label: '/clear', description: 'Clear conversation history', icon: '🗑️', insertText: '/clear ' },
  { id: 'new', label: '/new', description: 'Start a new conversation', icon: '✨', insertText: '/new ' },
  { id: 'settings', label: '/settings', description: 'Open settings', icon: '⚙️', insertText: '/settings ' },
  { id: 'export', label: '/export', description: 'Export conversation', icon: '📤', insertText: '/export ' },
  { id: 'search', label: '/search', description: 'Search conversations', icon: '🔍', insertText: '/search ' },
];

interface CommandPaletteProps {
  isOpen: boolean;
  activeIndex: number;
  filteredCommands: Command[];
  onHoverItem: (index: number) => void;
  onSelect: (command: Command) => void;
}

export function CommandPalette({
  isOpen,
  activeIndex,
  filteredCommands,
  onHoverItem,
  onSelect,
}: CommandPaletteProps) {
  if (!isOpen || filteredCommands.length === 0) return null;

  return (
    <div
      className="absolute bottom-full left-0 right-0 mb-2 z-50 bg-popover/95 backdrop-blur-md border border-border shadow-lg rounded-xl overflow-hidden flex flex-col max-h-60 overflow-y-auto animate-in fade-in-50 slide-in-from-bottom-2 duration-150"
      role="listbox"
      aria-label="Command suggestions"
    >
      <div className="py-1.5 px-3 bg-muted/40 border-b border-border text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
        Commands
      </div>
      <div className="p-1 flex flex-col gap-0.5 max-h-[220px] overflow-y-auto">
        {filteredCommands.map((command, index) => {
          const isActive = index === activeIndex;
          return (
            <button
              key={command.id}
              role="option"
              aria-selected={isActive}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors cursor-pointer outline-none border-none bg-transparent',
                isActive
                  ? 'bg-accent text-accent-foreground'
                  : 'text-foreground hover:bg-muted/40'
              )}
              onClick={() => onSelect(command)}
              onMouseEnter={() => onHoverItem(index)}
            >
              <span className="text-base select-none shrink-0" aria-hidden="true">
                {command.icon}
              </span>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium leading-none mb-0.5">
                  {command.label}
                </span>
                <span className="text-xs text-muted-foreground truncate">
                  {command.description}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
