'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ConvertedVersion {
  format: string;
  file: File;
  downloadUrl: string;
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
}

interface ImageProcessingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ImageProcessingModal({ isOpen, onClose }: ImageProcessingModalProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [autoConvert, setAutoConvert] = useState(false);
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  const [quality, setQuality] = useState(0.8);
  const [conversionMode, setConversionMode] = useState<'smart' | 'custom'>('smart');

  const handleFormatToggle = useCallback((format: string) => {
    setSelectedFormats(prev =>
      prev.includes(format) ? prev.filter(f => f !== format) : [...prev, format]
    );
  }, []);

  const handleSelectAllFormats = useCallback(() => {
    if (selectedFormats.length === 4) {
      setSelectedFormats([]);
    } else {
      setSelectedFormats(['AVIF', 'JPEG', 'PNG', 'WEBP']);
    }
  }, [selectedFormats.length]);

  const convertImage = useCallback(async (file: File, targetFormat?: string, quality: number = 0.8): Promise<File> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0);

          let outputFormat = targetFormat;

          // Default conversion logic if no format is selected
          if (!targetFormat && selectedFormats.length === 0) {
            if (file.type === 'image/jpeg') {
              outputFormat = 'PNG';
            } else if (file.type === 'image/png') {
              outputFormat = 'JPEG';
            }
          } else if (selectedFormats.length > 0) {
            // Use the first selected format
            outputFormat = selectedFormats[0];
          }

          const mimeType = `image/${outputFormat?.toLowerCase()}`;
          
          // Set appropriate quality based on format
          let outputQuality = quality;
          if (outputFormat === 'PNG') {
            // PNG is lossless, but we can still optimize
            outputQuality = 1.0;
          } else if (outputFormat === 'AVIF') {
            // AVIF supports high quality with good compression
            outputQuality = Math.max(0.6, quality);
          } else if (outputFormat === 'WEBP') {
            // WEBP good balance
            outputQuality = Math.max(0.7, quality);
          } else if (outputFormat === 'JPEG') {
            // JPEG quality control
            outputQuality = Math.max(0.6, quality);
          }

          canvas.toBlob((blob) => {
            if (blob) {
              const convertedFile = new File([blob], `${file.name.split('.')[0]}.${outputFormat?.toLowerCase()}`, { type: mimeType });
              resolve(convertedFile);
            } else {
              resolve(file);
            }
          }, mimeType, outputQuality);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  }, [selectedFormats]);

  const handleFileUpload = useCallback(async (files: FileList | null) => {
    if (!files) return;

    const maxFiles = 5;
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp'];

    for (const file of Array.from(files)) {
      if (uploadedFiles.length >= maxFiles) continue;
      if (file.size > maxSize) continue;
      if (!allowedTypes.includes(file.type)) continue;

      let processedFile = file;
      let downloadUrl = URL.createObjectURL(file);
      let converted = false;

      if (autoConvert) {
        processedFile = await convertImage(file);
        downloadUrl = URL.createObjectURL(processedFile);
        converted = true;
      }

      // Create preview using FileReader
      const reader = new FileReader();
      reader.onload = (e) => {
        const preview = e.target?.result as string;
        const uploadedFile: UploadedFile = {
          id: Math.random().toString(36).substr(2, 9),
          file: processedFile,
          preview,
          name: processedFile.name,
          size: processedFile.size,
          converted,
          downloadUrl,
          originalFile: file,
        };
        setUploadedFiles(prev => [...prev, uploadedFile]);
      };
      
      // Read as data URL for preview
      reader.readAsDataURL(file);
    }
  }, [autoConvert, convertImage, uploadedFiles.length]);

  const handleDownload = useCallback((file: UploadedFile) => {
    if (file.downloadUrl) {
      const link = document.createElement('a');
      link.href = file.downloadUrl;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, []);

  const handleDownloadAll = useCallback(() => {
    uploadedFiles.forEach(file => {
      // Download original
      if (file.downloadUrl) {
        handleDownload(file);
      }
      
      // Download all converted versions
      if (file.convertedVersions) {
        file.convertedVersions.forEach(version => {
          const link = document.createElement('a');
          link.href = version.downloadUrl;
          link.download = `${file.name.split('.')[0]}.${version.format.toLowerCase()}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        });
      }
    });
  }, [uploadedFiles, handleDownload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  }, [handleFileUpload]);

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
    
    // For small files (< 500KB), keep original format or use WEBP
    if (fileSize < 500 * 1024) {
      if (fileType === 'image/png') return 'WEBP';
      if (fileType === 'image/jpeg') return 'WEBP';
      return 'WEBP';
    }
    
    // For medium files (500KB - 2MB), use AVIF for better compression
    if (fileSize < 2 * 1024 * 1024) {
      return 'AVIF';
    }
    
    // For large files (> 2MB), use JPEG with quality control
    return 'JPEG';
  };

  const convertAllImages = async () => {
    for (const file of uploadedFiles) {
      if (conversionMode === 'smart') {
        const smartFormat = getSmartFormat(file.file);
        const isAlreadyConverted = file.convertedVersions?.some(v => v.format === smartFormat);
        if (!isAlreadyConverted) {
          const convertedFile = await convertImage(file.file, smartFormat, quality);
          const newDownloadUrl = URL.createObjectURL(convertedFile);
          const newVersion: ConvertedVersion = {
            format: smartFormat,
            file: convertedFile,
            downloadUrl: newDownloadUrl
          };
          
          setUploadedFiles(prev => prev.map(f => 
            f.id === file.id 
              ? { 
                  ...f, 
                  convertedVersions: [...(f.convertedVersions || []), newVersion],
                  converted: true
                }
              : f
          ));
        }
      } else {
        // Custom mode - convert to all selected formats
        for (const format of selectedFormats) {
          const isAlreadyConverted = file.convertedVersions?.some(v => v.format === format);
          if (!isAlreadyConverted) {
            const convertedFile = await convertImage(file.file, format, quality);
            const newDownloadUrl = URL.createObjectURL(convertedFile);
            const newVersion: ConvertedVersion = {
              format,
              file: convertedFile,
              downloadUrl: newDownloadUrl
            };
            
            setUploadedFiles(prev => prev.map(f => 
              f.id === file.id 
                ? { 
                    ...f, 
                    convertedVersions: [...(f.convertedVersions || []), newVersion],
                    converted: true
                  }
                : f
            ));
          }
        }
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Image Processing Studio
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Upload, convert, and download your images with professional quality tools
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Upload Area */}
          <div
            className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 bg-gray-50 ${
              isDragOver
                ? 'border-blue-500 bg-blue-50 scale-105 shadow-xl'
                : 'border-gray-300 hover:border-blue-400 hover:bg-gray-100 hover:shadow-xl'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="space-y-8">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
                <Icon icon="solar:cloud-upload-bold-duotone" className="h-10 w-10 text-blue-600" />
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Drop your images here!
                </h3>
                <p className="mt-2 text-base text-gray-600">
                  Up to 5 images, max 10MB each
                </p>
              </div>

              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleFileUpload(e.target.files)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>

          {/* Conversion Options */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="space-y-6">
              {/* Conversion Mode Selection */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">
                  Conversion Mode
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant={conversionMode === 'smart' ? 'default' : 'outline'}
                    className={`h-12 ${conversionMode === 'smart' ? 'bg-blue-600 text-white' : 'border-gray-300'}`}
                    onClick={() => setConversionMode('smart')}
                  >
                    <div className="text-center">
                      <Icon icon="solar:magic-stick-bold-duotone" className="h-5 w-5 mx-auto mb-1" />
                      <div className="text-xs font-medium">Smart Convert</div>
                    </div>
                  </Button>
                  <Button
                    variant={conversionMode === 'custom' ? 'default' : 'outline'}
                    className={`h-12 ${conversionMode === 'custom' ? 'bg-blue-600 text-white' : 'border-gray-300'}`}
                    onClick={() => setConversionMode('custom')}
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
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Icon icon="solar:lightbulb-bold-duotone" className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h5 className="text-sm font-medium text-blue-900 mb-2">Smart Conversion</h5>
                      <p className="text-xs text-blue-800 mb-3">
                        Automatically choose the best format and quality for each image to minimize file size while maintaining quality.
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-blue-700">Quality Level</span>
                          <span className="font-medium text-blue-900">{Math.round(quality * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0.5"
                          max="1.0"
                          step="0.1"
                          value={quality}
                          onChange={(e) => setQuality(parseFloat(e.target.value))}
                          className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer slider"
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
                <div className="space-y-4">
                  <div>
                    <h5 className="text-sm font-medium text-gray-900 mb-3">Choose Output Formats</h5>
                    <div className="flex flex-wrap gap-2">
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
                          onClick={() => handleFormatToggle(format)}
                        >
                          {format}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
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
                      onChange={(e) => setQuality(parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {/* Auto-convert Option */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <label htmlFor="auto-convert" className="text-sm font-medium text-gray-700">
                      Auto-convert on upload
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      Automatically convert images when you upload them
                    </p>
                  </div>
                  <Switch
                    id="auto-convert"
                    checked={autoConvert}
                    onCheckedChange={setAutoConvert}
                    className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-200"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Processed Images Container */}
          {uploadedFiles.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              {/* Header with Actions */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">
                    Processed Images
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {uploadedFiles.length} of 5 images uploaded
                  </p>
                </div>
                
                {/* Global Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  {/* Convert All Button */}
                  {conversionMode === 'smart' ? (
                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-sm font-medium shadow-md"
                      onClick={convertAllImages}
                    >
                      <Icon icon="solar:magic-stick-bold-duotone" className="h-4 w-4 mr-2" />
                      Smart Convert All
                    </Button>
                  ) : selectedFormats.length > 0 ? (
                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-sm font-medium shadow-md"
                      onClick={convertAllImages}
                    >
                      <Icon icon="solar:refresh-bold-duotone" className="h-4 w-4 mr-2" />
                      Convert All to {selectedFormats.join(', ')}
                    </Button>
                  ) : (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
                      <p className="text-xs text-yellow-800 font-medium">
                        Select formats above to enable conversion
                      </p>
                    </div>
                  )}
                  
                  {/* Download All Button */}
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-4 py-2 text-sm font-medium"
                    onClick={handleDownloadAll}
                  >
                    <Icon icon="solar:download-bold-duotone" className="h-4 w-4 mr-2" />
                    Download All
                  </Button>
                  
                  {/* Clear All Button */}
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50 rounded-lg px-4 py-2 text-sm font-medium"
                    onClick={() => setUploadedFiles([])}
                  >
                    <Icon icon="solar:trash-bin-trash-bold-duotone" className="h-4 w-4 mr-2" />
                    Clear All
                  </Button>
                </div>
              </div>

              {/* Images Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {uploadedFiles.map((file) => (
                  <div key={file.id} className="relative group bg-gray-50 rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-all duration-200">
                    {/* Image Preview */}
                    <div className="relative mb-3">
                      <img
                        src={file.preview}
                        alt={file.name}
                        className="w-full h-24 object-cover rounded-lg border border-gray-200"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const fallback = target.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                      {/* Fallback for non-image files or failed loads */}
                      <div className="w-full h-24 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center" style={{ display: 'none' }}>
                        <div className="text-center">
                          <Icon icon="solar:file-bold-duotone" className="h-8 w-8 text-gray-400 mx-auto mb-1" />
                          <span className="text-xs text-gray-500">{file.name.split('.').pop()?.toUpperCase()}</span>
                        </div>
                      </div>
                      
                      {/* Conversion Status Badge */}
                      {file.convertedVersions && file.convertedVersions.length > 0 && (
                        <div className="absolute top-2 left-2">
                          <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                            {file.convertedVersions.length} converted
                          </span>
                        </div>
                      )}
                      
                      {/* Remove Button */}
                      <button
                        onClick={() => setUploadedFiles(prev => prev.filter(f => f.id !== file.id))}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 transition-colors opacity-0 group-hover:opacity-100"
                        title="Remove"
                      >
                        <Icon icon="solar:close-circle-bold-duotone" className="h-3 w-3" />
                      </button>
                    </div>
                    
                    {/* File Info */}
                    <div className="mb-3">
                      <div className="text-sm text-gray-900 truncate font-medium" title={file.name}>
                        {file.name}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatFileSize(file.size)}
                      </div>
                    </div>

                    {/* Individual Actions */}
                    <div className="space-y-2">
                      {/* Download Original */}
                      {file.downloadUrl && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full text-xs py-2 border-gray-300 text-gray-700 hover:bg-gray-50"
                          onClick={() => handleDownload(file)}
                        >
                          <Icon icon="solar:download-bold-duotone" className="h-3 w-3 mr-2" />
                          Download Original
                        </Button>
                      )}
                      
                      {/* Individual Convert Button */}
                      {(conversionMode === 'smart' || selectedFormats.length > 0) && (
                        <Button
                          size="sm"
                          className="w-full text-xs py-2 bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={async () => {
                            if (conversionMode === 'smart') {
                              const smartFormat = getSmartFormat(file.file);
                              const isAlreadyConverted = file.convertedVersions?.some(v => v.format === smartFormat);
                              if (!isAlreadyConverted) {
                                const convertedFile = await convertImage(file.file, smartFormat, quality);
                                const newDownloadUrl = URL.createObjectURL(convertedFile);
                                const newVersion: ConvertedVersion = {
                                  format: smartFormat,
                                  file: convertedFile,
                                  downloadUrl: newDownloadUrl
                                };
                                
                                setUploadedFiles(prev => prev.map(f => 
                                  f.id === file.id 
                                    ? { 
                                        ...f, 
                                        convertedVersions: [...(f.convertedVersions || []), newVersion],
                                        converted: true
                                      }
                                    : f
                                ));
                              }
                            } else {
                              for (const format of selectedFormats) {
                                const isAlreadyConverted = file.convertedVersions?.some(v => v.format === format);
                                if (!isAlreadyConverted) {
                                  const convertedFile = await convertImage(file.file, format, quality);
                                  const newDownloadUrl = URL.createObjectURL(convertedFile);
                                  const newVersion: ConvertedVersion = {
                                    format,
                                    file: convertedFile,
                                    downloadUrl: newDownloadUrl
                                  };
                                  
                                  setUploadedFiles(prev => prev.map(f => 
                                    f.id === file.id 
                                      ? { 
                                          ...f, 
                                          convertedVersions: [...(f.convertedVersions || []), newVersion],
                                          converted: true
                                        }
                                      : f
                                  ));
                                }
                              }
                            }
                          }}
                        >
                          <Icon icon={conversionMode === 'smart' ? 'solar:magic-stick-bold-duotone' : 'solar:refresh-bold-duotone'} className="h-3 w-3 mr-2" />
                          {conversionMode === 'smart' ? 'Smart Convert' : 'Convert to Selected'}
                        </Button>
                      )}
                      
                      {/* Download Converted Versions */}
                      {file.convertedVersions && file.convertedVersions.length > 0 && (
                        <div className="space-y-1">
                          <div className="text-xs text-gray-600 font-medium">Converted versions:</div>
                          {file.convertedVersions.map((version, index) => (
                            <Button
                              key={index}
                              size="sm"
                              className="w-full text-xs py-1.5 bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = version.downloadUrl;
                                link.download = `${file.name.split('.')[0]}.${version.format.toLowerCase()}`;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }}
                            >
                              <Icon icon="solar:download-bold-duotone" className="h-3 w-3 mr-2" />
                              Download {version.format}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
