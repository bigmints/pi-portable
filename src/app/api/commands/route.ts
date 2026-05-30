import { NextResponse } from 'next/server';
import type { SlashCommand } from '@/types/chat';

const commands: SlashCommand[] = [
  {
    id: 'deploy',
    name: '/deploy',
    description: 'Deploy the current project',
    icon: 'Rocket',
    hasArgs: true,
    argPlaceholder: 'environment',
  },
  {
    id: 'status',
    name: '/status',
    description: 'Check deployment status',
    icon: 'Activity',
    hasArgs: false,
  },
  {
    id: 'logs',
    name: '/logs',
    description: 'View recent logs',
    icon: 'FileText',
    hasArgs: true,
    argPlaceholder: 'service',
  },
  {
    id: 'help',
    name: '/help',
    description: 'Show available commands',
    icon: 'HelpCircle',
    hasArgs: false,
  },
  {
    id: 'clear',
    name: '/clear',
    description: 'Clear the conversation',
    icon: 'Trash2',
    hasArgs: false,
  },
  {
    id: 'new',
    name: '/new',
    description: 'Start a new conversation',
    icon: 'Plus',
    hasArgs: false,
  },
  {
    id: 'settings',
    name: '/settings',
    description: 'Open settings panel',
    icon: 'Settings',
    hasArgs: false,
  },
  {
    id: 'export',
    name: '/export',
    description: 'Export conversation',
    icon: 'Download',
    hasArgs: true,
    argPlaceholder: 'format',
  },
  {
    id: 'undo',
    name: '/undo',
    description: 'Undo last message',
    icon: 'Undo2',
    hasArgs: false,
  },
  {
    id: 'redo',
    name: '/redo',
    description: 'Redo last message',
    icon: 'Redo2',
    hasArgs: false,
  },
];

export async function GET(): Promise<Response> {
  return NextResponse.json(commands);
}
