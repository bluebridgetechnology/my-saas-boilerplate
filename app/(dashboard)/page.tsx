'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { customerPortalAction } from '@/lib/payments/actions';
import { User } from '@/lib/supabase/database';
import useSWR from 'swr';
import { Suspense } from 'react';
import { 
  Loader2, 
  User as UserIcon, 
  CreditCard, 
  Image as ImageIcon,
  Zap,
  Crown,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle,
  Star
} from 'lucide-react';
import { Icon } from '@iconify/react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const allTools = [
  // Free Tools
  {
    id: 'image-resizer',
    name: 'Image Resizer',
    description: 'Resize images to any dimensions with precision',
    icon: 'solar:minimize-square-3-line-duotone',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    href: '/image-resizer',
    isPro: false,
    usage: 'Most Popular'
  },
  {
    id: 'image-cropper',
    name: 'Image Cropper',
    description: 'Crop images with precision and smart suggestions',
    icon: 'solar:crop-bold-duotone',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    href: '/image-cropper',
    isPro: false,
    usage: 'High Usage'
  },
  {
    id: 'image-compressor',
    name: 'Image Compressor',
    description: 'Reduce file size without losing visual quality',
    icon: 'solar:minimize-square-2-line-duotone',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    href: '/image-compressor',
    isPro: false,
    usage: 'Fast Processing'
  },
  {
    id: 'image-converter',
    name: 'Image Converter',
    description: 'Convert between different formats seamlessly',
    icon: 'solar:refresh-bold-duotone',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    href: '/image-converter',
    isPro: false,
    usage: 'Batch Ready'
  },
  {
    id: 'social-media-resizer',
    name: 'Social Media Resizer',
    description: 'Resize images for social media platforms',
    icon: 'solar:camera-bold-duotone',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    href: '/social-media-resizer',
    isPro: false,
    usage: 'Social Ready'
  },
  {
    id: 'social-presets',
    name: 'Social Presets',
    description: 'Pre-configured sizes for all social platforms',
    icon: 'solar:smartphone-bold-duotone',
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
    href: '/social-presets',
    isPro: false,
    usage: 'Quick Setup'
  },
  // Pro Tools
  {
    id: 'background-removal',
    name: 'Background Removal',
    description: 'AI-powered background removal with edge refinement',
    icon: 'solar:magic-stick-bold-duotone',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    href: '/background-removal',
    isPro: true,
    usage: 'AI Powered'
  },
  {
    id: 'image-watermark',
    name: 'Image Watermark',
    description: 'Add professional watermarks and branding',
    icon: 'solar:waterdrops-bold-duotone',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    href: '/image-watermark',
    isPro: true,
    usage: 'Professional'
  },
  {
    id: 'image-editor',
    name: 'Image Editor',
    description: 'Professional image editing with real-time preview',
    icon: 'solar:palette-bold-duotone',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    href: '/image-editor',
    isPro: true,
    usage: 'Advanced'
  },
  {
    id: 'advanced-crop',
    name: 'Advanced Crop',
    description: 'Advanced cropping with smart suggestions',
    icon: 'solar:crop-minimalistic-bold-duotone',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    href: '/advanced-crop',
    isPro: true,
    usage: 'Smart Crop'
  },
  {
    id: 'filters',
    name: 'Filters & Effects',
    description: 'Professional filters and visual effects',
    icon: 'solar:magic-stick-3-bold-duotone',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    href: '/filters',
    isPro: true,
    usage: 'Creative'
  },
  {
    id: 'text-overlay',
    name: 'Text Overlay',
    description: 'Add text and typography to images',
    icon: 'solar:text-bold-duotone',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    href: '/text-overlay',
    isPro: true,
    usage: 'Typography'
  },
  {
    id: 'color-picker',
    name: 'Color Picker',
    description: 'Advanced color picking and sampling',
    icon: 'solar:palette-bold-duotone',
    color: 'text-violet-600',
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-200',
    href: '/color-picker',
    isPro: true,
    usage: 'Precision'
  },
  {
    id: 'meme-generator',
    name: 'Meme Generator',
    description: 'Create memes with text overlays',
    icon: 'solar:emoji-funny-bold-duotone',
    color: 'text-lime-600',
    bgColor: 'bg-lime-50',
    borderColor: 'border-lime-200',
    href: '/meme-generator',
    isPro: true,
    usage: 'Creative'
  },
];

