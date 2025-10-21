'use client';

import { Suspense } from 'react';
import { ProjectManager } from '@/components/image-processing/project-manager';
import { ToolPageWrapper } from '@/components/image-processing/tool-page-wrapper';

export default function ProjectManagerPage() {
  return (
    <ToolPageWrapper>
      <Suspense fallback={<div className="animate-pulse h-96 bg-gray-200 rounded-lg"></div>}>
        <ProjectManager toolType="project-manager" />
      </Suspense>
    </ToolPageWrapper>
  );
}
