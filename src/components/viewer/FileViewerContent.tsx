/**
 * FileViewerContent — scrollable content area with line numbers and syntax highlighting
 */

'use client';

// @ts-ignore - react-syntax-highlighter types are incomplete
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// @ts-ignore - react-syntax-highlighter types are incomplete
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { useFileViewerStore, type ViewerFile } from '@/store/file-viewer';
import { computeUnifiedDiff, type DiffLine } from '@/lib/compute-diff';
import DiffView from './DiffView';
import styles from './FileViewerContent.module.css';

interface FileViewerContentProps {
  file: ViewerFile;
}

export default function FileViewerContent({ file }: FileViewerContentProps) {
  const { viewMode } = useFileViewerStore();

  const lines = file.content.split('\n');
  const lineCount = lines.length;

  // Compute diff lines when in diff mode
  const diffLines: DiffLine[] = file.originalContent
    ? computeUnifiedDiff(file.originalContent, file.content)
    : [];

  if (viewMode === 'diff' && file.originalContent) {
    return <DiffView diffLines={diffLines} />;
  }

  return (
    <div className={styles.content} role="region" aria-label="File content">
      {/* Line numbers gutter */}
      <div className={styles.gutter}>
        {lines.map((_, idx) => (
          <span key={idx} className={styles.lineNum}>
            {idx + 1}
          </span>
        ))}
      </div>

      {/* Syntax-highlighted content */}
      <div className={styles.code}>
        <SyntaxHighlighter
          language={file.language}
          style={oneDark}
          customStyle={{
            margin: 0,
            padding: 'var(--space-md)',
            background: 'transparent',
            fontSize: 'var(--font-size-sm)',
            lineHeight: '1.6',
          }}
          wrapLongLines={true}
          showLineNumbers={false}
          codeTagProps={{
            style: {
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
            },
          }}
        >
          {file.content}
        </SyntaxHighlighter>
      </div>

      {/* Line count footer */}
      <div className={styles.footer}>
        <span>{lineCount} line{lineCount !== 1 ? 's' : ''}</span>
        {file.size != null && (
          <span>{formatSize(file.size)}</span>
        )}
      </div>
    </div>
  );
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
