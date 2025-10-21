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

interface SocialPreset {
  id: string;
  name: string;
  platform: string;
  width: number;
  height: number;
  aspectRatio: string;
  description: string;
  isPro: boolean;
}

interface ProcessedFile {
  id: string;
  file: File;
  result?: Blob;
  error?: string;
  preset?: string;
  suffix?: string;
}

interface SocialPresetsToolProps {
  files?: File[];
  onProcessingStart?: () => void;
  onProcessingEnd?: () => void;
  onProgress?: (progress: number, message?: string) => void;
}

const FREE_PRESETS: SocialPreset[] = [
  {
    id: 'instagram-story',
    name: 'Instagram Story',
    platform: 'Instagram',
    width: 1080,
    height: 1920,
    aspectRatio: '9:16',
    description: 'Perfect for Instagram Stories',
    isPro: false
  },
  {
    id: 'instagram-post',
    name: 'Instagram Post',
    platform: 'Instagram',
    width: 1080,
    height: 1080,
    aspectRatio: '1:1',
    description: 'Square posts for Instagram feed',
    isPro: false
  },
  {
    id: 'youtube-thumbnail',
    name: 'YouTube Thumbnail',
    platform: 'YouTube',
    width: 1280,
    height: 720,
    aspectRatio: '16:9',
    description: 'YouTube video thumbnails',
    isPro: false
  }
];

const PRO_PRESETS: SocialPreset[] = [
  {
    id: 'instagram-profile',
    name: 'Instagram Profile',
    platform: 'Instagram',
    width: 400,
    height: 400,
    aspectRatio: '1:1',
    description: 'Profile picture for Instagram',
    isPro: true
  },
  {
    id: 'youtube-banner',
    name: 'YouTube Banner',
    platform: 'YouTube',
    width: 2560,
    height: 1440,
    aspectRatio: '16:9',
    description: 'YouTube channel banner',
    isPro: true
  },
  {
    id: 'youtube-profile',
    name: 'YouTube Profile',
    platform: 'YouTube',
    width: 800,
    height: 800,
    aspectRatio: '1:1',
    description: 'YouTube channel profile picture',
    isPro: true
  },
  {
    id: 'linkedin-post',
    name: 'LinkedIn Post',
    platform: 'LinkedIn',
    width: 1200,
    height: 627,
    aspectRatio: '1.91:1',
    description: 'LinkedIn feed posts',
    isPro: true
  },
  {
    id: 'linkedin-banner',
    name: 'LinkedIn Banner',
    platform: 'LinkedIn',
    width: 1584,
    height: 396,
    aspectRatio: '4:1',
    description: 'LinkedIn profile banner',
    isPro: true
  },
  {
    id: 'linkedin-profile',
    name: 'LinkedIn Profile',
    platform: 'LinkedIn',
    width: 400,
    height: 400,
    aspectRatio: '1:1',
    description: 'LinkedIn profile picture',
    isPro: true
  },
  {
    id: 'facebook-post',
    name: 'Facebook Post',
    platform: 'Facebook',
    width: 1200,
    height: 630,
    aspectRatio: '1.91:1',
    description: 'Facebook feed posts',
    isPro: true
  },
  {
    id: 'twitter-post',
    name: 'Twitter Post',
    platform: 'Twitter',
    width: 1200,
    height: 675,
    aspectRatio: '16:9',
    description: 'Twitter image posts',
    isPro: true
  },
  {
    id: 'pinterest-pin',
    name: 'Pinterest Pin',
    platform: 'Pinterest',
    width: 1000,
    height: 1500,
    aspectRatio: '2:3',
    description: 'Pinterest pins',
    isPro: true
  }
];

