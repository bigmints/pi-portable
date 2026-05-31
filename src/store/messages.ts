/**
 * Messages store — message management with streaming support
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MessageRole, ToolCallMessage } from '@/types/chat';
import type { ToolCall, ToolCallStatus } from '@/types/tool-call';

export type MessageStatus = 'sending' | 'streaming' | 'complete' | 'error';

export interface ChatMessage {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  status: MessageStatus;
  timestamp: number;
  interrupted?: boolean;
  is_regenerating?: boolean;
  toolCalls?: Record<string, ToolCall>;
}

export type AnyMessage = ChatMessage | ToolCallMessage;

interface MessagesState {
  messages: Record<string, ChatMessage>;
  inProgressMessageId: string | null;
  activeConversationId: string | null;
  isInterrupting: boolean;
  addMessage: (message: ChatMessage) => void;
  appendToken: (messageId: string, token: string) => void;
  updateMessageContent: (messageId: string, token: string) => void;
  completeMessage: (messageId: string) => void;
  setInProgressMessageId: (id: string | null) => void;
  setActiveConversationId: (id: string | null) => void;
  getMessagesByConversation: (conversationId: string) => ChatMessage[];
  isStreaming: () => boolean;
  markInterrupted: (messageId: string) => void;
  setInterrupting: (isInterrupting: boolean) => void;
  acknowledgeInterrupt: (conversationId: string) => void;
  regenerateMessage: (messageId: string) => void;
  clearRegenerating: (messageId: string) => void;
  rewindToMessage: (messageId: string) => void;
  addToolCall: (messageId: string, toolCall: ToolCall) => void;
  updateToolCall: (messageId: string, toolCallId: string, updates: Partial<ToolCall>) => void;
}

export const useMessagesStore = create<MessagesState>()(
  persist(
    (set, get) => ({
      messages: {},
      inProgressMessageId: null,
      activeConversationId: null,
      isInterrupting: false,
      addMessage: (message) =>
        set((s) => ({ messages: { ...s.messages, [message.id]: message } })),
      appendToken: (messageId, token) =>
        set((s) => {
          const msg = s.messages[messageId];
          if (!msg) return {};
          return {
            messages: {
              ...s.messages,
              [messageId]: { ...msg, content: msg.content + token },
            },
          };
        }),
      updateMessageContent: (messageId, token) =>
        set((s) => {
          const msg = s.messages[messageId];
          if (!msg) return {};
          return {
            messages: {
              ...s.messages,
              [messageId]: { ...msg, content: msg.content + token },
            },
          };
        }),
      completeMessage: (messageId) =>
        set((s) => {
          const msg = s.messages[messageId];
          if (!msg) return {};
          return {
            messages: {
              ...s.messages,
              [messageId]: { ...msg, status: 'complete' as const },
            },
            inProgressMessageId: null,
          };
        }),
      setInProgressMessageId: (id) => set({ inProgressMessageId: id }),
      setActiveConversationId: (id) => set({ activeConversationId: id }),
      getMessagesByConversation: (conversationId): ChatMessage[] => {
        const { messages } = get();
        return Object.values(messages)
          .filter((m) => m.conversationId === conversationId)
          .sort((a, b) => a.timestamp - b.timestamp);
      },
      isStreaming: (): boolean => {
        const { inProgressMessageId } = get();
        return inProgressMessageId !== null;
      },
      markInterrupted: (messageId) =>
        set((s) => {
          const msg = s.messages[messageId];
          if (!msg) return {};
          return {
            messages: {
              ...s.messages,
              [messageId]: {
                ...msg,
                interrupted: true,
                status: 'complete' as const,
              },
            },
            inProgressMessageId: null,
          };
        }),
      setInterrupting: (isInterrupting) => set({ isInterrupting }),
      acknowledgeInterrupt: (conversationId) => {
        set({ isInterrupting: false });
      },
      regenerateMessage: (messageId) =>
        set((s) => {
          const msg = s.messages[messageId];
          if (!msg) return {};
          return {
            messages: {
              ...s.messages,
              [messageId]: {
                ...msg,
                is_regenerating: true,
                content: '',
                status: 'streaming' as const,
              },
            },
          };
        }),
      clearRegenerating: (messageId) =>
        set((s) => {
          const msg = s.messages[messageId];
          if (!msg) return { messages: s.messages };
          const { is_regenerating: _, ...rest } = msg;
          return { messages: { ...s.messages, [messageId]: { ...rest } } };
        }),
      rewindToMessage: (messageId) => {
        const { messages, activeConversationId } = get();
        const targetMsg = messages[messageId];
        if (!targetMsg) return;

        const allMessages = Object.values(messages)
          .filter((m) => m.conversationId === activeConversationId)
          .sort((a, b) => a.timestamp - b.timestamp);

        const targetIndex = allMessages.findIndex((m) => m.id === messageId);
        if (targetIndex === -1) return;

        const keepMessages: Record<string, ChatMessage> = {};
        for (let i = 0; i <= targetIndex; i++) {
          const m = allMessages[i];
          keepMessages[m.id] = m;
        }

        set({ messages: keepMessages });
      },
      addToolCall: (messageId, toolCall) =>
        set((s) => {
          const msg = s.messages[messageId];
          if (!msg) return {};
          const toolCalls = msg.toolCalls || {};
          return {
            messages: {
              ...s.messages,
              [messageId]: {
                ...msg,
                toolCalls: {
                  ...toolCalls,
                  [toolCall.id]: toolCall,
                },
              },
            },
          };
        }),
      updateToolCall: (messageId, toolCallId, updates) =>
        set((s) => {
          const msg = s.messages[messageId];
          if (!msg || !msg.toolCalls || !msg.toolCalls[toolCallId]) return {};
          return {
            messages: {
              ...s.messages,
              [messageId]: {
                ...msg,
                toolCalls: {
                  ...msg.toolCalls,
                  [toolCallId]: {
                    ...msg.toolCalls[toolCallId],
                    ...updates,
                  },
                },
              },
            },
          };
        }),
    }),
    {
      name: 'pi-messages',
    }
  )
);
