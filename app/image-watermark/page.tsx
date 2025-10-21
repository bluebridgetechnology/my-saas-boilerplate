'use client';

import React, { useState } from 'react';
import { Navigation } from '@/components/layout/navigation';
import { Footer } from '@/components/layout/footer';
import { WatermarkTool } from '@/components/image-processing/watermark-tool';
import { FileUpload } from '@/components/image-processing/file-upload';
import { ZIPDownloadManager } from '@/components/image-processing/zip-download-manager';
import { ProjectManager } from '@/components/image-processing/project-manager';
import { FAQAccordion } from '@/components/layout/faq-accordion';
import { Icon } from '@iconify/react';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

export default function WatermarkPage() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processedResults, setProcessedResults] = useState<any[]>([]);

  const faqs = [
    {
      question: "What types of watermarks can I add?",
      answer: "You can add text watermarks with custom fonts, colors, and sizes, or upload your own logo/image watermarks. Pro users get access to image watermarking with advanced positioning and blend modes."
    },
    {
      question: "Can I customize the watermark appearance?",
      answer: "Yes! You can adjust opacity, size, rotation, position, and blend modes. Choose from 5 different positions (corners and center) and multiple blend modes for professional results."
    },
    {
      question: "Are my images secure when adding watermarks?",
      answer: "Absolutely! All watermark processing happens locally in your browser. Your images never leave your device, ensuring complete privacy and security."
    },
    {
      question: "Can I batch process multiple images with watermarks?",
      answer: "Yes! Free users can watermark up to 5 images at once, while Pro users can process up to 100 images simultaneously with batch processing features."
    },
    {
      question: "What file formats are supported for watermarks?",
      answer: "For text watermarks, all image formats are supported. For image watermarks (Pro feature), you can upload JPG, PNG, WebP, and GIF files as your watermark logo."
    }
  ];

  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles(files);
  };

  const handleProcessingStart = () => {
    setIsProcessing(true);
    setProcessingProgress(0);
  };

  const handleProcessingEnd = () => {
    setIsProcessing(false);
  };

  const handleProgress = (progress: number) => {
    setProcessingProgress(progress);
  };

  const handleBatchComplete = (results: any[]) => {
    setProcessedResults(results);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Universal Navigation */}
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
                Image Watermark Tool
              </h1>
              
              {/* Value Proposition */}
              <p className="text-lg md:text-xl text-slate-200 mb-6 font-medium">
                Add professional watermarks and logos instantly
              </p>
              
              {/* Description */}
              <p className="text-sm text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Protect your images with customizable text or logo watermarks. 
                Professional branding made simple with advanced positioning and blend modes!
              </p>
            </div>

            {/* Right Column - Stats */}
            <div className="lg:col-span-1">
              {/* Mobile: Horizontal layout */}
              <div className="flex lg:hidden justify-center gap-6 mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-400/30">
                    <Icon icon="solar:text-bold-duotone" className="h-4 w-4 text-blue-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-xl font-bold text-white">2</div>
                    <div className="text-xs text-slate-300">Types</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-green-500/20 border border-green-400/30">
                    <Icon icon="solar:settings-bold-duotone" className="h-4 w-4 text-green-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-xl font-bold text-white">5</div>
                    <div className="text-xs text-slate-300">Positions</div>
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
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-400/30">
                    <Icon icon="solar:text-bold-duotone" className="h-4 w-4 text-blue-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-xl font-bold text-white">2</div>
                    <div className="text-xs text-slate-300">Watermark Types</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-green-500/20 border border-green-400/30">
                    <Icon icon="solar:settings-bold-duotone" className="h-4 w-4 text-green-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-xl font-bold text-white">5</div>
                    <div className="text-xs text-slate-300">Position Options</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-400/30">
                    <Icon icon="solar:shield-check-bold-duotone" className="h-4 w-4 text-purple-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-xl font-bold text-white">100%</div>
                    <div className="text-xs text-slate-300">Free to Use</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {/* Preview Section - Always at Top */}
          <div className="mb-8">
            <Card className="p-6">
              <WatermarkTool
                files={selectedFiles}
                onProcessingStart={handleProcessingStart}
                onProcessingEnd={handleProcessingEnd}
                onProgress={handleProgress}
              />
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Upload */}
            <div className="space-y-6">
              <FileUpload
                onFilesSelected={handleFilesSelected}
                maxFiles={5}
                enableFolderUpload={true}
                enablePriorityQueue={true}
              />
              
              {/* Project Management */}
              <ProjectManager
                currentFiles={selectedFiles}
                toolType="watermark"
                onLoadProject={(project) => {
                  // Handle project loading
                  console.log('Loading project:', project);
                }}
              />
            </div>

            {/* Right Column - Instructions */}
            <div className="space-y-6">
              <Card className="p-6">
                {selectedFiles.length === 0 ? (
                  <div className="text-center py-12">
                    <Icon icon="solar:gallery-bold-duotone" className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-500 mb-2">No Images Selected</h4>
                    <p className="text-gray-400">
                      Upload images to start adding watermarks with our powerful tools
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Icon icon="solar:check-circle-bold-duotone" className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Images Uploaded!</h4>
                    <p className="text-gray-600">
                      Use the preview above to add and customize your watermarks. 
                      All changes will be applied in real-time.
                    </p>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      {processedResults.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <ZIPDownloadManager
              files={selectedFiles}
              processedResults={processedResults}
              onDownloadComplete={() => {
                console.log('Download completed');
              }}
            />
          </div>
        </section>
      )}

      {/* Ad Section */}
      <div className="bg-gray-100 py-8">
        <div className="container mx-auto px-4">
          <div className="bg-gray-200 h-32 rounded-lg flex items-center justify-center">
            <span className="text-gray-500">Google AdSense Banner</span>
          </div>
        </div>
      </div>

      {/* How-to Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">
              How to Add Watermarks
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">1</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Images</h3>
                <p className="text-gray-600">Choose images from your device. We support JPG, PNG, WebP, and GIF formats.</p>
              </div>
              <div className="text-center">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">2</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Customize Watermark</h3>
                <p className="text-gray-600">Add text or upload a logo. Adjust position, opacity, size, and blend modes.</p>
              </div>
              <div className="text-center">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">3</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Download Results</h3>
                <p className="text-gray-600">Get your watermarked images instantly. Download individually or as a ZIP file.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* More Tools Section */}
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
                  Resize images while maintaining quality and aspect ratio
                </p>
              </Card>
            </Link>

            {/* Crop Tool */}
            <Link href="/tools/crop" className="group">
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
            <Link href="/tools/compress" className="group">
              <Card className="p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-purple-100 border-2 border-purple-200 mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Icon icon="solar:compress-bold-duotone" className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                  Image Compressor
                </h3>
                <p className="text-gray-600 text-sm">
                  Reduce file size without losing visual quality
                </p>
              </Card>
            </Link>

            {/* Social Presets */}
            <Link href="/social-presets" className="group">
              <Card className="p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-orange-100 border-2 border-orange-200 mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Icon icon="solar:instagram-bold-duotone" className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                  Social Presets
                </h3>
                <p className="text-gray-600 text-sm">
                  Optimize images for Instagram, YouTube, LinkedIn
                </p>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQAccordion 
        faqs={faqs}
        title="Frequently Asked Questions"
        description="Everything you need to know about our watermark tool. Can't find what you're looking for? Contact our support team."
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}
