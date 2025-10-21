'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Navigation } from '@/components/layout/navigation';
import { Footer } from '@/components/layout/footer';
import { Icon } from '@iconify/react';

// Dynamically import the content component to prevent SSR issues
const ImageEditorPageContent = dynamic(() => import('./image-editor-content').then(mod => ({ default: mod.ImageEditorPageContent })), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center min-h-[400px]"><div className="text-gray-500">Loading image editor...</div></div>
});

export default function ImageEditorPage() {
  return (
    <>
      <Navigation />
      
      {/* Header Section */}
      <section className="relative pt-16 pb-12 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
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
                Professional Image Editor
              </h1>
              
              {/* Value Proposition */}
              <p className="text-lg md:text-xl text-slate-200 mb-6 font-medium">
                Adjust brightness, contrast, saturation, hue, and apply professional filters
              </p>
              
              {/* Description */}
              <p className="text-sm text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Professional image editing with precision controls. Enhance your images with advanced adjustments, filters, and effects for stunning results.
              </p>
            </div>

            {/* Right Column - Stats */}
            <div className="lg:col-span-1">
              {/* Mobile: Horizontal layout */}
              <div className="flex lg:hidden justify-center gap-6 mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/30">
                    <Icon icon="solar:palette-bold-duotone" className="h-4 w-4 text-blue-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-lg font-bold text-white">15+</div>
                    <div className="text-xs text-slate-300">Adjustments</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-500/20 border border-green-400/30">
                    <Icon icon="solar:magic-stick-bold-duotone" className="h-4 w-4 text-green-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-lg font-bold text-white">Auto</div>
                    <div className="text-xs text-slate-300">Enhance</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-yellow-500/20 border border-yellow-400/30">
                    <Icon icon="solar:crown-bold-duotone" className="h-4 w-4 text-yellow-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-lg font-bold text-white">Pro</div>
                    <div className="text-xs text-slate-300">Feature</div>
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
                    <div className="text-3xl font-bold text-white">15+</div>
                    <div className="text-sm text-slate-300">Professional Adjustments</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-green-500/20 border border-green-400/30">
                    <Icon icon="solar:magic-stick-bold-duotone" className="h-6 w-6 text-green-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-3xl font-bold text-white">Auto</div>
                    <div className="text-sm text-slate-300">Smart Enhancement</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-yellow-500/20 border border-yellow-400/30">
                    <Icon icon="solar:crown-bold-duotone" className="h-6 w-6 text-yellow-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-3xl font-bold text-white">Pro</div>
                    <div className="text-sm text-slate-300">Premium Feature</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <main className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ImageEditorPageContent />
        </div>
      </main>
      
      <Footer />
    </>
  );
}
