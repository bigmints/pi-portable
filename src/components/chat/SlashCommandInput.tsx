'use client';

import { useEffect, useState, useCallback, useTransition } from 'react';
import { useCommandsStore, type Command } from '@/store/commands';
import { fuzzyMatch } from '@/lib/fuzzy';
import CommandPalette from './CommandPalette';

interface SlashCommandInputProps {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  content: string;
  setContent: (value: string) => void;
  context?: 'conversation' | 'new-chat';
}

function getSlashCommandQuery(text: string, cursorIndex: number): string | null {
  const textBeforeCursor = text.slice(0, cursorIndex);
  const lastSlashIndex = textBeforeCursor.lastIndexOf('/');
  
  if (lastSlashIndex === -1) return null;
  
  // Verify '/' is at the start of a line or preceded by whitespace
  if (lastSlashIndex > 0 && !/\s/.test(textBeforeCursor[lastSlashIndex - 1])) {
    return null;
  }
  
  // Verify there is no whitespace between '/' and cursor
  const textBetween = textBeforeCursor.slice(lastSlashIndex + 1);
  if (/\s/.test(textBetween)) {
    return null;
  }
  
  return textBetween;
}

export default function SlashCommandInput({
  textareaRef,
  content,
  setContent,
  context = 'conversation',
}: SlashCommandInputProps) {
  const {
    commands,
    isPaletteOpen,
    openPalette,
    closePalette,
    filterQuery,
    setFilterQuery,
  } = useCommandsStore();

  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [, startTransition] = useTransition();

  // Filter commands by context and fuzzy match with filterQuery
  const getFilteredCommands = useCallback(() => {
    // First, filter by context suitability
    const contextCommands = commands.filter(
      (cmd) => cmd.context === 'all' || cmd.context === context
    );

    if (!filterQuery) {
      return contextCommands;
    }

    const labels = contextCommands.map((c) => c.label);
    const matches = fuzzyMatch(filterQuery, labels);

    return matches.map((m) => contextCommands[m.index]);
  }, [commands, filterQuery, context]);

  const filteredCommands = getFilteredCommands();

  // Handle command execution / selection
  const handleSelect = useCallback(
    (command: Command) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const cursorIndex = textarea.selectionStart;
      const textBeforeCursor = content.slice(0, cursorIndex);
      const lastSlashIndex = textBeforeCursor.lastIndexOf('/');

      if (lastSlashIndex !== -1) {
        const textAfterCursor = content.slice(cursorIndex);
        const insertion = command.action + ' ';
        const newContent = content.slice(0, lastSlashIndex) + insertion + textAfterCursor;

        setContent(newContent);
        closePalette();

        const newCursorPos = lastSlashIndex + insertion.length;
        requestAnimationFrame(() => {
          textarea.focus();
          textarea.selectionStart = newCursorPos;
          textarea.selectionEnd = newCursorPos;

          // Adjust height of textarea
          textarea.style.height = 'auto';
          textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
        });
      }
    },
    [content, setContent, closePalette, textareaRef]
  );

  // Monitor cursor position and text changes to toggle the palette
  const handleSelectionChangeOrInput = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const cursorIndex = textarea.selectionStart;
    const query = getSlashCommandQuery(textarea.value, cursorIndex);

    if (query !== null) {
      startTransition(() => {
        openPalette();
        setFilterQuery(query);
      });
    } else {
      if (isPaletteOpen) {
        startTransition(() => {
          closePalette();
        });
      }
    }
  }, [textareaRef, openPalette, closePalette, setFilterQuery, isPaletteOpen]);

  // Event listeners on textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const handleInput = () => {
      handleSelectionChangeOrInput();
    };

    const handleSelectEvent = () => {
      // Cursor movements also trigger selection change
      handleSelectionChangeOrInput();
    };

    textarea.addEventListener('input', handleInput);
    textarea.addEventListener('keyup', handleSelectEvent);
    textarea.addEventListener('click', handleSelectEvent);

    return () => {
      textarea.removeEventListener('input', handleInput);
      textarea.removeEventListener('keyup', handleSelectEvent);
      textarea.removeEventListener('click', handleSelectEvent);
    };
  }, [textareaRef, handleSelectionChangeOrInput]);

  // Intercept KeyDown events for navigation
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPaletteOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedIndex((prev) =>
          Math.min(prev + 1, filteredCommands.length - 1)
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        if (filteredCommands.length > 0) {
          e.preventDefault();
          handleSelect(filteredCommands[highlightedIndex]);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        closePalette();
      }
    };

    // Use capture phase so we intercept before parent or native keydowns (like submit on Enter)
    textarea.addEventListener('keydown', handleKeyDown, true);

    return () => {
      textarea.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [textareaRef, isPaletteOpen, filteredCommands, highlightedIndex, handleSelect, closePalette]);

  // Reset highlighted index when filtered list changes
  useEffect(() => {
    setHighlightedIndex(0);
  }, [filterQuery]);

  return (
    <CommandPalette
      filteredCommands={filteredCommands}
      highlightedIndex={highlightedIndex}
      onSelect={handleSelect}
      onClose={closePalette}
      onHoverItem={setHighlightedIndex}
    />
  );
}
