'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FileValidator, TierManager } from '@/lib/image-processing/download-manager';

interface FileUploadProps {
  onFilesSelected?: (files: File[]) => void;
  onFilesChange?: (files: File[]) => void;
  files?: File[];
  maxFiles?: number;
  acceptedTypes?: string[];
  className?: string;
  enableFolderUpload?: boolean;
  enablePriorityQueue?: boolean;
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
}

export function FileUpload({ 
  onFilesSelected, 
  onFilesChange,
  files = [],
  maxFiles = 5,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  className = '',
  enableFolderUpload = false,
  enablePriorityQueue = false,
  accept = 'image/*',
  multiple = true,
  maxSize = 10 * 1024 * 1024
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>(files);
  const [error, setError] = useState<string | null>(null);
  const [isProcessingFolder, setIsProcessingFolder] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  // Update uploadedFiles when files prop changes
  useEffect(() => {
    setUploadedFiles(files);
  }, [files]);

  const limits = TierManager.getLimits();

  const validateFiles = useCallback((files: File[]) => {
    // Check if limits are available
    if (!limits) {
      setError('System initialization in progress. Please try again.');
      return false;
    }

    // Check file count limit
    if (files.length > limits.maxImages) {
      setError(`Too many files. Maximum: ${limits.maxImages} files per batch`);
      return false;
    }

    // Check individual file sizes and types
    for (const file of files) {
      const validation = FileValidator.validateFile(file);
      if (!validation.valid) {
        setError(validation.error || 'Invalid file');
        return false;
      }
    }

    setError(null);
    return true;
  }, [limits]);

  const handleFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    if (!validateFiles(fileArray)) {
      return;
    }

    setUploadedFiles(fileArray);
    const callback = onFilesChange || onFilesSelected;
    if (callback) callback(fileArray);
  }, [validateFiles, onFilesChange, onFilesSelected]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
  }, [handleFiles]);

  const removeFile = useCallback((index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    const callback = onFilesChange || onFilesSelected;
    if (callback) callback(newFiles);
  }, [uploadedFiles, onFilesChange, onFilesSelected]);

  const clearAll = useCallback(() => {
    setUploadedFiles([]);
    const callback = onFilesChange || onFilesSelected;
    if (callback) callback([]);
    setError(null);
  }, [onFilesChange, onFilesSelected]);

  // Process folder upload (Pro feature)
  const processFolderUpload = useCallback(async (files: FileList) => {
    if (!enableFolderUpload || TierManager.getUserPlan() !== 'pro') {
      setError('Folder upload is only available for Pro users');
      return;
    }

    setIsProcessingFolder(true);
    setError(null);

    try {
      const fileArray = Array.from(files);
      
      // Filter only image files
      const imageFiles = fileArray.filter(file => 
        acceptedTypes.includes(file.type)
      );

      if (imageFiles.length === 0) {
        setError('No valid image files found in the folder');
        return;
      }

      // Validate files
      if (!validateFiles(imageFiles)) {
        return;
      }

      setUploadedFiles(imageFiles);
      const callback = onFilesChange || onFilesSelected;
      if (callback) callback(imageFiles);
    } catch (err) {
      setError('Error processing folder upload');
      console.error('Folder upload error:', err);
    } finally {
      setIsProcessingFolder(false);
    }
  }, [enableFolderUpload, acceptedTypes, validateFiles, onFilesChange, onFilesSelected]);

  const handleFolderInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFolderUpload(files);
    }
  }, [processFolderUpload]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card className={`p-6 shadow-none ${className}`}>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Upload Images</h3>
        
        {/* Upload Area */}
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragOver
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedTypes.join(',')}
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          
          {/* Hidden folder input for Pro users */}
          {enableFolderUpload && TierManager.getUserPlan() === 'pro' && (
            <input
              ref={folderInputRef}
              type="file"
              {...({ webkitdirectory: "true" } as any)}
              {...({ directory: "true" } as any)}
              multiple
              onChange={handleFolderInput}
              className="hidden"
            />
          )}
          
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <Icon icon="solar:upload-bold-duotone" className="h-8 w-8 text-gray-400" />
            </div>
            
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                Drop images here or click to browse
              </h4>
              <p className="text-sm text-gray-600">
                Supports JPG, PNG, WebP, GIF • Max {limits?.maxImages || 5} files • {Math.round((limits?.maxFileSize || 10 * 1024 * 1024) / (1024 * 1024))}MB per file
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="mx-auto"
              >
                <Icon icon="solar:folder-open-bold-duotone" className="h-4 w-4 mr-2" />
                Choose Files
              </Button>
              
              {enableFolderUpload && TierManager.getUserPlan() === 'pro' && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => folderInputRef.current?.click()}
                  className="mx-auto"
                  disabled={isProcessingFolder}
                >
                  <Icon 
                    icon={isProcessingFolder ? "solar:refresh-bold-duotone" : "solar:folder-bold-duotone"} 
                    className={`h-4 w-4 mr-2 ${isProcessingFolder ? 'animate-spin' : ''}`} 
                  />
                  {isProcessingFolder ? 'Processing...' : 'Upload Folder'}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <Icon icon="solar:close-circle-bold-duotone" className="h-5 w-5 text-red-600 mr-2" />
              <span className="text-sm text-red-600">{error}</span>
            </div>
          </div>
        )}

        {/* Uploaded Files */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-900">
                Uploaded Files ({uploadedFiles.length})
              </h4>
              <Button
                onClick={clearAll}
                size="sm"
                variant="outline"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Icon icon="solar:trash-bin-trash-bold-duotone" className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            </div>
            
            <div className="space-y-2">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg mr-3 flex items-center justify-center overflow-hidden">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to icon if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const fallback = target.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                      <Icon icon="solar:image-bold-duotone" className="h-5 w-5 text-gray-600" style={{ display: 'none' }} />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{file.name}</div>
                      <div className="text-xs text-gray-500">{formatFileSize(file.size)}</div>
                    </div>
                  </div>
                  <Button
                    onClick={() => removeFile(index)}
                    size="sm"
                    variant="ghost"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Icon icon="solar:close-circle-bold-duotone" className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tier Limit Info */}
        <div className="text-xs text-gray-500 text-center space-y-2">
          <div>
            {TierManager.getUserPlan() === 'free' ? (
              <span>
                Free tier: {limits?.maxImages || 5} images, {Math.round((limits?.maxFileSize || 10 * 1024 * 1024) / (1024 * 1024))}MB limit
              </span>
            ) : (
              <span>
                Pro tier: {limits?.maxImages || 100} images, {Math.round((limits?.maxFileSize || 50 * 1024 * 1024) / (1024 * 1024))}MB limit
              </span>
            )}
          </div>
          
          {TierManager.getUserPlan() === 'pro' && enableFolderUpload && (
            <div className="flex items-center justify-center gap-2 text-blue-600">
              <Icon icon="solar:crown-bold-duotone" className="h-3 w-3" />
              <span>Folder upload enabled</span>
            </div>
          )}
          
          {TierManager.getUserPlan() === 'pro' && enablePriorityQueue && (
            <div className="flex items-center justify-center gap-2 text-green-600">
              <Icon icon="solar:flash-bold-duotone" className="h-3 w-3" />
              <span>Priority processing</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
