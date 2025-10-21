'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ImagePreview } from './image-preview';
import { 
  EnhancedImageProcessor, 
  ResizeOptions, 
  ProcessingResult,
  ImageDimensions,
  FileValidator 
} from '@/lib/image-processing';

interface EnhancedResizeToolProps {
  files: File[];
  onProcessingStart: () => void;
  onProcessingEnd: () => void;
  onProgress: (progress: number) => void;
}

interface ResizeSettings {
  mode: 'dimensions' | 'percentage';
  width?: number;
  height?: number;
  percentage?: number;
  maintainAspectRatio: boolean;
  quality: number;
}

interface ProcessedFile {
  file: File;
  result?: ProcessingResult;
  error?: string;
  isProcessing: boolean;
}

const RESIZE_PRESETS = [
  { id: '50', name: '50%', percentage: 50 },
  { id: '75', name: '75%', percentage: 75 },
  { id: '150', name: '150%', percentage: 150 },
  { id: '200', name: '200%', percentage: 200 },
];

const COMMON_DIMENSIONS = [
  { id: '1920x1080', name: '1920×1080 (Full HD)', width: 1920, height: 1080 },
  { id: '1280x720', name: '1280×720 (HD)', width: 1280, height: 720 },
  { id: '800x600', name: '800×600 (SVGA)', width: 800, height: 600 },
  { id: '640x480', name: '640×480 (VGA)', width: 640, height: 480 },
];

