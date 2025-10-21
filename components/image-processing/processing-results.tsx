'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@iconify/react';
import { DownloadManager, TierManager, UpgradePrompts } from '@/lib/image-processing/download-manager';

interface ProcessedFile {
  id: string;
  file: File;
  result?: Blob;
  error?: string;
  preset?: string;
  platform?: string;
  suffix?: string;
}

interface ProcessingResultsProps {
  processedFiles: ProcessedFile[];
  onDownloadAll?: () => void;
  onDownloadFile?: (file: ProcessedFile) => void;
  onDownloadIndividual?: (file: ProcessedFile) => void;
  onDownloadPlatform?: (platform: string) => void;
  onRetry?: () => void;
}

export function ProcessingResults({ 
  processedFiles, 
  onDownloadAll, 
  onDownloadFile,
  onDownloadIndividual,
  onDownloadPlatform,
  onRetry 
}: ProcessingResultsProps) {
  const userPlan = TierManager.getUserPlan();
  const successfulFiles = processedFiles.filter(f => f.result);
  const failedFiles = processedFiles.filter(f => f.error);

  // Group files by platform
  const filesByPlatform = successfulFiles.reduce((acc, file) => {
    const platform = file.platform || 'Other';
    if (!acc[platform]) {
      acc[platform] = [];
    }
    acc[platform].push(file);
    return acc;
  }, {} as Record<string, ProcessedFile[]>);

  const handleDownloadFile = (file: ProcessedFile) => {
    if (onDownloadIndividual) {
      onDownloadIndividual(file);
    } else if (onDownloadFile) {
      onDownloadFile(file);
    }
  };

  const handleDownloadAll = () => {
    if (userPlan === 'pro' && successfulFiles.length > 1) {
      // Pro users can download as ZIP
      const files = successfulFiles.map(f => ({
        blob: f.result!,
        filename: DownloadManager.generateFilename(
          f.file.name,
          f.suffix || 'processed',
          'jpg'
        )
      }));
      DownloadManager.downloadMultipleAsZip(files);
    } else {
      // Free users download individually
      successfulFiles.forEach((file, index) => {
        setTimeout(() => handleDownloadFile(file), index * 100);
      });
    }
    onDownloadAll?.();
  };

  const handleUpgradeClick = () => {
    window.open('/pricing', '_blank');
  };

  if (processedFiles.length === 0) {
    return null;
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Processing Results
        </h3>
        <div className="flex gap-2">
          {successfulFiles.length > 0 && (
            <Button 
              onClick={handleDownloadAll}
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Icon icon="solar:download-bold-duotone" className="h-4 w-4 mr-2" />
              Download All ({successfulFiles.length})
            </Button>
          )}
          {failedFiles.length > 0 && onRetry && (
            <Button 
              onClick={onRetry}
              size="sm"
              variant="outline"
            >
              <Icon icon="solar:refresh-bold-duotone" className="h-4 w-4 mr-2" />
              Retry Failed
            </Button>
          )}
        </div>
      </div>
      
      {/* Platform-based grouping */}
      {Object.keys(filesByPlatform).length > 0 && (
        <div className="space-y-6">
          {Object.entries(filesByPlatform).map(([platform, files]) => (
            <div key={platform} className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                  <Icon icon={`solar:${platform.toLowerCase()}-bold-duotone`} className="h-5 w-5" />
                  {platform} ({files.length} sizes)
                </h4>
                {onDownloadPlatform && files.length > 1 && (
                  <Button
                    onClick={() => onDownloadPlatform(platform)}
                    size="sm"
                    variant="outline"
                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                  >
                    <Icon icon="solar:download-bold-duotone" className="h-4 w-4 mr-2" />
                    Download All {platform}
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {files.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-green-100 rounded-lg mr-3 flex items-center justify-center">
                        <Icon icon="solar:check-circle-bold-duotone" className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 text-sm">
                          {file.preset}
                        </div>
                        <div className="text-xs text-gray-500">
                          {file.result && `${(file.result.size / 1024).toFixed(1)} KB`}
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => handleDownloadFile(file)}
                      size="sm"
                      variant="outline"
                      className="text-xs"
                    >
                      <Icon icon="solar:download-bold-duotone" className="h-3 w-3 mr-1" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Failed files */}
      {failedFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900 text-red-600">Failed Processing</h4>
          {failedFiles.map((file) => (
            <div key={file.id} className="flex items-center justify-between p-3 border border-red-200 rounded-lg bg-red-50">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-red-100 rounded-lg mr-3 flex items-center justify-center">
                  <Icon icon="solar:close-circle-bold-duotone" className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900 text-sm">
                    {file.file.name}
                  </div>
                  <div className="text-xs text-red-600">
                    {file.error}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upgrade prompt for Pro features */}
      {userPlan === 'free' && successfulFiles.length > 1 && (
        <div className="mt-4 p-4 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Icon icon="solar:crown-bold-duotone" className="h-5 w-5 text-white" />
                <span className="text-sm text-white font-semibold">Want ZIP downloads?</span>
              </div>
              <p className="text-xs text-white/90 mt-1">
                Pro users can download multiple files as a single ZIP archive!
              </p>
            </div>
            <Button 
              onClick={handleUpgradeClick}
              size="sm"
              className="bg-white hover:bg-gray-50 text-blue-600"
            >
              Upgrade
            </Button>
          </div>
        </div>
      )}

      {/* Processing summary */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Icon icon="solar:check-circle-bold-duotone" className="h-4 w-4 text-green-600" />
              {successfulFiles.length} successful
            </span>
            {failedFiles.length > 0 && (
              <span className="flex items-center gap-1">
                <Icon icon="solar:close-circle-bold-duotone" className="h-4 w-4 text-red-600" />
                {failedFiles.length} failed
              </span>
            )}
          </div>
          <div className="text-xs text-gray-500">
            {userPlan === 'free' ? 'Free tier' : 'Pro tier'}
          </div>
        </div>
      </div>
    </Card>
  );
}
