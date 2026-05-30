/**
 * In-memory store for saved queues (server-side).
 * Persists across requests within the same process.
 */

import type { SavedQueue } from '@/types/taskQueue';

const store = new Map<string, SavedQueue>();

export const queuesStore = store;
