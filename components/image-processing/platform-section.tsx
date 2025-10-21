'use client';

import React from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { VisualPresetCard } from './visual-preset-card';
import { PlatformCategory, SocialPreset } from '@/lib/image-processing/social-presets-data';

interface PlatformSectionProps {
  platform: PlatformCategory;
  previewImage: string | null;
  selectedPresets: string[];
  onPresetToggle: (presetId: string) => void;
  onDownloadAll: (platformId: string) => void;
  onDownloadPreset: (presetId: string) => void;
  isPro: boolean;
  freeConversionsUsed: number;
  maxFreeConversions: number;
}

export function PlatformSection({
  platform,
  previewImage,
  selectedPresets,
  onPresetToggle,
  onDownloadAll,
  onDownloadPreset,
  isPro,
  freeConversionsUsed,
  maxFreeConversions
}: PlatformSectionProps) {
  const freePresets = platform.presets.filter(p => !p.isPro);
  const proPresets = platform.presets.filter(p => p.isPro);
  
  // Check if user can select more presets
  const canSelectMore = isPro || freeConversionsUsed < maxFreeConversions;
  
  // Get platform icon
  const getPlatformIcon = (platformId: string) => {
    const icons: Record<string, string> = {
      facebook: 'solar:facebook-bold-duotone',
      instagram: 'solar:instagram-bold-duotone',
      twitter: 'solar:twitter-bold-duotone',
      youtube: 'solar:youtube-bold-duotone',
      pinterest: 'solar:pinterest-bold-duotone',
      linkedin: 'solar:linkedin-bold-duotone',
      'google-display': 'solar:google-bold-duotone',
      'email-blog': 'solar:mail-bold-duotone'
    };
    return icons[platformId] || 'solar:layers-bold-duotone';
  };

  const getPlatformColor = (platformId: string) => {
    const colors: Record<string, string> = {
      facebook: 'text-blue-600',
      instagram: 'text-pink-600',
      twitter: 'text-blue-400',
      youtube: 'text-red-600',
      pinterest: 'text-red-500',
      linkedin: 'text-blue-700',
      'google-display': 'text-green-600',
      'email-blog': 'text-gray-600'
    };
    return colors[platformId] || 'text-gray-600';
  };

  return (
    <div className="space-y-4">
      {/* Platform Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Icon 
            icon={getPlatformIcon(platform.id)} 
            className={`h-6 w-6 ${getPlatformColor(platform.id)}`} 
          />
          <div>
            <h4 className="text-lg font-semibold text-gray-900">{platform.name}</h4>
            <p className="text-sm text-gray-600">{platform.description}</p>
          </div>
        </div>
        <Button
          onClick={() => onDownloadAll(platform.id)}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
        >
          <Icon icon="solar:download-bold-duotone" className="h-4 w-4" />
          Download all
        </Button>
      </div>

      {/* Presets Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {/* Free Presets */}
        {freePresets.map((preset) => (
          <VisualPresetCard
            key={preset.id}
            preset={preset}
            previewImage={previewImage}
            isSelected={selectedPresets.includes(preset.id)}
            onToggle={onPresetToggle}
            onDownload={onDownloadPreset}
            canSelect={canSelectMore}
            isPro={isPro}
          />
        ))}
        
        {/* Pro Presets */}
        {proPresets.map((preset) => (
          <VisualPresetCard
            key={preset.id}
            preset={preset}
            previewImage={previewImage}
            isSelected={selectedPresets.includes(preset.id)}
            onToggle={onPresetToggle}
            onDownload={onDownloadPreset}
            canSelect={canSelectMore}
            isPro={isPro}
          />
        ))}
      </div>

      {/* Free Tier Limit Warning */}
      {!isPro && freeConversionsUsed >= maxFreeConversions && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon icon="solar:crown-bold-duotone" className="h-5 w-5 text-yellow-600" />
            <span className="font-semibold text-yellow-800">Free Tier Limit Reached</span>
          </div>
          <p className="text-sm text-yellow-700 mb-3">
            You've used all {maxFreeConversions} free conversions. Upgrade to Pro for unlimited conversions and access to all presets!
          </p>
          <Button className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white">
            <Icon icon="solar:crown-bold-duotone" className="h-4 w-4 mr-2" />
            Upgrade to Pro
          </Button>
        </div>
      )}
    </div>
  );
}
