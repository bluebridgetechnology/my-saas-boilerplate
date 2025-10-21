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
  ConversionOptions,
  ProcessingResult,
  FileValidator 
} from '@/lib/image-processing';

interface ConversionToolProps {
  files: File[];
  onProcessingStart: () => void;
  onProcessingEnd: () => void;
  onProgress: (progress: number) => void;
}

interface ConversionSettings {
  outputFormat: 'jpeg' | 'png' | 'webp' | 'gif' | 'tiff' | 'bmp' | 'ico' | 'svg' | 'pdf';
  quality: number;
  preserveTransparency: boolean;
  removeMetadata: boolean;
}

interface ProcessedFile {
  file: File;
  result?: ProcessingResult;
  error?: string;
  isProcessing: boolean;
}

const OUTPUT_FORMATS = [
  { id: 'jpeg', name: 'JPEG', description: 'Best for photos, smaller files', supportsTransparency: false, category: 'raster' },
  { id: 'png', name: 'PNG', description: 'Lossless, supports transparency', supportsTransparency: true, category: 'raster' },
  { id: 'webp', name: 'WEBP', description: 'Modern format, excellent compression', supportsTransparency: true, category: 'raster' },
  { id: 'gif', name: 'GIF', description: 'Animation support, limited colors', supportsTransparency: true, category: 'raster' },
  { id: 'tiff', name: 'TIFF', description: 'High quality, professional use', supportsTransparency: true, category: 'raster' },
  { id: 'bmp', name: 'BMP', description: 'Uncompressed bitmap format', supportsTransparency: false, category: 'raster' },
  { id: 'ico', name: 'ICO', description: 'Windows icon format', supportsTransparency: true, category: 'raster' },
  { id: 'svg', name: 'SVG', description: 'Vector graphics, scalable', supportsTransparency: true, category: 'vector' },
  { id: 'pdf', name: 'PDF', description: 'Document format, multi-page', supportsTransparency: false, category: 'document' },
];

const QUALITY_PRESETS = [
  { id: 'low', name: 'Low (50%)', quality: 0.5 },
  { id: 'medium', name: 'Medium (75%)', quality: 0.75 },
  { id: 'high', name: 'High (90%)', quality: 0.9 },
  { id: 'max', name: 'Maximum (95%)', quality: 0.95 },
];

