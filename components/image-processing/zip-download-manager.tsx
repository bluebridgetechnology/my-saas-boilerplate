'use client';

import React, { useState, useCallback } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import JSZip from 'jszip';

interface CustomNamingOptions {
  prefix: string;
  suffix: string;
  numbering: 'sequential' | 'timestamp' | 'original';
  dateFormat: 'YYYY-MM-DD' | 'MM-DD-YYYY' | 'DD-MM-YYYY';
  separator: string;
}

interface ZIPDownloadManagerProps {
  files?: File[];
  processedResults?: Array<{
    file: File;
    processedData: Blob;
    originalSize: number;
    processedSize: number;
  }>;
  customNaming?: CustomNamingOptions;
  onDownloadComplete?: () => void;
}

export function ZIPDownloadManager({
  files = [],
  processedResults = [],
  customNaming,
  onDownloadComplete
}: ZIPDownloadManagerProps = {}) {
  const [isCreatingZIP, setIsCreatingZIP] = useState(false);
  const [zipProgress, setZipProgress] = useState(0);
  const [zipSize, setZipSize] = useState(0);

  const generateFileName = useCallback((originalFile: File, index: number): string => {
    if (!customNaming) {
      return originalFile.name;
    }

    const { prefix, suffix, numbering, dateFormat, separator } = customNaming;
    const baseName = originalFile.name.replace(/\.[^/.]+$/, '');
    const extension = originalFile.name.split('.').pop() || '';

    let numberPart = '';
    switch (numbering) {
      case 'sequential':
        numberPart = String(index + 1).padStart(3, '0');
        break;
      case 'timestamp':
        numberPart = new Date().getTime().toString();
        break;
      case 'original':
        numberPart = baseName;
        break;
    }

    let datePart = '';
    if (numbering === 'timestamp') {
      const now = new Date();
      switch (dateFormat) {
        case 'YYYY-MM-DD':
          datePart = now.toISOString().split('T')[0];
          break;
        case 'MM-DD-YYYY':
          datePart = `${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}-${now.getFullYear()}`;
          break;
        case 'DD-MM-YYYY':
          datePart = `${now.getDate().toString().padStart(2, '0')}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getFullYear()}`;
          break;
      }
    }

    const parts = [prefix, numberPart, datePart, suffix].filter(Boolean);
    return `${parts.join(separator)}.${extension}`;
  }, [customNaming]);

  const createZIPDownload = useCallback(async () => {
    if (processedResults.length === 0) return;

    setIsCreatingZIP(true);
    setZipProgress(0);

    try {
      const zip = new JSZip();
      const folder = zip.folder('processed-images');

      if (!folder) {
        throw new Error('Failed to create ZIP folder');
      }

      // Add files to ZIP
      for (let i = 0; i < processedResults.length; i++) {
        const result = processedResults[i];
        const fileName = generateFileName(result.file, i);
        
        folder.file(fileName, result.processedData);
        
        // Update progress
        const progress = Math.round(((i + 1) / processedResults.length) * 100);
        setZipProgress(progress);
      }

      // Generate ZIP
      const zipBlob = await zip.generateAsync({ type: 'blob' }, (metadata) => {
        setZipProgress(Math.round((metadata.percent / 100) * 100));
      });

      setZipSize(zipBlob.size);

      // Download ZIP
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `processed-images-${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      onDownloadComplete?.();
    } catch (error) {
      console.error('Error creating ZIP:', error);
    } finally {
      setIsCreatingZIP(false);
    }
  }, [processedResults, generateFileName, onDownloadComplete]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const totalOriginalSize = processedResults.reduce((sum, result) => sum + result.originalSize, 0);
  const totalProcessedSize = processedResults.reduce((sum, result) => sum + result.processedSize, 0);
  const compressionRatio = totalOriginalSize > 0 ? Math.round((1 - totalProcessedSize / totalOriginalSize) * 100) : 0;

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900">Download Results</h3>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Icon icon="solar:archive-bold-duotone" className="h-4 w-4" />
            <span>{processedResults.length} files</span>
          </div>
        </div>

        {/* File Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{processedResults.length}</div>
            <div className="text-sm text-gray-600">Files Processed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{compressionRatio}%</div>
            <div className="text-sm text-gray-600">Size Reduction</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{formatFileSize(totalProcessedSize)}</div>
            <div className="text-sm text-gray-600">Total Size</div>
          </div>
        </div>

        {/* Individual Downloads */}
        <div className="space-y-3">
          <h4 className="text-lg font-medium text-gray-900">Individual Files</h4>
          <div className="max-h-48 overflow-y-auto space-y-2">
            {processedResults.map((result, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Icon icon="solar:image-bold-duotone" className="h-5 w-5 text-gray-600" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {generateFileName(result.file, index)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatFileSize(result.processedSize)} ({Math.round((result.processedSize / result.originalSize) * 100)}% of original)
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const url = URL.createObjectURL(result.processedData);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = generateFileName(result.file, index);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                  }}
                >
                  <Icon icon="solar:download-bold-duotone" className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* ZIP Download */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-lg font-medium text-gray-900">Download All as ZIP</h4>
              <p className="text-sm text-gray-600">
                Get all processed images in a single ZIP file
                {zipSize > 0 && ` (${formatFileSize(zipSize)})`}
              </p>
            </div>
            <Icon icon="solar:archive-bold-duotone" className="h-8 w-8 text-green-600" />
          </div>

          {isCreatingZIP && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Creating ZIP...</span>
                <span className="text-sm text-gray-500">{zipProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${zipProgress}%` }}
                />
              </div>
            </div>
          )}

          <Button
            onClick={createZIPDownload}
            disabled={isCreatingZIP || processedResults.length === 0}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
          >
            {isCreatingZIP ? (
              <div className="flex items-center gap-3">
                <Icon icon="solar:refresh-bold-duotone" className="h-5 w-5 animate-spin" />
                Creating ZIP...
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Icon icon="solar:archive-bold-duotone" className="h-5 w-5" />
                Download ZIP ({processedResults.length} files)
              </div>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}

// Custom Naming Rules Builder Component
interface CustomNamingBuilderProps {
  onNamingChange: (options: CustomNamingOptions) => void;
  initialOptions?: Partial<CustomNamingOptions>;
}

export function CustomNamingBuilder({ onNamingChange, initialOptions }: CustomNamingBuilderProps) {
  const [options, setOptions] = useState<CustomNamingOptions>({
    prefix: initialOptions?.prefix || '',
    suffix: initialOptions?.suffix || '',
    numbering: initialOptions?.numbering || 'sequential',
    dateFormat: initialOptions?.dateFormat || 'YYYY-MM-DD',
    separator: initialOptions?.separator || '-',
    ...initialOptions
  });

  const updateOptions = useCallback((newOptions: Partial<CustomNamingOptions>) => {
    const updated = { ...options, ...newOptions };
    setOptions(updated);
    onNamingChange(updated);
  }, [options, onNamingChange]);

  const previewFileName = (originalName: string, index: number): string => {
    const { prefix, suffix, numbering, dateFormat, separator } = options;
    const baseName = originalName.replace(/\.[^/.]+$/, '');
    const extension = originalName.split('.').pop() || '';

    let numberPart = '';
    switch (numbering) {
      case 'sequential':
        numberPart = String(index + 1).padStart(3, '0');
        break;
      case 'timestamp':
        numberPart = new Date().getTime().toString();
        break;
      case 'original':
        numberPart = baseName;
        break;
    }

    let datePart = '';
    if (numbering === 'timestamp') {
      const now = new Date();
      switch (dateFormat) {
        case 'YYYY-MM-DD':
          datePart = now.toISOString().split('T')[0];
          break;
        case 'MM-DD-YYYY':
          datePart = `${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}-${now.getFullYear()}`;
          break;
        case 'DD-MM-YYYY':
          datePart = `${now.getDate().toString().padStart(2, '0')}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getFullYear()}`;
          break;
      }
    }

    const parts = [prefix, numberPart, datePart, suffix].filter(Boolean);
    return `${parts.join(separator)}.${extension}`;
  };

  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">Custom File Naming</h3>
      
      <div className="space-y-6">
        {/* Prefix */}
        <div>
          <Label htmlFor="prefix" className="text-sm font-medium text-gray-700">
            Prefix
          </Label>
          <Input
            id="prefix"
            value={options.prefix}
            onChange={(e) => updateOptions({ prefix: e.target.value })}
            placeholder="e.g., processed_"
            className="mt-1"
          />
        </div>

        {/* Suffix */}
        <div>
          <Label htmlFor="suffix" className="text-sm font-medium text-gray-700">
            Suffix
          </Label>
          <Input
            id="suffix"
            value={options.suffix}
            onChange={(e) => updateOptions({ suffix: e.target.value })}
            placeholder="e.g., _optimized"
            className="mt-1"
          />
        </div>

        {/* Numbering */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-3 block">
            Numbering Pattern
          </Label>
          <div className="space-y-2">
            <label className="flex items-center space-x-3">
              <input
                type="radio"
                name="numbering"
                value="sequential"
                checked={options.numbering === 'sequential'}
                onChange={(e) => updateOptions({ numbering: e.target.value as CustomNamingOptions['numbering'] })}
                className="text-blue-600"
              />
              <span className="text-gray-700">Sequential (001, 002, 003...)</span>
            </label>
            <label className="flex items-center space-x-3">
              <input
                type="radio"
                name="numbering"
                value="timestamp"
                checked={options.numbering === 'timestamp'}
                onChange={(e) => updateOptions({ numbering: e.target.value as CustomNamingOptions['numbering'] })}
                className="text-blue-600"
              />
              <span className="text-gray-700">Timestamp</span>
            </label>
            <label className="flex items-center space-x-3">
              <input
                type="radio"
                name="numbering"
                value="original"
                checked={options.numbering === 'original'}
                onChange={(e) => updateOptions({ numbering: e.target.value as CustomNamingOptions['numbering'] })}
                className="text-blue-600"
              />
              <span className="text-gray-700">Keep original name</span>
            </label>
          </div>
        </div>

        {/* Date Format (only show if timestamp is selected) */}
        {options.numbering === 'timestamp' && (
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-3 block">
              Date Format
            </Label>
            <div className="space-y-2">
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="dateFormat"
                  value="YYYY-MM-DD"
                  checked={options.dateFormat === 'YYYY-MM-DD'}
                  onChange={(e) => updateOptions({ dateFormat: e.target.value as CustomNamingOptions['dateFormat'] })}
                  className="text-blue-600"
                />
                <span className="text-gray-700">YYYY-MM-DD (2024-01-15)</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="dateFormat"
                  value="MM-DD-YYYY"
                  checked={options.dateFormat === 'MM-DD-YYYY'}
                  onChange={(e) => updateOptions({ dateFormat: e.target.value as CustomNamingOptions['dateFormat'] })}
                  className="text-blue-600"
                />
                <span className="text-gray-700">MM-DD-YYYY (01-15-2024)</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="dateFormat"
                  value="DD-MM-YYYY"
                  checked={options.dateFormat === 'DD-MM-YYYY'}
                  onChange={(e) => updateOptions({ dateFormat: e.target.value as CustomNamingOptions['dateFormat'] })}
                  className="text-blue-600"
                />
                <span className="text-gray-700">DD-MM-YYYY (15-01-2024)</span>
              </label>
            </div>
          </div>
        )}

        {/* Separator */}
        <div>
          <Label htmlFor="separator" className="text-sm font-medium text-gray-700">
            Separator
          </Label>
          <Input
            id="separator"
            value={options.separator}
            onChange={(e) => updateOptions({ separator: e.target.value })}
            placeholder="-"
            className="mt-1 max-w-20"
          />
        </div>

        {/* Preview */}
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Preview</h4>
          <div className="space-y-1 text-sm text-gray-600">
            <div>Original: image.jpg</div>
            <div>New: {previewFileName('image.jpg', 0)}</div>
            <div>Original: photo.png</div>
            <div>New: {previewFileName('photo.png', 1)}</div>
          </div>
        </div>
      </div>
    </Card>
  );
}
