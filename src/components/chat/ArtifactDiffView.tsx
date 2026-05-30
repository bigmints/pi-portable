'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import styles from './ArtifactDiffView.module.css';

interface ArtifactDiffViewProps {
  diffContent: string;
  added: number;
  removed: number;
  maxPreviewLines?: number;
}

interface ParsedLine {
  type: 'added' | 'removed' | 'context' | 'header';
  lineNumber: string;
  content: string;
}

function parseDiffLines(diffContent: string): ParsedLine[] {
  const lines = diffContent.split('\n');
  const parsed: ParsedLine[] = [];
  let oldLine = 0;
  let newLine = 0;

  for (const raw of lines) {
    const line = raw;
    if (line.startsWith('+++') || line.startsWith('---')) {
      parsed.push({ type: 'header', lineNumber: '', content: line });
      continue;
    }

    const match = line.match(/^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
    if (match) {
      oldLine = parseInt(match[1], 10);
      newLine = parseInt(match[2], 10);
      parsed.push({ type: 'context', lineNumber: '', content: line });
      continue;
    }

    if (line.startsWith('+')) {
      parsed.push({
        type: 'added',
        lineNumber: String(newLine),
        content: line,
      });
      newLine++;
    } else if (line.startsWith('-')) {
      parsed.push({
        type: 'removed',
        lineNumber: String(oldLine),
        content: line,
      });
      oldLine++;
    } else {
      parsed.push({
        type: 'context',
        lineNumber: String(newLine),
        content: line,
      });
      oldLine++;
      newLine++;
    }
  }

  return parsed;
}

export default function ArtifactDiffView({
  diffContent,
  added,
  removed,
  maxPreviewLines = 20,
}: ArtifactDiffViewProps) {
  const [expanded, setExpanded] = useState(false);
  const parsedLines = parseDiffLines(diffContent);
  const contentLines = parsedLines.filter((l) => l.type !== 'header');
  const previewLines = contentLines.slice(0, maxPreviewLines);
  const isTruncated = contentLines.length > maxPreviewLines;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.badges}>
          <span className={styles.badgeAdded}>+{added}</span>
          <span className={styles.badgeRemoved}>-{removed}</span>
        </div>
        {isTruncated && (
          <button
            className={styles.toggleBtn}
            onClick={() => setExpanded((prev) => !prev)}
            aria-label={expanded ? 'Show less' : 'Show more'}
          >
            {expanded ? (
              <>
                <ChevronUp size={14} /> Less
              </>
            ) : (
              <>
                <ChevronDown size={14} /> More ({contentLines.length - maxPreviewLines} more)
              </>
            )}
          </button>
        )}
      </div>
      <div className={styles.diffLines}>
        {(expanded ? contentLines : previewLines).map((line, i) => {
          if (line.type === 'header') return null;
          return (
            <div key={i} className={`${styles.line} ${styles[line.type]}`}>
              <span className={styles.lineNumber}>{line.lineNumber}</span>
              <span className={styles.lineContent}>{line.content}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