export function ConversionTool({ files, onProcessingStart, onProcessingEnd, onProgress }: ConversionToolProps) {
  const [settings, setSettings] = useState<ConversionSettings>({
    outputFormat: 'jpeg',
    quality: 0.9,
    preserveTransparency: true,
    removeMetadata: false
  });
  
  const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([]);
  const [selectedQualityPreset, setSelectedQualityPreset] = useState<string>('high');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [originalFormat, setOriginalFormat] = useState<string>('');
  const [hasTransparency, setHasTransparency] = useState<boolean>(false);
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

  const loadPreviewImage = useCallback(async (file: File) => {
    try {
      const url = URL.createObjectURL(file);
      setPreviewImage(url);
      
      // Get file format
      const format = FileValidator.getFileFormat(file);
      setOriginalFormat(format || 'unknown');
      
      // Check if format supports transparency
      const supportsTransparency = format ? FileValidator.supportsTransparency(format) : false;
      setHasTransparency(supportsTransparency);
      
      // Update preserve transparency setting based on output format
      const outputFormatSupportsTransparency = OUTPUT_FORMATS.find(f => f.id === settings.outputFormat)?.supportsTransparency || false;
      if (!outputFormatSupportsTransparency && settings.preserveTransparency) {
        setSettings(prev => ({ ...prev, preserveTransparency: false }));
      }
    } catch (error) {
      console.error('Failed to load preview image:', error);
    }
  }, [settings.outputFormat, settings.preserveTransparency]);

  const handleFormatSelect = useCallback((format: string) => {
    const newFormat = format as 'jpeg' | 'png' | 'webp' | 'gif' | 'tiff' | 'bmp' | 'ico' | 'svg' | 'pdf';
    const formatInfo = OUTPUT_FORMATS.find(f => f.id === newFormat);
    
    setSettings(prev => ({
      ...prev,
      outputFormat: newFormat,
      preserveTransparency: formatInfo?.supportsTransparency ? prev.preserveTransparency : false
    }));
  }, []);

  const handleQualityPresetSelect = useCallback((presetId: string) => {
    const preset = QUALITY_PRESETS.find(p => p.id === presetId);
    if (preset) {
      setSettings(prev => ({ ...prev, quality: preset.quality }));
      setSelectedQualityPreset(presetId);
    }
  }, []);

  const handleCustomQualityChange = useCallback((value: string) => {
    const quality = parseFloat(value) || 0.9;
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

    // Create conversion options
    const conversionOptions: ConversionOptions = {
      outputFormat: settings.outputFormat,
      quality: settings.quality,
      preserveTransparency: settings.preserveTransparency
    };

    // Convert image
    const convertResult = await processor.convert(conversionOptions);
    if (!convertResult.success) {
      return convertResult;
    }

    return convertResult;
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
      const originalName = processedFile.file.name.replace(/\.[^/.]+$/, '');
      link.download = `${originalName}.${settings.outputFormat}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }, [processedFiles, settings.outputFormat]);

  const getConvertedFileName = useCallback((originalName: string) => {
    const nameWithoutExtension = originalName.replace(/\.[^/.]+$/, '');
    return `${nameWithoutExtension}.${settings.outputFormat}`;
  }, [settings.outputFormat]);

  const downloadAllImages = useCallback(() => {
    processedFiles.forEach((processedFile, index) => {
      if (processedFile.result?.data) {
        setTimeout(() => downloadProcessedImage(index), index * 100);
      }
    });
  }, [processedFiles, downloadProcessedImage]);

  const outputFormatInfo = OUTPUT_FORMATS.find(f => f.id === settings.outputFormat);

  return (
    <div className="space-y-6">
      {/* Settings Panel */}
      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion Settings</h3>
            
            {/* Format Selection */}
            <div className="mb-6">
              <Label className="text-sm font-medium text-gray-700 mb-3 block">Output Format</Label>
              
              {/* Raster Formats */}
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Raster Images</h4>
                <RadioGroup 
                  value={settings.outputFormat} 
                  onValueChange={handleFormatSelect}
                  className="grid grid-cols-1 gap-2"
                >
                  {OUTPUT_FORMATS.filter(f => f.category === 'raster').map((format) => (
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

              {/* Vector Formats */}
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Vector Graphics</h4>
                <RadioGroup 
                  value={settings.outputFormat} 
                  onValueChange={handleFormatSelect}
                  className="grid grid-cols-1 gap-2"
                >
                  {OUTPUT_FORMATS.filter(f => f.category === 'vector').map((format) => (
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

              {/* Document Formats */}
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Documents</h4>
                <RadioGroup 
                  value={settings.outputFormat} 
                  onValueChange={handleFormatSelect}
                  className="grid grid-cols-1 gap-2"
                >
                  {OUTPUT_FORMATS.filter(f => f.category === 'document').map((format) => (
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
            </div>

            {/* Quality Settings - Only show for formats that support quality */}
            {['jpeg', 'webp', 'tiff'].includes(settings.outputFormat) && (
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
            )}

            {/* Format-specific Information */}
            {settings.outputFormat === 'svg' && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 mb-2">SVG Conversion Note</h4>
                <p className="text-sm text-blue-800">
                  Converting to SVG will create a vector representation. Complex images may not convert perfectly.
                </p>
              </div>
            )}

            {settings.outputFormat === 'pdf' && (
              <div className="mb-6 p-4 bg-purple-50 rounded-lg">
                <h4 className="text-sm font-medium text-purple-900 mb-2">PDF Conversion Note</h4>
                <p className="text-sm text-purple-800">
                  Images will be embedded in a PDF document. Each image becomes a separate page.
                </p>
              </div>
            )}

            {['gif', 'bmp', 'ico'].includes(settings.outputFormat) && (
              <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
                <h4 className="text-sm font-medium text-yellow-900 mb-2">Format Limitation</h4>
                <p className="text-sm text-yellow-800">
                  {settings.outputFormat.toUpperCase()} format has limited color support and may not preserve all image details.
                </p>
              </div>
            )}

            {/* Advanced Options */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="preserve-transparency" className="text-sm font-medium text-gray-700">Preserve Transparency</Label>
                  <p className="text-xs text-gray-500">Keep transparent areas (PNG/WEBP only)</p>
                </div>
                <Switch
                  id="preserve-transparency"
                  checked={settings.preserveTransparency}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, preserveTransparency: checked }))}
                  disabled={!outputFormatInfo?.supportsTransparency}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="remove-metadata" className="text-sm font-medium text-gray-700">Remove Metadata</Label>
                  <p className="text-xs text-gray-500">Strip EXIF data and other metadata</p>
                </div>
                <Switch
                  id="remove-metadata"
                  checked={settings.removeMetadata}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, removeMetadata: checked }))}
                />
              </div>
            </div>

            {/* Format Information */}
            {originalFormat && (
              <div className="p-4 bg-orange-50 rounded-lg">
                <h4 className="text-sm font-medium text-orange-900 mb-2">Format Information</h4>
                <div className="space-y-1 text-sm text-orange-800">
                  <div className="flex justify-between">
                    <span>Original Format:</span>
                    <span className="uppercase">{originalFormat}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Output Format:</span>
                    <span className="uppercase">{settings.outputFormat}</span>
                  </div>
                  {hasTransparency && (
                    <div className="flex justify-between">
                      <span>Has Transparency:</span>
                      <span>{hasTransparency ? 'Yes' : 'No'}</span>
                    </div>
                  )}
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
            Convert {files.length} Image{files.length !== 1 ? 's' : ''}
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
                    Bulk conversion of {files.length} images is available with Pro subscription
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
              <span>Converted Images</span>
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
                      {getConvertedFileName(processedFile.file.name)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Original: {FileValidator.formatFileSize(processedFile.file.size)}
                      {processedFile.result?.processedSize && (
                        <> → Converted: {FileValidator.formatFileSize(processedFile.result.processedSize)}</>
                      )}
                      {processedFile.result?.processedSize && (
                        <> ({FileValidator.calculateCompressionRatio(processedFile.file.size, processedFile.result.processedSize)}% change)</>
                      )}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {processedFile.isProcessing && (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin" />
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
