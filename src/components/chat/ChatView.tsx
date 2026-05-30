'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMessagesStore } from '@/store/messages';
import { useConversationsStore } from '@/store/conversations';
import { useConnectionStore } from '@/store/connection';
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
  const [swipeProgress, setSwipeProgress] = useState(0);
  const [swipeVisible, setSwipeVisible] = useState(false);
  const messagesMap = useMessagesStore((s) => s.messages);
  const isStreaming = useMessagesStore((s) => s.isStreaming);
  const inProgressMessageId = useMessagesStore((s) => s.inProgressMessageId);
  const addMessage = useMessagesStore((s) => s.addMessage);
  const setActiveConversationId = useMessagesStore((s) => s.setActiveConversationId);
  const getMessagesByConversation = useMessagesStore((s) => s.getMessagesByConversation);
  const markInterrupted = useMessagesStore((s) => s.markInterrupted);
  const setInterrupting = useMessagesStore((s) => s.setInterrupting);
  const { conversations, selectedId, addConversation, updateConversation, clearSelection } =
    useConversationsStore();
  const { state: connectionState } = useConnectionStore();

  const currentConversationId = conversationId || selectedId;

  // Swipe-back gesture — navigate back from a conversation
  const handleSwipeBack = useCallback(() => {
    clearSelection();
    router.push('/chat');
  }, [clearSelection, router]);

  const { progress: gestureProgress, setElementRef: setSwipeRef } = useSwipeGesture({
    onSwipeRight: (p) => {
      setSwipeProgress(p);
      setSwipeVisible(true);
    },
    onSwipeRightComplete: () => {
      handleSwipeBack();
      setSwipeProgress(0);
      setSwipeVisible(false);
    },
    onGestureEnd: () => {
      setSwipeProgress(0);
      setSwipeVisible(false);
    },
    enabled: !!currentConversationId,
  });

  useEffect(() => {
    if (currentConversationId) {
      setActiveConversationId(currentConversationId);
    }
  }, [currentConversationId, setActiveConversationId]);

  // Set up WebSocket message handler
  useEffect(() => {
    const handler = (frame: WsInboundFrame) => {
      switch (frame.type) {
        case 'message_start':
        case 'message_update':
        case 'message_end':
        case 'agent_end':
          // Handled globally by wsClient routeFrame and wired directly to useMessagesStore
          break;
      }
    };
    wsClient.onMessage(handler);
  }, []);

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

      const existing = conversations.find((c) => c.id === convId);
      if (existing) {
        updateConversation(convId, {
          lastMessagePreview: content,
          lastMessageAt: Date.now(),
          messageCount: existing.messageCount + 2,
        });
      } else {
        addConversation({
          id: convId,
          title: content.slice(0, 40),
          projectId: 'default',
          lastMessagePreview: content,
          lastMessageAt: Date.now(),
          isPinned: false,
          messageCount: 2,
        });
      }

      if (connectionState === 'connected') {
        wsClient.send({
          type: 'chat',
          conversationId: convId,
          content,
          projectId: 'default',
        });
      }
    },
    [currentConversationId, conversations, addMessage, addConversation, updateConversation, connectionState]
  );

  const messages = currentConversationId
    ? getMessagesByConversation(currentConversationId)
    : [];

  if (!currentConversationId && messages.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className={styles.container} ref={setSwipeRef}>
      <SwipeBackOverlay
        progress={gestureProgress}
        visible={swipeVisible}
        onRelease={handleSwipeBack}
        onCancel={() => {
          setSwipeProgress(0);
          setSwipeVisible(false);
        }}
      />
      <div className={styles.messagesContainer}>
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
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
