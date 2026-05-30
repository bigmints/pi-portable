/**
 * Search API — GET /api/conversations/search
 *
 * Query params:
 *   q        — search term (required)
 *   projects — comma-separated project IDs
 *   models   — comma-separated model names
 *   dateFrom — ISO date string (inclusive)
 *   dateTo   — ISO date string (inclusive)
 *   page     — page number (default 1)
 *   limit    — results per page (default 20)
 */

import { NextRequest, NextResponse } from 'next/server';

// ─── Types ───────────────────────────────────────────────────────────────────

interface SearchResult {
  id: string;
  title: string;
  preview: string;
  matchPositions: MatchPosition[];
  project: string;
  model: string;
  date: string; // ISO date string
  messageCount: number;
  lastMessageAt: number;
}

interface MatchPosition {
  start: number;
  end: number;
}

interface SearchResponse {
  results: SearchResult[];
  total: number;
  page: number;
  limit: number;
}

// ─── Mock data ───────────────────────────────────────────────────────────────

const MOCK_CONVERSATIONS: SearchResult[] = [
  {
    id: 'conv-001',
    title: 'WebSocket streaming in Next.js',
    preview: 'How to implement real-time WebSocket streaming in a Next.js 14 App Router application with server-sent events fallback',
    matchPositions: [],
    project: 'pi-app',
    model: 'gpt-4o',
    date: '2025-05-20',
    messageCount: 12,
    lastMessageAt: Date.now() - 86400000 * 6,
  },
  {
    id: 'conv-002',
    title: 'TypeScript strict mode tips',
    preview: 'Best practices for TypeScript strict mode including noImplicitAny, strictNullChecks, and exhaustive type checking patterns',
    matchPositions: [],
    project: 'pi-app',
    model: 'claude-3.5',
    date: '2025-05-19',
    messageCount: 8,
    lastMessageAt: Date.now() - 86400000 * 7,
  },
  {
    id: 'conv-003',
    title: 'CSS custom properties theming',
    preview: 'Implementing a dark mode theme system using CSS custom properties and data-theme attribute on the HTML element',
    matchPositions: [],
    project: 'design-system',
    model: 'gpt-4o',
    date: '2025-05-18',
    messageCount: 15,
    lastMessageAt: Date.now() - 86400000 * 8,
  },
  {
    id: 'conv-004',
    title: 'Zustand middleware patterns',
    preview: 'Using Zustand persist middleware for state management with custom storage adapters and hydration handling',
    matchPositions: [],
    project: 'pi-app',
    model: 'gpt-4o',
    date: '2025-05-17',
    messageCount: 6,
    lastMessageAt: Date.now() - 86400000 * 9,
  },
  {
    id: 'conv-005',
    title: 'PWA service worker lifecycle',
    preview: 'Managing service worker installation, activation, and update cycles in a progressive web app with next-pwa',
    matchPositions: [],
    project: 'pi-app',
    model: 'claude-3.5',
    date: '2025-05-16',
    messageCount: 10,
    lastMessageAt: Date.now() - 86400000 * 10,
  },
  {
    id: 'conv-006',
    title: 'React Server Components deep dive',
    preview: 'Understanding React Server Components in Next.js App Router with streaming SSR and Suspense boundaries',
    matchPositions: [],
    project: 'design-system',
    model: 'gpt-4o',
    date: '2025-05-15',
    messageCount: 20,
    lastMessageAt: Date.now() - 86400000 * 11,
  },
  {
    id: 'conv-007',
    title: 'Mobile gesture handling',
    preview: 'Implementing swipe gestures and touch interactions for mobile-first responsive design patterns in React',
    matchPositions: [],
    project: 'pi-app',
    model: 'claude-3.5',
    date: '2025-05-14',
    messageCount: 7,
    lastMessageAt: Date.now() - 86400000 * 12,
  },
  {
    id: 'conv-008',
    title: 'API route error handling',
    preview: 'Building robust error handling patterns for Next.js API routes with proper status codes and validation',
    matchPositions: [],
    project: 'backend-api',
    model: 'gpt-4o',
    date: '2025-05-13',
    messageCount: 9,
    lastMessageAt: Date.now() - 86400000 * 13,
  },
  {
    id: 'conv-009',
    title: 'E2E testing with Playwright',
    preview: 'Setting up end-to-end tests with Playwright for Next.js applications including visual regression testing',
    matchPositions: [],
    project: 'design-system',
    model: 'gpt-4o',
    date: '2025-05-12',
    messageCount: 14,
    lastMessageAt: Date.now() - 86400000 * 14,
  },
  {
    id: 'conv-010',
    title: 'Docker multi-stage builds',
    preview: 'Optimizing Docker multi-stage builds for Node.js applications with Alpine Linux and minimal images',
    matchPositions: [],
    project: 'backend-api',
    model: 'claude-3.5',
    date: '2025-05-11',
    messageCount: 5,
    lastMessageAt: Date.now() - 86400000 * 15,
  },
  {
    id: 'conv-011',
    title: 'GraphQL vs REST API design',
    preview: 'Comparing GraphQL and REST API design patterns for microservices architecture with authentication',
    matchPositions: [],
    project: 'backend-api',
    model: 'gpt-4o',
    date: '2025-05-10',
    messageCount: 18,
    lastMessageAt: Date.now() - 86400000 * 16,
  },
  {
    id: 'conv-012',
    title: 'Accessibility audit checklist',
    preview: 'Comprehensive accessibility audit checklist covering WCAG 2.1 AA compliance for web applications',
    matchPositions: [],
    project: 'design-system',
    model: 'claude-3.5',
    date: '2025-05-09',
    messageCount: 11,
    lastMessageAt: Date.now() - 86400000 * 17,
  },
];

