/**
 * Search store — query, filters, results, and debounced search
 */
import { create } from 'zustand';
import { useEffect, useRef } from 'react';

export interface SearchFilters {
  projects: string[];
  models: string[];
  dateFrom: string | null;
  dateTo: string | null;
}

export interface SearchResult {
  id: string;
  title: string;
  preview: string;
  matchPositions: { start: number; end: number }[];
  project: string;
  model: string;
  date: string;
  messageCount: number;
  lastMessageAt: number;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  page: number;
  limit: number;
  availableProjects?: string[];
  availableModels?: string[];
}

interface SearchState {
  query: string;
  filters: SearchFilters;
  results: SearchResult[];
  total: number;
  page: number;
  isLoading: boolean;
  hasSearched: boolean;
  availableProjects: string[];
  availableModels: string[];

  setQuery: (query: string) => void;
  setSearchFilters: (filters: SearchFilters) => void;
  setResults: (results: SearchResult[], total: number) => void;
  setIsLoading: (isLoading: boolean) => void;
  setHasSearched: (hasSearched: boolean) => void;
  setAvailableOptions: (projects: string[], models: string[]) => void;
  reset: () => void;
  search: (params?: { force?: boolean }) => Promise<void>;
  nextPage: () => Promise<void>;
  getActiveFilterCount: () => number;
}

const DEBOUNCE_MS = 300;

export const useSearchStore = create<SearchState>()(
  (set, get) => ({
    query: '',
    filters: {
      projects: [],
      models: [],
      dateFrom: null,
      dateTo: null,
    },
    results: [],
    total: 0,
    page: 1,
    isLoading: false,
    hasSearched: false,
    availableProjects: [],
    availableModels: [],

    setQuery: (query: string) => set({ query }),

    setSearchFilters: (filters: SearchFilters) => set({ filters }),

    setResults: (results: SearchResult[], total: number) => set({ results, total }),

    setIsLoading: (isLoading: boolean) => set({ isLoading }),

    setHasSearched: (hasSearched: boolean) => set({ hasSearched }),

    setAvailableOptions: (projects: string[], models: string[]) =>
      set({ availableProjects: projects, availableModels: models }),

    reset: () =>
      set({
        query: '',
        filters: { projects: [], models: [], dateFrom: null, dateTo: null },
        results: [],
        total: 0,
        page: 1,
        hasSearched: false,
        isLoading: false,
      }),

    getActiveFilterCount: (): number => {
      const { filters } = get();
      let count = 0;
      if (filters.projects.length > 0) count++;
      if (filters.models.length > 0) count++;
      if (filters.dateFrom) count++;
      if (filters.dateTo) count++;
      return count;
    },

    search: async ({ force = false } = {}) => {
      const { query, filters, page } = get();

      if (!force && !query.trim()) {
        set({ results: [], total: 0, hasSearched: false });
        return;
      }

      set({ isLoading: true });

      try {
        const params = new URLSearchParams({
          q: query,
          page: String(page),
        });

        if (filters.projects.length > 0) {
          params.set('projects', filters.projects.join(','));
        }
        if (filters.models.length > 0) {
          params.set('models', filters.models.join(','));
        }
        if (filters.dateFrom) {
          params.set('dateFrom', filters.dateFrom);
        }
        if (filters.dateTo) {
          params.set('dateTo', filters.dateTo);
        }

        const res = await fetch(`/api/conversations/search?${params}`);
        const data: SearchResponse = await res.json();

        set({
          results: data.results,
          total: data.total,
          hasSearched: true,
        });

        if (data.availableProjects) {
          set({ availableProjects: data.availableProjects });
        }
        if (data.availableModels) {
          set({ availableModels: data.availableModels });
        }
      } catch {
        set({ results: [], total: 0 });
      } finally {
        set({ isLoading: false });
      }
    },

    nextPage: async () => {
      const { page, results, total } = get();
      if (results.length >= total) return;
      set({ page: page + 1, isLoading: true });
      await get().search({ force: true });
    },
  })
);

/**
 * Debounced search hook — triggers search after a delay on query/filter changes
 */
export function useDebouncedSearch(delay: number = DEBOUNCE_MS) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { query, filters, page, search, setHasSearched, setResults } = useSearchStore();

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    if (query.trim()) {
      timerRef.current = setTimeout(() => {
        search();
      }, delay);
    } else {
      setHasSearched(false);
      setResults([], 0);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, JSON.stringify(filters), page, delay]);
}
