'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  ImageProcessor, 
  CompressionOptions,
  ProcessingResult,
  FileValidator 
} from '@/lib/image-processing';

interface CompressionToolProps {
  files: File[];
  onProcessingStart: () => void;
  onProcessingEnd: () => void;
  onProgress: (progress: number) => void;
}

interface CompressionSettings {
  format: 'jpeg' | 'png' | 'webp';
  quality: number;
  progressive: boolean;
  lossless: boolean;
}

interface ProcessedFile {
  file: File;
  result?: ProcessingResult;
  error?: string;
  isProcessing: boolean;
}

const COMPRESSION_FORMATS = [
  { id: 'jpeg', name: 'JPEG', description: 'Best for photos' },
  { id: 'png', name: 'PNG', description: 'Best for graphics with transparency' },
  { id: 'webp', name: 'WEBP', description: 'Modern format, smaller files' },
];

const QUALITY_PRESETS = [
  { id: 'low', name: 'Low (30%)', quality: 0.3 },
  { id: 'medium', name: 'Medium (60%)', quality: 0.6 },
  { id: 'high', name: 'High (85%)', quality: 0.85 },
  { id: 'max', name: 'Maximum (95%)', quality: 0.95 },
];

export function CompressionTool({ files, onProcessingStart, onProcessingEnd, onProgress }: CompressionToolProps) {
  const [settings, setSettings] = useState<CompressionSettings>({
    format: 'jpeg',
    quality: 0.85,
    progressive: true,
    lossless: false
  });
  
  const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([]);
  const [selectedQualityPreset, setSelectedQualityPreset] = useState<string>('high');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [estimatedSize, setEstimatedSize] = useState<number>(0);
  const [showResultsModal, setShowResultsModal] = useState(false);
  
  const processorRef = useRef<ImageProcessor | null>(null);

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

  // Update estimated size when settings change
  useEffect(() => {
    if (originalSize > 0) {
      const compressionRatio = settings.lossless ? 0.1 : (1 - settings.quality);
      const estimated = Math.round(originalSize * (1 - compressionRatio));
      setEstimatedSize(estimated);
    }
  }, [settings, originalSize]);

  const loadPreviewImage = useCallback(async (file: File) => {
    try {
      const url = URL.createObjectURL(file);
      setPreviewImage(url);
      setOriginalSize(file.size);
    } catch (error) {
      console.error('Failed to load preview image:', error);
    }
  }, []);

  const handleFormatSelect = useCallback((format: string) => {
    setSettings(prev => ({ ...prev, format: format as 'jpeg' | 'png' | 'webp' }));
  }, []);

  const handleQualityPresetSelect = useCallback((presetId: string) => {
    const preset = QUALITY_PRESETS.find(p => p.id === presetId);
    if (preset) {
      setSettings(prev => ({ ...prev, quality: preset.quality }));
      setSelectedQualityPreset(presetId);
    }
  }, []);

  const handleCustomQualityChange = useCallback((value: string) => {
    const quality = parseFloat(value) || 0.85;
    setSettings(prev => ({ ...prev, quality }));
    setSelectedQualityPreset('');
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

    // Create compression options
    const compressionOptions: CompressionOptions = {
      format: settings.format,
      quality: settings.quality,
      progressive: settings.progressive
    };

    // Compress image
    const compressResult = await processor.compress(compressionOptions);
    if (!compressResult.success) {
      return compressResult;
    }

    return compressResult;
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
      // Open results modal after processing is complete
      setShowResultsModal(true);
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
      link.download = `compressed_${processedFile.file.name.replace(/\.[^/.]+$/, '')}.${settings.format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }, [processedFiles, settings.format]);

  const downloadAllImages = useCallback(() => {
    processedFiles.forEach((processedFile, index) => {
      if (processedFile.result?.data) {
        setTimeout(() => downloadProcessedImage(index), index * 100);
      }
    });
  }, [processedFiles, downloadProcessedImage]);

  const compressionRatio = originalSize > 0 ? FileValidator.calculateCompressionRatio(originalSize, estimatedSize) : 0;

  return (
    <div className="space-y-6">
      {/* Settings Panel */}
      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Compression Settings</h3>
            
            {/* Format Selection */}
            <div className="mb-6">
              <Label className="text-sm font-medium text-gray-700 mb-3 block">Output Format</Label>
              <RadioGroup 
                value={settings.format} 
                onValueChange={handleFormatSelect}
                className="grid grid-cols-1 gap-3"
              >
                {COMPRESSION_FORMATS.map((format) => (
                  <div key={format.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value={format.id} id={format.id} />
                    <div className="flex-1">
                      <Label htmlFor={format.id} className="text-sm font-medium text-gray-900">
                        {format.name}
                      </Label>
                      <p className="text-xs text-gray-500">{format.description}</p>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Quality Settings */}
            <div className="mb-6">
              <Label className="text-sm font-medium text-gray-700 mb-3 block">Quality</Label>
              
              {/* Quality Presets */}
              <RadioGroup 
                value={selectedQualityPreset} 
                onValueChange={handleQualityPresetSelect}
                className="grid grid-cols-2 gap-2 mb-4"
              >
                {QUALITY_PRESETS.map((preset) => (
                  <div key={preset.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={preset.id} id={preset.id} />
                    <Label htmlFor={preset.id} className="text-sm">{preset.name}</Label>
                  </div>
                ))}
              </RadioGroup>

              {/* Custom Quality Slider */}
              <div>
                <Label htmlFor="quality" className="text-sm font-medium text-gray-700">Custom Quality</Label>
                <div className="flex items-center gap-3 mt-2">
                  <Input
                    id="quality"
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.05"
                    value={settings.quality}
                    onChange={(e) => handleCustomQualityChange(e.target.value)}
                    className="flex-1"
                  />
                  <span className="text-sm text-gray-600 w-12">{Math.round(settings.quality * 100)}%</span>
                </div>
              </div>
            </div>

            {/* Advanced Options */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="progressive" className="text-sm font-medium text-gray-700">Progressive JPEG</Label>
                  <p className="text-xs text-gray-500">Better loading experience for large images</p>
                </div>
                <Switch
                  id="progressive"
                  checked={settings.progressive}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, progressive: checked }))}
                  disabled={settings.format !== 'jpeg'}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="lossless" className="text-sm font-medium text-gray-700">Lossless Compression</Label>
                  <p className="text-xs text-gray-500">No quality loss, larger file size</p>
                </div>
                <Switch
                  id="lossless"
                  checked={settings.lossless}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, lossless: checked }))}
                />
              </div>
            </div>

            {/* Size Estimation */}
            {originalSize > 0 && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Size Estimation</h4>
                <div className="space-y-1 text-sm text-blue-800">
                  <div className="flex justify-between">
                    <span>Original Size:</span>
                    <span>{FileValidator.formatFileSize(originalSize)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated Size:</span>
                    <span>{FileValidator.formatFileSize(estimatedSize)}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Size Reduction:</span>
                    <span>{compressionRatio}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Process Button */}
          <Button 
            onClick={processAllImages}
            className="w-full"
            disabled={files.length === 0}
          >
            <Icon icon="solar:play-bold-duotone" className="h-4 w-4 mr-2" />
            Compress {files.length} Image{files.length !== 1 ? 's' : ''}
          </Button>

          {/* View Results Button */}
          {processedFiles.some(pf => pf.result || pf.error) && (
            <Button 
              onClick={() => setShowResultsModal(true)}
              variant="outline"
              className="w-full"
            >
              <Icon icon="solar:gallery-bold-duotone" className="h-4 w-4 mr-2" />
              View Results ({processedFiles.filter(pf => pf.result || pf.error).length})
            </Button>
          )}

          {/* Pro Feature Notice */}
          {files.length > 5 && (
            <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
              <div className="flex items-center gap-3">
                <Icon icon="solar:crown-bold-duotone" className="h-6 w-6 text-purple-600" />
                <div>
                  <h4 className="text-sm font-semibold text-purple-900">Pro Feature</h4>
                  <p className="text-xs text-purple-700">
                    Bulk compression of {files.length} images is available with Pro subscription
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Results Modal */}
      <Dialog open={showResultsModal} onOpenChange={setShowResultsModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Compressed Images</span>
              <Button onClick={downloadAllImages} variant="outline" size="sm">
                <Icon icon="solar:download-bold-duotone" className="h-4 w-4 mr-2" />
                Download All
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-3">
            {processedFiles.map((processedFile, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Icon icon="solar:gallery-bold-duotone" className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      compressed_{processedFile.file.name.replace(/\.[^/.]+$/, '')}.{settings.format}
                    </p>
                    <p className="text-xs text-gray-500">
                      Original: {FileValidator.formatFileSize(processedFile.file.size)}
                      {processedFile.result?.processedSize && (
                        <> → Compressed: {FileValidator.formatFileSize(processedFile.result.processedSize)}</>
                      )}
                      {processedFile.result?.processedSize && (
                        <> ({FileValidator.calculateCompressionRatio(processedFile.file.size, processedFile.result.processedSize)}% reduction)</>
                      )}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {processedFile.isProcessing && (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
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
        </DialogContent>
      </Dialog>
    </div>
  );
}
