'use client';

import { useState } from 'react';
import { Navigation } from '@/components/layout/navigation';
import { Footer } from '@/components/layout/footer';
import { Icon } from '@iconify/react';
import Link from 'next/link';
import { ProBadge } from '@/components/ui/pro-badge';
import { ProUpgradeModal } from '@/components/ui/pro-upgrade-modal';
import { useRouter } from 'next/navigation';

const tools = [
  {
    id: 'image-resizer',
    name: 'Image Resizer',
    description: 'Resize images to any dimensions while maintaining quality and aspect ratio',
    icon: 'solar:minimize-square-3-line-duotone',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    href: '/image-resizer',
    isPro: false,
    features: ['Custom dimensions', 'Aspect ratio lock', 'Batch processing']
  },
  {
    id: 'image-cropper',
    name: 'Image Cropper',
    description: 'Crop images to perfect composition with precise control over the crop area',
    icon: 'solar:crop-bold-duotone',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    href: '/image-cropper',
    isPro: false,
    features: ['Free-form crop', 'Preset ratios', 'Smart crop']
  },
  {
    id: 'image-compressor',
    name: 'Image Compressor',
    description: 'Reduce file size without losing visual quality. Perfect for web optimization',
    icon: 'solar:minimize-square-2-line-duotone',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    href: '/image-compressor',
    isPro: false,
    features: ['Quality control', 'Size optimization', 'Format conversion']
  },
  {
    id: 'image-converter',
    name: 'Image Converter',
    description: 'Convert images between different formats with quality preservation',
    icon: 'solar:refresh-bold-duotone',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    href: '/image-converter',
    isPro: false,
    features: ['All formats', 'Batch convert', 'Quality settings']
  },
  {
    id: 'social-presets',
    name: 'Social Media Presets',
    description: 'Optimize images for Instagram, YouTube, LinkedIn and other social platforms',
    icon: 'solar:chat-round-like-line-duotone',
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
    href: '/social-presets',
    isPro: false,
    features: ['Platform presets', 'Custom sizes', 'Auto-optimize']
  },
  {
    id: 'meme-generator',
    name: 'Meme Generator',
    description: 'Create hilarious memes with custom text, fonts, and styling options',
    icon: 'solar:text-bold-duotone',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    href: '/meme-generator',
    isPro: false,
    features: ['Text overlay', 'Font selection', 'Meme templates']
  },
  {
    id: 'color-picker',
    name: 'Color Picker',
    description: 'Extract colors from images with precision. Get HEX, RGB, HSL values',
    icon: 'solar:palette-bold-duotone',
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
    href: '/color-picker',
    isPro: false,
    features: ['Click to pick', 'Color palettes', 'Format conversion']
  },
  {
    id: 'image-watermark',
    name: 'Image Watermark',
    description: 'Add text or logo watermarks to protect your images',
    icon: 'solar:waterdrops-bold-duotone',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    href: '/image-watermark',
    isPro: true,
    features: ['Text watermarks', 'Logo overlay', 'Positioning']
  },
  {
    id: 'batch-processor',
    name: 'Batch Processor',
    description: 'Process multiple images simultaneously with advanced options',
    icon: 'solar:layers-bold-duotone',
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
    href: '/batch-processor',
    isPro: true,
    features: ['100+ images', 'ZIP download', 'Progress tracking']
  },
  {
    id: 'background-removal',
    name: 'Background Removal',
    description: 'Remove backgrounds from images using AI-powered technology',
    icon: 'solar:magic-stick-bold-duotone',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    href: '/background-removal',
    isPro: true,
    features: ['AI-powered', 'Edge refinement', 'Batch processing']
  },
  {
    id: 'image-editor',
    name: 'Image Editor',
    description: 'Professional image editing with brightness, contrast, saturation, hue, and filters',
    icon: 'solar:tuning-2-bold-duotone',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    href: '/image-editor',
    isPro: true,
    features: ['Brightness/Contrast', 'Filters', 'Auto-enhance']
  },
  {
    id: 'advanced-crop',
    name: 'Advanced Crop',
    description: 'AI-powered smart cropping with face detection and composition guides',
    icon: 'solar:crop-bold-duotone',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    href: '/advanced-crop',
    isPro: false,
    features: ['Smart crop', 'Face detection', 'Rule of thirds']
  },
  {
    id: 'filters',
    name: 'Filters & Effects',
    description: 'Apply vintage, artistic, and Instagram-style filters to your images',
    icon: 'solar:magic-stick-3-bold-duotone',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    href: '/filters',
    isPro: true,
    features: ['Vintage filters', 'Artistic effects', 'Custom builder']
  },
  {
    id: 'text-overlay',
    name: 'Text Overlay',
    description: 'Add professional text overlays with custom fonts and effects',
    icon: 'solar:text-bold-duotone',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    href: '/text-overlay',
    isPro: false,
    features: ['Custom fonts', 'Text effects', 'Precise positioning']
  },
];

export default function ToolsPage() {
  const [showProModal, setShowProModal] = useState(false);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const router = useRouter();

  const handleToolClick = (e: React.MouseEvent, tool: typeof tools[0]) => {
    if (tool.isPro) {
      e.preventDefault();
      setSelectedTool(tool.name);
      setShowProModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Universal Navigation */}
      <Navigation />

      {/* Pro Upgrade Modal */}
      <ProUpgradeModal
        isOpen={showProModal}
        onClose={() => {
          setShowProModal(false);
          setSelectedTool(null);
        }}
        toolName={selectedTool || undefined}
      />
      
      {/* Header Section */}
      <section className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              All Image Tools
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
              Complete collection of professional image processing tools. Everything you need to resize, optimize, and perfect your images.
            </p>
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="py-20 bg-white">
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

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-16">
            {tools.map((tool, index) => (
              <Link 
                key={tool.id}
                href={tool.href}
                onClick={(e) => handleToolClick(e, tool)}
                className={`group relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 cursor-pointer ${
                  tool.isPro ? 'ring-2 ring-purple-200 bg-gradient-to-br from-purple-50/30 to-pink-50/30' : ''
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Pro/Free Badge */}
                <div className="absolute -top-2 -right-2 z-10">
                  {tool.isPro ? (
                    <ProBadge variant="small" />
                  ) : (
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                      <Icon icon="solar:check-circle-bold-duotone" className="h-3 w-3" />
                      Free
                    </div>
                  )}
                </div>

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
                    <div className={`w-full px-4 py-2 rounded-lg font-medium transition-all duration-300 text-center ${
                      tool.isPro 
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg shadow-purple-500/30' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}>
                      {tool.isPro ? (
                        <>
                          <Icon icon="solar:crown-bold" className="h-4 w-4 mr-1 inline" />
                          Unlock Pro
                        </>
                      ) : (
                        <>
                          Use Free
                          <Icon icon="solar:arrow-right-bold-duotone" className="h-4 w-4 ml-2 inline" />
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-50/50 to-green-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
              </Link>
            ))}
          </div>

          {/* CTA Section */}
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
                      <div className="bg-white hover:bg-gray-50 text-blue-600 px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer">
                        <Icon icon="solar:play-bold-duotone" className="h-5 w-5 mr-2 inline" />
                        Start with Resize Tool
                      </div>
                    </Link>
                    <Link href="/pricing">
                      <div className="bg-white hover:bg-gray-50 text-blue-600 px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer">
                        <Icon icon="solar:star-bold-duotone" className="h-5 w-5 mr-2 inline" />
                        View Pro Features
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
