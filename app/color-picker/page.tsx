'use client';

import { Navigation } from '@/components/layout/navigation';
import { Footer } from '@/components/layout/footer';
import { ColorPickerTool } from '@/components/image-processing/color-picker-tool';
import { ToolPageWrapper } from '@/components/image-processing/tool-page-wrapper';
import { Icon } from '@iconify/react';
import Link from 'next/link';
import { useState } from 'react';

export default function ColorPickerPage() {
  const [openItems, setOpenItems] = useState<number[]>([]);

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
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight tracking-tight">
                Color Picker
              </h1>
              
              {/* Value Proposition */}
              <p className="text-xl md:text-2xl text-slate-200 mb-6 font-medium">
                Extract colors from images with precision
              </p>
              
              {/* Description */}
              <p className="text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Get HEX, RGB, HSL values, create color palettes, and find the perfect colors for your designs. 
                Professional color extraction made simple!
              </p>
            </div>

            {/* Right Column - Stats */}
            <div className="lg:col-span-1">
              {/* Mobile: Horizontal layout */}
              <div className="flex lg:hidden justify-center gap-6 mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30">
                    <Icon icon="solar:palette-bold-duotone" className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-xl font-bold text-white">5</div>
                    <div className="text-xs text-slate-300">Colors</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-green-500/20 border border-green-400/30">
                    <Icon icon="solar:layers-bold-duotone" className="h-5 w-5 text-green-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-xl font-bold text-white">3</div>
                    <div className="text-xs text-slate-300">Formats</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/30">
                    <Icon icon="solar:shield-check-bold-duotone" className="h-5 w-5 text-purple-400" />
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
                    <Icon icon="solar:palette-bold-duotone" className="h-6 w-6 text-blue-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-3xl font-bold text-white">5</div>
                    <div className="text-sm text-slate-300">Color Palette</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-green-500/20 border border-green-400/30">
                    <Icon icon="solar:layers-bold-duotone" className="h-6 w-6 text-green-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-3xl font-bold text-white">3</div>
                    <div className="text-sm text-slate-300">Color Formats</div>
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

      {/* Two-Column Tools Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Extract Colors from Images</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Upload your images and extract colors with our professional color picker
            </p>
          </div>

          <ToolPageWrapper>
            <ColorPickerTool />
          </ToolPageWrapper>
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

      {/* How-to Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How to Use Color Picker</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Follow these simple steps to extract colors from your images in seconds
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 border-2 border-blue-200 mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Your Image</h3>
              <p className="text-gray-600">
                Choose any image from your device. We support JPG, PNG, WebP, and GIF formats.
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 border-2 border-blue-200 mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Click to Pick Colors</h3>
              <p className="text-gray-600">
                Click anywhere on the image to extract colors. Get HEX, RGB, and HSL values instantly.
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 border-2 border-blue-200 mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Create Palettes</h3>
              <p className="text-gray-600">
                Generate color palettes from your images and copy colors to use in your designs.
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
            <a href="/image-cropper" className="group">
              <div className="p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 bg-white rounded-xl border border-gray-200">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-green-100 border-2 border-green-200 mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Icon icon="solar:crop-bold-duotone" className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                  Image Cropper
                </h3>
                <p className="text-gray-600 text-sm">
                  Crop images with precision using our visual crop selector
                </p>
              </div>
            </a>

            {/* Compress Tool */}
            <a href="/image-compressor" className="group">
              <div className="p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 bg-white rounded-xl border border-gray-200">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-purple-100 border-2 border-purple-200 mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Icon icon="solar:minimize-square-2-line-duotone" className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                  Image Compressor
                </h3>
                <p className="text-gray-600 text-sm">
                  Reduce file size without losing visual quality
                </p>
              </div>
            </a>

            {/* Convert Tool */}
            <a href="/image-converter" className="group">
              <div className="p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 bg-white rounded-xl border border-gray-200">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-orange-100 border-2 border-orange-200 mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Icon icon="solar:refresh-bold-duotone" className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                  Image Converter
                </h3>
                <p className="text-gray-600 text-sm">
                  Convert between JPG, PNG, WEBP, and GIF formats
                </p>
              </div>
            </a>

            {/* Background Removal Tool */}
            <a href="/background-removal" className="group">
              <div className="p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 bg-white rounded-xl border border-gray-200">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-100 border-2 border-emerald-200 mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Icon icon="solar:magic-stick-bold-duotone" className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors">
                  Background Removal
                </h3>
                <p className="text-gray-600 text-sm">
                  Remove backgrounds using AI-powered technology
                </p>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Tool-Specific FAQ Section */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to know about our color picker. Can't find what you're looking for? 
              <a href="/contact" className="text-blue-600 hover:text-blue-700 font-medium">Contact our support team</a>.
            </p>
          </div>

          {/* FAQ Items */}
          <div className="space-y-4">
            {[
              {
                question: "What color formats are supported?",
                answer: "We support HEX (#FFFFFF), RGB (255, 255, 255), HSL (0, 0%, 100%), and CMYK formats. Pro users get additional formats like LAB and XYZ for professional color work."
              },
              {
                question: "Can I create color palettes?",
                answer: "Yes! Free users can create palettes with up to 5 colors. Pro users can create palettes with up to 20 colors and save them for later use. All palettes can be exported and shared."
              },
              {
                question: "How accurate is the color extraction?",
                answer: "Our color picker uses advanced algorithms to extract colors with high precision. Pro users get access to enhanced accuracy modes and can pick colors from specific pixel coordinates."
              },
              {
                question: "Can I copy colors to clipboard?",
                answer: "Yes! Click any color value to copy it to your clipboard instantly. You can copy HEX, RGB, HSL, or CMYK values. Bulk copy options are available for entire palettes."
              },
              {
                question: "Are there any usage limits?",
                answer: "Free users can pick colors from up to 5 images per session and create palettes with 5 colors. Pro users have unlimited color picking, can save color history, and create larger palettes."
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

      {/* Ad Section 2 */}
      <div className="py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-32 bg-gray-200 rounded-lg flex items-center justify-center">
            <span className="text-gray-400">Google AdSense Banner</span>
          </div>
        </div>
      </div>

      {/* Ad Section 3 */}
      <div className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-32 bg-gray-200 rounded-lg flex items-center justify-center">
            <span className="text-gray-400">Google AdSense Banner</span>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Our Color Picker?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Professional-grade color extraction with advanced features and real-time preview
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-green-100 border-2 border-green-200 mx-auto mb-4">
                <Icon icon="solar:palette-bold-duotone" className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Multiple Color Formats</h3>
              <p className="text-gray-600">
                Extract colors in HEX, RGB, HSL, and CMYK formats. Perfect for designers and developers
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-blue-100 border-2 border-blue-200 mx-auto mb-4">
                <Icon icon="solar:eye-bold-duotone" className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-time Preview</h3>
              <p className="text-gray-600">
                See color values instantly as you hover over images with our crosshair cursor
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-purple-100 border-2 border-purple-200 mx-auto mb-4">
                <Icon icon="solar:layers-bold-duotone" className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Palette Generation</h3>
              <p className="text-gray-600">
                Automatically generate beautiful color palettes from your images with intelligent sampling
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
