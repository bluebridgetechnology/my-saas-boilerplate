'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@iconify/react';
import { ImageProcessor } from '@/lib/image-processing/processor';
import { ResizeOptions, ProcessingResult } from '@/lib/image-processing/types';
import { ProcessingResults } from './processing-results';
import { TierManager, FileValidator } from '@/lib/image-processing/download-manager';
import { TierLimitPrompt } from './upgrade-prompt';
import { useAuth } from '@/lib/auth/auth-context';
import { SocialDownloadManager } from '@/lib/image-processing/social-download-manager';
import { 
  PLATFORM_CATEGORIES, 
  SocialPreset, 
  getFreePresetsByPlatform, 
  getProPresetsByPlatform 
} from '@/lib/image-processing/social-presets';
import { PlatformSection } from './visual-preset-cards';

interface ProcessedFile {
  id: string;
  file: File;
  result?: Blob;
  error?: string;
  preset?: string;
  suffix?: string;
  platform?: string;
}

interface EnhancedSocialPresetsToolProps {
  files?: File[];
  onProcessingStart?: () => void;
  onProcessingEnd?: () => void;
  onProgress?: (progress: number, message?: string) => void;
}

export function EnhancedSocialPresetsTool({ 
  files = [], 
  onProcessingStart, 
  onProcessingEnd, 
  onProgress 
}: EnhancedSocialPresetsToolProps) {
  const [selectedPresets, setSelectedPresets] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [originalDimensions, setOriginalDimensions] = useState<{width: number, height: number} | null>(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const { profile, loading: authLoading } = useAuth();

  // Update tier manager when user plan changes
  useEffect(() => {
    if (profile) {
      TierManager.setUserPlan(profile.plan_name === 'pro' ? 'pro' : 'free');
    } else {
      TierManager.setUserPlan('free');
    }
  }, [profile]);

  // Load preview image when files change
  useEffect(() => {
    if (files.length > 0) {
      loadPreviewImage(files[0]);
    } else {
      setPreviewImage(null);
      setOriginalDimensions(null);
    }
  }, [files]);

  const loadPreviewImage = useCallback(async (file: File) => {
    try {
      const url = URL.createObjectURL(file);
      setPreviewImage(url);
      
      // Load image to get dimensions
      const img = new Image();
      img.onload = () => {
        setOriginalDimensions({ width: img.width, height: img.height });
      };
      img.src = url;
    } catch (error) {
      console.error('Failed to load preview image:', error);
    }
  }, []);

  const handlePresetToggle = useCallback((presetId: string) => {
    setSelectedPresets(prev => 
      prev.includes(presetId) 
        ? prev.filter(id => id !== presetId)
        : [...prev, presetId]
    );
  }, []);

  const handlePlatformToggle = useCallback((platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId) 
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  }, []);

  const processAllImages = useCallback(async () => {
    if (files.length === 0 || selectedPresets.length === 0) return;

    // Validate files against tier limits
    const validation = FileValidator.validateFiles(files);
    if (!validation.valid) {
      console.error('File validation failed:', validation.error);
      return;
    }

    setIsProcessing(true);
    onProcessingStart?.();

    try {
      const results: ProcessedFile[] = [];
      
      for (let i = 0; i < validation.validFiles.length; i++) {
        const file = validation.validFiles[i];
        onProgress?.((i / validation.validFiles.length) * 100, `Processing ${file.name}...`);

        const processor = new ImageProcessor();
        const loadResult = await processor.loadImage(file);
        
        if (!loadResult.success) {
          results.push({
            id: `${file.name}-${Date.now()}`,
            file,
            error: loadResult.error
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
          if (preset.isPro && (!profile || profile.plan_name !== 'pro')) {
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
            maintainAspectRatio: false, // We want exact dimensions for social media
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
      }

      setProcessedFiles(results);
      onProgress?.(100, 'Processing complete!');
    } catch (error) {
      console.error('Processing failed:', error);
    } finally {
      setIsProcessing(false);
      onProcessingEnd?.();
    }
  }, [files, selectedPresets, profile, onProcessingStart, onProcessingEnd, onProgress]);

  const handleRetry = useCallback(() => {
    // Retry failed files
    const failedFiles = processedFiles.filter(f => f.error);
    if (failedFiles.length > 0) {
      // In a real app, this would retry processing
      console.log('Retrying failed files:', failedFiles);
    }
  }, [processedFiles]);

  const downloadAllSizes = useCallback(async () => {
    // Download all processed files as a ZIP
    const successfulFiles = processedFiles.filter(f => f.result && !f.error);
    if (successfulFiles.length > 0) {
      await SocialDownloadManager.downloadAsZip(successfulFiles, {
        format: 'jpeg',
        quality: 0.9
      });
    }
  }, [processedFiles]);

  const downloadIndividual = useCallback((processedFile: ProcessedFile) => {
    SocialDownloadManager.downloadSingle(processedFile, {
      format: 'jpeg',
      quality: 0.9
    });
  }, []);

  const downloadPlatformSizes = useCallback(async (platform: string) => {
    const platformFiles = processedFiles.filter(f => f.platform === platform && f.result && !f.error);
    if (platformFiles.length > 0) {
      await SocialDownloadManager.downloadPlatformSizes(processedFiles, platform, {
        format: 'jpeg',
        quality: 0.9
      });
    }
  }, [processedFiles]);

  const isPro = profile?.plan_name === 'pro';
  const freeConversionsUsed = selectedPresets.filter(presetId => {
    const preset = PLATFORM_CATEGORIES
      .flatMap(cat => cat.presets)
      .find(p => p.id === presetId);
    return preset && !preset.isPro;
  }).length;

  const canSelectMoreFree = freeConversionsUsed < 3;

  return (
    <div className="space-y-8">
      {/* Image Preview */}
      {files.length > 0 && previewImage && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Image Preview</h3>
          <div className="bg-gray-100 rounded-lg p-4">
            <div className="max-w-md mx-auto">
              <img
                src={previewImage}
                alt="Preview"
                className="w-full h-auto rounded-lg border border-gray-200"
                style={{ maxWidth: '100%', height: 'auto' }}
              />
              {originalDimensions && (
                <div className="mt-2 text-center text-sm text-gray-600">
                  Original: {originalDimensions.width} × {originalDimensions.height}px
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Platform Selection Tags */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Select Platforms</h3>
        <div className="flex flex-wrap gap-2">
          {PLATFORM_CATEGORIES.map((platform) => (
            <button
              key={platform.id}
              onClick={() => handlePlatformToggle(platform.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedPlatforms.includes(platform.id)
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Icon icon={platform.icon} className="h-4 w-4 mr-2" />
              {platform.name}
            </button>
          ))}
        </div>
      </div>

      {/* Download All Button */}
      {selectedPresets.length > 0 && (
        <div className="flex justify-center">
          <Button
            onClick={downloadAllSizes}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Icon icon="solar:download-bold-duotone" className="h-5 w-5 mr-2" />
            Download All Sizes ({selectedPresets.length})
          </Button>
        </div>
      )}

      {/* Platform Categories with Visual Preset Cards */}
      <div className="space-y-8">
        <h3 className="text-xl font-semibold text-gray-900">Resize your image for social media</h3>
        
        {PLATFORM_CATEGORIES.map((platform) => (
          <PlatformSection
            key={platform.id}
            platform={platform}
            previewImage={previewImage}
            selectedPresets={selectedPresets}
            onPresetToggle={handlePresetToggle}
            onDownloadAll={downloadPlatformSizes}
            onDownloadPreset={(presetId) => {
              // Find the processed file for this preset and download it
              const processedFile = processedFiles.find(f => f.preset === presetId);
              if (processedFile) {
                downloadIndividual(processedFile);
              }
            }}
            isPro={isPro}
            canSelectMoreFree={canSelectMoreFree}
            freeConversionsUsed={selectedPresets.length}
            maxFreeConversions={3}
          />
        ))}
      </div>

      {/* Process Button */}
      <div className="sticky bottom-4 z-10">
        <Button 
          onClick={processAllImages}
          className="w-full h-14 text-lg font-semibold bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 shadow-lg"
          disabled={files.length === 0 || selectedPresets.length === 0 || isProcessing}
        >
          {isProcessing ? (
            <div className="flex items-center gap-3">
              <Icon icon="solar:refresh-bold-duotone" className="h-5 w-5 animate-spin" />
              Processing Images...
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Icon icon="solar:play-bold-duotone" className="h-5 w-5" />
              Process {files.length} Image{files.length !== 1 ? 's' : ''} for {selectedPresets.length} Preset{selectedPresets.length !== 1 ? 's' : ''}
            </div>
          )}
        </Button>
      </div>

      {/* Results Section */}
      {processedFiles.length > 0 && (
        <ProcessingResults
          processedFiles={processedFiles}
          onRetry={handleRetry}
          onDownloadIndividual={downloadIndividual}
          onDownloadPlatform={downloadPlatformSizes}
        />
      )}

      {/* Tier limit prompts */}
      {files.length > TierManager.getLimits().maxImages && (
        <TierLimitPrompt limitType="maxImages" currentCount={files.length} />
      )}

      {/* Free tier conversion limit */}
      {!isPro && freeConversionsUsed >= 3 && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon icon="solar:crown-bold-duotone" className="h-5 w-5 text-yellow-600" />
            <span className="font-semibold text-yellow-800">Free Tier Limit Reached</span>
          </div>
          <p className="text-sm text-yellow-700 mb-3">
            You've used all 3 free conversions. Upgrade to Pro for unlimited conversions and access to all presets!
          </p>
          <Button className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white">
            <Icon icon="solar:crown-bold-duotone" className="h-4 w-4 mr-2" />
            Upgrade to Pro
          </Button>
        </div>
      )}
    </div>
  );
}

