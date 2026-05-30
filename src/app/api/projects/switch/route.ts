import { NextRequest, NextResponse } from 'next/server';
import type { Project } from '@/types/projects';

/**
 * Mock project data (must match GET /api/projects for consistency).
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

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { id }: { id: string } = body;

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    const project = MOCK_PROJECTS.find((p) => p.id === id);
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Update active state
    const updatedProjects: Project[] = MOCK_PROJECTS.map((p) => ({
      ...p,
      isActive: p.id === id,
      lastActive: p.id === id ? new Date().toISOString() : p.lastActive,
      status: p.id === id ? 'active' : p.status,
    }));

    return NextResponse.json({
      activeProject: updatedProjects.find((p) => p.id === id)!,
      projects: updatedProjects,
    });
  } catch (error) {
    console.error('Failed to switch project:', error);
    return NextResponse.json(
      { error: 'Failed to switch project' },
      { status: 500 }
    );
  }
}
