'use client';

import ProjectList from '@/components/projects/ProjectList';

export default function ProjectsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="border-b border-border pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Projects</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your development workspaces, configure environment variables, and monitor activity.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card/30 p-5 md:p-6 shadow-sm">
        <ProjectList />
      </div>
    </div>
  );
}
