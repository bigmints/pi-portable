'use client';

import { useState, useCallback } from 'react';
import { Wrench, ChevronDown, ChevronUp, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import type { ToolCall } from '@/types/chat';
import styles from './ToolCallCard.module.css';

interface ToolCallCardProps {
  toolCall: ToolCall;
}

export default function ToolCallCard({ toolCall }: ToolCallCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const { toolName, status, input, output, error } = toolCall;

  return (
    <div className={`${styles.card} ${styles[status]}`}>
      <button 
        onClick={toggleExpanded} 
        className={styles.header}
        type="button"
        aria-expanded={isExpanded}
      >
        <div className={styles.headerLeft}>
          <Wrench className={styles.wrenchIcon} size={16} />
          <span className={styles.toolName}>{toolName}</span>
        </div>
        
        <div className={styles.headerRight}>
          {status === 'running' && (
            <Loader2 className={`${styles.statusIcon} ${styles.spinner}`} size={16} />
          )}
          {status === 'complete' && (
            <CheckCircle className={`${styles.statusIcon} ${styles.completeIcon}`} size={16} />
          )}
          {status === 'error' && (
            <XCircle className={`${styles.statusIcon} ${styles.errorIcon}`} size={16} />
          )}
          {isExpanded ? (
            <ChevronUp className={styles.chevron} size={16} />
          ) : (
            <ChevronDown className={styles.chevron} size={16} />
          )}
        </div>
      </button>

      <div className={`${styles.contentWrapper} ${isExpanded ? styles.expanded : ''}`}>
        <div className={styles.content}>
          <div className={styles.section}>
            <span className={styles.sectionTitle}>Parameters</span>
            <pre className={styles.pre}>
              {JSON.stringify(input, null, 2)}
            </pre>
          </div>

          {status === 'complete' && output && (
            <div className={styles.section}>
              <span className={styles.sectionTitle}>Result</span>
              <pre className={`${styles.pre} ${styles.outputPre}`}>
                {output}
              </pre>
            </div>
          )}

          {status === 'error' && error && (
            <div className={styles.section}>
              <span className={styles.sectionTitle}>Error</span>
              <pre className={`${styles.pre} ${styles.errorPre}`}>
                {error}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
