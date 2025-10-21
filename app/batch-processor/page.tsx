'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Navigation } from '@/components/layout/navigation';
import { Footer } from '@/components/layout/footer';
import { BatchProcessingTool } from '@/components/image-processing/batch-processing-tool';
import { FileValidator } from '@/lib/image-processing';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Link from 'next/link';

export default function BatchProcessorPage() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((files: File[]) => {
    const validFiles: File[] = [];
    const errors: string[] = [];

    files.forEach((file, index) => {
      const validation = FileValidator.validateFile(file);
      if (validation.valid && validation.file) {
        validFiles.push(validation.file);
      } else {
        errors.push(`File ${index + 1} (${file.name}): ${validation.error}`);
      }
    });

    if (errors.length > 0) {
      console.error('File validation errors:', errors);
    }

    setSelectedFiles(validFiles);
  }, []);

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    handleFileSelect(files);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    handleFileSelect(files);
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const clearFiles = () => {
    setSelectedFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <Navigation />
      
      {/* Header Section */}
      <section className="relative pt-24 pb-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1)_0%,transparent_50%)]"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 text-center lg:text-left">
              {/* Main Title */}
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-6 leading-tight tracking-tight">
                Batch Image Processor
              </h1>
              
              {/* Value Proposition */}
              <p className="text-lg md:text-xl text-slate-200 mb-6 font-medium">
                Process hundreds of images simultaneously with advanced queue management
              </p>
              
              {/* Description */}
              <p className="text-sm text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Professional batch processing with selective processing, progress tracking, and advanced queue management. 
                Perfect for photographers and designers handling large image collections!
              </p>
            </div>

            {/* Right Column - Stats */}
            <div className="lg:col-span-1">
              {/* Mobile: Horizontal layout */}
              <div className="flex lg:hidden justify-center gap-6 mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-400/30">
                    <Icon icon="solar:layers-bold-duotone" className="h-4 w-4 text-blue-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-xl font-bold text-white">100</div>
                    <div className="text-xs text-slate-300">Images</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-green-500/20 border border-green-400/30">
                    <Icon icon="solar:cup-star-line-duotone" className="h-4 w-4 text-green-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-xl font-bold text-white">Pro</div>
                    <div className="text-xs text-slate-300">Feature</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-400/30">
                    <Icon icon="solar:shield-check-bold-duotone" className="h-4 w-4 text-purple-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-xl font-bold text-white">100%</div>
                    <div className="text-xs text-slate-300">Secure</div>
                  </div>
                </div>
              </div>

              {/* Desktop: Vertical layout */}
              <div className="hidden lg:block space-y-6">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-400/30">
                    <Icon icon="solar:layers-bold-duotone" className="h-4 w-4 text-blue-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-xl font-bold text-white">100</div>
                    <div className="text-xs text-slate-300">Images Per Batch</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-green-500/20 border border-green-400/30">
                    <Icon icon="solar:cup-star-line-duotone" className="h-4 w-4 text-green-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-xl font-bold text-white">Pro</div>
                    <div className="text-xs text-slate-300">Advanced Features</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-400/30">
                    <Icon icon="solar:shield-check-bold-duotone" className="h-4 w-4 text-purple-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-xl font-bold text-white">100%</div>
                    <div className="text-xs text-slate-300">Local Processing</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ad Section */}
      <div className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-32 bg-gray-200 rounded-lg flex items-center justify-center">
            <span className="text-gray-400">Google AdSense Banner</span>
          </div>
        </div>
      </div>

      {/* Batch Processing Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Batch Process Your Images</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Upload multiple images and process them with advanced batch management tools
            </p>
          </div>

          {/* Two Column Layout for Upload and Settings */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Left Column - Upload Area */}
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Images</h3>
                
                {/* Upload Area */}
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer bg-gray-50"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Icon icon="solar:upload-bold-duotone" className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    Drop images here or click to browse
                  </h4>
                  <p className="text-gray-600 mb-4">
                    Supports JPG, PNG, WEBP, GIF (max 50MB each for Pro users)
                  </p>
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                    <Icon icon="solar:upload-bold-duotone" className="h-5 w-5 mr-2" />
                    Choose Images
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                </div>

                {/* Selected Files */}
                {selectedFiles.length > 0 && (
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-gray-900">
                        Selected Files ({selectedFiles.length})
                      </h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearFiles}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <Icon icon="solar:trash-bin-trash-bold-duotone" className="h-4 w-4 mr-1" />
                        Clear All
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="relative group bg-white rounded-lg border border-gray-200 p-3">
                          <div className="relative">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={file.name}
                              className="w-full h-20 object-cover rounded-lg border border-gray-200"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const fallback = target.nextElementSibling as HTMLElement;
                                if (fallback) fallback.style.display = 'flex';
                              }}
                            />
                            <div className="w-full h-20 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center" style={{ display: 'none' }}>
                              <div className="text-center">
                                <Icon icon="solar:file-bold-duotone" className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                                <span className="text-xs text-gray-500">{file.name.split('.').pop()?.toUpperCase()}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-2">
                            <div className="text-xs text-gray-600 truncate font-medium" title={file.name}>
                              {file.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {FileValidator.formatFileSize(file.size)}
                            </div>
                          </div>

                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== index))}
                              className="bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
                              title="Remove"
                            >
                              <Icon icon="solar:close-circle-bold-duotone" className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            </div>

            {/* Right Column - Batch Settings */}
            <div className="space-y-6">
              <Card className="p-6">
                {/* Processing Status */}
                {isProcessing && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-medium text-gray-700">Processing...</span>
                      <span className="text-lg text-gray-500">{processingProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${processingProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Batch Processing Tool */}
                {selectedFiles.length > 0 ? (
                  <BatchProcessingTool
                    files={selectedFiles}
                    onProcessingStart={() => setIsProcessing(true)}
                    onProcessingEnd={() => setIsProcessing(false)}
                    onProgress={setProcessingProgress}
                    onBatchComplete={(results) => {
                      console.log('Batch processing complete:', results);
                    }}
                    processingComponent={({ files, onProcessingStart, onProcessingEnd, onProgress }) => (
                      <div className="text-center py-8">
                        <Icon icon="solar:settings-bold-duotone" className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                        <h4 className="text-lg font-medium text-gray-900 mb-2">Processing Component</h4>
                        <p className="text-gray-600 text-sm">
                          Configure your processing settings in the batch tool
                        </p>
                      </div>
                    )}
                  />
                ) : (
                  <div className="text-center py-12">
                    <Icon icon="solar:gallery-bold-duotone" className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-500 mb-2">No Images Selected</h4>
                    <p className="text-gray-400">
                      Upload images to start batch processing with our advanced tools
                    </p>
                  </div>
                )}

                {/* Pro Features Notice */}
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon icon="solar:crown-bold-duotone" className="h-5 w-5 text-white" />
                    <span className="text-sm text-white font-semibold">Pro Feature</span>
                  </div>
                  <p className="text-xs text-white/90 leading-relaxed">
                    Batch processing with selective processing, priority queue, and advanced management is available for Pro users.
                  </p>
                </div>
              </Card>
            </div>
          </div>

          {/* Full Width Batch Queue Table */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Batch Queue</h3>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Preview</TableHead>
                  <TableHead>File Name</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedFiles.length > 0 ? (
                  selectedFiles.map((file, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-200">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const fallback = target.nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center" style={{ display: 'none' }}>
                            <Icon icon="solar:file-bold-duotone" className="h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{file.name}</TableCell>
                      <TableCell>{FileValidator.formatFileSize(file.size)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Icon icon="solar:clock-circle-bold-duotone" className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">Pending</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-gray-300 h-2 rounded-full" style={{ width: '0%' }} />
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== index))}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Icon icon="solar:trash-bin-trash-bold-duotone" className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Icon icon="solar:gallery-bold-duotone" className="h-8 w-8 text-gray-300" />
                        <span className="text-gray-500">No files uploaded yet</span>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </div>
      </section>

      {/* Ad Section */}
      <div className="py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-32 bg-gray-200 rounded-lg flex items-center justify-center">
            <span className="text-gray-400">Google AdSense Banner</span>
          </div>
        </div>
      </div>

      {/* How-to Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How to Use Batch Processing</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Follow these simple steps to process multiple images efficiently
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 border-2 border-blue-200 mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Images</h3>
              <p className="text-gray-600">
                Drag and drop multiple images or select them from your device. Supports up to 100 images for Pro users.
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 border-2 border-blue-200 mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Configure Settings</h3>
              <p className="text-gray-600">
                Choose processing mode, select specific images, and configure batch settings for optimal results.
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 border-2 border-blue-200 mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Monitor Progress</h3>
              <p className="text-gray-600">
                Track processing status in real-time with detailed progress indicators and queue management.
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 border-2 border-blue-200 mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">4</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Download Results</h3>
              <p className="text-gray-600">
                Download all processed images individually or as a ZIP file. Review failed items and retry if needed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Other Tools Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">More Image Tools</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Explore our complete suite of professional image processing tools
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Resize Tool */}
            <Link href="/image-resizer" className="group">
              <Card className="p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100 border-2 border-blue-200 mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Icon icon="solar:resize-bold-duotone" className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  Image Resizer
                </h3>
                <p className="text-gray-600 text-sm">
                  Resize images to any dimensions while maintaining quality
                </p>
              </Card>
            </Link>

            {/* Compress Tool */}
            <Link href="/image-compressor" className="group">
              <Card className="p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-purple-100 border-2 border-purple-200 mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Icon icon="solar:minimize-square-2-line-duotone" className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                  Image Compressor
                </h3>
                <p className="text-gray-600 text-sm">
                  Reduce file size without losing visual quality
                </p>
              </Card>
            </Link>

            {/* Social Presets Tool */}
            <Link href="/social-presets" className="group">
              <Card className="p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-green-100 border-2 border-green-200 mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Icon icon="solar:layers-bold-duotone" className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                  Social Presets
                </h3>
                <p className="text-gray-600 text-sm">
                  Optimize images for Instagram, YouTube, LinkedIn and more
                </p>
              </Card>
            </Link>

            {/* Background Removal Tool */}
            <Link href="/background-removal" className="group">
              <Card className="p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-100 border-2 border-emerald-200 mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Icon icon="solar:magic-stick-bold-duotone" className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors">
                  Background Removal
                </h3>
                <p className="text-gray-600 text-sm">
                  Remove backgrounds using AI-powered technology
                </p>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
