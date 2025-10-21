'use client';

import React from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { SocialPreset } from '@/lib/image-processing/social-presets-data';

interface MobilePresetItemProps {
  preset: SocialPreset;
  previewImage: string | null;
  isSelected: boolean;
  onToggle: (presetId: string) => void;
  canSelect: boolean;
  isPro: boolean;
  isFreeLimitReached: boolean;
}

export function MobilePresetItem({ 
  preset, 
  previewImage, 
  isSelected, 
  onToggle, 
  canSelect, 
  isPro, 
  isFreeLimitReached 
}: MobilePresetItemProps) {
  const handleClick = () => {
    if (canSelect || preset.isPro) {
      onToggle(preset.id);
    }
  };

  const isDisabled = !canSelect && !preset.isPro;
  const isLocked = preset.isPro && !isPro;

  return (
    <div 
      className={`
        flex items-center gap-4 p-4 rounded-lg border transition-all duration-200
        ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-sm'}
        ${isLocked ? 'bg-gray-50' : ''}
      `}
      onClick={handleClick}
    >
      {/* Preview Thumbnail */}
      <div className="flex-shrink-0">
        <div 
          className={`
            w-16 h-16 rounded-lg overflow-hidden border
            ${isSelected ? 'border-blue-300' : 'border-gray-200'}
            ${isLocked ? 'bg-gray-200' : 'bg-gray-100'}
          `}
        >
          {previewImage && !isLocked ? (
            <img
              src={previewImage}
              alt={preset.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              {isLocked ? (
                <Icon icon="solar:lock-bold-duotone" className="h-6 w-6 text-gray-400" />
              ) : (
                <Icon icon="solar:gallery-bold-duotone" className="h-6 w-6 text-gray-400" />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900 truncate">{preset.name}</h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-gray-500">{preset.width} × {preset.height}</span>
              <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                {preset.aspectRatio}
              </span>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="flex items-center gap-2">
            {isLocked && (
              <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 rounded-full">
                <Icon icon="solar:lock-bold-duotone" className="h-3 w-3 text-orange-600" />
                <span className="text-xs text-orange-600 font-medium">Pro</span>
              </div>
            )}
            {isSelected && !isLocked && (
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <Icon icon="solar:check-bold" className="h-4 w-4 text-white" />
              </div>
            )}
            {!isSelected && !isLocked && canSelect && (
              <div className="w-6 h-6 border-2 border-gray-300 rounded-full hover:border-blue-400" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface MobilePlatformSectionProps {
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
  isPro: boolean;
  canSelectMoreFree: boolean;
  freeConversionsUsed: number;
  maxFreeConversions: number;
}

export function MobilePlatformSection({
  platform,
  previewImage,
  selectedPresets,
  onPresetToggle,
  onDownloadAll,
  isPro,
  canSelectMoreFree,
  freeConversionsUsed,
  maxFreeConversions
}: MobilePlatformSectionProps) {
  const platformPresets = platform.presets;
  const selectedCount = platformPresets.filter(preset => selectedPresets.includes(preset.id)).length;
  const hasSelectedPresets = selectedCount > 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      {/* Collapsible Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 flex items-center justify-center">
              <img 
                src={platform.icon} 
                alt={`${platform.name} icon`}
                className="h-8 w-8 object-contain"
              />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{platform.name}</h3>
              <p className="text-xs text-gray-500">{platformPresets.length} presets</p>
            </div>
          </div>
          
          {hasSelectedPresets && (
            <Button
              onClick={() => onDownloadAll(platform.id)}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Icon icon="solar:download-bold-duotone" className="h-4 w-4 mr-1" />
              {selectedCount}
            </Button>
          )}
        </div>
      </div>

      {/* Presets List */}
      <div className="p-4 space-y-3">
        {platformPresets.map((preset) => (
          <MobilePresetItem
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
    </div>
  );
}
