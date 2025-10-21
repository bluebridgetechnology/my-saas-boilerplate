'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Navigation } from '@/components/layout/navigation';
import { Footer } from '@/components/layout/footer';
import { ConversionTool } from '@/components/image-processing/conversion-tool';
import { FileValidator } from '@/lib/image-processing';
import Link from 'next/link';

export default function ImageConverterPage() {
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
      
      {/* Header Section */}
      <section className="relative pt-24 pb-12 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1)_0%,transparent_50%)]"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 text-center lg:text-left py-4">
              {/* Main Title */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight tracking-tight">
                Free Image Converter
              </h1>
              
              {/* Value Proposition */}
              <p className="text-xl md:text-2xl text-slate-200 mb-6 font-medium">
                Convert images between different formats with quality preservation
              </p>
              
              {/* Description */}
              <p className="text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Transform images between JPG, PNG, WEBP, GIF, TIFF, BMP, ICO, SVG, and PDF formats while maintaining quality and transparency. 
                Perfect for web optimization and compatibility!
              </p>
            </div>

            {/* Right Column - Stats */}
            <div className="lg:col-span-1">
              {/* Mobile: Horizontal layout */}
              <div className="flex lg:hidden justify-center gap-6 mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-500/20 border border-orange-400/30">
                    <Icon icon="solar:refresh-bold-duotone" className="h-4 w-4 text-orange-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-lg font-bold text-white">100%</div>
                    <div className="text-xs text-slate-300">Free</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/30">
                    <Icon icon="solar:shield-check-bold-duotone" className="h-4 w-4 text-blue-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-lg font-bold text-white">Secure</div>
                    <div className="text-xs text-slate-300">Local</div>
                  </div>
                </div>
              </div>

              {/* Desktop: Horizontal layout */}
              <div className="hidden lg:block space-y-4 py-8">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-orange-500/20 border border-orange-400/30">
                    <Icon icon="solar:refresh-bold-duotone" className="h-5 w-5 text-orange-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-xl font-bold text-white">100% Free</div>
                    <div className="text-sm text-slate-300">No hidden costs</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-500/20 border border-blue-400/30">
                    <Icon icon="solar:shield-check-bold-duotone" className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-xl font-bold text-white">Secure</div>
                    <div className="text-sm text-slate-300">Local processing</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-500/20 border border-green-400/30">
                    <Icon icon="solar:bolt-bold-duotone" className="h-5 w-5 text-green-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-xl font-bold text-white">Fast</div>
                    <div className="text-sm text-slate-300">Instant results</div>
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
          <div className="h-32 bg-gray-200 rounded-lg flex items-center justify-center">
            <span className="text-gray-400">Google AdSense Banner</span>
          </div>
        </div>
      </div>

      {/* Tools Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Upload */}
            <div className="space-y-6">
              <Card className="p-6">
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-orange-400 transition-colors cursor-pointer"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Icon icon="solar:upload-bold-duotone" className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    Drop images here or click to browse
                  </h4>
                  <p className="text-gray-600 mb-4">
                    Supports JPG, PNG, WEBP, GIF, TIFF, BMP, ICO, SVG, PDF (max 10MB each)
                  </p>
                  <Button size="lg" className="bg-orange-600 hover:bg-orange-700">
                    <Icon icon="solar:upload-bold-duotone" className="h-5 w-5 mr-2" />
                    Choose Images
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,.pdf,.svg,.tiff,.tif"
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
                        className="bg-orange-600 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${processingProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Conversion Tool */}
                {selectedFiles.length > 0 ? (
                  <ConversionTool
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
                      Upload images to start converting them to different formats
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
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How to Convert Images</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Follow these simple steps to convert your images between different formats
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 border-2 border-orange-200 mx-auto mb-4">
                <span className="text-2xl font-bold text-orange-600">1</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Images</h3>
              <p className="text-gray-600">
                Drag and drop your images or click to browse. Supports JPG, PNG, WEBP, and GIF formats.
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 border-2 border-orange-200 mx-auto mb-4">
                <span className="text-2xl font-bold text-orange-600">2</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Choose Format</h3>
              <p className="text-gray-600">
                Select the target format (JPG, PNG, WEBP, GIF) and adjust quality settings for optimal results.
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 border-2 border-orange-200 mx-auto mb-4">
                <span className="text-2xl font-bold text-orange-600">3</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Adjust Settings</h3>
              <p className="text-gray-600">
                Fine-tune quality settings, transparency handling, and compression options for each format.
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 border-2 border-orange-200 mx-auto mb-4">
                <span className="text-2xl font-bold text-orange-600">4</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Download Results</h3>
              <p className="text-gray-600">
                Click "Process Images" and download your converted images. All processing happens in your browser.
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
          <div className="h-32 bg-gray-200 rounded-lg flex items-center justify-center">
            <span className="text-gray-400">Google AdSense Banner</span>
          </div>
        </div>
      </div>

      {/* Tool-Specific FAQ Section */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to know about our image converter. Can't find what you're looking for? 
              <a href="/contact" className="text-orange-600 hover:text-orange-700 font-medium">Contact our support team</a>.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                question: "Is the image converter completely free?",
                answer: "Yes! Our free image converter allows you to convert up to 5 images per session, with a maximum file size of 10MB each. No registration required and your images are processed locally in your browser - never uploaded to our servers."
              },
              {
                question: "What image formats are supported?",
                answer: "Our converter supports JPG, PNG, WEBP, GIF, TIFF, BMP, ICO, SVG, and PDF formats for both input and output. You can convert between any of these formats while maintaining quality and handling transparency appropriately for each format type."
              },
              {
                question: "Will converting affect image quality?",
                answer: "Our converter uses advanced algorithms to preserve image quality during format conversion. Quality settings are available for each format to help you find the perfect balance between file size and visual quality."
              },
              {
                question: "How does transparency handling work?",
                answer: "Transparency is preserved when converting to PNG and WEBP formats. When converting to JPG (which doesn't support transparency), transparent areas become white. GIF transparency is maintained for animated images."
              },
              {
                question: "Are my images secure and private?",
                answer: "Absolutely! All image processing happens locally in your browser using client-side JavaScript. Your images are never uploaded to our servers, ensuring complete privacy and security. We don't store, access, or have any way to see your images."
              },
              {
                question: "Can I convert multiple images at once?",
                answer: "Yes! Free users can convert up to 5 images per batch, while Pro users can process up to 100 images simultaneously with bulk conversion features. All conversions happen locally in your browser with real-time progress tracking."
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
                    className={`h-6 w-6 text-orange-600 flex-shrink-0 transition-transform duration-200 ${
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
                  className="inline-flex items-center px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
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
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Our Image Converter?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Convert between all major image formats with quality preservation and transparency handling
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-orange-100 border-2 border-orange-200 mx-auto mb-4">
                <Icon icon="solar:refresh-bold-duotone" className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">All Formats</h3>
              <p className="text-gray-600">
                Convert between JPG, PNG, WEBP, and GIF with format-specific optimization
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-blue-100 border-2 border-blue-200 mx-auto mb-4">
                <Icon icon="solar:eye-bold-duotone" className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Quality Preservation</h3>
              <p className="text-gray-600">
                Maintain image quality with transparency preservation and color accuracy
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-green-100 border-2 border-green-200 mx-auto mb-4">
                <Icon icon="solar:layers-bold-duotone" className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Batch Convert</h3>
              <p className="text-gray-600">
                Convert multiple images simultaneously with progress tracking and individual controls
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