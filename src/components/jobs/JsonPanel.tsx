'use client';

// @ts-ignore - react-syntax-highlighter types are incomplete
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// @ts-ignore - react-syntax-highlighter types are incomplete
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import styles from './JsonPanel.module.css';

interface JsonPanelProps {
  title: string;
  data: Record<string, unknown>;
}

export default function JsonPanel({ title, data }: JsonPanelProps) {
  const jsonStr = JSON.stringify(data, null, 2);

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.label}>{title}</span>
      </div>
      <div className={styles.codeContainer}>
        <SyntaxHighlighter
          language="json"
          style={oneDark}
          customStyle={{
            padding: '8px',
            margin: 0,
            fontSize: '11px',
            lineHeight: '1.5',
            background: 'var(--color-surface-1)',
            borderRadius: '0 0 8px 8px',
          }}
          codeTagProps={{ className: styles.pre }}
        >
          {jsonStr}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
