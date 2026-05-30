/**
 * Queue output store — manages live output state for the running task
 */

import { create } from 'zustand';
import type { QueueTask, OutputLine, OutputLineType } from '@/types/chat';

export type QueueOutputStatus = 'idle' | 'running' | 'completed' | 'error';

interface QueueOutputState {
  activeTask: QueueTask | null;
  outputLines: OutputLine[];
  status: QueueOutputStatus;
  startedAt: number | null;
  conversationId: string | null;
  currentPosition: number;
  totalTasks: number;
  errorMessage: string | null;

  setActiveTask: (task: QueueTask | null, position?: number, total?: number) => void;
  appendOutput: (line: OutputLine) => void;
  clearOutput: () => void;
  markComplete: (conversationId: string) => void;
  markError: (errorMessage: string) => void;
  resetToIdle: () => void;
  setPosition: (position: number, total: number) => void;
  appendToken: (token: string) => void;
  appendToolCall: (toolName: string, content: string) => void;
  appendToolResult: (toolName: string, content: string) => void;
  appendUserMessage: (content: string) => void;
}

export const useQueueOutputStore = create<QueueOutputState>((set) => ({
  activeTask: null,
  outputLines: [],
  status: 'idle',
  startedAt: null,
  conversationId: null,
  currentPosition: 0,
  totalTasks: 0,
  errorMessage: null,

  setActiveTask: (task, position = 0, total = 0) =>
    set(() => ({
      activeTask: task,
      outputLines: [],
      status: 'running',
      startedAt: Date.now(),
      conversationId: task?.conversationId ?? null,
      currentPosition: position,
      totalTasks: total,
      errorMessage: null,
    })),

  appendOutput: (line) =>
    set((s) => ({
      outputLines: [...s.outputLines, line],
    })),

  clearOutput: () =>
    set(() => ({
      outputLines: [],
    })),

  markComplete: (conversationId) =>
    set((s) => ({
      status: 'completed',
      conversationId,
    })),

  markError: (errorMessage) =>
    set(() => ({
      status: 'error',
      errorMessage,
    })),

  resetToIdle: () =>
    set(() => ({
      activeTask: null,
      outputLines: [],
      status: 'idle',
      startedAt: null,
      conversationId: null,
      currentPosition: 0,
      totalTasks: 0,
      errorMessage: null,
    })),

  setPosition: (position, total) =>
    set(() => ({
      currentPosition: position,
      totalTasks: total,
    })),

  appendToken: (token) =>
    set((s) => {
      const lines = [...s.outputLines];
      const lastLine = lines[lines.length - 1];
      if (lastLine && lastLine.type === 'assistant') {
        lines[lines.length - 1] = {
          ...lastLine,
          content: lastLine.content + token,
        };
      } else {
        lines.push({
          type: 'assistant',
          content: token,
          timestamp: Date.now(),
        });
      }
      return { outputLines: lines };
    }),

  appendToolCall: (toolName, content) =>
    set((s) => ({
      outputLines: [...s.outputLines, { type: 'tool-call', content, timestamp: Date.now(), toolName }],
    })),

  appendToolResult: (toolName, content) =>
    set((s) => ({
      outputLines: [...s.outputLines, { type: 'tool-result', content, timestamp: Date.now(), toolName }],
    })),

  appendUserMessage: (content) =>
    set((s) => ({
      outputLines: [...s.outputLines, { type: 'user', content, timestamp: Date.now() }],
    })),
}));
