'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@iconify/react';
import { FileUpload } from '@/components/image-processing/file-upload';
import { 
  ImageProcessor, 
  ConversionOptions,
  ProcessingResult,
  FileValidator 
} from '@/lib/image-processing';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth/auth-context';
import { createZipFromFiles, downloadZip } from '@/lib/image-processing/zip-helper';

interface ConversionSettings {
  outputFormat: 'jpeg' | 'png' | 'webp' | 'gif' | 'tiff' | 'bmp' | 'ico';
  quality: number;
  preserveTransparency: boolean;
}

interface ProcessedFile {
  file: File;
  result?: ProcessingResult & {
    dataUrl?: string;
    filename?: string;
    outputFormat?: string;
  };
  error?: string;
  isProcessing: boolean;
}

const OUTPUT_FORMATS = [
  { id: 'jpeg', name: 'JPEG', description: 'Best for photos, smaller files', supportsTransparency: false },
  { id: 'png', name: 'PNG', description: 'Lossless, supports transparency', supportsTransparency: true },
  { id: 'webp', name: 'WEBP', description: 'Modern format, excellent compression', supportsTransparency: true },
  { id: 'gif', name: 'GIF', description: 'Animation support, limited colors', supportsTransparency: true },
  { id: 'tiff', name: 'TIFF', description: 'High quality, professional use', supportsTransparency: true },
  { id: 'bmp', name: 'BMP', description: 'Uncompressed bitmap format', supportsTransparency: false },
  { id: 'ico', name: 'ICO', description: 'Windows icon format', supportsTransparency: true },
];

