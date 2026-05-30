'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function FileViewerPage() {
  const params = useParams();
  const router = useRouter();
  const filePath = (params?.path as string) ?? '';

  return (
    <div className="flex h-[calc(100dvh-56px)] flex-col">
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          aria-label="Back"
        >
          <ArrowLeft size={20} strokeWidth={1.5} />
        </Button>
        <div className="flex items-center gap-2">
          <FileText size={18} strokeWidth={1.5} className="text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">{filePath}</span>
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <FileText size={48} strokeWidth={1.5} className="mx-auto mb-4 text-muted-foreground" />
          <p className="text-sm text-foreground">File viewer for {filePath}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Content will be streamed from the backend when available
          </p>
        </div>
      </div>
    </div>
  );
}
