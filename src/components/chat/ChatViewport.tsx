'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import { ChevronUp } from 'lucide-react';
import { useMessagesStore } from '@/store/messages';
import type { ChatMessage, ToolCallMessage } from '@/types/chat';
import MessageBubble from './MessageBubble';
import ToolCallAnnotation from './ToolCallAnnotation';
import styles from './ChatViewport.module.css';

interface ChatViewportProps {
  conversationId: string;
}

export default function ChatViewport({ conversationId }: ChatViewportProps) {
  const { getMessagesByConversation, isStreaming } = useMessagesStore();
  const messages = getMessagesByConversation(conversationId);
  const viewportRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const scrollToBottom = useCallback(() => {
    viewportRef.current?.scrollTo({
      top: viewportRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, []);

  useEffect(() => {
    if (isStreaming() && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isStreaming]);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const handleScroll = () => {
      const threshold = 200;
      const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
      setShowScrollButton(!isNearBottom);
    };

    el.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  if (messages.length === 0) {
    return (
      <div className={styles.viewport}>
        <div className={styles.emptyState}>
          <div className={styles.emptyContent}>
            <div className={styles.emptyIcon}>
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="20" stroke="var(--color-brand)" strokeWidth={2} />
                <path
                  d="M16 20c0-4.4 3.6-8 8-8s8 3.6 8 8c0 4-3 6-6 7.5L24 30l-2-0.5c-3-1.5-6-3.5-6-7.5z"
                  fill="var(--color-brand)"
                />
                <circle cx="20" cy="18" r="1.5" fill="white" />
                <circle cx="28" cy="18" r="1.5" fill="white" />
              </svg>
            </div>
            <h1 className={styles.emptyTitle}>Welcome to pi-app</h1>
            <p className={styles.emptySubtitle}>
              Start a conversation by typing a message below.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.viewport} ref={viewportRef}>
      <div className={styles.messageList}>
        {messages.map((msg) => {
          if ('toolCalls' in msg) {
            const tc = msg as ToolCallMessage;
            return <ToolCallAnnotation key={msg.id} toolCalls={tc.toolCalls.map(t => ({
              toolName: t.toolName,
              input: t.input,
              output: t.output as Record<string, unknown> | string | undefined,
              error: t.error,
              durationMs: t.durationMs,
              status: t.status === 'running' ? 'running' : ((t.status as string) === 'success' || t.status === 'complete') ? 'completed' : 'error',
            }))} />;
          }
          return <MessageBubble key={msg.id} message={msg as ChatMessage} />;
        })}
        <div ref={bottomRef} />
      </div>

      {showScrollButton && (
        <button
          className={styles.scrollButton}
          onClick={scrollToBottom}
          aria-label="Scroll to bottom"
        >
          <ChevronUp size={16} strokeWidth={1.5} />
        </button>
      )}
    </div>
  );
}
