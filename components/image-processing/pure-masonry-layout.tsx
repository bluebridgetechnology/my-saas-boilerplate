'use client';

import React from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { SocialPreset } from '@/lib/image-processing/social-presets-data';

interface PureMasonryCardProps {
  preset: SocialPreset;
  previewImage: string | null;
  isSelected: boolean;
  onToggle: (presetId: string) => void;
  canSelect: boolean;
  isPro: boolean;
  isFreeLimitReached: boolean;
}

export function PureMasonryCard({ 
  preset, 
  previewImage, 
  isSelected, 
  onToggle, 
  canSelect, 
  isPro, 
  isFreeLimitReached 
}: PureMasonryCardProps) {
  const handleClick = () => {
    if (canSelect || preset.isPro) {
      onToggle(preset.id);
    }
  };

  const isDisabled = !canSelect && !preset.isPro;
  const isLocked = preset.isPro && !isPro;

  // Calculate scaled dimensions to show true proportions
  const aspectRatio = preset.width / preset.height;
  
  // Dynamic scaling based on aspect ratio for better representation
  let cardWidth, cardHeight;
  
  if (aspectRatio > 3) {
    // Very wide formats (banners, leaderboards) - use wider cards
    cardWidth = 280;
    cardHeight = Math.round(cardWidth / aspectRatio);
  } else if (aspectRatio > 2) {
    // Wide formats (YouTube thumbnails, covers) - medium wide cards
    cardWidth = 240;
    cardHeight = Math.round(cardWidth / aspectRatio);
  } else if (aspectRatio < 0.7) {
    // Tall formats (Stories, Pinterest pins) - use taller cards
    cardWidth = 160;
    cardHeight = Math.round(cardWidth / aspectRatio);
  } else {
    // Square-ish formats - standard size
    cardWidth = 200;
    cardHeight = Math.round(cardWidth / aspectRatio);
  }
  
  // Ensure reasonable bounds
  const minHeight = 60;
  const maxHeight = 400;
  const minWidth = 120;
  const maxWidth = 320;
  
  cardWidth = Math.max(minWidth, Math.min(maxWidth, cardWidth));
  const finalHeight = Math.max(minHeight, Math.min(maxHeight, cardHeight));

  return (
    <div 
      className={`
        relative group cursor-pointer transition-all duration-200 w-full
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
      style={{ 
        maxWidth: `${cardWidth}px`
      }}
    >
      {/* Card Labels - Outside the preset card */}
      <div className="mb-2 px-1">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-gray-900 truncate">{preset.name}</h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-500">{preset.width} × {preset.height}</span>
              <span className="text-xs px-2 py-0.5 bg-gray-100 rounded text-gray-600">
                {preset.aspectRatio}
              </span>
            </div>
          </div>
          
          {/* Clean status - no overwhelming badges */}
          <div className="flex items-center gap-2 ml-2">
            {isLocked && (
              <span className="text-xs text-orange-600 font-medium">Pro</span>
            )}
          </div>
        </div>
      </div>

      {/* Main Preview Container - Clean preset card */}
      <div 
        className={`
          relative rounded-lg overflow-hidden border-2 transition-all duration-200 bg-white shadow-sm mx-auto
          ${isSelected ? 'border-blue-500 shadow-lg ring-2 ring-blue-500 ring-offset-2' : 'border-gray-200 hover:border-gray-300 hover:shadow-md'}
          ${isLocked ? 'bg-gray-50 border-gray-300' : ''}
        `}
        style={{ 
          width: '100%',
          height: `${finalHeight}px`
        }}
        onClick={handleClick}
      >
        {/* Always show image preview, regardless of Pro status */}
        {previewImage ? (
          <img
            src={previewImage}
            alt={preset.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
            <div className="text-center">
              <Icon icon="solar:gallery-bold-duotone" className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <div className="text-xs text-gray-400 font-medium">Preview</div>
            </div>
          </div>
        )}
        
        {/* Subtle lock overlay for Pro Features - only shows lock icon */}
        {isLocked && (
          <div className="absolute top-2 left-2">
            <div className="bg-black bg-opacity-60 rounded-full p-1.5">
              <Icon icon="solar:lock-bold-duotone" className="h-3 w-3 text-white" />
            </div>
          </div>
        )}
        
        {/* No overlay - clean image display */}

        {/* Selection indicator in corner */}
        <div className="absolute top-2 right-2">
          {isSelected && !isLocked && (
            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
              <Icon icon="solar:check-bold" className="h-3 w-3 text-white" />
            </div>
          )}
        </div>
      </div>

      {/* Simple Selection Controls - Outside the card */}
      <div className="mt-3 px-1">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={handleClick}
            disabled={isLocked || (isDisabled && !isSelected)}
            className="form-checkbox h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 disabled:opacity-50"
          />
          <span className="text-xs text-gray-600">
            {isLocked ? 'Pro feature' : isSelected ? 'Selected' : 'Select'}
          </span>
        </div>
      </div>
    </div>
  );
}

interface PureMasonryPlatformSectionProps {
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

export function PureMasonryPlatformSection({
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
}: PureMasonryPlatformSectionProps) {
  const platformPresets = platform.presets;
  const selectedCount = platformPresets.filter(preset => selectedPresets.includes(preset.id)).length;
  const hasSelectedPresets = selectedCount > 0;
  const freePresets = platformPresets.filter(p => !p.isPro);
  const proPresets = platformPresets.filter(p => p.isPro);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Platform Header */}
      <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 flex items-center justify-center">
              <img 
                src={platform.icon} 
                alt={`${platform.name} icon`}
                className="h-12 w-12 object-contain"
              />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{platform.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{platform.description}</p>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {freePresets.length} free • {proPresets.length} pro
                </span>
                {selectedCount > 0 && (
                  <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-full">
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
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all"
            >
              <Icon icon="solar:download-bold-duotone" className="h-4 w-4 mr-2" />
              Download All ({selectedCount})
            </Button>
          )}
        </div>
      </div>

      {/* Grid Layout - Prevents Overlapping */}
      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 items-start">
          {platformPresets.map((preset) => (
            <div key={preset.id} className="flex justify-center mb-4">
              <PureMasonryCard
                preset={preset}
                previewImage={previewImage}
                isSelected={selectedPresets.includes(preset.id)}
                onToggle={onPresetToggle}
                canSelect={canSelectMoreFree || isPro}
                isPro={isPro}
                isFreeLimitReached={!isPro && freeConversionsUsed >= maxFreeConversions}
              />
            </div>
          ))}
        </div>

        {/* Visual Size Comparison Note */}
        <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <Icon icon="solar:eye-bold-duotone" className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800">True Proportional Preview</p>
              <p className="text-xs text-blue-600 mt-1">
                Each preset shows its actual aspect ratio and relative size. Notice how Instagram Stories are tall, 
                YouTube thumbnails are wide, and profile images are square - just like in real life!
              </p>
            </div>
          </div>
        </div>

        {/* Free Tier Limit Warning */}
        {!isPro && freeConversionsUsed >= maxFreeConversions && (
          <div className="mt-4 p-4 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg">
            <div className="flex items-center gap-3">
              <Icon icon="solar:shield-warning-bold-duotone" className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-orange-800">Free limit reached</p>
                <p className="text-xs text-orange-600">Upgrade to Pro for unlimited conversions and all presets</p>
              </div>
              <Button size="sm" className="ml-auto bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white shadow-lg">
                Upgrade Now
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