const batchTools = [
  {
    id: 'batch-processor',
    name: 'Batch Processor',
    description: 'Process multiple images simultaneously with queue management',
    icon: 'solar:layers-bold-duotone',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    href: '/batch-processor',
    isPro: true,
    usage: 'Pro Feature',
    features: ['Queue Management', 'Priority Processing', '100 Images Max']
  },
  {
    id: 'project-manager',
    name: 'Project Manager',
    description: 'Save and organize your image processing projects',
    icon: 'solar:folder-open-bold-duotone',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    href: '/project-manager',
    isPro: true,
    usage: 'Pro Feature',
    features: ['Project Templates', 'Settings Presets', 'File Organization']
  },
  {
    id: 'zip-download',
    name: 'ZIP Download Manager',
    description: 'Download processed images as organized ZIP files',
    icon: 'solar:download-bold-duotone',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    href: '/zip-download',
    isPro: true,
    usage: 'Pro Feature',
    features: ['Custom Naming', 'Folder Structure', 'Compression Options']
  },
];

function WelcomeSection() {
  const { data: userData } = useSWR<User>('/api/user', fetcher);

  const getUserDisplayName = (user: User) => {
    return user.name || user.email || 'Unknown User';
  };

  if (!userData) {
    return (
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 rounded-2xl p-8 mb-8">
        <div className="animate-pulse">
          <div className="h-8 bg-white/20 rounded mb-4 w-64"></div>
          <div className="h-4 bg-white/20 rounded w-96"></div>
        </div>
      </div>
    );
  }

  const isPro = userData.subscription_status === 'active' || userData.subscription_status === 'trialing';

  return (
    <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 rounded-2xl p-8 mb-8 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0%,transparent_70%)]"></div>
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {getUserDisplayName(userData).split(' ')[0]}! 👋
            </h1>
            <p className="text-blue-100 text-lg">
              Ready to process some images? You have access to {isPro ? 'all Pro tools' : '4+ free tools'}.
            </p>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <Avatar className="h-16 w-16 border-2 border-white/20">
              <AvatarFallback className="text-lg font-semibold bg-white/20 text-white">
                {getUserDisplayName(userData)
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
        
        <div className="mt-6 flex flex-wrap gap-4">
          <div className="flex items-center bg-white/10 rounded-lg px-4 py-2">
            <Clock className="h-5 w-5 mr-2" />
            <span className="text-sm">Member since {new Date(userData.created_at).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center bg-white/10 rounded-lg px-4 py-2">
            <TrendingUp className="h-5 w-5 mr-2" />
            <span className="text-sm">{isPro ? 'Pro Plan Active' : 'Free Plan'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickStats() {
  const { data: userData } = useSWR<User>('/api/user', fetcher);

  const freeTools = allTools.filter(t => !t.isPro);
  const proTools = allTools.filter(t => t.isPro);
  const isPro = userData?.subscription_status === 'active' || userData?.subscription_status === 'trialing';

  const stats = [
    {
      title: 'Current Plan',
      value: userData?.plan_name || 'Free',
      icon: Crown,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      title: 'Available Tools',
      value: `${freeTools.length}${isPro ? ` + ${proTools.length}` : ''}`,
      icon: Zap,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      title: 'Pro Features',
      value: `${proTools.length}`,
      icon: Sparkles,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {stats.map((stat, index) => (
        <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`h-12 w-12 ${stat.bgColor} ${stat.borderColor} border rounded-xl flex items-center justify-center`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function SubscriptionCard() {
  const { data: userData } = useSWR<User>('/api/user', fetcher);

  if (!userData) {
    return (
      <Card className="mb-8 border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Subscription
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 w-32 bg-gray-200 rounded"></div>
            <div className="h-3 w-48 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isPro = userData.subscription_status === 'active' || userData.subscription_status === 'trialing';

  return (
    <Card className="mb-8 border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Subscription Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div className="mb-4 sm:mb-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-lg">
                  {userData?.plan_name || 'Free Plan'}
                </h3>
                {isPro && (
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                    <Crown className="h-3 w-3" />
                    Pro
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-600">
                {userData?.subscription_status === 'active'
                  ? 'Billed monthly • Next billing date: ' + new Date().toLocaleDateString()
                  : userData?.subscription_status === 'trialing'
                  ? 'Trial period • Upgrade anytime'
                  : 'No active subscription • Upgrade to unlock Pro features'}
              </p>
            </div>
            <div className="flex gap-2">
              {userData?.stripe_customer_id && (
                <form action={customerPortalAction}>
                  <Button type="submit" variant="outline" size="sm">
                    Manage Billing
                  </Button>
                </form>
              )}
              {!isPro && (
                <Link href="/pricing">
                  <Button size="sm" className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                    <Crown className="h-4 w-4 mr-2" />
                    Upgrade to Pro
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ToolsGrid() {
  const { data: userData } = useSWR<User>('/api/user', fetcher);
  
  const freeTools = allTools.filter(t => !t.isPro);
  const proTools = allTools.filter(t => t.isPro);
  const isPro = userData?.subscription_status === 'active' || userData?.subscription_status === 'trialing';

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Image Processing Tools</h2>
          <p className="text-gray-600">Choose from our comprehensive suite of professional image tools</p>
        </div>
        <Link href="/tools">
          <Button variant="outline" size="sm" className="shadow-sm hover:shadow-md transition-shadow duration-300">
            View All Tools
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </div>
      
      {/* Free Tools Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Free Tools</h3>
          <div className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
            {freeTools.length} Tools Available
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {freeTools.map((tool) => (
            <Link key={tool.id} href={tool.href}>
              <Card className="group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${tool.bgColor} ${tool.borderColor} border group-hover:scale-110 transition-transform duration-300`}>
                      <Icon icon={tool.icon} className={`h-6 w-6 ${tool.color}`} />
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {tool.usage}
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-300 mb-2">
                    {tool.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                    {tool.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium flex items-center gap-1 text-green-600">
                      <CheckCircle className="h-3 w-3" />
                      Free Tool
                    </span>
                    <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors duration-300" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Pro Tools Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Pro Tools</h3>
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-bold px-3 py-1 rounded-full flex items-center gap-1">
              <Crown className="h-3 w-3" />
              Pro Features
            </div>
            <div className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
              {proTools.length} Advanced Tools
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {proTools.map((tool) => (
            <Link key={tool.id} href={tool.href}>
              <Card className={`group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer border-0 shadow-sm ${!isPro ? 'opacity-75' : ''}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${tool.bgColor} ${tool.borderColor} border group-hover:scale-110 transition-transform duration-300`}>
                      <Icon icon={tool.icon} className={`h-6 w-6 ${tool.color}`} />
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                        <Crown className="h-3 w-3" />
                        Pro
                      </div>
                      <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {tool.usage}
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-300 mb-2">
                    {tool.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                    {tool.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium flex items-center gap-1 text-blue-600">
                      <Crown className="h-3 w-3" />
                      {isPro ? 'Pro Feature' : 'Upgrade Required'}
                    </span>
                    <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors duration-300" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
        {!isPro && (
          <div className="text-center mt-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Unlock All Pro Tools</h4>
            <p className="text-gray-600 mb-4">Get access to {proTools.length} advanced tools with a Pro subscription</p>
            <Link href="/pricing">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                <Crown className="h-4 w-4 mr-2" />
                Upgrade to Pro
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function BatchProcessingSection() {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Batch Processing & Management</h2>
          <p className="text-gray-600">Professional tools for handling multiple images efficiently</p>
        </div>
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-bold px-3 py-1 rounded-full flex items-center gap-1">
          <Crown className="h-4 w-4" />
          Pro Features
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {batchTools.map((tool) => (
          <Link key={tool.id} href={tool.href}>
            <Card className="group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${tool.bgColor} ${tool.borderColor} border group-hover:scale-110 transition-transform duration-300`}>
                    <Icon icon={tool.icon} className={`h-6 w-6 ${tool.color}`} />
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                      <Crown className="h-3 w-3" />
                      Pro
                    </div>
                    <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {tool.usage}
                    </div>
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-300 mb-2">
                  {tool.name}
                </h3>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                  {tool.description}
                </p>
                
                {/* Features */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {tool.features.map((feature, index) => (
                      <span key={index} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium flex items-center gap-1 text-blue-600">
                    <Crown className="h-3 w-3" />
                    Pro Feature
                  </span>
                  <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors duration-300" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <section className="flex-1 p-4 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <Suspense fallback={<div className="animate-pulse h-48 bg-gray-200 rounded-2xl mb-8"></div>}>
          <WelcomeSection />
        </Suspense>

        <Suspense fallback={<div className="animate-pulse h-32 bg-gray-200 rounded-lg mb-8"></div>}>
          <QuickStats />
        </Suspense>

        <Suspense fallback={<div className="animate-pulse h-32 bg-gray-200 rounded-lg mb-8"></div>}>
          <SubscriptionCard />
        </Suspense>

        <ToolsGrid />
        <BatchProcessingSection />
      </div>
    </section>
  );
}
