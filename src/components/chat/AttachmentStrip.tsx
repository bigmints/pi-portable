'use client';

import { X } from 'lucide-react';
import { useAttachmentsStore, type PendingFile } from '@/store/attachments';
import styles from './AttachmentStrip.module.css';

interface AttachmentStripProps {
  onRemove?: (id: string) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function truncateFilename(name: string, maxLength: number = 20): string {
  if (name.length <= maxLength) return name;
  const extIndex = name.lastIndexOf('.');
  if (extIndex > 0 && name.length - extIndex <= 6) {
    // Keep extension, truncate stem
    const stem = name.slice(0, extIndex);
    const ext = name.slice(extIndex);
    const maxStem = maxLength - ext.length - 1;
    return `${stem.slice(0, maxStem)}…${ext}`;
  }
  return `${name.slice(0, maxLength - 1)}…`;
}

function FilePill({ file, onRemove }: { file: PendingFile; onRemove: (id: string) => void }) {
  const isUploading = !file.uploadedId;
  return (
    <div className={`${styles.pill} ${isUploading ? styles.uploading : ''}`}>
      {file.previewUrl && (
        <img
          src={file.previewUrl}
          alt=""
          className={styles.thumbnail}
        />
      )}
      <div className={styles.pillInfo}>
        <span className={styles.pillName}>{truncateFilename(file.name)}</span>
        <span className={styles.pillSize}>{formatFileSize(file.size)}</span>
      </div>
      <button
        className={styles.removeButton}
        onClick={() => onRemove(file.id)}
        aria-label={`Remove ${file.name}`}
      >
        <X size={14} strokeWidth={1.5} />
      </button>
    </div>
  );
}

export default function AttachmentStrip({ onRemove }: AttachmentStripProps) {
  const { files, removeFile } = useAttachmentsStore();

  if (files.length === 0) return null;

  const handleRemove = (id: string) => {
    removeFile(id);
    onRemove?.(id);
  };

  return (
    <div className={styles.strip} role="list" aria-label="Attached files">
      {files.map((file) => (
        <FilePill key={file.id} file={file} onRemove={handleRemove} />
      ))}
    </div>
  );
}
