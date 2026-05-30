'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Copy, RefreshCw, GitFork, Edit, Check } from 'lucide-react';
import type { ChatMessage } from '@/types/chat';
import { showToast } from '@/components/common/Toast';
import styles from './MessageActionBar.module.css';

interface MessageActionBarProps {
  message: ChatMessage;
  onCopy?: () => void;
  onRetry?: () => void;
  onEdit?: () => void;
  onFork?: () => void;
}

export default function MessageActionBar({
  message,
  onCopy,
  onRetry,
  onEdit,
  onFork,
}: MessageActionBarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartTime = useRef<number>(0);
  const isTouching = useRef(false);

  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(message.content).then(() => {
      setCopied(true);
      showToast('Copied ✓', 'success');
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = message.content;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      showToast('Copied ✓', 'success');
      setTimeout(() => setCopied(false), 2000);
    });
    onCopy?.();
  }, [message.content, onCopy]);

  const handleTouchStart = useCallback(() => {
    isTouching.current = true;
    touchStartTime.current = Date.now();
    longPressTimer.current = setTimeout(() => {
      if (isTouching.current) {
        setIsMobileMenuOpen(true);
      }
    }, 500);
  }, []);

  const handleTouchEnd = useCallback(() => {
    isTouching.current = false;
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      {/* Desktop hover bar */}
      <div
        className={styles.desktopBar}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <button
          className={`${styles.actionButton} ${copied ? styles.copied : ''}`}
          data-tooltip="Copy"
          onClick={handleCopy}
          aria-label="Copy message"
        >
          {copied ? <Check size={14} strokeWidth={1.5} /> : <Copy size={14} strokeWidth={1.5} />}
        </button>

        {isAssistant && onRetry && (
          <button
            className={styles.actionButton}
            data-tooltip="Retry"
            onClick={onRetry}
            aria-label="Retry message"
          >
            <RefreshCw size={14} strokeWidth={1.5} />
          </button>
        )}

        {isUser && onEdit && (
          <button
            className={styles.actionButton}
            data-tooltip="Edit"
            onClick={onEdit}
            aria-label="Edit message"
          >
            <Edit size={14} strokeWidth={1.5} />
          </button>
        )}

        {onFork && (
          <button
            className={styles.actionButton}
            data-tooltip="Fork"
            onClick={onFork}
            aria-label="Fork conversation"
          >
            <GitFork size={14} strokeWidth={1.5} />
          </button>
        )}
      </div>

      {/* Mobile bottom sheet */}
      {isMobileMenuOpen && (
        <div className={styles.mobileSheetOverlay} onClick={() => setIsMobileMenuOpen(false)}>
          <div className={styles.mobileSheet} onClick={(e) => e.stopPropagation()}>
            <div className={styles.sheetHandle} />
            <div className={styles.sheetTitle}>Message actions</div>

            <button className={styles.sheetButton} onClick={handleCopy}>
              <Copy size={18} strokeWidth={1.5} />
              <span>Copy</span>
            </button>

            {isAssistant && onRetry && (
              <button className={styles.sheetButton} onClick={onRetry}>
                <RefreshCw size={18} strokeWidth={1.5} />
                <span>Retry</span>
              </button>
            )}

            {isUser && onEdit && (
              <button className={styles.sheetButton} onClick={onEdit}>
                <Edit size={18} strokeWidth={1.5} />
                <span>Edit</span>
              </button>
            )}

            {onFork && (
              <button className={styles.sheetButton} onClick={onFork}>
                <GitFork size={18} strokeWidth={1.5} />
                <span>Fork conversation</span>
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
