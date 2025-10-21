'use client';

import React, { useState } from 'react';
import { FileUpload } from './file-upload';

interface ToolPageWrapperProps {
  children: React.ReactNode;
  files?: File[];
}

export function ToolPageWrapper({ children }: ToolPageWrapperProps) {
  const [files, setFiles] = useState<File[]>([]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left Column - Upload */}
      <div className="space-y-6">
        <FileUpload onFilesSelected={setFiles} />
      </div>

      {/* Right Column - Tool */}
      <div className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          {React.cloneElement(children as React.ReactElement<any>, { files })}
        </div>
      </div>
    </div>
  );
}
