'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import { AdvancedCropProcessor } from '@/lib/image-processing/advanced-crop';
import { ImageProcessor } from '@/lib/image-processing';
import { FileValidator } from '@/lib/image-processing';

interface CropSettings {
  aspectRatio: 'free' | '1:1' | '4:3' | '16:9' | '3:2' | 'custom';
  customRatio: { width: number; height: number };
  rotation: number;
  flipHorizontal: boolean;
  flipVertical: boolean;
  smartCrop: boolean;
  faceDetection: boolean;
  outputFormat: 'original' | 'jpeg' | 'png' | 'webp';
  quality: number;
}

interface CropToolCoreProps {
  files: File[];
  settings: CropSettings;
  onProcessingStart: () => void;
  onProcessingEnd: () => void;
  onProgress: (progress: number) => void;
  onResults: (files: File[]) => void;
}

export function CropToolCore({
  files,
  settings,
  onProcessingStart,
  onProcessingEnd,
  onProgress,
  onResults
}: CropToolCoreProps) {
  const [processor, setProcessor] = useState<ImageProcessor | null>(null);
  const [advancedProcessor, setAdvancedProcessor] = useState<AdvancedCropProcessor | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [initializationProgress, setInitializationProgress] = useState(0);

  // Initialize the crop processor
  useEffect(() => {
    let mounted = true;

    const initializeProcessor = async () => {
      try {
        onProcessingStart();
        setInitializationProgress(10);

        const imgProcessor = new ImageProcessor();
        setInitializationProgress(30);

        // Only initialize advanced features if smart crop or face detection is enabled
        if (settings.smartCrop || settings.faceDetection) {
          setInitializationProgress(50);
          const advancedProcessor = new AdvancedCropProcessor();
          await advancedProcessor.initialize();
          if (!mounted) return;
          setAdvancedProcessor(advancedProcessor);
          setInitializationProgress(80);
        }

        setProcessor(imgProcessor);
        setInitializationProgress(100);
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize crop processor:', error);
        if (mounted) {
          // Handle initialization error gracefully - still allow basic cropping
          const imgProcessor = new ImageProcessor();
          setProcessor(imgProcessor);
          setIsInitialized(true);
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
  }, [settings.smartCrop, settings.faceDetection, onProcessingStart, onProcessingEnd]);

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
          // Load the image first
          const loadResult = await processor.loadImage(file);
          if (!loadResult.success) {
            console.error(`Failed to load file ${file.name}`);
            continue;
          }

          // Determine crop area
          let cropArea;
          if (settings.smartCrop && advancedProcessor) {
            // Use AI-powered smart cropping
            const img = new Image();
            img.src = URL.createObjectURL(loadResult.data!);
            await new Promise(resolve => img.onload = resolve);
            
            const smartCropResult = await advancedProcessor.smartCrop(
              img,
              settings.aspectRatio === 'custom' 
                ? settings.customRatio 
                : undefined
            );
            cropArea = smartCropResult.cropArea;
          } else {
            // Use center crop with aspect ratio
            const img = new Image();
            img.src = URL.createObjectURL(loadResult.data!);
            await new Promise(resolve => img.onload = resolve);
            const { width, height } = img;
            
            let targetWidth = width;
            let targetHeight = height;

            if (settings.aspectRatio !== 'free') {
              let ratio = 1;
              switch (settings.aspectRatio) {
                case '1:1':
                  ratio = 1;
                  break;
                case '4:3':
                  ratio = 4 / 3;
                  break;
                case '16:9':
                  ratio = 16 / 9;
                  break;
                case '3:2':
                  ratio = 3 / 2;
                  break;
                case 'custom':
                  ratio = settings.customRatio.width / settings.customRatio.height;
                  break;
              }

              if (width / height > ratio) {
                targetWidth = height * ratio;
              } else {
                targetHeight = width / ratio;
              }
            }

            const x = (width - targetWidth) / 2;
            const y = (height - targetHeight) / 2;

            cropArea = {
              x: Math.max(0, x),
              y: Math.max(0, y),
              width: Math.min(targetWidth, width),
              height: Math.min(targetHeight, height)
            };
          }

          // Apply crop
          const cropResult = await processor.crop({
            area: cropArea,
            maintainAspectRatio: true
          });

          if (cropResult.success && cropResult.data) {
            // Convert Blob to File
            const processedFile = new File([cropResult.data], file.name, { type: cropResult.data.type });
            processedFiles.push(processedFile);
          }
        } catch (error) {
          console.error(`Failed to process file ${file.name}:`, error);
        }

        onProgress(progress);
      }

      onResults(processedFiles);
    } catch (error) {
      console.error('Crop processing failed:', error);
    } finally {
      onProcessingEnd();
    }
  }, [processor, advancedProcessor, isInitialized, files, settings, onProcessingStart, onProcessingEnd, onProgress, onResults]);

  if (!isInitialized) {
    return (
      <div className="text-center py-12">
        <div className="flex items-center justify-center mb-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
        <h4 className="text-lg font-medium text-gray-500 mb-2">
          Initializing Crop Tools...
        </h4>
        <p className="text-gray-400 text-sm mb-4">
          Loading image processing tools ({initializationProgress}%)
        </p>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-green-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${initializationProgress}%` }}
          />
        </div>
        {(settings.smartCrop || settings.faceDetection) && (
          <p className="text-xs text-gray-400 mt-2">
            Loading AI models for smart cropping...
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="text-center py-8">
      <Button
        onClick={handleProcess}
        size="lg"
        className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
        disabled={files.length === 0}
      >
        <Icon icon="solar:crop-bold-duotone" className="h-5 w-5 mr-2" />
        Crop Images ({files.length} images)
      </Button>
      
      <p className="text-sm text-gray-500 mt-3">
        {settings.smartCrop ? 'AI-powered smart cropping' : 'Precision cropping'} 
        {settings.faceDetection && ' with face detection'}
      </p>
    </div>
  );
}
