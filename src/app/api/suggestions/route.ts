import { NextResponse } from 'next/server';
import type { Suggestion } from '@/types/chat';

const SUGGESTIONS: Suggestion[] = [
  {
    id: 'explain',
    label: 'Explain a concept',
    prompt: 'Explain how WebSocket connections work in a progressive web app',
  },
  {
    id: 'write-code',
    label: 'Write code',
    prompt: 'Write a TypeScript function that validates email addresses',
  },
  {
    id: 'debug',
    label: 'Debug an issue',
    prompt: 'Help me debug a Next.js 14 App Router hydration error',
  },
  {
    id: 'analyze',
    label: 'Analyze data',
    prompt: 'How do I implement real-time streaming with Server-Sent Events?',
  },
];

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ suggestions: SUGGESTIONS });
}
