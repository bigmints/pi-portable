/**
 * Conversations store — conversation CRUD operations
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Conversation, GroupedConversations, ConversationGroupEntry } from '@/types/chat';
import type { ToolCallEvent } from '@/types/tool-calls';
import type { ToolCall } from '@/types/tool-call';
import { useMessagesStore } from './messages';

function getGroupKey(timestamp: number): 'today' | 'yesterday' | 'thisWeek' | 'older' {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (diffDays < 1) return 'today';
  if (diffDays < 2) return 'yesterday';
  if (diffDays < 7) return 'thisWeek';
  return 'older';
}

interface ConversationsState {
  conversations: Conversation[];
  selectedId: string | null;

  // Core actions
  addConversation: (_conversation: Conversation) => void;
  updateConversation: (_id: string, _updates: Partial<Conversation>) => void;
  removeConversation: (_id: string) => void;
  selectConversation: (_id: string | null) => void;
  clearSelection: () => void;
  setConversations: (_conversations: Conversation[]) => void;

  // Data loading
  refetchConversations: () => Promise<void>;
  loadConversations: () => void;

  // Convenience actions
  togglePin: (_conversationId: string) => void;
  renameConversation: (_conversationId: string, _newTitle: string) => void;
  deleteConversation: (_conversationId: string) => void;
  exportConversation: (_conversationId: string) => string;
  groupConversations: () => ConversationGroupEntry[];
  getGroupedConversationsArray: () => ConversationGroupEntry[];

  // Legacy alias
  getGrouped: () => GroupedConversations;
  forkConversation: (sourceId: string, messageId: string) => string;
  createNewConversation: () => string;

  // Tool Call actions
  addToolCall: (toolCall: ToolCallEvent) => void;
  updateToolCallStatus: (id: string, status: ToolCallEvent['status'], output?: string, error?: string) => void;
  addToolCallToMessage: (messageId: string, toolCall: ToolCall) => void;
  updateToolCallInMessage: (messageId: string, toolCallId: string, updates: Partial<ToolCall>) => void;
}

export const useConversationsStore = create<ConversationsState>()(
  persist(
    (set, get) => ({
      conversations: [],
      selectedId: null,

      loadConversations: () => {
        try {
          const stored = localStorage.getItem('pi-conversations');
          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed && parsed.state && Array.isArray(parsed.state.conversations)) {
              set({ conversations: parsed.state.conversations });
            }
          }
        } catch (e) {
          console.error(e);
        }
      },

      addToolCall: (toolCall: ToolCallEvent) => {
        const activeId = get().selectedId;
        if (!activeId) return;
        set((state) => ({
          conversations: state.conversations.map((c) => {
            if (c.id !== activeId) return c;
            const existingToolCalls = c.toolCalls || [];
            const exists = existingToolCalls.some((tc) => tc.id === toolCall.id);
            const updatedToolCalls = exists
              ? existingToolCalls.map((tc) => (tc.id === toolCall.id ? toolCall : tc))
              : [...existingToolCalls, toolCall];
            return { ...c, toolCalls: updatedToolCalls };
          }),
        }));
      },

      updateToolCallStatus: (id: string, status: ToolCallEvent['status'], output?: string, error?: string) => {
        set((state) => ({
          conversations: state.conversations.map((c) => {
            const existingToolCalls = c.toolCalls || [];
            const exists = existingToolCalls.some((tc) => tc.id === id);
            if (!exists) return c;
            const updatedToolCalls = existingToolCalls.map((tc) => {
              if (tc.id !== id) return tc;
              return {
                ...tc,
                status,
                ...(output !== undefined ? { output } : {}),
                ...(error !== undefined ? { error } : {}),
              };
            });
            return { ...c, toolCalls: updatedToolCalls };
          }),
        }));
      },

      addToolCallToMessage: (messageId: string, toolCall: ToolCall) => {
        useMessagesStore.getState().addToolCall(messageId, toolCall);
      },

      updateToolCallInMessage: (messageId: string, toolCallId: string, updates: Partial<ToolCall>) => {
        useMessagesStore.getState().updateToolCall(messageId, toolCallId, updates);
      },

      addConversation: (conversation: Conversation) =>
        set((state) => ({
          conversations: [conversation, ...state.conversations],
        })),

      updateConversation: (id: string, updates: Partial<Conversation>) =>
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        })),

      removeConversation: (id: string) =>
        set((state) => ({
          conversations: state.conversations.filter((c) => c.id !== id),
          selectedId: state.selectedId === id ? null : state.selectedId,
        })),

      selectConversation: (id: string | null) => set(() => ({ selectedId: id })),

      clearSelection: () => set(() => ({ selectedId: null })),

      setConversations: (conversations: Conversation[]) => set(() => ({ conversations })),

      // Data loading
      refetchConversations: async () => {
        // In production, fetch from API: const res = await fetch('/api/conversations');
        // For now, no-op (store state persists in memory)
      },

      // Convenience methods
      togglePin: (conversationId: string) => {
        const { conversations } = get();
        const conv = conversations.find((c) => c.id === conversationId);
        if (conv) {
          set((state) => ({
            conversations: state.conversations.map((c) =>
              c.id === conversationId ? { ...c, isPinned: !c.isPinned } : c
            ),
          }));
        }
      },

      renameConversation: (conversationId: string, newTitle: string) => {
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === conversationId ? { ...c, title: newTitle } : c
          ),
        }));
      },

      deleteConversation: (conversationId: string) => {
        set((state) => ({
          conversations: state.conversations.filter((c) => c.id !== conversationId),
          selectedId: state.selectedId === conversationId ? null : state.selectedId,
        }));
      },

      exportConversation: (conversationId: string): string => {
        const { conversations } = get();
        const conv = conversations.find((c) => c.id === conversationId);
        if (!conv) return '';
        const blob = new Blob([JSON.stringify(conv, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        // Trigger download
        const a = document.createElement('a');
        a.href = url;
        a.download = `${conv.title}.json`;
        a.click();
        URL.revokeObjectURL(url);
        return url;
      },

      groupConversations: (): ConversationGroupEntry[] => {
        const { conversations } = get();
        return getGroupedConversationsArray(conversations);
      },

      getGroupedConversationsArray: (): ConversationGroupEntry[] => {
        const { conversations } = get();
        return getGroupedConversationsArray(conversations);
      },

      // Legacy alias
      getGrouped: (): GroupedConversations => {
        const { conversations } = get();
        return getGroupedConversations(conversations);
      },

      forkConversation: (sourceId: string, messageId: string): string => {
        const { conversations } = get();
        const sourceConv = conversations.find((c) => c.id === sourceId);
        if (!sourceConv) return '';

        const allMessages = useMessagesStore.getState().getMessagesByConversation(sourceId);
        const forkIndex = allMessages.findIndex((m) => m.id === messageId);
        if (forkIndex === -1) return '';

        const forkedMessages = allMessages.slice(0, forkIndex + 1);
        const newId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
        const previewMsg = forkedMessages[forkedMessages.length - 1];
        const title = sourceConv.title + ' (forked)';

        const newConv: Conversation = {
          id: newId,
          title,
          projectId: sourceConv.projectId,
          lastMessagePreview: previewMsg?.content.slice(0, 50) || '',
          lastMessageAt: Date.now(),
          isPinned: false,
          messageCount: forkedMessages.length,
        };

        // Add the new conversation
        set((state) => ({
          conversations: [newConv, ...state.conversations],
          selectedId: newId,
        }));

        // Add forked messages to the messages store
        forkedMessages.forEach((msg) => {
          useMessagesStore.getState().addMessage({
            ...msg,
            conversationId: newId,
            id: `${newId}-${msg.id}`,
          });
        });

        return newId;
      },

      createNewConversation: () => {
        const newId = crypto.randomUUID();
        const newConversation: Conversation = {
          id: newId,
          title: 'New Conversation',
          projectId: 'default',
          lastMessagePreview: '',
          lastMessageAt: Date.now(),
          isPinned: false,
          messageCount: 0,
          messages: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          conversations: [newConversation, ...state.conversations],
          selectedId: newId,
        }));
        return newId;
      },
    }),
    {
      name: 'pi-conversations',
    }
  )
);

function getGroupedConversations(conversations: Conversation[]): GroupedConversations {
  const pinned = conversations.filter((c) => c.isPinned);
  const unpinned = conversations.filter((c) => !c.isPinned);

  const today: Conversation[] = [];
  const yesterday: Conversation[] = [];
  const thisWeek: Conversation[] = [];
  const older: Conversation[] = [];

  for (const conv of unpinned) {
    const group = getGroupKey(conv.lastMessageAt);
    switch (group) {
      case 'today':
        today.push(conv);
        break;
      case 'yesterday':
        yesterday.push(conv);
        break;
      case 'thisWeek':
        thisWeek.push(conv);
        break;
      case 'older':
        older.push(conv);
        break;
    }
  }

  return { pinned, today, yesterday, thisWeek, older };
}

function getGroupedConversationsArray(conversations: Conversation[]): ConversationGroupEntry[] {
  const grouped = getGroupedConversations(conversations);
  const entries: ConversationGroupEntry[] = [];

  if (grouped.pinned.length > 0) {
    entries.push({ label: 'Pinned', conversations: grouped.pinned });
  }
  if (grouped.today.length > 0) {
    entries.push({ label: 'Today', conversations: grouped.today });
  }
  if (grouped.yesterday.length > 0) {
    entries.push({ label: 'Yesterday', conversations: grouped.yesterday });
  }
  if (grouped.thisWeek.length > 0) {
    entries.push({ label: 'This Week', conversations: grouped.thisWeek });
  }
  if (grouped.older.length > 0) {
    entries.push({ label: 'Older', conversations: grouped.older });
  }

  return entries;
}