export function HeroImageConverter() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [settings, setSettings] = useState<ConversionSettings>({
    outputFormat: 'jpeg',
    quality: 0.9,
    preserveTransparency: true
  });
  const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const { profile } = useAuth();
  
  const processorRef = useRef<ImageProcessor | null>(null);

  const handleFilesSelected = useCallback((files: File[]) => {
    setSelectedFiles(files);
    setProcessedFiles([]);
  }, []);

  const handleFormatChange = useCallback((format: string) => {
    const newFormat = format as ConversionSettings['outputFormat'];
    setSettings(prev => ({
      ...prev,
      outputFormat: newFormat,
      preserveTransparency: OUTPUT_FORMATS.find(f => f.id === newFormat)?.supportsTransparency || false
    }));
  }, []);

  const handleQualityChange = useCallback((quality: number) => {
    setSettings(prev => ({ ...prev, quality }));
  }, []);

  const processFiles = useCallback(async () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select files to convert');
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(0);
    
    try {
      const processor = new ImageProcessor();
      processorRef.current = processor;
      
      const initialProcessedFiles: ProcessedFile[] = selectedFiles.map(file => ({
        file,
        isProcessing: true
      }));
      setProcessedFiles(initialProcessedFiles);

      const results: ProcessedFile[] = [];
      
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const progress = ((i + 1) / selectedFiles.length) * 100;
        setProcessingProgress(progress);

        try {
          const options: ConversionOptions = {
            outputFormat: settings.outputFormat,
            quality: settings.quality,
            preserveTransparency: settings.preserveTransparency
          };

          // Load the image first
          const loadResult = await processor.loadImage(file);
          if (!loadResult.success) {
            throw new Error(loadResult.error || 'Failed to load image');
          }

          // Convert the image
          const result = await processor.convert(options);
          
          if (result.success && result.data) {
            // Create download URL and filename
            const originalName = file.name.replace(/\.[^/.]+$/, '');
            const filename = `${originalName}.${settings.outputFormat}`;
            const dataUrl = URL.createObjectURL(result.data);
            
            results.push({
              file,
              result: {
                ...result,
                dataUrl,
                filename,
                outputFormat: settings.outputFormat
              },
              isProcessing: false
            });
            
            toast.success(`Converted ${file.name} successfully`);
          } else {
            throw new Error(result.error || 'Conversion failed');
          }
        } catch (error) {
          console.error(`Error processing ${file.name}:`, error);
          results.push({
            file,
            error: error instanceof Error ? error.message : 'Unknown error',
            isProcessing: false
          });
          toast.error(`Failed to convert ${file.name}`);
        }
      }

      setProcessedFiles(results);
      toast.success(`Conversion complete! ${results.filter(r => r.result).length} files processed successfully.`);
      
    } catch (error) {
      console.error('Conversion error:', error);
      toast.error('Conversion failed. Please try again.');
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  }, [selectedFiles, settings]);

  const downloadFile = useCallback((processedFile: ProcessedFile) => {
    if (!processedFile.result?.dataUrl) return;
    
    const link = document.createElement('a');
    link.href = processedFile.result.dataUrl;
    link.download = processedFile.result.filename || processedFile.file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const downloadAll = useCallback(async () => {
    const zipBlob = await createZipFromFiles(processedFiles as any);
    downloadZip(zipBlob, 'resizesuite-converted-images.zip');
    toast.success('Downloading all converted images as ZIP');
  }, [processedFiles]);

  const clearFiles = useCallback(() => {
    setSelectedFiles([]);
    setProcessedFiles([]);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 pt-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Free Online Image Converter
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Convert images between different formats instantly. Support for JPEG, PNG, WEBP, GIF, TIFF, BMP, and ICO formats. 
            No uploads required - everything happens in your browser.
          </p>
        </div>

        {/* Main Converter Interface */}
        <Card className="bg-white shadow-xl rounded-2xl p-8 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upload Section */}
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon icon="solar:cloud-upload-bold-duotone" className="h-12 w-12 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Drag & drop your images or click to upload
                </h3>
                <FileUpload
                  onFilesSelected={handleFilesSelected}
                  maxFiles={profile?.plan_name === 'pro' ? 50 : 5}
                  acceptedTypes={['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/tiff', 'image/bmp']}
                />
                {selectedFiles.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">
                      {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={clearFiles}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      <Icon icon="solar:trash-bin-trash-bold-duotone" className="h-4 w-4 mr-2" />
                      Clear Files
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Conversion Settings */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Conversion Settings</h3>
              
              {/* Format Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Output Format</label>
                <div className="grid grid-cols-2 gap-2">
                  {OUTPUT_FORMATS.map((format) => (
                    <button
                      key={format.id}
                      onClick={() => handleFormatChange(format.id)}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        settings.outputFormat === format.id
                          ? 'border-blue-500 bg-blue-50 text-blue-900'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="font-medium text-sm">{format.name}</div>
                      <div className="text-xs text-gray-600">{format.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quality Slider */}
              {['jpeg', 'webp'].includes(settings.outputFormat) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quality: {Math.round(settings.quality * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.05"
                    value={settings.quality}
                    onChange={(e) => handleQualityChange(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Low</span>
                    <span>High</span>
                  </div>
                </div>
              )}

              {/* Convert Button */}
              <Button 
                onClick={processFiles}
                disabled={selectedFiles.length === 0 || isProcessing}
                className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white"
              >
                {isProcessing ? (
                  <>
                    <Icon icon="solar:refresh-bold-duotone" className="h-4 w-4 mr-2 animate-spin" />
                    Converting... {Math.round(processingProgress)}%
                  </>
                ) : (
                  <>
                    <Icon icon="solar:refresh-bold-duotone" className="h-4 w-4 mr-2" />
                    Convert Images
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>

        {/* Results Section */}
        {processedFiles.length > 0 && (
          <Card className="bg-white shadow-xl rounded-2xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Conversion Results</h2>
              {processedFiles.some(f => f.result) && (
                <Button 
                  onClick={downloadAll}
                  className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white"
                >
                  <Icon icon="solar:download-bold-duotone" className="h-4 w-4 mr-2" />
                  Download All (ZIP)
                </Button>
              )}
            </div>

            <div className="space-y-4">
              {processedFiles.map((processedFile, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                      {processedFile.result?.dataUrl ? (
                        <img
                          src={processedFile.result.dataUrl}
                          alt={processedFile.result.filename || processedFile.file.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Icon icon="solar:image-bold-duotone" className="h-6 w-6 text-gray-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{processedFile.result?.filename || processedFile.file.name}</p>
                      <p className="text-sm text-gray-600">
                        {processedFile.result?.outputFormat ? 
                          `Converted to ${processedFile.result.outputFormat.toUpperCase()}` : 
                          'Conversion failed'
                        }
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {processedFile.isProcessing ? (
                      <div className="flex items-center space-x-2">
                        <Icon icon="solar:refresh-bold-duotone" className="h-4 w-4 animate-spin text-blue-600" />
                        <span className="text-sm text-gray-600">Processing...</span>
                      </div>
                    ) : processedFile.result ? (
                      <Button 
                        onClick={() => downloadFile(processedFile)}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Icon icon="solar:download-bold-duotone" className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Icon icon="solar:danger-circle-bold-duotone" className="h-4 w-4 text-red-600" />
                        <span className="text-sm text-red-600">Failed</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Features Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon icon="solar:shield-check-bold-duotone" className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">100% Private</h3>
            <p className="text-gray-600">All conversions happen in your browser. No files are uploaded to our servers.</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon icon="solar:flash-bold-duotone" className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Lightning Fast</h3>
            <p className="text-gray-600">Convert images instantly with our optimized processing engine.</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon icon="solar:settings-bold-duotone" className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">High Quality</h3>
            <p className="text-gray-600">Maintain image quality with customizable compression settings.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
