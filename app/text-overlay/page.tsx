'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Navigation } from '@/components/layout/navigation';
import { Footer } from '@/components/layout/footer';
import { Icon } from '@iconify/react';

// Dynamically import the content to avoid SSR issues
const TextOverlayPageContent = dynamic(() => import('./text-overlay-content').then(mod => ({ default: mod.TextOverlayPageContent })), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center py-16">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  )
});

export default function TextOverlayPage() {
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
                Text Overlay Tool
              </h1>
              
              {/* Value Proposition */}
              <p className="text-lg md:text-xl text-slate-200 mb-6 font-medium">
                Add professional text overlays with custom fonts and effects
              </p>
              
              {/* Description */}
              <p className="text-sm text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Create stunning text overlays with advanced typography, custom fonts, text effects, shadows, outlines, and precise positioning for professional results.
              </p>
            </div>

            {/* Right Column - Stats */}
            <div className="lg:col-span-1">
              {/* Mobile: Horizontal layout */}
              <div className="flex lg:hidden justify-center gap-6 mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/30">
                    <Icon icon="solar:text-bold-duotone" className="h-4 w-4 text-blue-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-lg font-bold text-white">Custom</div>
                    <div className="text-xs text-slate-300">Fonts</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-500/20 border border-green-400/30">
                    <Icon icon="solar:magic-stick-3-bold-duotone" className="h-4 w-4 text-green-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-lg font-bold text-white">Text</div>
                    <div className="text-xs text-slate-300">Effects</div>
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
                    <Icon icon="solar:text-bold-duotone" className="h-6 w-6 text-blue-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-3xl font-bold text-white">Custom</div>
                    <div className="text-sm text-slate-300">Google Fonts</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-green-500/20 border border-green-400/30">
                    <Icon icon="solar:magic-stick-3-bold-duotone" className="h-6 w-6 text-green-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-3xl font-bold text-white">Text</div>
                    <div className="text-sm text-slate-300">Effects & Styles</div>
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
          <TextOverlayPageContent />
        </div>
      </main>
      
      <Footer />
    </>
  );
}
