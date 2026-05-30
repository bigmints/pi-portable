'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Command {
  id: string;
  label: string;
  description: string;
  shortcut?: string;
  icon?: string;
  action: string;
  context?: 'all' | 'conversation' | 'new-chat';
}

interface CommandsState {
  commands: Command[];
  isPaletteOpen: boolean;
  selectedCommand: Command | null;
  filterQuery: string;
  
  openPalette: () => void;
  closePalette: () => void;
  setFilterQuery: (query: string) => void;
  selectCommand: (command: Command | null) => void;
  reset: () => void;
}

const DEFAULT_COMMANDS: Command[] = [
  {
    id: 'summarize',
    label: '/summarize',
    description: 'Summarize the current conversation thread',
    shortcut: 'Tab',
    icon: 'FileText',
    action: '/summarize',
    context: 'conversation',
  },
  {
    id: 'explain',
    label: '/explain',
    description: 'Explain the selected code or concept',
    shortcut: 'Tab',
    icon: 'HelpCircle',
    action: '/explain',
    context: 'all',
  },
  {
    id: 'refactor',
    label: '/refactor',
    description: 'Refactor code for readability or performance',
    shortcut: 'Tab',
    icon: 'Code2',
    action: '/refactor',
    context: 'all',
  },
  {
    id: 'debug',
    label: '/debug',
    description: 'Find and fix bugs in code',
    shortcut: 'Tab',
    icon: 'Bug',
    action: '/debug',
    context: 'all',
  },
  {
    id: 'test',
    label: '/test',
    description: 'Generate unit tests for the code',
    shortcut: 'Tab',
    icon: 'CheckSquare',
    action: '/test',
    context: 'all',
  },
  {
    id: 'document',
    label: '/document',
    description: 'Generate documentation or comments',
    shortcut: 'Tab',
    icon: 'BookOpen',
    action: '/document',
    context: 'all',
  },
  {
    id: 'optimize',
    label: '/optimize',
    description: 'Optimize code performance and efficiency',
    shortcut: 'Tab',
    icon: 'Zap',
    action: '/optimize',
    context: 'all',
  },
  {
    id: 'improve',
    label: '/improve',
    description: 'Improve writing clarity and style',
    shortcut: 'Tab',
    icon: 'Sparkles',
    action: '/improve',
    context: 'all',
  },
  {
    id: 'translate',
    label: '/translate',
    description: 'Translate text to another language',
    shortcut: 'Tab',
    icon: 'Languages',
    action: '/translate',
    context: 'all',
  },
  {
    id: 'mock',
    label: '/mock',
    description: 'Generate mock data or API structures',
    shortcut: 'Tab',
    icon: 'Database',
    action: '/mock',
    context: 'all',
  },
  {
    id: 'clear',
    label: '/clear',
    description: 'Clear the active message input',
    shortcut: 'Tab',
    icon: 'Trash2',
    action: '/clear',
    context: 'all',
  },
  {
    id: 'format',
    label: '/format',
    description: 'Format code or markdown text',
    shortcut: 'Tab',
    icon: 'WrapText',
    action: '/format',
    context: 'all',
  },
  {
    id: 'help',
    label: '/help',
    description: 'Show list of available commands',
    shortcut: 'Tab',
    icon: 'Info',
    action: '/help',
    context: 'all',
  },
  {
    id: 'newchat',
    label: '/new',
    description: 'Start a fresh conversation',
    shortcut: 'Tab',
    icon: 'PlusCircle',
    action: '/new',
    context: 'new-chat',
  },
  {
    id: 'analyze',
    label: '/analyze',
    description: 'Deeply analyze a system design or problem',
    shortcut: 'Tab',
    icon: 'Activity',
    action: '/analyze',
    context: 'conversation',
  },
];

export const useCommandsStore = create<CommandsState>()(
  persist(
    (set) => ({
      commands: DEFAULT_COMMANDS,
      isPaletteOpen: false,
      selectedCommand: null,
      filterQuery: '',

      openPalette: () => set({ isPaletteOpen: true }),
      closePalette: () => set({ isPaletteOpen: false, selectedCommand: null, filterQuery: '' }),
      setFilterQuery: (query: string) => set({ filterQuery: query }),
      selectCommand: (command: Command | null) => set({ selectedCommand: command }),
      reset: () => set({ isPaletteOpen: false, selectedCommand: null, filterQuery: '' }),
    }),
    {
      name: 'pi-commands',
    }
  )
);
