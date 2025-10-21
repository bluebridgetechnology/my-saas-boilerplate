'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  ImageProcessor, 
  ResizeOptions, 
  ProcessingResult,
  ImageDimensions,
  FileValidator 
} from '@/lib/image-processing';

interface ResizeToolProps {
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

// Free tier presets - limited as per blueprint
const COMMON_DIMENSIONS = [
  // Standard Resolutions (Free)
  { id: '1920x1080', name: '1920×1080 (Full HD)', width: 1920, height: 1080 },
  { id: '1280x720', name: '1280×720 (HD)', width: 1280, height: 720 },
  { id: '1024x768', name: '1024×768 (XGA)', width: 1024, height: 768 },
  { id: '800x600', name: '800×600 (SVGA)', width: 800, height: 600 },
  { id: '640x480', name: '640×480 (VGA)', width: 640, height: 480 },
];

// Social Media Presets - FREE TIER (1 per platform as per blueprint)
const SOCIAL_MEDIA_PRESETS_FREE = [
  // Instagram (1 preset for free)
  { id: 'instagram-post', name: 'Instagram Post', width: 1080, height: 1080, platform: 'Instagram' },
  
  // YouTube (1 preset for free)
  { id: 'youtube-thumbnail', name: 'YouTube Thumbnail', width: 1280, height: 720, platform: 'YouTube' },
  
  // LinkedIn (1 preset for free)
  { id: 'linkedin-post', name: 'LinkedIn Post', width: 1200, height: 627, platform: 'LinkedIn' },
];

// Social Media Presets - PRO TIER (Additional presets for paid users)
const SOCIAL_MEDIA_PRESETS_PRO = [
  // Instagram Pro presets
  { id: 'instagram-story', name: 'Instagram Story', width: 1080, height: 1920, platform: 'Instagram' },
  { id: 'instagram-profile', name: 'Instagram Profile', width: 400, height: 400, platform: 'Instagram' },
  
  // YouTube Pro presets
  { id: 'youtube-banner', name: 'YouTube Banner', width: 2560, height: 1440, platform: 'YouTube' },
  { id: 'youtube-profile', name: 'YouTube Profile', width: 800, height: 800, platform: 'YouTube' },
  
  // LinkedIn Pro presets
  { id: 'linkedin-banner', name: 'LinkedIn Banner', width: 1584, height: 396, platform: 'LinkedIn' },
  { id: 'linkedin-profile', name: 'LinkedIn Profile', width: 400, height: 400, platform: 'LinkedIn' },
];

// Combined presets for free users (will be updated based on user plan)
const SOCIAL_MEDIA_PRESETS = SOCIAL_MEDIA_PRESETS_FREE;

export function ResizeTool({ files, onProcessingStart, onProcessingEnd, onProgress }: ResizeToolProps) {
  const [settings, setSettings] = useState<ResizeSettings>({
    mode: 'dimensions',
    maintainAspectRatio: true,
    quality: 0.9
  });
  
  const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [selectedDimension, setSelectedDimension] = useState<string>('');
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [originalDimensions, setOriginalDimensions] = useState<ImageDimensions | null>(null);
  const [processedDimensions, setProcessedDimensions] = useState<ImageDimensions | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({
    standard: true,
    social: false,
    percentage: false,
  });
  
  const processorRef = useRef<ImageProcessor | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
    // Check if it's a pro preset (disabled)
    const isProPreset = SOCIAL_MEDIA_PRESETS_PRO.some(preset => preset.id === dimensionId);
    if (isProPreset) {
      // Don't allow selection of pro presets for free users
      return;
    }
    
    // Check both COMMON_DIMENSIONS and SOCIAL_MEDIA_PRESETS_FREE
    let dimension = COMMON_DIMENSIONS.find(d => d.id === dimensionId);
    if (!dimension) {
      dimension = SOCIAL_MEDIA_PRESETS_FREE.find(d => d.id === dimensionId);
    }
    
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

  const processSingleImage = useCallback(async (file: File): Promise<ProcessingResult> => {
    if (!processorRef.current) {
      processorRef.current = new ImageProcessor();
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
    setIsProcessing(true);
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
      setIsProcessing(false);
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
      <div className="space-y-8">
        <h3 className="text-xl font-semibold text-gray-900">Resize Settings</h3>
        
        {/* Mode Selection */}
        <div>
          <Label className="text-base font-medium text-gray-700 mb-4 block">Resize Mode</Label>
          <RadioGroup 
            value={settings.mode} 
            onValueChange={(value) => setSettings(prev => ({ ...prev, mode: value as 'dimensions' | 'percentage' }))}
            className="flex flex-col sm:flex-row gap-4"
          >
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="dimensions" id="dimensions" />
              <Label htmlFor="dimensions" className="text-base">Custom Dimensions</Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="percentage" id="percentage" />
              <Label htmlFor="percentage" className="text-base">Percentage</Label>
            </div>
          </RadioGroup>
        </div>

        <hr className="border-gray-200" />

        {/* Dimension Settings */}
        {settings.mode === 'dimensions' && (
          <>
            {/* Preset Dimensions Dropdown */}
            <div>
              <Label className="text-base font-medium text-gray-700 mb-3 block">Quick Presets</Label>
              <select
                value={selectedDimension}
                onChange={(e) => handleDimensionSelect(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a preset...</option>
                <optgroup label="Standard Resolutions">
                  {COMMON_DIMENSIONS.map((dimension) => (
                    <option key={dimension.id} value={dimension.id}>
                      {dimension.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Social Media">
                  {SOCIAL_MEDIA_PRESETS.map((preset) => (
                    <option key={preset.id} value={preset.id}>
                      {preset.name} ({preset.width}×{preset.height})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Social Media Pro (Upgrade Required)">
                  {SOCIAL_MEDIA_PRESETS_PRO.map((preset) => (
                    <option key={preset.id} value={preset.id} disabled>
                      🔒 {preset.name} ({preset.width}×{preset.height}) - Pro Only
                    </option>
                  ))}
                </optgroup>
              </select>
              
              {/* Upgrade prompt for more presets */}
              <div className="mt-3 p-4 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg">
                <div className="flex items-center gap-2">
                  <Icon icon="solar:crown-bold-duotone" className="h-5 w-5 text-white" />
                  <span className="text-sm text-white font-semibold">Want more presets?</span>
                </div>
                <p className="text-xs text-white/90 mt-2 leading-relaxed">
                  Upgrade to Pro for 6 additional social media presets including Instagram Stories, YouTube Banners, and more!
                </p>
              </div>
            </div>

            <hr className="border-gray-200" />

            {/* Custom Dimensions */}
            <div>
              <Label className="text-base font-medium text-gray-700 mb-3 block">Custom Dimensions</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="width" className="text-sm font-medium text-gray-600 mb-2 block">Width (px)</Label>
                  <Input
                    id="width"
                    type="number"
                    value={settings.width || ''}
                    onChange={(e) => handleCustomDimensionChange('width', e.target.value)}
                    placeholder="Enter width"
                    className="h-12 text-base"
                  />
                </div>
                <div>
                  <Label htmlFor="height" className="text-sm font-medium text-gray-600 mb-2 block">Height (px)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={settings.height || ''}
                    onChange={(e) => handleCustomDimensionChange('height', e.target.value)}
                    placeholder="Enter height"
                    className="h-12 text-base"
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Percentage Settings */}
        {settings.mode === 'percentage' && (
          <>
            {/* Quick Presets */}
            <div>
              <Label className="text-base font-medium text-gray-700 mb-3 block">Quick Presets</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {RESIZE_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handlePresetSelect(preset.id)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedPreset === preset.id
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-base font-medium">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <hr className="border-gray-200" />

            {/* Custom Percentage */}
            <div>
              <Label htmlFor="percentage" className="text-base font-medium text-gray-700 mb-3 block">Custom Percentage</Label>
              <Input
                id="percentage"
                type="number"
                value={settings.percentage || ''}
                onChange={(e) => handlePercentageChange(e.target.value)}
                placeholder="Enter percentage (e.g., 75)"
                min="1"
                max="500"
                className="h-12 text-base"
              />
            </div>
          </>
        )}

        <hr className="border-gray-200" />

        {/* Aspect Ratio Toggle */}
        <div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="aspect-ratio" className="text-base font-medium text-gray-700">Maintain Aspect Ratio</Label>
              <p className="text-sm text-gray-500 mt-1">Keep original proportions when resizing</p>
            </div>
            <Switch
              id="aspect-ratio"
              checked={settings.maintainAspectRatio}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, maintainAspectRatio: checked }))}
            />
          </div>
        </div>

        <hr className="border-gray-200" />

        {/* Quality Setting */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <Label htmlFor="quality" className="text-base font-medium text-gray-700">Quality</Label>
            <span className="text-lg font-semibold text-gray-900">{Math.round(settings.quality * 100)}%</span>
          </div>
          <input
            id="quality"
            type="range"
            min="0.1"
            max="1"
            step="0.1"
            value={settings.quality}
            onChange={(e) => setSettings(prev => ({ ...prev, quality: parseFloat(e.target.value) }))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>Lower quality</span>
            <span>Higher quality</span>
          </div>
        </div>

        {/* Process Button */}
        <Button 
          onClick={processAllImages}
          className="w-full h-14 text-lg font-semibold bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
          disabled={files.length === 0}
        >
          {isProcessing ? (
            <div className="flex items-center gap-3">
              <Icon icon="solar:refresh-bold-duotone" className="h-5 w-5 animate-spin" />
              Processing Images...
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Icon icon="solar:play-bold-duotone" className="h-5 w-5" />
              Process {files.length} Image{files.length !== 1 ? 's' : ''}
            </div>
          )}
        </Button>
      </div>

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

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {processedFiles.map((processedFile, index) => (
                <div key={index} className="relative group bg-white rounded-lg border border-gray-200 p-3">
                  <div className="relative">
                    <img
                      src={URL.createObjectURL(processedFile.file)}
                      alt={processedFile.file.name}
                      className="w-full h-20 object-cover rounded-lg border border-gray-200"
                      onError={(e) => {
                        // Fallback for images that fail to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const fallback = target.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                    {/* Fallback for non-image files or failed loads */}
                    <div className="w-full h-20 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center" style={{ display: 'none' }}>
                      <div className="text-center">
                        <Icon icon="solar:file-bold-duotone" className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                        <span className="text-xs text-gray-500">{processedFile.file.name.split('.').pop()?.toUpperCase()}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* File Info */}
                  <div className="mt-2">
                    <div className="text-xs text-gray-600 truncate font-medium" title={processedFile.file.name}>
                      {processedFile.file.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {FileValidator.formatFileSize(processedFile.file.size)}
                      {processedFile.result?.success && (
                        <span className="ml-1 text-green-600 font-medium">• Processed</span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex gap-1">
                      {processedFile.result?.success && (
                        <button
                          onClick={() => downloadProcessedImage(index)}
                          className="bg-green-500 hover:bg-green-600 text-white rounded-full p-1 transition-colors"
                          title="Download"
                        >
                          <Icon icon="solar:download-bold-duotone" className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Status Badge */}
                  {processedFile.isProcessing && (
                    <div className="absolute top-2 left-2">
                      <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                        Processing...
                      </span>
                    </div>
                  )}
                  
                  {processedFile.error && (
                    <div className="absolute top-2 left-2">
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                        Error
                      </span>
                    </div>
                  )}
                  
                  {processedFile.result?.success && (
                    <div className="absolute top-2 left-2">
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                        Ready
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
