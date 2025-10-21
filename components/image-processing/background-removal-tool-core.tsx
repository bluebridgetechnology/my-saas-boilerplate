'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import { BackgroundRemovalProcessor } from '@/lib/image-processing/background-removal';
import { FileValidator } from '@/lib/image-processing';

interface BackgroundRemovalSettings {
  model: 'standard' | 'precise';
  edgeRefinement: boolean;
  outputFormat: 'png' | 'jpg';
  quality: number;
  replaceBackground: boolean;
  backgroundColor: string;
  customBackground?: File;
}

interface BackgroundRemovalToolCoreProps {
  files: File[];
  settings: BackgroundRemovalSettings;
  onProcessingStart: () => void;
  onProcessingEnd: () => void;
  onProgress: (progress: number) => void;
  onResults: (files: File[]) => void;
}

export function BackgroundRemovalToolCore({
  files,
  settings,
  onProcessingStart,
  onProcessingEnd,
  onProgress,
  onResults
}: BackgroundRemovalToolCoreProps) {
  const [processor, setProcessor] = useState<BackgroundRemovalProcessor | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [initializationProgress, setInitializationProgress] = useState(0);

  // Initialize the background removal processor
  useEffect(() => {
    let mounted = true;

    const initializeProcessor = async () => {
      try {
        onProcessingStart();
        setInitializationProgress(10);

        const bgProcessor = new BackgroundRemovalProcessor();
        setInitializationProgress(30);

        await bgProcessor.initialize();
        if (!mounted) return;

        setInitializationProgress(70);
        setProcessor(bgProcessor);
        setInitializationProgress(100);
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize background removal processor:', error);
        if (mounted) {
          // Handle initialization error gracefully
          setIsInitialized(false);
        }
      } finally {
        if (mounted) {
          onProcessingEnd();
        }
      }
    };

    initializeProcessor();

    return () => {
      mounted = false;
    };
  }, [onProcessingStart, onProcessingEnd]);

  const handleProcess = useCallback(async () => {
    if (!processor || !isInitialized || files.length === 0) return;

    onProcessingStart();
    try {
      const processedFiles: File[] = [];
      const totalFiles = files.length;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const progress = Math.round(((i + 1) / totalFiles) * 100);
        
        try {
          const result = await processor.removeBackground(file, {
            model: settings.model,
            edgeRefinement: settings.edgeRefinement,
            outputFormat: settings.outputFormat,
            quality: settings.quality,
            replaceBackground: settings.replaceBackground,
            backgroundColor: settings.backgroundColor,
            customBackground: settings.customBackground
          });

          if (result.success && result.file) {
            processedFiles.push(result.file);
          }
        } catch (error) {
          console.error(`Failed to process file ${file.name}:`, error);
        }

        onProgress(progress);
      }

      onResults(processedFiles);
    } catch (error) {
      console.error('Background removal processing failed:', error);
    } finally {
      onProcessingEnd();
    }
  }, [processor, isInitialized, files, settings, onProcessingStart, onProcessingEnd, onProgress, onResults]);

  if (!isInitialized) {
    return (
      <div className="text-center py-12">
        <div className="flex items-center justify-center mb-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
        <h4 className="text-lg font-medium text-gray-500 mb-2">
          Initializing AI Models...
        </h4>
        <p className="text-gray-400 text-sm mb-4">
          Loading background removal models ({initializationProgress}%)
        </p>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${initializationProgress}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="text-center py-8">
      <Button
        onClick={handleProcess}
        size="lg"
        className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3"
        disabled={files.length === 0}
      >
        <Icon icon="solar:magic-stick-bold-duotone" className="h-5 w-5 mr-2" />
        Remove Backgrounds ({files.length} images)
      </Button>
      
      <p className="text-sm text-gray-500 mt-3">
        AI-powered background removal with {settings.model} model
      </p>
    </div>
  );
}