export function EnhancedResizeTool({ files, onProcessingStart, onProcessingEnd, onProgress }: EnhancedResizeToolProps) {
  const [settings, setSettings] = useState<ResizeSettings>({
    mode: 'dimensions',
    maintainAspectRatio: true,
    quality: 0.9
  });
  
  const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [selectedDimension, setSelectedDimension] = useState<string>('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [originalDimensions, setOriginalDimensions] = useState<ImageDimensions | null>(null);
  const [processedDimensions, setProcessedDimensions] = useState<ImageDimensions | null>(null);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [processedSize, setProcessedSize] = useState<number>(0);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  
  const processorRef = useRef<EnhancedImageProcessor | null>(null);

  // Initialize processed files
  useEffect(() => {
    const initialProcessedFiles: ProcessedFile[] = files.map(file => ({
      file,
      isProcessing: false
    }));
    setProcessedFiles(initialProcessedFiles);
  }, [files]);

  // Load preview image
  useEffect(() => {
    if (files.length > 0) {
      loadPreviewImage(files[currentImageIndex]);
    }
  }, [files, currentImageIndex]);

  const loadPreviewImage = useCallback(async (file: File) => {
    try {
      const url = URL.createObjectURL(file);
      setPreviewImage(url);
      setOriginalSize(file.size);
      
      // Load image to get dimensions
      const img = new Image();
      img.onload = () => {
        setOriginalDimensions({ width: img.width, height: img.height });
        setProcessedDimensions({ width: img.width, height: img.height });
      };
      img.src = url;
    } catch (error) {
      console.error('Failed to load preview image:', error);
    }
  }, []);

  const handlePresetSelect = useCallback((presetId: string) => {
    const preset = RESIZE_PRESETS.find(p => p.id === presetId);
    if (preset) {
      setSettings(prev => ({
        ...prev,
        mode: 'percentage',
        percentage: preset.percentage
      }));
      setSelectedPreset(presetId);
      setSelectedDimension('');
    }
  }, []);

  const handleDimensionSelect = useCallback((dimensionId: string) => {
    const dimension = COMMON_DIMENSIONS.find(d => d.id === dimensionId);
    if (dimension) {
      setSettings(prev => ({
        ...prev,
        mode: 'dimensions',
        width: dimension.width,
        height: dimension.height
      }));
      setSelectedDimension(dimensionId);
      setSelectedPreset('');
    }
  }, []);

  const handleCustomDimensionChange = useCallback((field: 'width' | 'height', value: string) => {
    const numValue = parseInt(value) || undefined;
    setSettings(prev => ({
      ...prev,
      mode: 'dimensions',
      [field]: numValue
    }));
    setSelectedPreset('');
    setSelectedDimension('');
  }, []);

  const handlePercentageChange = useCallback((value: string) => {
    const numValue = parseInt(value) || undefined;
    setSettings(prev => ({
      ...prev,
      mode: 'percentage',
      percentage: numValue
    }));
    setSelectedPreset('');
  }, []);

  // Generate preview of resize operation
  const generatePreview = useCallback(async () => {
    if (!files[currentImageIndex] || !processorRef.current) {
      return;
    }

    setIsPreviewLoading(true);
    
    try {
      const processor = processorRef.current;
      
      // Create resize options
      const resizeOptions: ResizeOptions = {
        maintainAspectRatio: settings.maintainAspectRatio,
        quality: settings.quality
      };

      if (settings.mode === 'dimensions') {
        if (settings.width) resizeOptions.width = settings.width;
        if (settings.height) resizeOptions.height = settings.height;
      } else if (settings.mode === 'percentage' && settings.percentage) {
        resizeOptions.percentage = settings.percentage;
      }

      // Get processed image blob
      const blob = await processor.getCanvasBlob('png', settings.quality);
      if (blob) {
        const url = URL.createObjectURL(blob);
        setProcessedImage(url);
        setProcessedSize(blob.size);
        
        // Update dimensions
        const dimensions = processor.getCurrentDimensions();
        if (dimensions) {
          setProcessedDimensions(dimensions);
        }
      }
    } catch (error) {
      console.error('Failed to generate preview:', error);
    } finally {
      setIsPreviewLoading(false);
    }
  }, [files, currentImageIndex, settings]);

  // Generate preview when settings change
  useEffect(() => {
    if (previewImage && (settings.width || settings.height || settings.percentage)) {
      const timeoutId = setTimeout(() => {
        generatePreview();
      }, 300); // Debounce preview generation

      return () => clearTimeout(timeoutId);
    }
  }, [settings, previewImage, generatePreview]);

  const processSingleImage = useCallback(async (file: File): Promise<ProcessingResult> => {
    if (!processorRef.current) {
      processorRef.current = new EnhancedImageProcessor();
    }

    const processor = processorRef.current;
    
    // Load image
    const loadResult = await processor.loadImage(file);
    if (!loadResult.success) {
      return loadResult;
    }

    // Create resize options
    const resizeOptions: ResizeOptions = {
      maintainAspectRatio: settings.maintainAspectRatio,
      quality: settings.quality
    };

    if (settings.mode === 'dimensions') {
      if (settings.width) resizeOptions.width = settings.width;
      if (settings.height) resizeOptions.height = settings.height;
    } else if (settings.mode === 'percentage' && settings.percentage) {
      resizeOptions.percentage = settings.percentage;
    }

    // Resize image
    const resizeResult = await processor.resize(resizeOptions);
    if (!resizeResult.success) {
      return resizeResult;
    }

    // Get processed image as blob
    const blob = await processor.getCanvasBlob('png', settings.quality);
    if (!blob) {
      return { success: false, error: 'Failed to generate processed image' };
    }

    return {
      success: true,
      data: blob,
      processedSize: blob.size,
      dimensions: resizeResult.dimensions
    };
  }, [settings]);

  const processAllImages = useCallback(async () => {
    onProcessingStart();
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Update processing status
        setProcessedFiles(prev => prev.map((pf, index) => 
          index === i ? { ...pf, isProcessing: true } : pf
        ));
        
        onProgress((i / files.length) * 100);
        
        try {
          const result = await processSingleImage(file);
          
          setProcessedFiles(prev => prev.map((pf, index) => 
            index === i ? { ...pf, result, isProcessing: false } : pf
          ));
        } catch (error) {
          setProcessedFiles(prev => prev.map((pf, index) => 
            index === i ? { 
              ...pf, 
              error: error instanceof Error ? error.message : 'Processing failed',
              isProcessing: false 
            } : pf
          ));
        }
      }
      
      onProgress(100);
    } finally {
      onProcessingEnd();
    }
  }, [files, processSingleImage, onProcessingStart, onProcessingEnd, onProgress]);

  const downloadProcessedImage = useCallback((index: number) => {
    const processedFile = processedFiles[index];
    if (processedFile.result?.data) {
      const url = URL.createObjectURL(processedFile.result.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = `resized_${processedFile.file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }, [processedFiles]);

  const downloadAllImages = useCallback(() => {
    processedFiles.forEach((processedFile, index) => {
      if (processedFile.result?.data) {
        setTimeout(() => downloadProcessedImage(index), index * 100);
      }
    });
  }, [processedFiles, downloadProcessedImage]);

  return (
    <div className="space-y-6">
      {/* Settings Panel */}
      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resize Settings</h3>
            
            {/* Mode Selection */}
            <div className="mb-6">
              <Label className="text-sm font-medium text-gray-700 mb-3 block">Resize Mode</Label>
              <RadioGroup 
                value={settings.mode} 
                onValueChange={(value) => setSettings(prev => ({ ...prev, mode: value as 'dimensions' | 'percentage' }))}
                className="flex gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="dimensions" id="dimensions" />
                  <Label htmlFor="dimensions">Custom Dimensions</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="percentage" id="percentage" />
                  <Label htmlFor="percentage">Percentage</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Dimension Settings */}
            {settings.mode === 'dimensions' && (
              <div className="space-y-4">
                {/* Preset Dimensions */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">Common Dimensions</Label>
                  <RadioGroup 
                    value={selectedDimension} 
                    onValueChange={handleDimensionSelect}
                    className="grid grid-cols-2 gap-2"
                  >
                    {COMMON_DIMENSIONS.map((dimension) => (
                      <div key={dimension.id} className="flex items-center space-x-2">
                        <RadioGroupItem value={dimension.id} id={dimension.id} />
                        <Label htmlFor={dimension.id} className="text-sm">{dimension.name}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {/* Custom Dimensions */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="width" className="text-sm font-medium text-gray-700">Width (px)</Label>
                    <Input
                      id="width"
                      type="number"
                      value={settings.width || ''}
                      onChange={(e) => handleCustomDimensionChange('width', e.target.value)}
                      placeholder="Enter width"
                    />
                  </div>
                  <div>
                    <Label htmlFor="height" className="text-sm font-medium text-gray-700">Height (px)</Label>
                    <Input
                      id="height"
                      type="number"
                      value={settings.height || ''}
                      onChange={(e) => handleCustomDimensionChange('height', e.target.value)}
                      placeholder="Enter height"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Percentage Settings */}
            {settings.mode === 'percentage' && (
              <div className="space-y-4">
                {/* Preset Percentages */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">Quick Presets</Label>
                  <RadioGroup 
                    value={selectedPreset} 
                    onValueChange={handlePresetSelect}
                    className="grid grid-cols-4 gap-2"
                  >
                    {RESIZE_PRESETS.map((preset) => (
                      <div key={preset.id} className="flex items-center space-x-2">
                        <RadioGroupItem value={preset.id} id={preset.id} />
                        <Label htmlFor={preset.id} className="text-sm">{preset.name}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {/* Custom Percentage */}
                <div>
                  <Label htmlFor="percentage" className="text-sm font-medium text-gray-700">Custom Percentage</Label>
                  <Input
                    id="percentage"
                    type="number"
                    value={settings.percentage || ''}
                    onChange={(e) => handlePercentageChange(e.target.value)}
                    placeholder="Enter percentage (e.g., 75)"
                    min="1"
                    max="500"
                  />
                </div>
              </div>
            )}

            {/* Aspect Ratio Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="aspect-ratio" className="text-sm font-medium text-gray-700">Maintain Aspect Ratio</Label>
                <p className="text-xs text-gray-500">Keep original proportions when resizing</p>
              </div>
              <Switch
                id="aspect-ratio"
                checked={settings.maintainAspectRatio}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, maintainAspectRatio: checked }))}
              />
            </div>

            {/* Quality Setting */}
            <div>
              <Label htmlFor="quality" className="text-sm font-medium text-gray-700">Quality</Label>
              <div className="flex items-center gap-3 mt-2">
                <Input
                  id="quality"
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={settings.quality}
                  onChange={(e) => setSettings(prev => ({ ...prev, quality: parseFloat(e.target.value) }))}
                  className="flex-1"
                />
                <span className="text-sm text-gray-600 w-12">{Math.round(settings.quality * 100)}%</span>
              </div>
            </div>
          </div>

          {/* Process Button */}
          <Button 
            onClick={processAllImages}
            className="w-full"
            disabled={files.length === 0}
          >
            <Icon icon="solar:play-bold-duotone" className="h-4 w-4 mr-2" />
            Process {files.length} Image{files.length !== 1 ? 's' : ''}
          </Button>
        </div>
      </Card>

      {/* Enhanced Image Preview */}
      {previewImage && originalDimensions && (
        <ImagePreview
          originalImage={previewImage}
          processedImage={processedImage || undefined}
          originalSize={originalSize}
          processedSize={processedSize}
          originalDimensions={originalDimensions}
          processedDimensions={processedDimensions || undefined}
          isLoading={isPreviewLoading}
        />
      )}

      {/* Results */}
      {processedFiles.some(pf => pf.result || pf.error) && (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Processed Images</h3>
              <Button onClick={downloadAllImages} variant="outline">
                <Icon icon="solar:download-bold-duotone" className="h-4 w-4 mr-2" />
                Download All
              </Button>
            </div>

            <div className="space-y-3">
              {processedFiles.map((processedFile, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Icon icon="solar:gallery-bold-duotone" className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{processedFile.file.name}</p>
                      <p className="text-xs text-gray-500">
                        Original: {FileValidator.formatFileSize(processedFile.file.size)}
                        {processedFile.result?.processedSize && (
                          <> → Processed: {FileValidator.formatFileSize(processedFile.result.processedSize)}</>
                        )}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {processedFile.isProcessing && (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm text-gray-600">Processing...</span>
                      </div>
                    )}
                    
                    {processedFile.error && (
                      <span className="text-sm text-red-600">{processedFile.error}</span>
                    )}
                    
                    {processedFile.result?.success && (
                      <Button
                        size="sm"
                        onClick={() => downloadProcessedImage(index)}
                      >
                        <Icon icon="solar:download-bold-duotone" className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
