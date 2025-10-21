'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import { Switch } from '@/components/ui/switch';

interface ConvertedVersion {
  format: string;
  file: File;
  downloadUrl: string;
  sizeChange: number; // percentage change from original
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

interface ImageConversionResultsProps {
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
}

export function ImageConversionResults({
  uploadedFiles,
  onRemoveFile,
  onClearAll,
  onDownloadAll,
  onConvertFile,
  onDownloadFile,
  onDownloadConverted,
  conversionMode,
  selectedFormats,
  quality
}: ImageConversionResultsProps) {
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

  console.log('ImageConversionResults - uploadedFiles:', uploadedFiles.length, uploadedFiles);
  
  if (uploadedFiles.length === 0) {
    console.log('No files uploaded, returning null');
    return null;
  }

  return (
    <div className="relative -mt-16 pt-16 flex justify-center">
      {/* Results Container */}
      <div className="bg-gray-900 text-white rounded-2xl shadow-2xl border border-gray-700 overflow-hidden max-w-4xl w-full mx-4">
        {/* Header */}
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

        {/* Files List */}
        <div className="p-6 space-y-6">
          {uploadedFiles.map((file) => (
            <div key={file.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-start space-x-6">
                {/* Thumbnail */}
                <div className="flex-shrink-0">
                  <img
                    src={file.preview}
                    alt={file.name}
                    className="w-20 h-20 object-cover rounded-lg border border-gray-600"
                  />
                </div>

                {/* File Info and Conversions */}
                <div className="flex-1 min-w-0">
                  {/* File Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-medium text-white truncate" title={file.name}>
                        {file.name}
                      </h4>
                      <p className="text-sm text-gray-400">
                        {file.file.type.split('/')[1].toUpperCase()} • {formatFileSize(file.size)}
                      </p>
                    </div>
                    <button
                      onClick={() => onRemoveFile(file.id)}
                      className="text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <Icon icon="solar:close-circle-bold-duotone" className="h-6 w-6" />
                    </button>
                  </div>

                  {/* Conversion Results */}
                  <div className="space-y-4">
                    {/* Original File */}
                    <div className="flex items-center justify-between bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                          <Icon icon="solar:file-bold-duotone" className="h-5 w-5 text-gray-300" />
                        </div>
                        <div>
                          <p className="text-base font-medium text-white">Original</p>
                          <p className="text-sm text-gray-400">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-white px-4 py-2"
                        onClick={() => onDownloadFile(file)}
                      >
                        <Icon icon="solar:download-bold-duotone" className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>

                    {/* Converted Versions */}
                    {file.convertedVersions && file.convertedVersions.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {file.convertedVersions.map((version, index) => (
                          <div key={index} className="bg-green-900/20 border border-green-700/30 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-white">{version.format}</span>
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                  version.sizeChange < 0 
                                    ? 'bg-green-600 text-white' 
                                    : 'bg-red-600 text-white'
                                }`}>
                                  {version.sizeChange < 0 ? '-' : '+'}{Math.abs(version.sizeChange)}%
                                </span>
                              </div>
                              <button
                                onClick={() => onDownloadConverted(version, file.name)}
                                className="text-green-400 hover:text-green-300 transition-colors"
                              >
                                <Icon icon="solar:download-bold-duotone" className="h-4 w-4" />
                              </button>
                            </div>
                            <p className="text-sm text-gray-400">{formatFileSize(version.file.size)}</p>
                          </div>
                        ))}
                      </div>
                    ) : file.isConverting ? (
                      /* Loading State */
                      <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4">
                        <div className="flex items-center space-x-3">
                          <div className="animate-spin">
                            <Icon icon="solar:refresh-bold-duotone" className="h-5 w-5 text-blue-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">Converting to {file.convertingFormat}...</p>
                            <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
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
  );
}
