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
import { useAttachmentsStore } from '@/store/attachments';
import AttachmentStrip from '@/components/chat/AttachmentStrip';
import { CommandPalette, COMMANDS } from '@/components/chat/CommandPalette';
import type { Command } from '@/components/chat/CommandPalette';
import { fuzzyMatch } from '@/lib/fuzzy';
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
    const [showCommandPalette, setShowCommandPalette] = useState(false);
    const [commandQuery, setCommandQuery] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const composerRef = useRef<HTMLDivElement>(null);

    const files = useAttachmentsStore((s) => s.files);
    const addFile = useAttachmentsStore((s) => s.addFile);
    const removeFile = useAttachmentsStore((s) => s.removeFile);
    const setUploadedId = useAttachmentsStore((s) => s.setUploadedId);
    const setError = useAttachmentsStore((s) => s.setError);

    const isUploading = files.some((f) => !f.uploadedId);
    const hasUploadedFiles = files.length > 0 && !isUploading;

    const filteredCommands = showCommandPalette
      ? (commandQuery
          ? fuzzyMatch(commandQuery, COMMANDS.map((c) => c.label)).map((m) => COMMANDS[m.index])
          : COMMANDS)
      : [];

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

    // Handle click outside to close the palette
    useEffect(() => {
      if (!showCommandPalette) return;

      const handleClickOutside = (e: MouseEvent) => {
        if (
          composerRef.current &&
          !composerRef.current.contains(e.target as Node)
        ) {
          setShowCommandPalette(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [showCommandPalette]);

    const handleSelectCommand = useCallback((command: Command) => {
      setContent(command.insertText);
      setShowCommandPalette(false);
      if (textareaRef.current) {
        textareaRef.current.focus();
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.selectionStart = command.insertText.length;
            textareaRef.current.selectionEnd = command.insertText.length;
          }
        }, 0);
      }
    }, []);

    const handleInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      setContent(value);

      const el = e.target;
      el.style.height = 'auto';
      el.style.height = `${Math.min(el.scrollHeight, 200)}px`;

      if (value.startsWith('/')) {
        const query = value.slice(1);
        if (query.includes(' ')) {
          setShowCommandPalette(false);
        } else {
          const matches = fuzzyMatch(query, COMMANDS.map((c) => c.label));
          if (matches.length > 0) {
            setShowCommandPalette(true);
            setCommandQuery(query);
            setActiveIndex(0);
          } else {
            setShowCommandPalette(false);
          }
        }
      } else {
        setShowCommandPalette(false);
      }
    }, []);

    const uploadAndAttachFile = useCallback(
      async (file: File) => {
        const fileId = addFile(file);
        if (!fileId) return;

        try {
          const formData = new FormData();
          formData.append('files', file);

          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            throw new Error('Upload failed');
          }

          const data = await response.json();
          const uploadedFile = data.files?.[0];
          if (uploadedFile?.id) {
            setUploadedId(fileId, uploadedFile.id);
          } else {
            throw new Error('No file ID returned from server');
          }
        } catch (err) {
          console.error('Failed to upload file:', err);
          setError('Failed to upload pasted image');
          removeFile(fileId);
        }
      },
      [addFile, setUploadedId, setError, removeFile]
    );

    const handlePaste = useCallback(
      (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
        const clipboardData = e.clipboardData;
        if (!clipboardData) return;

        const filesToUpload: File[] = [];
        const seenFiles = new Set<string>();

        const SUPPORTED_IMAGE_TYPES = [
          'image/png',
          'image/jpeg',
          'image/gif',
          'image/webp',
        ];

        const addFileIfUnique = (file: File) => {
          if (SUPPORTED_IMAGE_TYPES.includes(file.type)) {
            const key = `${file.name}-${file.size}-${file.type}`;
            if (!seenFiles.has(key)) {
              seenFiles.add(key);
              filesToUpload.push(file);
            }
          }
        };

        // Method 1: Check clipboardData.files
        if (clipboardData.files && clipboardData.files.length > 0) {
          for (let i = 0; i < clipboardData.files.length; i++) {
            const file = clipboardData.files[i];
            addFileIfUnique(file);
          }
        }

        // Method 2: Check clipboardData.items for image data
        if (clipboardData.items && clipboardData.items.length > 0) {
          for (let i = 0; i < clipboardData.items.length; i++) {
            const item = clipboardData.items[i];
            if (SUPPORTED_IMAGE_TYPES.includes(item.type)) {
              const file = item.getAsFile();
              if (file) {
                addFileIfUnique(file);
              }
            }
          }
        }

        if (filesToUpload.length > 0) {
          e.preventDefault();
          filesToUpload.forEach((file) => {
            uploadAndAttachFile(file);
          });
        }
      },
      [uploadAndAttachFile]
    );


    const handleSend = useCallback(() => {
      const trimmed = content.trim();
      if ((!trimmed && !hasUploadedFiles) || disabled || isUploading) return;
      onSubmit(trimmed);
      setContent('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }, [content, disabled, onSubmit, hasUploadedFiles, isUploading]);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (showCommandPalette && filteredCommands.length > 0) {
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex((prev) => (prev + 1) % filteredCommands.length);
            return;
          }
          if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
            return;
          }
          if (e.key === 'Enter') {
            e.preventDefault();
            const selected = filteredCommands[activeIndex];
            if (selected) {
              handleSelectCommand(selected);
            }
            return;
          }
          if (e.key === 'Escape') {
            e.preventDefault();
            setShowCommandPalette(false);
            return;
          }
        }

        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSend();
        }
      },
      [showCommandPalette, activeIndex, filteredCommands, handleSend, handleSelectCommand]
    );

    return (
      <div ref={composerRef} className={`${styles.container} relative`}>
        <CommandPalette
          isOpen={showCommandPalette}
          activeIndex={activeIndex}
          filteredCommands={filteredCommands}
          onHoverItem={setActiveIndex}
          onSelect={handleSelectCommand}
        />
        <AttachmentStrip />
        <div className={styles.inputWrapper}>
          <textarea
            ref={textareaRef}
            className={styles.textarea}
            placeholder={placeholder}
            value={content}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
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
              className={`${styles.sendButton} ${(content.trim() || hasUploadedFiles) && !isUploading ? styles.active : ''}`}
              onClick={handleSend}
              disabled={(!content.trim() && !hasUploadedFiles) || disabled || isUploading}
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
