import { NextResponse } from 'next/server';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import type { Project, ProjectType, ProjectStatus } from '@/types/projects';

const execAsync = promisify(exec);

/**
 * Mock project data for demo purposes.
 * In production, this would query the pi CLI or a database.
 */
const MOCK_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    name: 'pi-app',
    path: '/home/bigmints/Projects/pi-app/pi-app',
    lastActive: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    isActive: true,
    status: 'active',
  },
  {
    id: 'proj-2',
    name: 'dashboard-api',
    path: '/home/bigmints/Projects/dashboard-api',
    lastActive: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    isActive: false,
    status: 'idle',
  },
  {
    id: 'proj-3',
    name: 'auth-service',
    path: '/home/bigmints/Projects/auth-service/src',
    lastActive: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    isActive: false,
    status: 'idle',
  },
  {
    id: 'proj-4',
    name: 'data-pipeline',
    path: '/home/bigmints/Projects/data-pipeline',
    lastActive: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    isActive: false,
    status: 'error',
  },
];

function generateId(): string {
  return `proj-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function extractName(path: string, type: ProjectType): string {
  if (type === 'git') {
    // Extract repo name from URL (e.g. https://github.com/user/repo.git → repo)
    const match = path.match(/\/([^/]+?)(?:\.git)?$/);
    return match ? match[1] : path;
  }
  // Local path: last segment
  const segments = path.split('/').filter(Boolean);
  return segments[segments.length - 1] || path;
}

/**
 * GET — list all projects
 */
export async function GET(): Promise<NextResponse> {
  try {
    return NextResponse.json({ projects: MOCK_PROJECTS });
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

/**
 * POST — add a new project (local path or Git URL)
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { type, path, branch }: { type: ProjectType; path: string; branch?: string } = body;

    // Validate input
    if (!type || !['local', 'git'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid project type. Must be "local" or "git".' },
        { status: 400 }
      );
    }

    if (!path || typeof path !== 'string' || path.trim().length === 0) {
      return NextResponse.json(
        { error: 'Path is required.' },
        { status: 400 }
      );
    }

    const trimmedPath = path.trim();

    // Validate via pi CLI
    let validationError: string | null = null;
    try {
      if (type === 'local') {
        await execAsync(`pi validate --path ${trimmedPath}`, { timeout: 15000 });
      } else {
        const cmd = branch
          ? `pi validate --url ${trimmedPath} --branch ${branch.trim()}`
          : `pi validate --url ${trimmedPath}`;
        await execAsync(cmd, { timeout: 30000 });
      }
    } catch (err) {
      // pi CLI might not be available — fall back to basic validation
      if (type === 'local') {
        // Basic check: path looks reasonable
        if (!trimmedPath.startsWith('/') && !trimmedPath.match(/^[a-zA-Z]:\\/)) {
          validationError = 'Invalid local path format.';
        }
      } else {
        // Basic URL check for git
        try {
          new URL(trimmedPath);
        } catch {
          // Allow git@ssh URLs
          if (!trimmedPath.includes('@') || !trimmedPath.includes(':')) {
            validationError = 'Invalid Git URL format.';
          }
        }
      }
    }

    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    // Check for duplicates
    const exists = MOCK_PROJECTS.some(
      (p) => p.path.toLowerCase() === trimmedPath.toLowerCase()
    );
    if (exists) {
      return NextResponse.json(
        { error: 'A project with this path already exists.' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const project: Project = {
      id: generateId(),
      name: extractName(trimmedPath, type),
      path: trimmedPath,
      lastActive: now,
      isActive: MOCK_PROJECTS.length === 0,
      status: 'idle',
    };

    MOCK_PROJECTS.push(project);

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error('Failed to add project:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
