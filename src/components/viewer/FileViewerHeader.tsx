/**
 * FileViewerHeader — header bar with language badge, file path, and toolbar
 */

'use client';

import { Copy, Download, GitCompare, ExternalLink, X } from 'lucide-react';
import { useFileViewerStore, type ViewerFile } from '@/store/file-viewer';
import styles from './FileViewerHeader.module.css';

interface FileViewerHeaderProps {
  file: ViewerFile;
}

export default function FileViewerHeader({ file }: FileViewerHeaderProps) {
  const { closeFile, viewMode, setViewMode } = useFileViewerStore();

  const hasDiff = !!file.originalContent;

  // Copy all content to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(file.content);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = file.content;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
  };

  // Download file
  const handleDownload = () => {
    const blob = new Blob([file.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.path.split('/').pop() || 'file';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Open in VS Code
  const handleOpenInVSCode = () => {
    const vscodeUrl = `vscode://file/${file.path}`;
    window.open(vscodeUrl, '_blank');
  };

  return (
    <div className={styles.header}>
      {/* Left: language badge + file path */}
      <div className={styles.left}>
        <span className={styles.badge}>{file.language}</span>
        <span className={styles.path} title={file.path}>
          {file.path}
        </span>
      </div>

      {/* Right: toolbar actions */}
      <div className={styles.toolbar}>
        <button
          className={styles.toolButton}
          onClick={handleCopy}
          aria-label="Copy all content"
          title="Copy all"
        >
          <Copy size={16} strokeWidth={1.5} />
        </button>

        <button
          className={styles.toolButton}
          onClick={handleDownload}
          aria-label="Download file"
          title="Download"
        >
          <Download size={16} strokeWidth={1.5} />
        </button>

        {hasDiff && (
          <button
            className={`${styles.toolButton} ${viewMode === 'diff' ? styles.active : ''}`}
            onClick={() => setViewMode(viewMode === 'diff' ? 'full' : 'diff')}
            aria-label="Toggle diff view"
            title="Toggle diff"
          >
            <GitCompare size={16} strokeWidth={1.5} />
          </button>
        )}

        <button
          className={styles.toolButton}
          onClick={handleOpenInVSCode}
          aria-label="Open in VS Code"
          title="Open in VS Code"
        >
          <ExternalLink size={16} strokeWidth={1.5} />
        </button>

        <button
          className={styles.closeButton}
          onClick={closeFile}
          aria-label="Close viewer"
          title="Close"
        >
          <X size={16} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}
