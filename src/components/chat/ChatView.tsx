'use client';

import { useEffect, useRef, useCallback, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useMessagesStore } from '@/store/messages';
import { useConversationsStore } from '@/store/conversations';
import { useConnectionStore } from '@/store/connection';
import { useAttachmentsStore } from '@/store/attachments';
import { useProjectStore } from '@/store/projects';
import { wsClient } from '@/lib/ws-client';
import { SwipeBackOverlay } from '@/components/gestures';
import { useSwipeGesture } from '@/hooks/useSwipeGesture';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import EmptyState from '@/components/common/EmptyState';
import { showToast } from '@/components/common/Toast';
import type {
  ChatMessage,
  WsInboundFrame,
} from '@/types/chat';
import styles from './ChatView.module.css';

interface ChatViewProps {
  conversationId?: string;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export default function ChatView({ conversationId }: ChatViewProps) {
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [swipeVisible, setSwipeVisible] = useState(false);
  const messagesMap = useMessagesStore((s) => s.messages);
  const isStreaming = useMessagesStore((s) => s.isStreaming);
  const inProgressMessageId = useMessagesStore((s) => s.inProgressMessageId);
  const addMessage = useMessagesStore((s) => s.addMessage);
  const setActiveConversationId = useMessagesStore((s) => s.setActiveConversationId);
  const getMessagesByConversation = useMessagesStore((s) => s.getMessagesByConversation);
  const markInterrupted = useMessagesStore((s) => s.markInterrupted);
  const setInterrupting = useMessagesStore((s) => s.setInterrupting);
  const { conversations, selectedId, addConversation, updateConversation, selectConversation, clearSelection, addToolCallToMessage, updateToolCallInMessage } =
    useConversationsStore();
  const { state: connectionState } = useConnectionStore();
  const getUploadedIds = useAttachmentsStore((s) => s.getUploadedIds);
  const activeProject = useProjectStore((s) => s.activeProject);
  const clearFiles = useAttachmentsStore((s) => s.clearFiles);
  const appendToken = useMessagesStore((s) => s.appendToken);
  const completeMessage = useMessagesStore((s) => s.completeMessage);
  const setInProgressMessageId = useMessagesStore((s) => s.setInProgressMessageId);

  const currentConversationId = conversationId || selectedId;

  // Swipe-back gesture — navigate back from a conversation
  const handleSwipeBack = useCallback(() => {
    clearSelection();
    router.push('/chat');
  }, [clearSelection, router]);

  const { progress: gestureProgress, setElementRef: setSwipeRef } = useSwipeGesture({
    onSwipeRight: (_p) => {
      setSwipeVisible(true);
    },
    onSwipeRightComplete: () => {
      handleSwipeBack();
      setSwipeVisible(false);
    },
    onGestureEnd: () => {
      setSwipeVisible(false);
    },
    enabled: !!currentConversationId,
  });

  useEffect(() => {
    if (conversationId) {
      selectConversation(conversationId);
      setActiveConversationId(conversationId);
    }
  }, [conversationId, selectConversation, setActiveConversationId]);

  // Set up WebSocket message handler
  useEffect(() => {
    const handler = (frame: WsInboundFrame) => {
      switch (frame.type) {
        case 'token':
          if (frame.messageId && frame.token) {
            appendToken(frame.messageId, frame.token);
            setInProgressMessageId(frame.messageId);
          }
          break;
        case 'message_complete':
          if (frame.messageId) {
            completeMessage(frame.messageId);
          }
          break;
        case 'message_update': {
          const event = frame.payload?.assistantMessageEvent;
          const targetMessageId = frame.messageId || inProgressMessageId;
          if (event && targetMessageId) {
            if (event.type === 'tool_use_start' && event.toolCallId && event.toolName) {
              addToolCallToMessage(targetMessageId, {
                id: event.toolCallId,
                toolName: event.toolName,
                input: event.input || {},
                status: 'running',
                timestamp: Date.now(),
              });
            } else if (event.type === 'tool_use_complete' && event.toolCallId) {
              updateToolCallInMessage(targetMessageId, event.toolCallId, {
                status: 'complete',
                output: event.output || '',
              });
            } else if (event.type === 'tool_use_error' && event.toolCallId) {
              updateToolCallInMessage(targetMessageId, event.toolCallId, {
                status: 'error',
                error: event.error || 'Unknown error',
              });
            }
          }
          break;
        }
        case 'job_event':
          break;
      }
    };
    wsClient.onMessage(handler);
    return () => {
      // Clean up if needed, but wsClient handles multiple listeners
    };
  }, [appendToken, completeMessage, setInProgressMessageId, addToolCallToMessage, updateToolCallInMessage, inProgressMessageId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messagesMap, isStreaming]);

  const handleStopStreaming = useCallback(() => {
    if (!currentConversationId || !inProgressMessageId) return;

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Send interrupt
    wsClient.sendInterrupt(currentConversationId);
    setInterrupting(true);

    // Mark the current streaming message as interrupted
    markInterrupted(inProgressMessageId);

    // Set 3-second timeout for acknowledgment
    timeoutRef.current = setTimeout(() => {
      showToast('Streaming was interrupted', 'info');
      setInterrupting(false);
      timeoutRef.current = null;
    }, 3000);
  }, [currentConversationId, inProgressMessageId, markInterrupted, setInterrupting]);

  const handleSendMessage = useCallback(
    (content: string) => {
      const convId = currentConversationId || generateId();
      const msgId = generateId();
      const fileIds = getUploadedIds();

      const userMsg: ChatMessage = {
        id: msgId,
        conversationId: convId,
        role: 'user',
        content,
        status: 'complete',
        timestamp: Date.now(),
      };
      addMessage(userMsg);

      const assistantId = generateId();
      const assistantMsg: ChatMessage = {
        id: assistantId,
        conversationId: convId,
        role: 'assistant',
        content: '',
        status: 'streaming',
        timestamp: Date.now(),
      };
      addMessage(assistantMsg);
      setInProgressMessageId(assistantId);

      const existing = conversations.find((c) => c.id === convId);
      if (existing) {
        updateConversation(convId, {
          title: existing.messageCount === 0 ? (content.slice(0, 40) || (fileIds.length > 0 ? 'Image Attachment' : 'New Conversation')) : existing.title,
          lastMessagePreview: content || (fileIds.length > 0 ? '[Image]' : ''),
          lastMessageAt: Date.now(),
          messageCount: existing.messageCount + 2,
        });
      } else {
        addConversation({
          id: convId,
          title: content.slice(0, 40) || (fileIds.length > 0 ? 'Image Attachment' : 'New Conversation'),
          projectId: activeProject?.id || 'default',
          lastMessagePreview: content || (fileIds.length > 0 ? '[Image]' : ''),
          lastMessageAt: Date.now(),
          isPinned: false,
          messageCount: 2,
        });
        
        // If we were on the base /chat page, navigate to the new conversation
        if (!conversationId) {
          router.push(`/chat/${convId}`);
        }
      }

      if (connectionState === 'connected') {
        wsClient.send({
          type: 'chat',
          conversationId: convId,
          content,
          projectId: activeProject?.id || 'default',
          fileIds: fileIds.length > 0 ? fileIds : undefined,
        });
      }
      clearFiles();
    },
    [currentConversationId, conversationId, router, conversations, addMessage, addConversation, updateConversation, connectionState, getUploadedIds, clearFiles, setInProgressMessageId, activeProject?.id]
  );

  const messages = currentConversationId
    ? getMessagesByConversation(currentConversationId)
    : [];

  const timelineItems = useMemo(() => {
    const items = messages.map((msg) => ({
      type: 'message' as const,
      id: msg.id,
      timestamp: msg.timestamp,
      data: msg,
    }));
    return items.sort((a, b) => a.timestamp - b.timestamp);
  }, [messages]);

  if (messages.length === 0) {
    return <EmptyState onSuggestion={handleSendMessage} />;
  }

  return (
    <div className={styles.container} ref={setSwipeRef}>
      <SwipeBackOverlay
        progress={gestureProgress}
        visible={swipeVisible}
        onRelease={handleSwipeBack}
        onCancel={() => {
          setSwipeVisible(false);
        }}
      />
      <div className={styles.messagesContainer}>
        {timelineItems.map((item) => {
          return <MessageBubble key={item.id} message={item.data} />;
        })}
        {isStreaming() && (
          <div className={styles.streamingIndicator}>
            <div className={styles.dots}>
              <span className={styles.dot} />
              <span className={styles.dot} />
              <span className={styles.dot} />
            </div>
            <span className={styles.streamingText}>pi is thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className={styles.inputContainer}>
        <ChatInput
          onSend={handleSendMessage}
          disabled={isStreaming()}
          isStreaming={isStreaming()}
          onStop={handleStopStreaming}
        />
      </div>
    </div>
  );
}
