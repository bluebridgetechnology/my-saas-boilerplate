'use client';

import React, { useState, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Navigation } from '@/components/layout/navigation';
import { Footer } from '@/components/layout/footer';
import { BetweenContentAdBanner } from '@/components/layout/ad-banner-display';
import { FileValidator } from '@/lib/image-processing';
import Link from 'next/link';

const ResizeTool = dynamic(
  () => import('@/components/image-processing/resize-tool').then(mod => mod.ResizeTool),
  {
    ssr: false,
    loading: () => (
      <div className="text-center py-12">
        <div className="flex items-center justify-center mb-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
        <h4 className="text-lg font-medium text-gray-500 mb-2">
          Loading Image Resizer...
        </h4>
        <p className="text-gray-400 text-sm">
          Please wait while the tool is being prepared.
        </p>
      </div>
    ),
  }
);

export default function ImageResizerPage() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [openItems, setOpenItems] = useState<number[]>([]);
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
      
      {/* Redesigned Header Section */}
      <section className="relative pt-20 pb-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
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
                Free Image Resizer
              </h1>
              
              {/* Value Proposition */}
              <p className="text-lg md:text-xl text-slate-200 mb-6 font-medium">
                Resize images instantly while maintaining quality
              </p>
              
              {/* Description */}
              <p className="text-sm text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Professional-grade image resizing with support for JPG, PNG, WEBP, and GIF formats. 
                No registration required - start resizing for free!
              </p>
            </div>

            {/* Right Column - Stats */}
            <div className="lg:col-span-1">
              {/* Mobile: Horizontal layout */}
              <div className="flex lg:hidden justify-center gap-6 mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-400/30">
                    <Icon icon="solar:file-bold-duotone" className="h-4 w-4 text-blue-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-xl font-bold text-white">10MB</div>
                    <div className="text-xs text-slate-300">Max Size</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-green-500/20 border border-green-400/30">
                    <Icon icon="solar:layers-bold-duotone" className="h-4 w-4 text-green-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-xl font-bold text-white">4</div>
                    <div className="text-xs text-slate-300">Formats</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-400/30">
                    <Icon icon="solar:shield-check-bold-duotone" className="h-4 w-4 text-purple-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-xl font-bold text-white">100%</div>
                    <div className="text-xs text-slate-300">Free</div>
                  </div>
                </div>
              </div>

              {/* Desktop: Vertical layout */}
              <div className="hidden lg:block space-y-6">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-400/30">
                    <Icon icon="solar:file-bold-duotone" className="h-6 w-6 text-blue-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-3xl font-bold text-white">10MB</div>
                    <div className="text-sm text-slate-300">Max File Size</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-green-500/20 border border-green-400/30">
                    <Icon icon="solar:layers-bold-duotone" className="h-6 w-6 text-green-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-3xl font-bold text-white">4</div>
                    <div className="text-sm text-slate-300">Supported Formats</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-400/30">
                    <Icon icon="solar:shield-check-bold-duotone" className="h-6 w-6 text-purple-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-3xl font-bold text-white">100%</div>
                    <div className="text-sm text-slate-300">Free to Use</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ad Section 1 */}
      <div className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <BetweenContentAdBanner currentPath="/image-resizer" />
        </div>
      </div>

      {/* Two-Column Tools Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Resize Your Images</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Upload your images and resize them with our professional tools
            </p>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                    Supports JPG, PNG, WEBP, GIF (max 10MB each)
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
                                // Fallback for images that fail to load
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const fallback = target.nextElementSibling as HTMLElement;
                                if (fallback) fallback.style.display = 'flex';
                              }}
                            />
                            {/* Fallback for non-image files or failed loads */}
                            <div className="w-full h-20 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center" style={{ display: 'none' }}>
                              <div className="text-center">
                                <Icon icon="solar:file-bold-duotone" className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                                <span className="text-xs text-gray-500">{file.name.split('.').pop()?.toUpperCase()}</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* File Info */}
                          <div className="mt-2">
                            <div className="text-xs text-gray-600 truncate font-medium" title={file.name}>
                              {file.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {FileValidator.formatFileSize(file.size)}
                            </div>
                          </div>

                          {/* Remove Button */}
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

            {/* Right Column - Actions */}
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

                {/* Resize Tool */}
                {selectedFiles.length > 0 ? (
                  <ResizeTool
                    files={selectedFiles}
                    onProcessingStart={() => setIsProcessing(true)}
                    onProcessingEnd={() => setIsProcessing(false)}
                    onProgress={setProcessingProgress}
                  />
                ) : (
                  <div className="text-center py-12">
                    <Icon icon="solar:gallery-bold-duotone" className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-500 mb-2">No Images Selected</h4>
                    <p className="text-gray-400">
                      Upload images to start resizing them with our powerful tools
                    </p>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Ad Section 2 */}
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
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How to Resize Images</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Follow these simple steps to resize your images in seconds
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 border-2 border-blue-200 mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Images</h3>
              <p className="text-gray-600">
                Drag and drop your images or click to browse. Supports JPG, PNG, WEBP, and GIF formats.
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 border-2 border-blue-200 mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Choose Dimensions</h3>
              <p className="text-gray-600">
                Select preset dimensions or enter custom width and height. Choose to maintain aspect ratio.
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 border-2 border-blue-200 mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Adjust Quality</h3>
              <p className="text-gray-600">
                Use the quality slider to balance file size and image quality. Higher quality means larger files.
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 border-2 border-blue-200 mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">4</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Download Results</h3>
              <p className="text-gray-600">
                Click "Process Images" and download your resized images. All processing happens in your browser.
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
            {/* Crop Tool */}
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

            {/* Convert Tool */}
            <Link href="/image-converter" className="group">
              <Card className="p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-orange-100 border-2 border-orange-200 mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Icon icon="solar:refresh-bold-duotone" className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                  Image Converter
                </h3>
                <p className="text-gray-600 text-sm">
                  Convert between JPG, PNG, WEBP, and GIF formats
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

      {/* Ad Section 3 */}
      <div className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <BetweenContentAdBanner currentPath="/image-resizer" />
        </div>
      </div>

      {/* Tool-Specific FAQ Section */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to know about our image resizer. Can't find what you're looking for? 
              <a href="/contact" className="text-blue-600 hover:text-blue-700 font-medium">Contact our support team</a>.
            </p>
          </div>

          {/* FAQ Items */}
          <div className="space-y-4">
            {[
              {
                question: "Is the image resizer completely free?",
                answer: "Yes! Our free image resizer allows you to resize up to 5 images per session, with a maximum file size of 10MB each. No registration required and your images are processed locally in your browser - never uploaded to our servers."
              },
              {
                question: "What image formats are supported?",
                answer: "Our free resizer supports JPG, PNG, WEBP, and GIF formats. Pro users get access to additional formats including TIFF, SVG, and more. All processing happens client-side for maximum privacy and security."
              },
              {
                question: "Are my images secure and private?",
                answer: "Absolutely! All image processing happens locally in your browser using client-side JavaScript. Your images are never uploaded to our servers, ensuring complete privacy and security. We don't store, access, or have any way to see your images."
              },
              {
                question: "What's the maximum file size I can resize?",
                answer: "Free users can resize images up to 10MB each. Pro users can process images up to 50MB each. If you need to resize larger files, consider upgrading to our Pro plan for increased limits and advanced features."
              },
              {
                question: "Can I resize multiple images at once?",
                answer: "Yes! Free users can resize up to 5 images per batch, while Pro users can process up to 100 images simultaneously. All images are processed locally in your browser with real-time progress tracking."
              }
            ].map((faq, index) => (
              <div 
                key={index}
                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <button
                  onClick={() => {
                    const newOpenItems = openItems.includes(index) 
                      ? openItems.filter(item => item !== index)
                      : [...openItems, index];
                    setOpenItems(newOpenItems);
                  }}
                  className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-gray-50 rounded-xl transition-colors duration-200"
                >
                  <h3 className="text-lg font-semibold text-gray-900 pr-4">
                    {faq.question}
                  </h3>
                  <Icon 
                    icon={openItems.includes(index) ? "solar:minus-circle-bold-duotone" : "solar:add-circle-bold-duotone"}
                    className={`h-6 w-6 text-blue-600 flex-shrink-0 transition-transform duration-200 ${
                      openItems.includes(index) ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                
                {openItems.includes(index) && (
                  <div className="px-6 pb-5">
                    <div className="border-t border-gray-100 pt-4">
                      <p className="text-gray-600 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-16">
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Still have questions?
              </h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Our support team is here to help. Get in touch and we'll get back to you within 24 hours.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="/contact"
                  className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  <Icon icon="solar:letter-unread-bold-duotone" className="h-5 w-5 mr-2" />
                  Contact Support
                </a>
                <a 
                  href="/docs"
                  className="inline-flex items-center px-6 py-3 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 font-semibold rounded-lg transition-all duration-300"
                >
                  <Icon icon="solar:book-bold-duotone" className="h-5 w-5 mr-2" />
                  View Documentation
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Our Image Resizer?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Professional-grade image resizing with advanced features and real-time preview
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-green-100 border-2 border-green-200 mx-auto mb-4">
                <Icon icon="solar:check-circle-bold-duotone" className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Aspect Ratio Control</h3>
              <p className="text-gray-600">
                Maintain perfect proportions or customize dimensions with flexible aspect ratio options
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-blue-100 border-2 border-blue-200 mx-auto mb-4">
                <Icon icon="solar:eye-bold-duotone" className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-time Preview</h3>
              <p className="text-gray-600">
                See changes instantly with before/after comparison and file size estimation
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-purple-100 border-2 border-purple-200 mx-auto mb-4">
                <Icon icon="solar:layers-bold-duotone" className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Batch Processing</h3>
              <p className="text-gray-600">
                Process multiple images simultaneously with progress tracking and individual controls
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}