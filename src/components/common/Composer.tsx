'use client';

import {
  useRef,
  useState,
  useCallback,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { Send, Square } from 'lucide-react';
import styles from './Composer.module.css';

export interface ComposerHandle {
  insertText: (text: string) => void;
  focus: () => void;
}

interface ComposerProps {
  placeholder?: string;
  onSubmit: (_content: string) => void;
  autoFocus?: boolean;
  disabled?: boolean;
  isStreaming?: boolean;
  onStop?: () => void;
}

const Composer = forwardRef<ComposerHandle, ComposerProps>(
  (
    {
      placeholder = 'Type a message...',
      onSubmit,
      autoFocus = false,
      disabled = false,
      isStreaming = false,
      onStop,
    },
    ref
  ) => {
    const [content, setContent] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useImperativeHandle(
      ref,
      () => ({
        insertText: (text: string) => {
          setContent(text);
          if (textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.selectionStart = text.length;
          }
        },
        focus: () => {
          textareaRef.current?.focus();
        },
      }),
      []
    );

    useEffect(() => {
      if (autoFocus && textareaRef.current) {
        textareaRef.current.focus();
      }
    }, [autoFocus]);

    const handleInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setContent(e.target.value);
      const el = e.target;
      el.style.height = 'auto';
      el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
    }, []);

    const handleSend = useCallback(() => {
      const trimmed = content.trim();
      if (!trimmed || disabled) return;
      onSubmit(trimmed);
      setContent('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }, [content, disabled, onSubmit]);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSend();
        }
      },
      [handleSend]
    );

    return (
      <div className={styles.container}>
        <div className={styles.inputWrapper}>
          <textarea
            ref={textareaRef}
            className={styles.textarea}
            placeholder={placeholder}
            value={content}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            rows={1}
          />
          {isStreaming ? (
            <button
              className={`${styles.sendButton} ${styles.active}`}
              onClick={onStop}
              aria-label="Stop generation"
            >
              <Square size={14} fill="currentColor" />
            </button>
          ) : (
            <button
              className={`${styles.sendButton} ${content.trim() ? styles.active : ''}`}
              onClick={handleSend}
              disabled={!content.trim() || disabled}
              aria-label="Send message"
            >
              <Send size={16} strokeWidth={1.5} />
            </button>
          )}
        </div>
      </div>
    );
  }
);

Composer.displayName = 'Composer';

export default Composer;
