'use client';

import { useState } from 'react';
import { Copy, ExternalLink, Expand, Check } from 'lucide-react';
// @ts-ignore - react-syntax-highlighter types are incomplete
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// @ts-ignore - react-syntax-highlighter types are incomplete
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/hljs';
import { detectLanguage, isImageFile } from '@/lib/detect-language';
import { getFileIcon } from '@/lib/file-icons';
import ArtifactDiffView from './ArtifactDiffView';
import type { ArtifactFile } from '@/types/chat';
import styles from './ArtifactCard.module.css';

const MAX_PREVIEW_LINES = 20;

interface ArtifactCardProps {
  artifact: ArtifactFile;
  onExpand?: (artifact: ArtifactFile) => void;
}

export default function ArtifactCard({ artifact, onExpand }: ArtifactCardProps) {
  const [copied, setCopied] = useState(false);

  const language = detectLanguage(artifact.filename);
  const isImage = isImageFile(artifact.filename);
  const isModified = artifact.isModified && artifact.diffContent;

  const lines = artifact.content.split('\n');
  const previewLines = lines.slice(0, MAX_PREVIEW_LINES);
  const previewCode = previewLines.join('\n');
  const isTruncated = lines.length > MAX_PREVIEW_LINES;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(artifact.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const ta = document.createElement('textarea');
      ta.value = artifact.content;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleExpand = () => {
    if (onExpand) {
      onExpand(artifact);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.icon}>
          {getFileIcon(artifact.filename)}
        </div>

        <div className={styles.filenameSection}>
          <span className={styles.filename} title={artifact.path}>
            {artifact.filename}
          </span>
          <span className={`${styles.badge} ${styles.languageBadge}`}>
            {language}
          </span>
          {!isImage && (
            <span className={`${styles.badge} ${styles.lineCountBadge}`}>
              {artifact.lineCount} lines
            </span>
          )}
          {isModified && (
            <span className={styles.diffBadge}>
              <span className={styles.diffAdded}>+{artifact.diffAdded ?? 0}</span>
              <span className={styles.diffRemoved}>-{artifact.diffRemoved ?? 0}</span>
            </span>
          )}
        </div>

        <div className={styles.actions}>
          <button
            className={styles.actionBtn}
            onClick={handleCopy}
            aria-label="Copy content"
          >
            {copied ? (
              <>
                <Check size={14} />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy size={14} />
                <span>Copy</span>
              </>
            )}
          </button>
          <button
            className={styles.actionBtn}
            onClick={handleExpand}
            aria-label="Expand file"
          >
            <Expand size={14} />
            <span>Expand</span>
          </button>
        </div>
      </div>

      <div className={styles.body}>
        {isImage ? (
          <div className={styles.imagePreview}>
            {artifact.imageUrl ? (
              <img
                src={artifact.imageUrl}
                alt={artifact.filename}
                onClick={handleExpand}
                className={styles.image}
              />
            ) : (
              <div className={styles.imagePlaceholder}>
                <ExternalLink size={16} />
                <span>{artifact.filename}</span>
              </div>
            )}
          </div>
        ) : isModified ? (
          <ArtifactDiffView
            diffContent={artifact.diffContent!}
            added={artifact.diffAdded ?? 0}
            removed={artifact.diffRemoved ?? 0}
            maxPreviewLines={MAX_PREVIEW_LINES}
          />
        ) : artifact.content ? (
          <>
            <div className={styles.codeBlock}>
              <SyntaxHighlighter
                language={language}
                style={oneDark}
                customStyle={{
                  margin: 0,
                  padding: '0.5rem 1rem',
                  background: 'transparent',
                  fontSize: 'var(--font-size-xs)',
                }}
                showLineNumbers
                startingLine={1}
              >
                {previewCode}
              </SyntaxHighlighter>
            </div>
            {isTruncated && (
              <div className={styles.truncated}>
                ... {lines.length - MAX_PREVIEW_LINES} more lines
              </div>
            )}
          </>
        ) : (
          <div className={styles.empty}>No content available</div>
        )}
      </div>
    </div>
  );
}
