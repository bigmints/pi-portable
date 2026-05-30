/**
 * History store — conversation history with pinning and day grouping
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Conversation } from '@/types/chat';

export type HistoryGroup = {
  label: string;
  key: 'today' | 'yesterday' | 'this-week' | 'older';
  conversations: Conversation[];
};

/** 30 days in milliseconds */
const SOFT_DELETE_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;

interface HistoryState {
  conversations: Conversation[];
  softDeleted: Conversation[];
  pinnedIds: string[];
  page: number;
  hasMore: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  setConversations: (conversations: Conversation[]) => void;
  loadMore: () => void;
  pinConversation: (id: string) => void;
  unpinConversation: (id: string) => void;
  renameConversation: (id: string, title: string) => void;
  softDeleteConversation: (id: string) => Conversation | undefined;
  restoreConversation: (id: string) => void;
  purgePermanentlyDeleted: () => void;
  getPinnedConversations: () => Conversation[];
  getGroupedConversations: () => HistoryGroup[];
  setIsLoading: (isLoading: boolean) => void;
  setIsLoadingMore: (isLoadingMore: boolean) => void;
  setHasMore: (hasMore: boolean) => void;
  setPage: (page: number) => void;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      conversations: [],
      softDeleted: [],
      pinnedIds: [],
      page: 0,
      hasMore: true,
      isLoading: false,
      isLoadingMore: false,
      setConversations: (conversations: Conversation[]) => set({ conversations }),
      loadMore: () => set((s) => ({ page: s.page + 1 })),
      pinConversation: (id: string) =>
        set((s) => ({
          pinnedIds: s.pinnedIds.includes(id) ? s.pinnedIds : [...s.pinnedIds, id],
        })),
      unpinConversation: (id: string) =>
        set((s) => ({ pinnedIds: s.pinnedIds.filter((p) => p !== id) })),
      renameConversation: (id: string, title: string) =>
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === id ? { ...c, title } : c
          ),
        })),
      softDeleteConversation: (id: string): Conversation | undefined => {
        const state = get();
        const conversation = state.conversations.find((c) => c.id === id);
        if (!conversation) return undefined;
        const deleted: Conversation = { ...conversation, softDeletedAt: new Date().toISOString() };
        set((s) => ({
          conversations: s.conversations.filter((c) => c.id !== id),
          softDeleted: [...s.softDeleted, deleted],
          pinnedIds: s.pinnedIds.filter((p) => p !== id),
        }));
        return deleted;
      },
      restoreConversation: (id: string) => {
        const state = get();
        const toRestore = state.softDeleted.find((c) => c.id === id);
        if (!toRestore) return;
        const restored: Conversation = {
          ...toRestore,
          softDeletedAt: undefined,
        };
        set((s) => ({
          conversations: [...s.conversations, restored],
          softDeleted: s.softDeleted.filter((c) => c.id !== id),
        }));
      },
      purgePermanentlyDeleted: () => {
        const cutoff = Date.now() - SOFT_DELETE_RETENTION_MS;
        set((s) => ({
          softDeleted: s.softDeleted.filter((c) => {
            if (!c.softDeletedAt) return true;
            return new Date(c.softDeletedAt).getTime() >= cutoff;
          }),
        }));
      },
      getPinnedConversations: (): Conversation[] => {
        const { conversations, pinnedIds } = get();
        return conversations.filter((c) => pinnedIds.includes(c.id));
      },
      getGroupedConversations: (): HistoryGroup[] => {
        const { conversations, pinnedIds } = get();
        const unpinned = conversations.filter((c) => !pinnedIds.includes(c.id));
        const groups: Record<string, HistoryGroup> = {
          today: { label: 'Today', key: 'today', conversations: [] },
          yesterday: { label: 'Yesterday', key: 'yesterday', conversations: [] },
          'this-week': { label: 'This Week', key: 'this-week', conversations: [] },
          older: { label: 'Older', key: 'older', conversations: [] },
        };
        for (const c of unpinned) {
          const d = new Date(c.lastMessageAt || Date.now());
          const now = new Date();
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          let key: HistoryGroup['key'];
          if (d >= today) key = 'today';
          else if (d >= yesterday) key = 'yesterday';
          else if (d >= weekAgo) key = 'this-week';
          else key = 'older';
          groups[key].conversations.push(c);
        }
        return Object.values(groups).filter((g) => g.conversations.length > 0);
      },
      setIsLoading: (isLoading: boolean) => set({ isLoading }),
      setIsLoadingMore: (isLoadingMore: boolean) => set({ isLoadingMore }),
      setHasMore: (hasMore: boolean) => set({ hasMore }),
      setPage: (page: number) => set({ page }),
    }),
    {
      name: 'pi-history',
      onRehydrateStorage: () => (state) => {
        if (state && state.purgePermanentlyDeleted) {
          state.purgePermanentlyDeleted();
        }
      },
    }
  )
);
