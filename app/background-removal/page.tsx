'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Navigation } from '@/components/layout/navigation';
import { Footer } from '@/components/layout/footer';
import { ToolPageWrapper } from '@/components/image-processing/tool-page-wrapper';
import { FAQAccordion } from '@/components/layout/faq-accordion';
import { Icon } from '@iconify/react';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

const BackgroundRemovalTool = dynamic(
  () => import('@/components/image-processing/background-removal-tool').then(mod => mod.BackgroundRemovalTool),
  { 
    ssr: false,
    loading: () => (
      <div className="text-center py-12">
        <div className="flex items-center justify-center mb-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
        <h4 className="text-lg font-medium text-gray-500 mb-2">
          Loading Background Removal Tool...
        </h4>
        <p className="text-gray-400 text-sm">
          Please wait while the tool is being prepared.
        </p>
      </div>
    ),
  }
);

export default function BackgroundRemovalPage() {
  const faqs = [
    {
      question: "How does AI background removal work?",
      answer: "Our AI uses advanced machine learning models to automatically detect and separate the foreground subject from the background. The process analyzes image content to create precise masks and remove backgrounds while preserving fine details like hair and edges."
    },
    {
      question: "What image formats are supported?",
      answer: "We support JPG, PNG, WEBP, and GIF formats for input. Output images are automatically converted to PNG format to preserve transparency. Pro users can also process TIFF and other advanced formats."
    },
    {
      question: "How accurate is the background removal?",
      answer: "Our AI achieves professional-grade accuracy, especially with clear subjects against contrasting backgrounds. For complex images with fine details like hair or fur, the AI includes edge refinement to ensure natural-looking results."
    },
    {
      question: "Are there any usage limits?",
      answer: "Free users can remove backgrounds from up to 3 images per session. Pro users get unlimited background removal and can process up to 100 images in a single batch. All processing happens locally in your browser."
    },
    {
      question: "Is my data secure and private?",
      answer: "Absolutely! All background removal processing happens entirely in your browser using client-side AI models. Your images never leave your device, ensuring complete privacy and security. We don't store, access, or have any way to see your images."
    },
    {
      question: "Can I replace the background with a new one?",
      answer: "Yes! Pro users can replace removed backgrounds with solid colors, gradients, or upload custom background images. You can also save transparent PNG files for use in other applications."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Universal Navigation */}
      <Navigation />
      
      {/* Redesigned Header Section */}
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
                AI Background Removal
              </h1>
              
              {/* Value Proposition */}
              <p className="text-lg md:text-xl text-slate-200 mb-6 font-medium">
                Remove backgrounds instantly with AI-powered precision
              </p>
              
              {/* Description */}
              <p className="text-sm text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Professional-grade background removal using advanced AI technology. 
                Perfect for product photos, portraits, and creative projects!
              </p>
            </div>

            {/* Right Column - Stats */}
            <div className="lg:col-span-1">
              {/* Mobile: Horizontal layout */}
              <div className="flex lg:hidden justify-center gap-6 mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30">
                    <Icon icon="solar:magic-stick-bold-duotone" className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-xl font-bold text-white">AI</div>
                    <div className="text-xs text-slate-300">Powered</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30">
                    <Icon icon="solar:shield-check-bold-duotone" className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-xl font-bold text-white">100%</div>
                    <div className="text-xs text-slate-300">Private</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/30">
                    <Icon icon="solar:crown-bold-duotone" className="h-5 w-5 text-purple-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-xl font-bold text-white">Pro</div>
                    <div className="text-xs text-slate-300">Feature</div>
                  </div>
                </div>
              </div>

              {/* Desktop: Vertical layout */}
              <div className="hidden lg:block space-y-6">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400/30">
                    <Icon icon="solar:magic-stick-bold-duotone" className="h-6 w-6 text-emerald-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-3xl font-bold text-white">AI</div>
                    <div className="text-sm text-slate-300">Powered Technology</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-400/30">
                    <Icon icon="solar:shield-check-bold-duotone" className="h-6 w-6 text-blue-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-3xl font-bold text-white">100%</div>
                    <div className="text-sm text-slate-300">Client-Side Processing</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-400/30">
                    <Icon icon="solar:crown-bold-duotone" className="h-6 w-6 text-purple-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-3xl font-bold text-white">Pro</div>
                    <div className="text-sm text-slate-300">Tier Feature</div>
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
          <ToolPageWrapper>
            <BackgroundRemovalTool />
          </ToolPageWrapper>
        </div>
      </section>

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
              How to Remove Backgrounds
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-emerald-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-emerald-600">1</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Your Image</h3>
                <p className="text-gray-600">Choose any image from your device. Our AI works best with clear subjects against contrasting backgrounds.</p>
              </div>
              <div className="text-center">
                <div className="bg-emerald-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-emerald-600">2</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Processing</h3>
                <p className="text-gray-600">Our AI automatically detects the subject and removes the background with professional precision.</p>
              </div>
              <div className="text-center">
                <div className="bg-emerald-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-emerald-600">3</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Download Result</h3>
                <p className="text-gray-600">Get your image with transparent background or add a new background. Perfect for any project!</p>
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

            {/* Social Presets Tool */}
            <Link href="/social-presets" className="group">
              <Card className="p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-pink-100 border-2 border-pink-200 mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Icon icon="solar:instagram-bold-duotone" className="h-6 w-6 text-pink-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-pink-600 transition-colors">
                  Social Media Presets
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
        description="Everything you need to know about our AI background removal tool. Can't find what you're looking for? Contact our support team."
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}
