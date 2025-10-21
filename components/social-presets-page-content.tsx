'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Navigation } from '@/components/layout/navigation';
import { Footer } from '@/components/layout/footer';
import { BetweenContentAdBanner } from '@/components/layout/ad-banner-display';
import { FileValidator } from '@/lib/image-processing';
import { VisualSocialPresetsTool } from '@/components/image-processing/visual-social-presets-tool';
import Link from 'next/link';

export function SocialPresetsPageContent() {
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
      <section className="relative pt-16 pb-12 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1)_0%,transparent_50%)]"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            <div className="lg:col-span-2 text-center lg:text-left">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-6 leading-tight tracking-tight">
                Social Media Presets
              </h1>
              <p className="text-lg md:text-xl text-slate-200 mb-6 font-medium">
                Optimize images for all social media platforms instantly
              </p>
              <p className="text-sm text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Professional social media image optimization with 60+ presets for Facebook, Instagram, Twitter, 
                YouTube, LinkedIn, Pinterest, and more. Perfect aspect ratios every time!
              </p>
            </div>

            <div className="lg:col-span-1">
              <div className="flex lg:hidden justify-center gap-6 mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/30">
                    <Icon icon="solar:chat-round-like-line-duotone" className="h-4 w-4 text-blue-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-lg font-bold text-white">8</div>
                    <div className="text-xs text-slate-300">Platforms</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-500/20 border border-green-400/30">
                    <Icon icon="solar:layers-bold-duotone" className="h-4 w-4 text-green-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-lg font-bold text-white">60+</div>
                    <div className="text-xs text-slate-300">Presets</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-500/20 border border-orange-400/30">
                    <Icon icon="solar:download-bold-duotone" className="h-4 w-4 text-orange-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-lg font-bold text-white">3</div>
                    <div className="text-xs text-slate-300">Free</div>
                  </div>
                </div>
              </div>

              <div className="hidden lg:block space-y-4 py-8">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-500/20 border border-blue-400/30">
                    <Icon icon="solar:chat-round-like-line-duotone" className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-xl font-bold text-white">8 Platforms</div>
                    <div className="text-sm text-slate-300">Social media coverage</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-500/20 border border-green-400/30">
                    <Icon icon="solar:layers-bold-duotone" className="h-5 w-5 text-green-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-xl font-bold text-white">60+ Presets</div>
                    <div className="text-sm text-slate-300">Perfect dimensions</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-orange-500/20 border border-orange-400/30">
                    <Icon icon="solar:download-bold-duotone" className="h-5 w-5 text-orange-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-xl font-bold text-white">3 Free</div>
                    <div className="text-sm text-slate-300">No registration</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Tool Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            {/* Single Upload Section */}
            <div className="mb-8">
              <Card className="bg-white shadow-xl rounded-2xl p-8 border-2 border-gray-100">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon icon="solar:cloud-upload-bold-duotone" className="h-12 w-12 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Drag & drop your image or click to upload
                  </h3>
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-blue-400 transition-colors cursor-pointer max-w-md mx-auto"
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileInputChange}
                      className="hidden"
                    />
                    <div className="text-center">
                      <Icon icon="solar:cloud-upload-bold-duotone" className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">Choose files or drag them here</p>
                      <p className="text-sm text-gray-500">Supports JPG, PNG, WEBP, GIF up to 10MB each</p>
                    </div>
                  </div>
                  {selectedFiles.length > 0 && (
                    <div className="mt-4">
                      <Button 
                        onClick={clearFiles}
                        variant="outline" 
                        size="sm"
                        className="mr-2"
                      >
                        Clear Files
                      </Button>
                      <span className="text-sm text-gray-600">
                        {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected
                      </span>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Visual Social Media Presets Tool */}
            <VisualSocialPresetsTool 
              files={selectedFiles}
              onProcessingStart={() => setIsProcessing(true)}
              onProcessingEnd={() => setIsProcessing(false)}
              onProgress={setProcessingProgress}
            />
          </div>
        </div>
      </section>

      {/* Ad Banner */}
      <BetweenContentAdBanner />

      {/* How-to Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">
              How to Use Social Media Presets
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">1</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Your Image</h3>
                <p className="text-gray-600">Choose any image from your device. We support JPG, PNG, WebP, and GIF formats.</p>
              </div>
              <div className="text-center">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">2</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Select Platform</h3>
                <p className="text-gray-600">Choose from 8 platforms: Facebook, Instagram, Twitter, YouTube, LinkedIn, Pinterest, Google Display, and Email & Blog.</p>
              </div>
              <div className="text-center">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">3</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Download Results</h3>
                <p className="text-gray-600">Get perfectly sized images optimized for your chosen social media platform.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* More Tools Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">More Image Tools</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Explore our complete suite of professional image processing tools
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/image-cropper" className="group">
              <Card className="p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-green-100 border-2 border-green-200 mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Icon icon="solar:crop-bold-duotone" className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                  Image Cropper
                </h3>
                <p className="text-gray-600 text-sm">
                  Crop images with precision using our visual crop selector
                </p>
              </Card>
            </Link>

            <Link href="/image-compressor" className="group">
              <Card className="p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-orange-100 border-2 border-orange-200 mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Icon icon="solar:minimize-square-2-line-duotone" className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                  Image Compressor
                </h3>
                <p className="text-gray-600 text-sm">
                  Reduce file size without losing visual quality
                </p>
              </Card>
            </Link>

            <Link href="/image-converter" className="group">
              <Card className="p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100 border-2 border-blue-200 mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Icon icon="solar:refresh-bold-duotone" className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  Image Converter
                </h3>
                <p className="text-gray-600 text-sm">
                  Convert between JPG, PNG, WEBP, and GIF formats
                </p>
              </Card>
            </Link>

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
