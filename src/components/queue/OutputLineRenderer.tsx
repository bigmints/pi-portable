/**
 * Output line renderer — renders individual output lines with appropriate styling
 */

'use client';

import { Wrench, MessageSquare } from 'lucide-react';
import styles from './OutputLineRenderer.module.css';
import type { OutputLine } from '@/types/chat';

interface OutputLineRendererProps {
  line: OutputLine;
  isLast: boolean;
}

export default function OutputLineRenderer({ line, isLast }: OutputLineRendererProps) {
  switch (line.type) {
    case 'user':
      return (
        <div className={styles.userMessage}>
          <div className={styles.userBubble}>
            <span className={styles.userIcon}>
              <MessageSquare size={14} />
            </span>
            <span className={styles.userContent}>{line.content}</span>
          </div>
        </div>
      );

    case 'assistant':
      return (
        <div className={styles.assistantMessage}>
          <div className={`${styles.assistantBubble} ${isLast ? styles.streaming : ''}`}>
            <span className={styles.assistantContent}>{line.content}</span>
            {isLast && <span className={styles.cursor} />}
          </div>
        </div>
      );

    case 'tool-call':
      return (
        <div className={styles.toolCall}>
          <span className={styles.toolIcon}>
            <Wrench size={12} />
          </span>
          <span className={styles.toolName}>{line.toolName ?? 'tool'}</span>
          <span className={styles.toolContent}>{line.content}</span>
        </div>
      );

    case 'tool-result':
      return (
        <div className={styles.toolResult}>
          <span className={styles.toolIcon}>
            <Wrench size={12} />
          </span>
          <span className={`${styles.toolName} ${styles.toolNameDone}`}>{line.toolName ?? 'tool'}</span>
          <span className={styles.toolContent}>{line.content}</span>
        </div>
      );

    default:
      return null;
  }
}
