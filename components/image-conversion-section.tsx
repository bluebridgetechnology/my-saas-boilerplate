'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import { Switch } from '@/components/ui/switch';

interface ConvertedVersion {
  format: string;
  file: File;
  downloadUrl: string;
  sizeChange: number;
}

interface UploadedFile {
  id: string;
  file: File;
  preview: string;
  name: string;
  size: number;
  converted?: boolean;
  downloadUrl?: string;
  originalFile?: File;
  convertedVersions?: ConvertedVersion[];
  isConverting?: boolean;
  convertingFormat?: string;
}

interface ImageConversionSectionProps {
  uploadedFiles: UploadedFile[];
  onRemoveFile: (fileId: string) => void;
  onClearAll: () => void;
  onDownloadAll: () => void;
  onConvertFile: (fileId: string, format: string) => void;
  onDownloadFile: (file: UploadedFile) => void;
  onDownloadConverted: (version: ConvertedVersion, originalName: string) => void;
  conversionMode: 'smart' | 'custom';
  selectedFormats: string[];
  quality: number;
  onFormatToggle: (format: string) => void;
  onSelectAllFormats: () => void;
  onConversionModeChange: (mode: 'smart' | 'custom') => void;
  onQualityChange: (quality: number) => void;
}

export function ImageConversionSection({
  uploadedFiles,
  onRemoveFile,
  onClearAll,
  onDownloadAll,
  onConvertFile,
  onDownloadFile,
  onDownloadConverted,
  conversionMode,
  selectedFormats,
  quality,
  onFormatToggle,
  onSelectAllFormats,
  onConversionModeChange,
  onQualityChange
}: ImageConversionSectionProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getSmartFormat = (file: File): string => {
    const fileType = file.type;
    const fileSize = file.size;
    
    if (fileSize < 500 * 1024) return 'WEBP';
    if (fileSize < 2 * 1024 * 1024) return 'AVIF';
    return 'JPEG';
  };

  const getTotalSavings = () => {
    let totalOriginal = 0;
    let totalConverted = 0;
    
    uploadedFiles.forEach(file => {
      totalOriginal += file.size;
      if (file.convertedVersions && file.convertedVersions.length > 0) {
        // Use the first converted version for calculation
        totalConverted += file.convertedVersions[0].file.size;
      } else {
        totalConverted += file.size;
      }
    });
    
    const savings = ((totalOriginal - totalConverted) / totalOriginal) * 100;
    return Math.max(0, Math.round(savings));
  };

  const getTotalSize = () => {
    let total = 0;
    uploadedFiles.forEach(file => {
      if (file.convertedVersions && file.convertedVersions.length > 0) {
        total += file.convertedVersions[0].file.size;
      } else {
        total += file.size;
      }
    });
    return formatFileSize(total);
  };

  if (uploadedFiles.length === 0) return null;

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column - Conversion Options */}
          <div className="lg:col-span-4">
            <div className="sticky top-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Conversion Settings</h2>
              
              {/* Conversion Mode Selection */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion Mode</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant={conversionMode === 'smart' ? 'default' : 'outline'}
                    className={`h-12 ${conversionMode === 'smart' ? 'bg-blue-600 text-white' : 'border-gray-300'}`}
                    onClick={() => onConversionModeChange('smart')}
                  >
                    <div className="text-center">
                      <Icon icon="solar:magic-stick-bold-duotone" className="h-5 w-5 mx-auto mb-1" />
                      <div className="text-xs font-medium">Smart Convert</div>
                    </div>
                  </Button>
                  <Button
                    variant={conversionMode === 'custom' ? 'default' : 'outline'}
                    className={`h-12 ${conversionMode === 'custom' ? 'bg-blue-600 text-white' : 'border-gray-300'}`}
                    onClick={() => onConversionModeChange('custom')}
                  >
                    <div className="text-center">
                      <Icon icon="solar:settings-bold-duotone" className="h-5 w-5 mx-auto mb-1" />
                      <div className="text-xs font-medium">Custom</div>
                    </div>
                  </Button>
                </div>
              </div>

              {/* Smart Mode */}
              {conversionMode === 'smart' && (
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-200 mb-6">
                  <div className="flex items-start space-x-3">
                    <Icon icon="solar:lightbulb-bold-duotone" className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-900 mb-2">Smart Conversion</h4>
                      <p className="text-xs text-blue-800 mb-4">
                        Automatically choose the best format and quality for each image to minimize file size while maintaining quality.
                      </p>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-blue-700 font-medium">Quality Level</span>
                          <span className="font-bold text-blue-900">{Math.round(quality * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0.5"
                          max="1.0"
                          step="0.1"
                          value={quality}
                          onChange={(e) => onQualityChange(parseFloat(e.target.value))}
                          className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-blue-600">
                          <span>Smaller</span>
                          <span>Larger</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Custom Mode */}
              {conversionMode === 'custom' && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-4">Choose Output Formats</h4>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {['AVIF', 'JPEG', 'PNG', 'WEBP'].map((format) => (
                      <Button
                        key={format}
                        variant={selectedFormats.includes(format) ? 'default' : 'outline'}
                        size="sm"
                        className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                          selectedFormats.includes(format) 
                            ? 'bg-blue-600 text-white shadow-md' 
                            : 'border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-blue-400'
                        }`}
                        onClick={() => onFormatToggle(format)}
                      >
                        {format}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant={selectedFormats.length === 4 ? 'default' : 'outline'}
                    size="sm"
                    className={`w-full rounded-lg text-xs font-semibold ${
                      selectedFormats.length === 4 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={onSelectAllFormats}
                  >
                    {selectedFormats.length === 4 ? 'All Selected' : 'Select All'}
                  </Button>
                  
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700">Quality</label>
                      <span className="text-xs text-gray-500">{Math.round(quality * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="1.0"
                      step="0.1"
                      value={quality}
                      onChange={(e) => onQualityChange(parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="lg:col-span-8">
            {/* Results Header */}
            <div className="bg-gray-900 text-white rounded-2xl shadow-2xl border border-gray-700 overflow-hidden mb-6">
              <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                      <Icon icon="solar:magic-stick-bold-duotone" className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        Resize Suite converted your images and saved you {getTotalSavings()}%
                      </h3>
                      <p className="text-sm text-gray-300">
                        {uploadedFiles.length} image{uploadedFiles.length !== 1 ? 's' : ''} optimized | {getTotalSize()} TOTAL
                      </p>
                    </div>
                  </div>
                  
                  {/* Global Actions */}
                  <div className="flex items-center space-x-3">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                      onClick={onClearAll}
                    >
                      <Icon icon="solar:trash-bin-trash-bold-duotone" className="h-4 w-4 mr-2" />
                      Clear All
                    </Button>
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={onDownloadAll}
                    >
                      <Icon icon="solar:download-bold-duotone" className="h-4 w-4 mr-2" />
                      Download All
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Files List */}
            <div className="space-y-6">
              {uploadedFiles.map((file) => (
                <div key={file.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-start space-x-6">
                    {/* Thumbnail */}
                    <div className="flex-shrink-0">
                      <img
                        src={file.preview}
                        alt={file.name}
                        className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                      />
                    </div>

                    {/* File Info and Conversions */}
                    <div className="flex-1 min-w-0">
                      {/* File Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="text-lg font-medium text-gray-900 truncate" title={file.name}>
                            {file.name}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {file.file.type.split('/')[1].toUpperCase()} • {formatFileSize(file.size)}
                          </p>
                        </div>
                        <button
                          onClick={() => onRemoveFile(file.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Icon icon="solar:close-circle-bold-duotone" className="h-6 w-6" />
                        </button>
                      </div>

                      {/* Conversion Results - Reference Design Style */}
                      <div className="space-y-4">
                        {/* Original File */}
                        <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                              <Icon icon="solar:file-bold-duotone" className="h-5 w-5 text-gray-600" />
                            </div>
                            <div>
                              <p className="text-base font-medium text-gray-900">Original</p>
                              <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-gray-300 text-gray-700 hover:bg-gray-100 px-4 py-2"
                            onClick={() => onDownloadFile(file)}
                          >
                            <Icon icon="solar:download-bold-duotone" className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>

                        {/* Converted Versions - Reference Style (All Formats) */}
                        {file.convertedVersions && file.convertedVersions.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {/* Show all formats like reference design */}
                            {['JPEG', 'PNG', 'WEBP'].map((format) => {
                              const version = file.convertedVersions?.find(v => v.format === format);
                              const isRecommended = format === 'WEBP'; // WEBP is usually the most optimized
                              
                              return (
                                <div key={format} className={`border rounded-lg p-4 ${
                                  version ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                                }`}>
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center space-x-2">
                                      <span className="text-sm font-medium text-gray-900">{format}</span>
                                      {version && (
                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                          version.sizeChange < 0 
                                            ? 'bg-green-600 text-white' 
                                            : 'bg-red-600 text-white'
                                        }`}>
                                          {version.sizeChange < 0 ? '-' : '+'}{Math.abs(version.sizeChange)}%
                                        </span>
                                      )}
                                      {isRecommended && version && (
                                        <Icon icon="solar:check-circle-bold-duotone" className="h-4 w-4 text-green-600" />
                                      )}
                                    </div>
                                    {version ? (
                                      <button
                                        onClick={() => onDownloadConverted(version, file.name)}
                                        className="text-green-600 hover:text-green-700 transition-colors"
                                      >
                                        <Icon icon="solar:download-bold-duotone" className="h-4 w-4" />
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => onConvertFile(file.id, format)}
                                        className="text-gray-400 hover:text-gray-600 transition-colors"
                                        disabled={file.isConverting}
                                      >
                                        <Icon icon="solar:refresh-bold-duotone" className="h-4 w-4" />
                                      </button>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-600">
                                    {version ? formatFileSize(version.file.size) : 'Click to convert'}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        ) : file.isConverting ? (
                          /* Loading State */
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center space-x-3">
                              <div className="animate-spin">
                                <Icon icon="solar:refresh-bold-duotone" className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-blue-900">Converting to {file.convertingFormat}...</p>
                                <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                                  <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* Conversion Buttons */
                          <div className="space-y-3">
                            {conversionMode === 'smart' ? (
                              <Button
                                size="lg"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                                onClick={() => onConvertFile(file.id, getSmartFormat(file.file))}
                              >
                                <Icon icon="solar:magic-stick-bold-duotone" className="h-5 w-5 mr-2" />
                                Smart Convert to {getSmartFormat(file.file)}
                              </Button>
                            ) : (
                              <div className="grid grid-cols-2 gap-3">
                                {selectedFormats.map((format) => (
                                  <Button
                                    key={format}
                                    size="lg"
                                    className="bg-blue-600 hover:bg-blue-700 text-white py-3"
                                    onClick={() => onConvertFile(file.id, format)}
                                  >
                                    Convert to {format}
                                  </Button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
