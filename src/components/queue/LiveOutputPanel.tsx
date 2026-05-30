/**
 * Live output panel — real-time display of queue task execution
 */

'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useQueueOutputStore } from '@/store/queue-output';
import DurationCounter from './DurationCounter';
import OutputLineRenderer from './OutputLineRenderer';
import { Play, ExternalLink, AlertTriangle, Loader2 } from 'lucide-react';
import styles from './LiveOutputPanel.module.css';

export default function LiveOutputPanel() {
  const router = useRouter();
  const {
    activeTask,
    outputLines,
    status,
    startedAt,
    conversationId,
    currentPosition,
    totalTasks,
    errorMessage,
    resetToIdle,
  } = useQueueOutputStore();

  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new output
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [outputLines]);

  // Truncate long instructions for the header
  const truncated = activeTask?.prompt
    ? activeTask.prompt.length > 60
      ? activeTask.prompt.slice(0, 60) + '…'
      : activeTask.prompt
    : 'Running…';

  // Idle state
  if (status === 'idle') {
    return (
      <div className={styles.panel}>
        <div className={styles.idleState}>
          <Play size={32} className={styles.idleIcon} />
          <p>Queue is ready — press Run to start</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.panel}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.positionBadge}>
            {currentPosition}/{totalTasks || '—'}
          </span>
          <span className={styles.instruction}>{truncated}</span>
        </div>
        <div className={styles.headerRight}>
          {status === 'running' && startedAt && (
            <DurationCounter startedAt={startedAt} />
          )}
          {status === 'running' && (
            <Loader2 size={14} className={styles.spinner} />
          )}
          {status === 'completed' && conversationId && (
            <button
              className={styles.viewChatBtn}
              onClick={() => router.push(`/chat/${conversationId}`)}
            >
              <ExternalLink size={12} />
              View in Chat
            </button>
          )}
          {status === 'error' && (
            <AlertTriangle size={14} className={styles.errorIcon} />
          )}
        </div>
      </div>

      {/* Body — output lines */}
      <div className={styles.body} ref={scrollRef}>
        {outputLines.map((line, i) => (
          <OutputLineRenderer
            key={i}
            line={line}
            isLast={i === outputLines.length - 1 && status === 'running'}
          />
        ))}
        {outputLines.length === 0 && status === 'running' && (
          <div className={styles.placeholder}>Waiting for output…</div>
        )}
        {status === 'error' && errorMessage && (
          <div className={styles.errorBlock}>
            <AlertTriangle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Footer — clear button when not running */}
      {status !== 'running' && (
        <div className={styles.footer}>
          <button className={styles.resetBtn} onClick={resetToIdle}>
            Clear
          </button>
        </div>
      )}
    </div>
  );
}
