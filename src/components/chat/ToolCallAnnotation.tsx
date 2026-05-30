'use client';

import { useState, useCallback, useMemo } from 'react';
import { Wrench, ChevronDown, ChevronUp, Copy, Check, AlertCircle } from 'lucide-react';
import SyntaxHighlighter from 'react-syntax-highlighter/dist/esm/prism';
import oneDark from 'react-syntax-highlighter/dist/esm/styles/prism/one-dark';
import oneLight from 'react-syntax-highlighter/dist/esm/styles/prism/one-light';
import styles from './ToolCallAnnotation.module.css';

interface ToolCallData {
  toolName: string;
  input: Record<string, unknown>;
  output?: Record<string, unknown> | string;
  error?: string;
  durationMs?: number;
  status: 'running' | 'completed' | 'error';
}

interface ToolCallAnnotationProps {
  toolCalls: ToolCallData[];
  defaultExpanded?: boolean;
}

export default function ToolCallAnnotation({
  toolCalls,
  defaultExpanded = false,
}: ToolCallAnnotationProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const toggleExpand = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  const handleCopy = useCallback(
    async (text: string, field: string) => {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    },
    [],
  );

  const getSummary = (tc: ToolCallData): string => {
    if (tc.status === 'error') return tc.error || 'Error';
    if (tc.status === 'running') return 'Running...';
    if (tc.output) {
      const outputStr =
        typeof tc.output === 'string' ? tc.output : JSON.stringify(tc.output);
      return outputStr.length > 60
        ? outputStr.slice(0, 60) + '...'
        : outputStr;
    }
    return 'No output';
  };

  const isDark = useMemo(() => {
    if (typeof window === 'undefined') return true;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }, []);
  const hljsStyle = isDark ? oneDark : oneLight;

  const totalDuration = toolCalls.reduce(
    (sum, tc) => sum + (tc.durationMs || 0),
    0,
  );
  const hasError = toolCalls.some((tc) => tc.status === 'error');
  const toolNames = [...new Set(toolCalls.map((tc) => tc.toolName))];

  return (
    <div
      className={`${styles.container} ${hasError ? styles.errorState : ''}`}
    >
      <div
        className={styles.header}
        onClick={toggleExpand}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && toggleExpand()}
      >
        <div className={styles.headerLeft}>
          <Wrench size={16} />
          <span className={styles.toolChip}>{toolNames.join(', ')}</span>
          {hasError && <AlertCircle size={16} className={styles.errorIcon} />}
          <span className={styles.summary}>
            {toolCalls.map(getSummary).join(' | ')}
          </span>
        </div>
        <div className={styles.headerRight}>
          {totalDuration > 0 && (
            <span className={styles.durationBadge}>{totalDuration}ms</span>
          )}
          {expanded ? (
            <ChevronUp size={16} />
          ) : (
            <ChevronDown size={16} />
          )}
        </div>
      </div>
      {expanded && (
        <div className={styles.panels}>
          {toolCalls.map((tc, i) => (
            <div key={i} className={styles.toolCallGroup}>
              <div className={styles.panel}>
                <div className={styles.panelHeader}>
                  <span className={styles.panelTitle}>
                    Input — {tc.toolName}
                  </span>
                  <button
                    className={styles.copyBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy(JSON.stringify(tc.input, null, 2), `input-${i}`);
                    }}
                  >
                    {copiedField === `input-${i}` ? (
                      <Check size={14} />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                </div>
                <SyntaxHighlighter
                  language="json"
                  style={hljsStyle}
                  customStyle={{ background: 'transparent', margin: 0 }}
                >
                  {JSON.stringify(tc.input, null, 2)}
                </SyntaxHighlighter>
              </div>
              <div className={styles.panel}>
                <div className={styles.panelHeader}>
                  <span className={styles.panelTitle}>
                    {tc.status === 'error' ? 'Error' : 'Output'}
                  </span>
                  <button
                    className={styles.copyBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy(
                        tc.error || JSON.stringify(tc.output, null, 2),
                        `output-${i}`,
                      );
                    }}
                  >
                    {copiedField === `output-${i}` ? (
                      <Check size={14} />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                </div>
                {tc.status === 'error' ? (
                  <div className={styles.errorOutput}>{tc.error}</div>
                ) : (
                  <SyntaxHighlighter
                    language="json"
                    style={hljsStyle}
                    customStyle={{ background: 'transparent', margin: 0 }}
                  >
                    {JSON.stringify(tc.output || {}, null, 2)}
                  </SyntaxHighlighter>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
