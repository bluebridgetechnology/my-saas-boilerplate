'use client';

import React, { useState, useCallback } from 'react';
import { FiltersTool } from '@/components/image-processing/filters-tool';
import { ProAccessGuard } from '@/components/ui/pro-access-guard';
import { FileUpload } from '@/components/image-processing/file-upload';
import { toast } from 'sonner';

export function FiltersPageContent() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleProcessingStart = useCallback(() => {
    setIsProcessing(true);
    setProgress(0);
  }, []);

  const handleProcessingEnd = useCallback(() => {
    setIsProcessing(false);
    setProgress(100);
  }, []);

  const handleProgress = useCallback((progress: number, message?: string) => {
    setProgress(progress);
    if (message) {
      toast.info(message);
    }
  }, []);

  return (
    <ProAccessGuard>
      <div className="space-y-8">
        <FileUpload
          files={files}
          onFilesChange={setFiles}
          accept="image/*"
          multiple={true}
          maxFiles={20}
          maxSize={10 * 1024 * 1024} // 10MB
        />

        {files.length > 0 && (
          <FiltersTool
            files={files}
            onProcessingStart={handleProcessingStart}
            onProcessingEnd={handleProcessingEnd}
            onProgress={handleProgress}
          />
        )}

        {isProcessing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Processing Images</h3>
                <p className="text-gray-600 mb-4">Please wait while we process your images...</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500 mt-2">{Math.round(progress)}% complete</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProAccessGuard>
  );
}