export function SocialPresetsTool({ 
  files = [], 
  onProcessingStart, 
  onProcessingEnd, 
  onProgress 
}: SocialPresetsToolProps) {
  const [selectedPresets, setSelectedPresets] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [originalDimensions, setOriginalDimensions] = useState<{width: number, height: number} | null>(null);
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
          const preset = [...FREE_PRESETS, ...PRO_PRESETS].find(p => p.id === presetId);
          if (!preset) continue;

          // Check if user has access to this preset
          if (preset.isPro && (!profile || profile.plan_name !== 'pro')) {
            results.push({
              id: `${file.name}-${presetId}-${Date.now()}`,
              file,
              error: 'Pro feature - upgrade required',
              preset: preset.name,
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
              suffix: preset.name.toLowerCase().replace(/\s+/g, '-')
            });
          } else {
            results.push({
              id: `${file.name}-${presetId}-${Date.now()}`,
              file,
              error: result.error,
              preset: preset.name,
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

  return (
    <div className="space-y-6">
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

      <div className="space-y-8">
        <h3 className="text-xl font-semibold text-gray-900">Social Media Presets</h3>
        
        {/* Platform Selection */}
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-4">Select Platforms</h4>
          <div className="space-y-4">
            {/* Free Options */}
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-3">Free Options</h5>
              <div className="grid grid-cols-1 gap-3">
                {FREE_PRESETS.map((preset) => (
                  <div key={preset.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer" onClick={() => handlePresetToggle(preset.id)}>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={preset.id}
                        checked={selectedPresets.includes(preset.id)}
                        onChange={() => handlePresetToggle(preset.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={preset.id} className="ml-3 text-sm font-medium text-gray-900 cursor-pointer">
                        <div className="flex items-center">
                          <Icon icon={`solar:${preset.platform.toLowerCase()}-bold-duotone`} className="h-5 w-5 mr-2 text-blue-600" />
                          <div>
                            <div className="font-medium">{preset.name}</div>
                            <div className="text-xs text-gray-500">{preset.description}</div>
                          </div>
                        </div>
                      </label>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">{preset.width}×{preset.height}</div>
                      <div className="text-xs text-gray-500">{preset.aspectRatio}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <hr className="border-gray-200" />
            
            {/* Pro Options */}
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-3">Pro Options (Upgrade Required)</h5>
              <div className="grid grid-cols-1 gap-3">
                {PRO_PRESETS.map((preset) => (
                  <div key={preset.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50 opacity-75">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={preset.id}
                        disabled
                        className="h-4 w-4 text-gray-400 border-gray-300 rounded"
                      />
                      <label htmlFor={preset.id} className="ml-3 text-sm font-medium text-gray-500 cursor-not-allowed">
                        <div className="flex items-center">
                          <Icon icon={`solar:${preset.platform.toLowerCase()}-bold-duotone`} className="h-5 w-5 mr-2 text-gray-400" />
                          <div>
                            <div className="font-medium">🔒 {preset.name}</div>
                            <div className="text-xs text-gray-500">{preset.description}</div>
                          </div>
                        </div>
                      </label>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-500">{preset.width}×{preset.height}</div>
                      <div className="text-xs text-gray-400">{preset.aspectRatio}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Upgrade prompt */}
          <div className="mt-3 p-4 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg">
            <div className="flex items-center gap-2">
              <Icon icon="solar:crown-bold-duotone" className="h-5 w-5 text-white" />
              <span className="text-sm text-white font-semibold">Want more platforms?</span>
            </div>
            <p className="text-xs text-white/90 mt-2 leading-relaxed">
              Upgrade to Pro for LinkedIn, Facebook, Twitter, Pinterest presets and more!
            </p>
          </div>
        </div>
        
        <hr className="border-gray-200" />
        
        {/* Process Button */}
        <Button 
          onClick={processAllImages}
          className="w-full h-14 text-lg font-semibold bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
          disabled={files.length === 0 || selectedPresets.length === 0}
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
        />
      )}

      {/* Tier limit prompts */}
      {files.length > TierManager.getLimits().maxImages && (
        <TierLimitPrompt limitType="maxImages" currentCount={files.length} />
      )}
    </div>
  );
}
