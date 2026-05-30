'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { ChatMessage, ToolCallMessage, ToolCallData } from '@/types/chat';
import type { AnyMessage } from '@/store/messages';
import ToolCallAnnotation from './ToolCallAnnotation';
import ToolCallCard from './ToolCallCard';
import styles from './MessageBubble.module.css';

interface MessageBubbleProps {
  message: AnyMessage;
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isLegacyToolCall = !('role' in message);

  if (isLegacyToolCall) {
    return <ToolCallBubble message={message as ToolCallMessage} />;
  }

  const chatMsg = message as ChatMessage;
  const isUser = chatMsg.role === 'user';
  const isAssistant = chatMsg.role === 'assistant';

  return (
    <div className={`${styles.bubble} ${isUser ? styles.user : styles.assistant}`}>
      <div className={styles.content}>
        {isAssistant ? (
          <div className={styles.markdownContent}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {chatMsg.content}
            </ReactMarkdown>
          </div>
        ) : (
          <span>{chatMsg.content}</span>
        )}
      </div>
      
      {isAssistant && chatMsg.toolCalls && chatMsg.toolCalls.length > 0 && (
        <div className={styles.toolCallsContainer}>
          {chatMsg.toolCalls.map((tc) => (
            <ToolCallCard key={tc.id} toolCall={tc} />
          ))}
        </div>
      )}

      <div className={styles.metadata}>
        <span className={styles.role}>
          {isUser ? 'You' : 'pi'}
        </span>
        <span className={styles.time}>
          {formatTime(chatMsg.timestamp)}
        </span>
      </div>
      {chatMsg.status === 'error' && (
        <div className={styles.errorBadge}>Message failed</div>
      )}
      {chatMsg.interrupted && (
        <div className={styles.interruptedBadge}>interrupted</div>
      )}
    </div>
  );
}

function ToolCallBubble({ message }: { message: ToolCallMessage }) {
  const toolCalls: ToolCallData[] = message.toolCalls.map((tc) => ({
    toolName: tc.toolName,
    input: tc.input,
    output: tc.output as Record<string, unknown> | string | undefined,
    error: tc.error,
    durationMs: tc.durationMs,
    status: ((tc.status as string) === 'success' || tc.status === 'complete')
      ? 'completed' as const
      : (tc.status === 'running' ? 'running' as const : 'error' as const),
  }));

  const hasError = message.status === 'error';

  return (
    <div className={`${styles.bubble} ${styles.toolCall}`}>
      <ToolCallAnnotation toolCalls={toolCalls} />
      <div className={styles.metadata}>
        <span className={styles.role}>Tool</span>
        <span className={styles.time}>{formatTime(message.timestamp)}</span>
      </div>
      {hasError && (
        <div className={styles.errorBadge}>Tool call failed</div>
      )}
    </div>
  );
}
