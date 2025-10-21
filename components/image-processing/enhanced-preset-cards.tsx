'use client';

import React from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SocialPreset } from '@/lib/image-processing/social-presets-data';

interface EnhancedPresetCardProps {
  preset: SocialPreset;
  previewImage: string | null;
  isSelected: boolean;
  onToggle: (presetId: string) => void;
  canSelect: boolean;
  isPro: boolean;
  isFreeLimitReached: boolean;
}

export function EnhancedPresetCard({ 
  preset, 
  previewImage, 
  isSelected, 
  onToggle, 
  canSelect, 
  isPro, 
  isFreeLimitReached 
}: EnhancedPresetCardProps) {
  const handleClick = () => {
    if (canSelect || preset.isPro) {
      onToggle(preset.id);
    }
  };

  const isDisabled = !canSelect && !preset.isPro;
  const isLocked = preset.isPro && !isPro;

  // Calculate aspect ratio for the preview container
  const aspectRatio = preset.width / preset.height;
  const isWide = aspectRatio > 1.5;
  const isTall = aspectRatio < 0.7;
  const isSquare = aspectRatio >= 0.7 && aspectRatio <= 1.3;

  return (
    <Card 
      className={`
        relative cursor-pointer transition-all duration-200 hover:shadow-lg
        ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2 bg-blue-50' : 'hover:shadow-md'}
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${isLocked ? 'bg-gray-50' : ''}
      `}
      onClick={handleClick}
    >
      <div className="p-4">
        {/* Header with name and dimensions */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="font-medium text-gray-900 text-sm">{preset.name}</h4>
            <p className="text-xs text-gray-500">{preset.width} × {preset.height}</p>
          </div>
          
          {/* Selection indicator */}
          <div className="flex items-center gap-2">
            {isLocked && (
              <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 rounded-full">
                <Icon icon="solar:lock-bold-duotone" className="h-3 w-3 text-orange-600" />
                <span className="text-xs text-orange-600 font-medium">Pro</span>
              </div>
            )}
            {isSelected && !isLocked && (
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                <Icon icon="solar:check-bold" className="h-3 w-3 text-white" />
              </div>
            )}
            {!isSelected && !isLocked && canSelect && (
              <div className="w-5 h-5 border-2 border-gray-300 rounded-full hover:border-blue-400" />
            )}
          </div>
        </div>

        {/* Visual Preview Container */}
        <div className="relative mb-3">
          <div 
            className={`
              bg-gray-100 border border-gray-200 rounded-lg overflow-hidden relative
              ${isSelected ? 'border-blue-300 bg-blue-50' : ''}
              ${isLocked ? 'bg-gray-200 border-gray-300' : ''}
              ${isWide ? 'h-16' : isTall ? 'h-24' : 'h-20'}
            `}
          >
            {/* Image Preview */}
            {previewImage && !isLocked && (
              <img
                src={previewImage}
                alt={preset.name}
                className="w-full h-full object-cover"
              />
            )}
            
            {/* Placeholder when no image */}
            {!previewImage && !isLocked && (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <Icon icon="solar:gallery-bold-duotone" className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                  <span className="text-xs text-gray-500">Preview</span>
                </div>
              </div>
            )}
            
            {/* Lock Overlay */}
            {isLocked && (
              <div className="absolute inset-0 bg-gray-800 bg-opacity-40 flex items-center justify-center">
                <div className="text-center">
                  <Icon icon="solar:lock-bold-duotone" className="h-5 w-5 text-white mx-auto mb-1" />
                  <span className="text-xs text-white font-medium">Upgrade to Pro</span>
                </div>
              </div>
            )}
            
            {/* Selection Overlay */}
            {isSelected && !isLocked && (
              <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center">
                <Icon icon="solar:check-circle-bold-duotone" className="h-8 w-8 text-blue-600" />
              </div>
            )}
          </div>
          
          {/* Aspect Ratio Indicator */}
          <div className="absolute top-2 left-2 px-2 py-1 bg-black bg-opacity-60 rounded text-xs text-white font-medium">
            {preset.aspectRatio}
          </div>
        </div>

        {/* Download Button (when processed) */}
        {isSelected && !isLocked && (
          <Button 
            size="sm" 
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            onClick={(e) => {
              e.stopPropagation();
              // Handle individual download
            }}
          >
            <Icon icon="solar:download-bold-duotone" className="h-4 w-4 mr-1" />
            Download
          </Button>
        )}
      </div>
    </Card>
  );
}

interface EnhancedPlatformSectionProps {
  platform: {
    id: string;
    name: string;
    icon: string;
    color: string;
    description: string;
    presets: SocialPreset[];
  };
  previewImage: string | null;
  selectedPresets: string[];
  onPresetToggle: (presetId: string) => void;
  onDownloadAll: (platformId: string) => void;
  onDownloadPreset: (presetId: string) => void;
  isPro: boolean;
  canSelectMoreFree: boolean;
  freeConversionsUsed: number;
  maxFreeConversions: number;
}

export function EnhancedPlatformSection({
  platform,
  previewImage,
  selectedPresets,
  onPresetToggle,
  onDownloadAll,
  onDownloadPreset,
  isPro,
  canSelectMoreFree,
  freeConversionsUsed,
  maxFreeConversions
}: EnhancedPlatformSectionProps) {
  const platformPresets = platform.presets;
  const selectedCount = platformPresets.filter(preset => selectedPresets.includes(preset.id)).length;
  const hasSelectedPresets = selectedCount > 0;
  const freePresets = platformPresets.filter(p => !p.isPro);
  const proPresets = platformPresets.filter(p => p.isPro);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      {/* Platform Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${platform.color}`}>
              <Icon icon={platform.icon} className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{platform.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{platform.description}</p>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-xs text-gray-500">
                  {freePresets.length} free • {proPresets.length} pro
                </span>
                {selectedCount > 0 && (
                  <span className="text-xs text-blue-600 font-medium">
                    {selectedCount} selected
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* Download All Button */}
          {hasSelectedPresets && (
            <Button
              onClick={() => onDownloadAll(platform.id)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Icon icon="solar:download-bold-duotone" className="h-4 w-4 mr-2" />
              Download All ({selectedCount})
            </Button>
          )}
        </div>
      </div>

      {/* Presets Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {platformPresets.map((preset) => (
            <EnhancedPresetCard
              key={preset.id}
              preset={preset}
              previewImage={previewImage}
              isSelected={selectedPresets.includes(preset.id)}
              onToggle={onPresetToggle}
              canSelect={canSelectMoreFree || isPro}
              isPro={isPro}
              isFreeLimitReached={!isPro && freeConversionsUsed >= maxFreeConversions}
            />
          ))}
        </div>

        {/* Free Tier Limit Warning */}
        {!isPro && freeConversionsUsed >= maxFreeConversions && (
          <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center gap-3">
              <Icon icon="solar:info-circle-bold-duotone" className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-orange-800">Free limit reached</p>
                <p className="text-xs text-orange-600">Upgrade to Pro for unlimited conversions</p>
              </div>
              <Button size="sm" className="ml-auto bg-orange-600 hover:bg-orange-700 text-white">
                Upgrade
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
