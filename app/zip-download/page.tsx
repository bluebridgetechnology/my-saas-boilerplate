'use client';

import { Suspense } from 'react';
import { ZIPDownloadManager } from '@/components/image-processing/zip-download-manager';
import { ToolPageWrapper } from '@/components/image-processing/tool-page-wrapper';

export default function ZipDownloadPage() {
  return (
    <ToolPageWrapper>
      <Suspense fallback={<div className="animate-pulse h-96 bg-gray-200 rounded-lg"></div>}>
        <ZIPDownloadManager />
      </Suspense>
    </ToolPageWrapper>
  );
}
