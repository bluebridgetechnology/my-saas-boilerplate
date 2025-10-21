'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';

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

interface TinyPNGStyleResultsProps {
  uploadedFiles: UploadedFile[];
  onRemoveFile: (fileId: string) => void;
  onClearAll: () => void;
  onDownloadAll: () => void;
  onConvertFile: (fileId: string, format: string) => void;
  onDownloadFile: (file: UploadedFile) => void;
  onDownloadConverted: (version: ConvertedVersion, originalName: string) => void;
  isDownloadingAll?: boolean;
}

export function TinyPNGStyleResults({
  uploadedFiles,
  onRemoveFile,
  onClearAll,
  onDownloadAll,
  onConvertFile,
  onDownloadFile,
  onDownloadConverted,
  isDownloadingAll = false
}: TinyPNGStyleResultsProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getTotalSavings = () => {
    let totalOriginal = 0;
    let totalConverted = 0;
    
    uploadedFiles.forEach(file => {
      totalOriginal += file.size;
      if (file.convertedVersions && file.convertedVersions.length > 0) {
        // Use the best conversion (smallest file size)
        const bestVersion = file.convertedVersions.reduce((best, current) => 
          current.file.size < best.file.size ? current : best
        );
        totalConverted += bestVersion.file.size;
      } else {
        totalConverted += file.size;
      }
    });
    
    const savings = ((totalOriginal - totalConverted) / totalOriginal) * 100;
    return Math.max(0, Math.round(savings));
  };

  const getHeaderText = () => {
    const isConverting = uploadedFiles.some(file => file.isConverting);
    const hasConversions = uploadedFiles.some(file => file.convertedVersions && file.convertedVersions.length > 0);
    const totalSavings = getTotalSavings();
    
    if (isConverting) {
      return "Wait, we are converting your files";
    }
    
    if (!hasConversions) {
      return "Ready to convert your images";
    }
    
    if (totalSavings === 0) {
      return "Images converted successfully";
    }
    
    return `Done! We saved you ${totalSavings}%`;
  };

  const getTotalSize = () => {
    let total = 0;
    uploadedFiles.forEach(file => {
      if (file.convertedVersions && file.convertedVersions.length > 0) {
        const bestVersion = file.convertedVersions.reduce((best, current) => 
          current.file.size < best.file.size ? current : best
        );
        total += bestVersion.file.size;
      } else {
        total += file.size;
      }
    });
    return formatFileSize(total);
  };

  if (uploadedFiles.length === 0) return null;

  return (
    <div className="relative -mt-20 pt-20 flex justify-center">
      {/* Results Container - TinyPNG Style */}
      <div className="bg-gray-800 text-white rounded-2xl shadow-2xl border border-gray-700 overflow-hidden max-w-4xl w-full mx-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-700 to-gray-800 px-6 py-4 border-b border-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                <Icon icon="solar:check-circle-bold-duotone" className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {getHeaderText()}
                </h3>
                <p className="text-sm text-gray-300">
                  {uploadedFiles.length} image{uploadedFiles.length !== 1 ? 's' : ''} optimized | {getTotalSize()} total
                </p>
              </div>
            </div>
            
            {/* Global Actions */}
            <div className="flex items-center space-x-3">
              <Button
                size="sm"
                variant="outline"
                className="border-gray-500 text-gray-300 hover:bg-gray-600 hover:text-white px-3 py-2"
                onClick={onClearAll}
              >
                <Icon icon="solar:close-circle-bold-duotone" className="h-4 w-4 mr-2" />
                Clear
              </Button>
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={onDownloadAll}
                disabled={isDownloadingAll}
              >
                {isDownloadingAll ? (
                  <>
                    <Icon icon="solar:refresh-bold-duotone" className="h-4 w-4 mr-2 animate-spin" />
                    Creating ZIP...
                  </>
                ) : (
                  <>
                    <Icon icon="solar:download-bold-duotone" className="h-4 w-4 mr-2" />
                    Download all
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Files List */}
        <div className="p-6 space-y-4">
          {uploadedFiles.map((file) => (
            <div key={file.id} className="bg-white rounded-xl p-4 shadow-lg border border-gray-200">
              <div className="flex items-start space-x-4">
                {/* Thumbnail */}
                <div className="flex-shrink-0">
                  <img
                    src={file.preview}
                    alt={file.name}
                    className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                  />
                </div>

                {/* File Info and Conversions */}
                <div className="flex-1 min-w-0">
                  {/* File Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="text-base font-medium text-gray-900 truncate" title={file.name}>
                        {file.name}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                    <button
                      onClick={() => onRemoveFile(file.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Icon icon="solar:close-circle-bold-duotone" className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Converted Versions - TinyPNG Style */}
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                    {/* Original File */}
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span className="font-medium">{file.file.type.split('/')[1].toUpperCase()}</span>
                      <span>{formatFileSize(file.size)}</span>
                    </div>

                    {/* Format Selection Buttons */}
                    {(!file.convertedVersions || file.convertedVersions.length === 0) && !file.isConverting && (
                      <div className="flex flex-wrap items-center gap-2">
                        {['JPEG', 'PNG', 'WEBP'].map((format) => (
                          <button
                            key={format}
                            onClick={() => onConvertFile(file.id, format)}
                            className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-full hover:bg-blue-100 transition-colors min-w-0"
                          >
                            Convert to {format}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Converted Versions */}
                    {file.convertedVersions && file.convertedVersions.length > 0 && (
                      <>
                        {file.convertedVersions.map((version, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-900">{version.format}</span>
                            <span className="text-sm text-gray-600">{formatFileSize(version.file.size)}</span>
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                              version.sizeChange < 0 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {version.sizeChange < 0 ? `-${Math.abs(version.sizeChange)}%` : `+${version.sizeChange}%`}
                            </span>
                            <button
                              onClick={() => onDownloadConverted(version, file.name)}
                              className="text-green-600 hover:text-green-700 transition-colors p-1 rounded-full hover:bg-green-50"
                            >
                              <Icon icon="solar:download-bold-duotone" className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                        {/* Add more format buttons */}
                        <div className="flex flex-wrap items-center gap-2">
                          {['JPEG', 'PNG', 'WEBP'].map((format) => {
                            const hasVersion = file.convertedVersions?.some(v => v.format === format);
                            if (hasVersion) return null;
                            return (
                              <button
                                key={format}
                                onClick={() => onConvertFile(file.id, format)}
                                className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-full hover:bg-blue-100 transition-colors min-w-0"
                              >
                                Convert to {format}
                              </button>
                            );
                          })}
                        </div>
                      </>
                    )}

                    {/* Loading State */}
                    {file.isConverting && (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin">
                          <Icon icon="solar:refresh-bold-duotone" className="h-4 w-4 text-blue-600" />
                        </div>
                        <span className="text-sm text-blue-600">Converting to {file.convertingFormat}...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Actions */}
        <div className="bg-gray-700 px-6 py-4 border-t border-gray-600">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-300">
              All images are processed locally in your browser
            </div>
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={onDownloadAll}
              disabled={isDownloadingAll}
            >
              {isDownloadingAll ? (
                <>
                  <Icon icon="solar:refresh-bold-duotone" className="h-4 w-4 mr-2 animate-spin" />
                  Creating ZIP...
                </>
              ) : (
                <>
                  <Icon icon="solar:download-bold-duotone" className="h-4 w-4 mr-2" />
                  Download all
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
