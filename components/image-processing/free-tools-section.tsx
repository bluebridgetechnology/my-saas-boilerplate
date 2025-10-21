'use client';

import React from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function FreeToolsSection() {
  // Mapping from tool IDs to their direct URLs
  const toolUrlMap: Record<string, string> = {
    'resize': '/image-resizer',
    'crop': '/image-cropper',
    'compress': '/image-compressor',
    'convert': '/image-converter',
    'social': '/social-presets',
    'watermark': '/image-watermark',
    'color': '/color-tools',
    'batch': '/batch-processor'
  };

  const tools = [
    {
      id: 'resize',
      name: 'Resize',
      description: 'Change image dimensions while maintaining quality',
      icon: 'solar:minimize-square-3-line-duotone',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      features: ['Custom dimensions', 'Aspect ratio lock', 'Batch processing'],
      isPro: false
    },
    {
      id: 'crop',
      name: 'Crop',
      description: 'Cut and trim images to perfect composition',
      icon: 'solar:crop-bold-duotone',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      features: ['Free-form crop', 'Preset ratios', 'Smart crop'],
      isPro: false
    },
    {
      id: 'compress',
      name: 'Compress',
      description: 'Reduce file size without losing visual quality',
      icon: 'solar:minimize-square-2-line-duotone',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      features: ['Quality control', 'Size optimization', 'Format conversion'],
      isPro: false
    },
    {
      id: 'convert',
      name: 'Convert',
      description: 'Transform images between different formats',
      icon: 'solar:refresh-bold-duotone',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      features: ['All formats', 'Batch convert', 'Quality settings'],
      isPro: false
    },
    {
      id: 'social',
      name: 'Social Presets',
      description: 'Optimize images for social media platforms',
      icon: 'solar:chat-round-like-line-duotone',
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-200',
      features: ['Platform presets', 'Custom sizes', 'Auto-optimize'],
      isPro: true
    },
    {
      id: 'watermark',
      name: 'Watermark',
      description: 'Add text or logo watermarks to protect images',
      icon: 'solar:text-bold-duotone',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      features: ['Text watermarks', 'Logo overlay', 'Positioning'],
      isPro: true
    },
    {
      id: 'color',
      name: 'Color Tools',
      description: 'Adjust brightness, contrast, and color balance',
      icon: 'solar:palette-bold-duotone',
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
      borderColor: 'border-cyan-200',
      features: ['Brightness/Contrast', 'Color balance', 'Filters'],
      isPro: true
    },
    {
      id: 'batch',
      name: 'Batch Process',
      description: 'Process multiple images simultaneously',
      icon: 'solar:layers-bold-duotone',
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      borderColor: 'border-teal-200',
      features: ['100+ images', 'ZIP download', 'Progress tracking'],
      isPro: true
    }
  ];

  return (
    <section id="free-tools" className="py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-6">
            <Icon icon="solar:tools-bold-duotone" className="h-4 w-4 mr-2" />
            Professional Tools
          </div>
          <h2 className="text-4xl font-bold text-gray-900 sm:text-5xl lg:text-6xl mb-6 leading-tight">
            Complete{' '}
            <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Image Processing
            </span>{' '}
            Suite
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Everything you need to process, optimize, and perfect your images. 
            Start with our free tools and unlock advanced features with Pro.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 mb-16">
          {tools.map((tool, index) => (
            <div 
              key={tool.id}
              className={`group relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 cursor-pointer ${
                tool.isPro ? 'ring-2 ring-blue-200' : ''
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {tool.isPro && (
                <div className="absolute -top-2 -right-2">
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs font-semibold px-2 py-1 rounded-full">
                    Pro
              </div>
            </div>
              )}

              <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${tool.bgColor} ${tool.borderColor} border-2 mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <Icon icon={tool.icon} className={`h-7 w-7 ${tool.color}`} />
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                  {tool.name}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {tool.description}
                </p>
                
                <ul className="space-y-1">
                  {tool.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-xs text-gray-500">
                      <Icon icon="solar:check-circle-bold-duotone" className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="pt-2">
                  <Link href={toolUrlMap[tool.id] || `/tools/${tool.id}`}>
                <Button
                  size="sm"
                      className={`w-full ${
                        tool.isPro 
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white' 
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      } rounded-lg font-medium transition-all duration-300`}
                    >
                      {tool.isPro ? 'Try Pro' : 'Use Free'}
                      <Icon icon="solar:arrow-right-bold-duotone" className="h-4 w-4 ml-2" />
                </Button>
                  </Link>
                    </div>
                    </div>

              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-50/50 to-green-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                  </div>
                ))}
              </div>

        <div className="relative -mx-4 sm:-mx-6 lg:-mx-8 mt-16">
          <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0%,transparent_70%)]"></div>
            </div>
            <div className="absolute inset-0 opacity-20">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15)_0%,transparent_50%)]"></div>
            </div>
            <div className="absolute inset-0 opacity-15">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.1)_0%,transparent_50%)]"></div>
            </div>
            
            <div className="relative px-4 sm:px-6 lg:px-8 py-16">
              <div className="max-w-2xl mx-auto text-center">
                <h3 className="text-2xl font-bold text-white mb-4">
                  Ready to Get Started?
                </h3>
                <p className="text-lg text-blue-100 mb-8">
                  Choose any tool above to start processing your images instantly. 
                  No signup required for free tools!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/image-resizer">
                    <Button size="lg" className="bg-white hover:bg-gray-50 text-blue-600 px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5">
                      <Icon icon="solar:play-bold-duotone" className="h-5 w-5 mr-2" />
                      Start with Resize Tool
                    </Button>
                  </Link>
                  <Link href="/tools">
                    <Button size="lg" className="bg-white hover:bg-gray-50 text-blue-600 px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5">
                      <Icon icon="solar:tools-bold-duotone" className="h-5 w-5 mr-2" />
                      View All Tools
                    </Button>
                  </Link>
                  <Link href="/pricing">
                    <Button size="lg" className="bg-white hover:bg-gray-50 text-blue-600 px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5">
                      <Icon icon="solar:star-bold-duotone" className="h-5 w-5 mr-2" />
                      View Pro Features
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
              </div>
      </div>
    </section>
  );
}
