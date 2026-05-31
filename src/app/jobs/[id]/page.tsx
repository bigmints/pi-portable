'use client';

import { notFound } from 'next/navigation';
import JobDetail from '@/components/jobs/JobDetail';
import StepTimeline from '@/components/jobs/StepTimeline';
import ArtifactList from '@/components/jobs/ArtifactList';
import JobDetailFooter from '@/components/jobs/JobDetailFooter';
import { useJobsStore } from '@/store/jobs';
import { useParams } from 'next/navigation';

export default function JobDetailPage() {
  const params = useParams();
  const jobId = params?.id as string;
  const { jobs } = useJobsStore();
  const job = jobs[jobId];

  if (!job) {
    return (
      <div className="flex items-center justify-center p-6 text-center text-muted-foreground">
        Job not found
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <JobDetail job={job} />
      <div className="px-4">
        <StepTimeline steps={job.steps} jobId={jobId} />
      </div>
      <ArtifactList artifacts={job.artifacts ?? []} />
      <JobDetailFooter steps={job.steps} />
    </div>
  );
}
