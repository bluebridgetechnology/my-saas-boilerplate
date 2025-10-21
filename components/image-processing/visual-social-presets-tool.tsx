'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { PureMasonryPlatformSection } from './pure-masonry-layout';
import { MobilePlatformSection } from './mobile-preset-layout';
import { PLATFORM_CATEGORIES, SocialPreset } from '@/lib/image-processing/social-presets-data';
import { ImageProcessor } from '@/lib/image-processing/processor';
import { ResizeOptions } from '@/lib/image-processing/types';
import { useAuth } from '@/lib/auth/auth-context';

interface ProcessedFile {
  id: string;
  file: File;
  result?: Blob;
  error?: string;
  preset?: string;
  platform?: string;
  suffix?: string;
}

interface VisualSocialPresetsToolProps {
  files?: File[];
  onProcessingStart?: () => void;
  onProcessingEnd?: () => void;
  onProgress?: (progress: number, message?: string) => void;
}

export function VisualSocialPresetsTool({ 
  files = [], 
  onProcessingStart, 
  onProcessingEnd, 
  onProgress 
}: VisualSocialPresetsToolProps) {
  const [selectedPresets, setSelectedPresets] = useState<string[]>([]);
  const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [freeConversionsUsed, setFreeConversionsUsed] = useState(0);
  
  const { profile } = useAuth();
  const isPro = profile?.plan_name === 'pro';
  const maxFreeConversions = 3;
  const canSelectMoreFree = !isPro && freeConversionsUsed < maxFreeConversions;

  // Load preview image when files change
  useEffect(() => {
    if (files.length > 0) {
      loadPreviewImage(files[0]);
    } else {
      setPreviewImage(null);
    }
  }, [files]);

  const loadPreviewImage = useCallback(async (file: File) => {
    try {
      const url = URL.createObjectURL(file);
      setPreviewImage(url);
    } catch (error) {
      console.error('Failed to load preview image:', error);
    }
  }, []);

  const handlePresetToggle = useCallback((presetId: string) => {
    setSelectedPresets(prev => {
      if (prev.includes(presetId)) {
        return prev.filter(id => id !== presetId);
      } else {
        // Check if user can select more presets
        if (!isPro && freeConversionsUsed >= maxFreeConversions) {
          return prev;
        }
        return [...prev, presetId];
      }
    });
  }, [isPro, freeConversionsUsed, maxFreeConversions]);

  const processAllImages = useCallback(async () => {
    if (files.length === 0 || selectedPresets.length === 0) return;

    setIsProcessing(true);
    onProcessingStart?.();
    
    try {
      const results: ProcessedFile[] = [];
      let processedCount = 0;
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const processor = new ImageProcessor();
        
        // Load the image
        const loadResult = await processor.loadImage(file);
        if (!loadResult.success) {
          results.push({
            id: `${file.name}-${Date.now()}`,
            file,
            error: loadResult.error || 'Failed to load image',
            preset: 'Unknown',
            platform: 'Unknown'
          });
          continue;
        }

        // Process with each selected preset
        for (const presetId of selectedPresets) {
          const preset = PLATFORM_CATEGORIES
            .flatMap(cat => cat.presets)
            .find(p => p.id === presetId);
          
          if (!preset) continue;

          // Check if user has access to this preset
          if (preset.isPro && !isPro) {
            results.push({
              id: `${file.name}-${presetId}-${Date.now()}`,
              file,
              error: 'Pro feature - upgrade required',
              preset: preset.name,
              platform: preset.platform,
              suffix: preset.name.toLowerCase().replace(/\s+/g, '-')
            });
            continue;
          }

          const resizeOptions: ResizeOptions = {
            width: preset.width,
            height: preset.height,
            maintainAspectRatio: false,
            quality: 0.9
          };

          const result = await processor.resize(resizeOptions);
          
          if (result.success) {
            const blob = await processor.getCanvasBlob('jpeg', 0.9);
            results.push({
              id: `${file.name}-${presetId}-${Date.now()}`,
              file,
              result: blob || undefined,
              preset: preset.name,
              platform: preset.platform,
              suffix: preset.name.toLowerCase().replace(/\s+/g, '-')
            });
          } else {
            results.push({
              id: `${file.name}-${presetId}-${Date.now()}`,
              file,
              error: result.error,
              preset: preset.name,
              platform: preset.platform,
              suffix: preset.name.toLowerCase().replace(/\s+/g, '-')
            });
          }
        }

        processor.cleanup();
        processedCount++;
        onProgress?.(Math.round((processedCount / files.length) * 100), `Processing ${processedCount}/${files.length} images...`);
      }

      setProcessedFiles(results);
      setFreeConversionsUsed(prev => prev + selectedPresets.length);
      onProgress?.(100, 'Processing complete!');
    } catch (error) {
      console.error('Processing failed:', error);
    } finally {
      setIsProcessing(false);
      onProcessingEnd?.();
    }
  }, [files, selectedPresets, isPro, onProcessingStart, onProcessingEnd, onProgress]);

  const downloadPreset = useCallback((presetId: string) => {
    const processedFile = processedFiles.find(f => f.preset === presetId);
    if (processedFile && processedFile.result) {
      const url = URL.createObjectURL(processedFile.result);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${processedFile.file.name.split('.')[0]}_${processedFile.suffix}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }, [processedFiles]);

  const downloadPlatformAll = useCallback((platformId: string) => {
    const platformFiles = processedFiles.filter(f => f.platform === platformId);
    if (platformFiles.length === 0) return;

    // For now, download the first file (in a real implementation, you'd create a ZIP)
    const firstFile = platformFiles[0];
    if (firstFile && firstFile.result) {
      downloadPreset(firstFile.preset || '');
    }
  }, [processedFiles, downloadPreset]);

  return (
    <div className="space-y-8">
      {/* Main Heading */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Resize your image for social media</h2>
        <p className="text-gray-600">
          {isPro 
            ? 'Select any presets you want and download them all at once' 
            : `Free users can select up to ${maxFreeConversions} presets. Upgrade to Pro for unlimited access.`
          }
        </p>
      </div>

      {/* Platform Sections - Responsive Layout */}
      {PLATFORM_CATEGORIES.map((platform) => (
        <div key={platform.id}>
          {/* Desktop Layout - Pure Masonry */}
          <div className="hidden md:block">
            <PureMasonryPlatformSection
              platform={platform}
              previewImage={previewImage}
              selectedPresets={selectedPresets}
              onPresetToggle={handlePresetToggle}
              onDownloadAll={downloadPlatformAll}
              onDownloadPreset={downloadPreset}
              isPro={isPro}
              canSelectMoreFree={canSelectMoreFree}
              freeConversionsUsed={freeConversionsUsed}
              maxFreeConversions={maxFreeConversions}
            />
          </div>
          
          {/* Mobile Layout */}
          <div className="block md:hidden">
            <MobilePlatformSection
              platform={platform}
              previewImage={previewImage}
              selectedPresets={selectedPresets}
              onPresetToggle={handlePresetToggle}
              onDownloadAll={downloadPlatformAll}
              isPro={isPro}
              canSelectMoreFree={canSelectMoreFree}
              freeConversionsUsed={freeConversionsUsed}
              maxFreeConversions={maxFreeConversions}
            />
          </div>
        </div>
      ))}

      {/* Process Button - Only show when files are uploaded */}
      {files.length > 0 && selectedPresets.length > 0 && (
        <div className="flex justify-center">
          <Button
            onClick={processAllImages}
            disabled={isProcessing}
            className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {isProcessing ? (
              <>
                <Icon icon="solar:loading-bold-duotone" className="h-5 w-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Icon icon="solar:download-bold-duotone" className="h-5 w-5 mr-2" />
                Process {selectedPresets.length} preset{selectedPresets.length !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </div>
      )}


      {/* Results */}
      {processedFiles.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Processed Images</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {processedFiles.map((file) => (
              <div key={file.id} className="border rounded-lg p-4">
                <div className="text-sm font-medium text-gray-900">{file.preset}</div>
                <div className="text-xs text-gray-500">{file.platform}</div>
                {file.error ? (
                  <div className="text-red-600 text-sm mt-2">{file.error}</div>
                ) : (
                  <Button
                    onClick={() => downloadPreset(file.preset || '')}
                    size="sm"
                    className="mt-2"
                  >
                    Download
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