// All available projects and models from mock data
const ALL_PROJECTS = [...new Set(MOCK_CONVERSATIONS.map((c) => c.project))];
const ALL_MODELS = [...new Set(MOCK_CONVERSATIONS.map((c) => c.model))];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function findMatchPositions(text: string, terms: string[]): MatchPosition[] {
  const positions: MatchPosition[] = [];
  const lowerText = text.toLowerCase();
  for (const term of terms) {
    const lowerTerm = term.toLowerCase();
    let idx = lowerText.indexOf(lowerTerm);
    while (idx !== -1) {
      positions.push({ start: idx, end: idx + term.length });
      idx = lowerText.indexOf(lowerTerm, idx + 1);
    }
  }
  // Sort and merge overlapping positions
  positions.sort((a, b) => a.start - b.start);
  const merged: MatchPosition[] = [];
  for (const pos of positions) {
    if (merged.length > 0 && pos.start < merged[merged.length - 1].end) {
      merged[merged.length - 1].end = Math.max(merged[merged.length - 1].end, pos.end);
    } else {
      merged.push({ ...pos });
    }
  }
  return merged;
}

function searchConversations(
  query: string,
  projects: string[],
  models: string[],
  dateFrom: string | null,
  dateTo: string | null,
  page: number,
  limit: number
): SearchResponse {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) {
    return { results: [], total: 0, page, limit };
  }

  // Filter conversations
  let filtered = MOCK_CONVERSATIONS.filter((conv) => {
    // Project filter
    if (projects.length > 0 && !projects.includes(conv.project)) {
      return false;
    }
    // Model filter
    if (models.length > 0 && !models.includes(conv.model)) {
      return false;
    }
    // Date range filter
    if (dateFrom) {
      const convDate = new Date(conv.date);
      const from = new Date(dateFrom);
      if (convDate < from) return false;
    }
    if (dateTo) {
      const convDate = new Date(conv.date);
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      if (convDate > to) return false;
    }
    // Text search — match against title and preview
    const searchText = `${conv.title} ${conv.preview}`.toLowerCase();
    return terms.some((term) => searchText.includes(term));
  });

  // Sort by relevance (more matches = higher rank), then by date
  filtered = filtered.sort((a, b) => {
    const aScore = terms.filter((t) => `${a.title} ${a.preview}`.toLowerCase().includes(t)).length;
    const bScore = terms.filter((t) => `${b.title} ${b.preview}`.toLowerCase().includes(t)).length;
    if (bScore !== aScore) return bScore - aScore;
    return b.lastMessageAt - a.lastMessageAt;
  });

  const total = filtered.length;
  const start = (page - 1) * limit;
  const paginated = filtered.slice(start, start + limit);

  // Compute match positions for each result
  const results: SearchResult[] = paginated.map((conv) => ({
    ...conv,
    matchPositions: findMatchPositions(conv.preview, terms),
  }));

  return { results, total, page, limit };
}

// ─── Route handler ───────────────────────────────────────────────────────────

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);

  const q = searchParams.get('q') || '';
  const projectsParam = searchParams.get('projects') || '';
  const modelsParam = searchParams.get('models') || '';
  const dateFrom = searchParams.get('dateFrom') || null;
  const dateTo = searchParams.get('dateTo') || null;
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '20', 10);

  const projects = projectsParam ? projectsParam.split(',').filter(Boolean) : [];
  const models = modelsParam ? modelsParam.split(',').filter(Boolean) : [];

  if (!q.trim()) {
    return NextResponse.json(
      { error: 'Search query parameter "q" is required' },
      { status: 400 }
    );
  }

  const response = searchConversations(q, projects, models, dateFrom, dateTo, page, limit);

  return NextResponse.json({
    ...response,
    availableProjects: ALL_PROJECTS,
    availableModels: ALL_MODELS,
  });
}
