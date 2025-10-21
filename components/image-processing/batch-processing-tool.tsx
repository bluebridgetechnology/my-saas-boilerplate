'use client';

import React, { useState, useCallback } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TierManager, TIER_LIMITS } from '@/lib/image-processing/download-manager';

interface BatchProcessingToolProps {
  files: File[];
  onProcessingStart: () => void;
  onProcessingEnd: () => void;
  onProgress: (progress: number) => void;
  onBatchComplete: (results: any[]) => void;
  processingComponent: React.ComponentType<any>;
}

export function BatchProcessingTool({
  files: filesProp,
  onProcessingStart,
  onProcessingEnd,
  onProgress,
  onBatchComplete,
  processingComponent: ProcessingComponent
}: BatchProcessingToolProps) {
  // Ensure files is always defined and is an array
  const files = filesProp || [];
  const [batchSettings, setBatchSettings] = useState({
    applyToAll: true,
    selectiveProcessing: false,
    priorityQueue: false,
    customNaming: false,
    zipDownload: false
  });
  
  const [selectedFiles, setSelectedFiles] = useState<Set<number>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingResults, setProcessingResults] = useState<any[]>([]);

  const userPlan = TierManager.getUserPlan() || 'free';
  const limits = TierManager.getLimits() || TIER_LIMITS.free;

  const handleSelectFile = useCallback((index: number) => {
    if (index >= files.length) return;
    
    if (batchSettings.selectiveProcessing) {
      const newSelected = new Set(selectedFiles);
      if (newSelected.has(index)) {
        newSelected.delete(index);
      } else {
        newSelected.add(index);
      }
      setSelectedFiles(newSelected);
    }
  }, [selectedFiles, batchSettings.selectiveProcessing]);

  const handleSelectAll = useCallback(() => {
    if (files.length === 0) return;
    
    if (selectedFiles.size === files.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(files.map((_, index) => index)));
    }
  }, [selectedFiles, files]);

  const processBatch = useCallback(async () => {
    if (files.length === 0) return;

    setIsProcessing(true);
    onProcessingStart();

    try {
      const filesToProcess = batchSettings.selectiveProcessing 
        ? files.filter((_, index) => selectedFiles.has(index))
        : files;

      if (filesToProcess.length === 0) {
        throw new Error('No files selected for processing');
      }

      // Check Pro tier limits
      if ((userPlan || 'free') === 'free' && filesToProcess.length > 5) {
        throw new Error('Free tier limited to 5 images. Upgrade to Pro for batch processing up to 100 images.');
      }

      const results: any[] = [];
      const totalFiles = filesToProcess.length;

      for (let i = 0; i < filesToProcess.length; i++) {
        const file = filesToProcess[i];
        const progress = Math.round(((i + 1) / totalFiles) * 100);
        
        onProgress(progress);

        // Simulate processing (replace with actual processing logic)
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        results.push({
          file,
          success: true,
          processedData: new Blob(),
          originalSize: file.size,
          processedSize: Math.round(file.size * 0.8)
        });
      }

      setProcessingResults(results);
      onBatchComplete(results);
    } catch (error) {
      console.error('Batch processing error:', error);
    } finally {
      setIsProcessing(false);
      onProcessingEnd();
    }
  }, [files, batchSettings, selectedFiles, userPlan, onProcessingStart, onProcessingEnd, onProgress, onBatchComplete]);

  const canUseProFeatures = (userPlan || 'free') === 'pro';
  const selectedCount = batchSettings.selectiveProcessing ? selectedFiles.size : files.length;

  return (
    <div className="space-y-6">
      {/* Batch Settings */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Batch Processing Settings</h3>
        
        <div className="space-y-6">
          {/* Processing Mode */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-3">Processing Mode</h4>
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="processingMode"
                  checked={batchSettings.applyToAll}
                  onChange={() => setBatchSettings(prev => ({ 
                    ...prev, 
                    applyToAll: true, 
                    selectiveProcessing: false 
                  }))}
                  className="text-blue-600"
                />
                <span className="text-gray-700">Apply same settings to all images</span>
              </label>
              
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="processingMode"
                  checked={batchSettings.selectiveProcessing}
                  onChange={() => setBatchSettings(prev => ({ 
                    ...prev, 
                    applyToAll: false, 
                    selectiveProcessing: true 
                  }))}
                  className="text-blue-600"
                  disabled={!canUseProFeatures}
                />
                <span className={`${!canUseProFeatures ? 'text-gray-400' : 'text-gray-700'}`}>
                  Selective batch processing
                  {!canUseProFeatures && <span className="text-blue-600 ml-2">(Pro only)</span>}
                </span>
              </label>
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* Pro Features */}
          {canUseProFeatures && (
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-3">Pro Features</h4>
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={batchSettings.priorityQueue}
                    onChange={(e) => setBatchSettings(prev => ({ 
                      ...prev, 
                      priorityQueue: e.target.checked 
                    }))}
                    className="text-blue-600"
                  />
                  <span className="text-gray-700">Priority processing queue</span>
                  <Icon icon="solar:flash-bold-duotone" className="h-4 w-4 text-yellow-500" />
                </label>
                
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={batchSettings.customNaming}
                    onChange={(e) => setBatchSettings(prev => ({ 
                      ...prev, 
                      customNaming: e.target.checked 
                    }))}
                    className="text-blue-600"
                  />
                  <span className="text-gray-700">Custom file naming</span>
                  <Icon icon="solar:text-bold-duotone" className="h-4 w-4 text-blue-500" />
                </label>
                
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={batchSettings.zipDownload}
                    onChange={(e) => setBatchSettings(prev => ({ 
                      ...prev, 
                      zipDownload: e.target.checked 
                    }))}
                    className="text-blue-600"
                  />
                  <span className="text-gray-700">ZIP download</span>
                  <Icon icon="solar:archive-bold-duotone" className="h-4 w-4 text-green-500" />
                </label>
              </div>
            </div>
          )}

          <hr className="border-gray-200" />

          {/* File Selection */}
          {batchSettings.selectiveProcessing && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-medium text-gray-900">Select Files</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                >
                  {selectedFiles.size === (files?.length || 0) ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto">
                {files?.map((file, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedFiles.has(index)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleSelectFile(index)}
                  >
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedFiles.has(index)}
                        onChange={() => handleSelectFile(index)}
                        className="text-blue-600"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {file.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {(file.size / (1024 * 1024)).toFixed(1)} MB
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Process Button */}
          <Button
            onClick={processBatch}
            className="w-full h-14 text-lg font-semibold bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
            disabled={files.length === 0 || (batchSettings.selectiveProcessing && selectedFiles.size === 0) || isProcessing}
          >
            {isProcessing ? (
              <div className="flex items-center gap-3">
                <Icon icon="solar:refresh-bold-duotone" className="h-5 w-5 animate-spin" />
                Processing {selectedCount} Image{selectedCount !== 1 ? 's' : ''}...
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Icon icon="solar:play-bold-duotone" className="h-5 w-5" />
                Process {selectedCount} Image{selectedCount !== 1 ? 's' : ''}
              </div>
            )}
          </Button>
        </div>
      </Card>

      {/* Processing Component */}
      {files.length > 0 && (
        <ProcessingComponent
          files={files}
          onProcessingStart={onProcessingStart}
          onProcessingEnd={onProcessingEnd}
          onProgress={onProgress}
        />
      )}

      {/* Results */}
      {processingResults.length > 0 && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Processing Results</h3>
          <div className="space-y-3">
            {processingResults.map((result, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Icon icon="solar:check-circle-bold-duotone" className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">{result.file.name}</div>
                    <div className="text-xs text-gray-500">
                      {Math.round((result.processedSize / result.originalSize) * 100)}% of original size
                    </div>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  <Icon icon="solar:download-bold-duotone" className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </div>
            ))}
          </div>
          
          {batchSettings.zipDownload && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <Button className="w-full bg-green-600 hover:bg-green-700">
                <Icon icon="solar:archive-bold-duotone" className="h-5 w-5 mr-2" />
                Download All as ZIP
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
