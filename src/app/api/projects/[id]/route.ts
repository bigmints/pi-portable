import { NextRequest, NextResponse } from 'next/server';
import type { Project } from '@/types/projects';

/**
 * Mock project data — mirrors the in-memory store from GET /api/projects.
 * In production this would be backed by a database or the pi CLI.
 */
const MOCK_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    name: 'pi-app',
    path: '/home/bigmints/Projects/pi-app/pi-app',
    lastActive: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    isActive: true,
    status: 'active',
    description: 'A mobile-first PWA web client for the pi CLI.',
    envVars: { NODE_ENV: 'development' },
    ignorePatterns: ['node_modules', '.next', 'dist'],
  },
];

interface ProjectPatch {
  description?: string;
  envVars?: Record<string, string>;
  ignorePatterns?: string[];
}

/**
 * PATCH — partial update of a project's settings
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const id = params.id;
  const project = MOCK_PROJECTS.find((p) => p.id === id);

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  const body: ProjectPatch = await request.json();

  console.log(`[PATCH /api/projects/${id}] Updating project settings:`, body);

  if (body.description !== undefined) {
    project.description = body.description;
  }
  if (body.envVars !== undefined) {
    project.envVars = body.envVars;
  }
  if (body.ignorePatterns !== undefined) {
    project.ignorePatterns = body.ignorePatterns;
  }

  project.lastActive = new Date().toISOString();

  console.log(`[PATCH /api/projects/${id}] Updated project:`, project);

  return NextResponse.json({ project }, { status: 200 });
}

/**
 * DELETE — remove a project
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const id = params.id;
  const index = MOCK_PROJECTS.findIndex((p) => p.id === id);

  if (index === -1) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  const [deleted] = MOCK_PROJECTS.splice(index, 1);

  console.log(`[DELETE /api/projects/${id}] Deleted project:`, deleted.name);

  return NextResponse.json({ message: 'Project deleted', project: deleted }, { status: 200 });
}

/**
 * GET — get a single project by ID
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const id = params.id;
  const project = MOCK_PROJECTS.find((p) => p.id === id);

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  return NextResponse.json({ project }, { status: 200 });
}
