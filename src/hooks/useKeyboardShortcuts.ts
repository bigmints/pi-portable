/**
 * useKeyboardShortcuts — global keyboard shortcut listener
 *
 * Registers a window-level keydown listener that fires shortcuts only when
 * the user is NOT typing inside an input, textarea, or [contenteditable] element.
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useShortcutsStore } from '@/store/shortcuts';
import { useMessagesStore } from '@/store/messages';
import { useConversationsStore } from '@/store/conversations';
import { wsClient } from '@/lib/ws-client';

/** Check if the event target is an editable element */
function isEditableElement(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target instanceof HTMLInputElement) return true;
  if (target instanceof HTMLTextAreaElement) return true;
  if (target.getAttribute('contenteditable') !== null) return true;
  return false;
}

/** Check if the event matches a modifier key */
function isModifierKey(e: KeyboardEvent, modifier: 'Meta' | 'Ctrl'): boolean {
  if (modifier === 'Meta') return e.metaKey;
  return e.ctrlKey && !e.metaKey;
}

export function useKeyboardShortcuts(): void {
  const router = useRouter();
  const {
    commandPaletteOpen,
    shortcutsPanelOpen,
    openCommandPalette,
    closeCommandPalette,
    openShortcutsPanel,
    closeShortcutsPanel,
  } = useShortcutsStore();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent): void {
      // Never fire shortcuts when typing in an input/textarea/contenteditable
      if (isEditableElement(e.target)) return;

      const key = e.key;

      // ── Escape ────────────────────────────────────────────────────────────
      if (key === 'Escape') {
        e.preventDefault();

        // Close command palette if open
        if (commandPaletteOpen) {
          closeCommandPalette();
          return;
        }

        // Close shortcuts panel if open
        if (shortcutsPanelOpen) {
          closeShortcutsPanel();
          return;
        }

        // Interrupt streaming if active
        const isStreaming = useMessagesStore.getState().isStreaming();
        if (isStreaming) {
          const activeConversationId =
            useMessagesStore.getState().activeConversationId;
          if (activeConversationId) {
            e.preventDefault();
            useMessagesStore.getState().setInterrupting(true);
            wsClient.sendInterrupt(activeConversationId);
            // Mark the in-progress message as interrupted
            const inProgressId = useMessagesStore.getState().inProgressMessageId;
            if (inProgressId) {
              useMessagesStore.getState().markInterrupted(inProgressId);
            }
          }
        }
        return;
      }

      // ── Cmd+K / Ctrl+K → Command Palette ─────────────────────────────────
      if (key === 'k' && (e.metaKey || (e.ctrlKey && !e.metaKey))) {
        e.preventDefault();
        openCommandPalette();
        return;
      }

      // ── Cmd+N / Ctrl+N → New Conversation ────────────────────────────────
      if (key === 'n' && (e.metaKey || (e.ctrlKey && !e.metaKey))) {
        e.preventDefault();
        router.push('/chat');
        return;
      }

      // ── Cmd+1 through Cmd+5 → Tab navigation ─────────────────────────────
      const tabMap: Record<string, string> = {
        '1': '/chat',
        '2': '/queue',
        '3': '/jobs',
        '4': '/history',
        '5': '/settings',
      };

      if (key in tabMap && (e.metaKey || (e.ctrlKey && !e.metaKey))) {
        e.preventDefault();
        router.push(tabMap[key]);
        return;
      }

      // ── Cmd+? / Ctrl+? → Shortcuts Reference Panel ───────────────────────
      // Shift+/ produces ? on US keyboards; Shift+= produces + on some layouts
      // We check for '?' key or '/' with Shift (which produces '?')
      if (
        (key === '?' || key === '/') &&
        (e.metaKey || (e.ctrlKey && !e.metaKey)) &&
        e.shiftKey
      ) {
        e.preventDefault();
        openShortcutsPanel();
        return;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    router,
    commandPaletteOpen,
    shortcutsPanelOpen,
    openCommandPalette,
    closeCommandPalette,
    openShortcutsPanel,
    closeCommandPalette,
    closeShortcutsPanel,
  ]);
}
