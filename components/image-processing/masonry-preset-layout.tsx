'use client';

import React from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { SocialPreset } from '@/lib/image-processing/social-presets-data';

interface MasonryPresetCardProps {
  preset: SocialPreset;
  previewImage: string | null;
  isSelected: boolean;
  onToggle: (presetId: string) => void;
  canSelect: boolean;
  isPro: boolean;
  isFreeLimitReached: boolean;
}

export function MasonryPresetCard({ 
  preset, 
  previewImage, 
  isSelected, 
  onToggle, 
  canSelect, 
  isPro, 
  isFreeLimitReached 
}: MasonryPresetCardProps) {
  const handleClick = () => {
    if (canSelect || preset.isPro) {
      onToggle(preset.id);
    }
  };

  const isDisabled = !canSelect && !preset.isPro;
  const isLocked = preset.isPro && !isPro;

  // Calculate scaled dimensions to show true proportions
  const aspectRatio = preset.width / preset.height;
  
  // Base scaling factor to keep cards reasonably sized
  const baseScale = 0.08; // Adjust this to make cards bigger/smaller overall
  const maxWidth = 200;
  const maxHeight = 200;
  const minWidth = 60;
  const minHeight = 40;
  
  // Calculate scaled dimensions
  let scaledWidth = preset.width * baseScale;
  let scaledHeight = preset.height * baseScale;
  
  // Apply constraints while maintaining aspect ratio
  if (scaledWidth > maxWidth) {
    scaledWidth = maxWidth;
    scaledHeight = scaledWidth / aspectRatio;
  }
  if (scaledHeight > maxHeight) {
    scaledHeight = maxHeight;
    scaledWidth = scaledHeight * aspectRatio;
  }
  if (scaledWidth < minWidth) {
    scaledWidth = minWidth;
    scaledHeight = scaledWidth / aspectRatio;
  }
  if (scaledHeight < minHeight) {
    scaledHeight = minHeight;
    scaledWidth = scaledHeight * aspectRatio;
  }

  return (
    <div 
      className={`
        relative group cursor-pointer transition-all duration-200
        ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 hover:z-10'}
        ${isLocked ? 'opacity-75' : ''}
      `}
      onClick={handleClick}
      style={{
        width: `${scaledWidth}px`,
        height: `${scaledHeight + 60}px` // Extra space for labels
      }}
    >
      {/* Main Preview Container - Shows true proportions */}
      <div 
        className={`
          relative rounded-lg overflow-hidden border-2 transition-all duration-200
          ${isSelected ? 'border-blue-500 shadow-lg' : 'border-gray-200 hover:border-gray-300'}
          ${isLocked ? 'bg-gray-200 border-gray-300' : 'bg-gray-50'}
        `}
        style={{
          width: `${scaledWidth}px`,
          height: `${scaledHeight}px`
        }}
      >
        {/* Image Preview */}
        {previewImage && !isLocked && (
          <img
            src={previewImage}
            alt={preset.name}
            className="w-full h-full object-cover"
          />
        )}
        
        {/* Placeholder Pattern */}
        {!previewImage && !isLocked && (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <Icon icon="solar:gallery-bold-duotone" className="h-8 w-8 text-gray-400" />
          </div>
        )}
        
        {/* Lock Overlay for Pro Features */}
        {isLocked && (
          <div className="absolute inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
            <div className="text-center">
              <Icon icon="solar:lock-bold-duotone" className="h-6 w-6 text-white mx-auto mb-1" />
              <span className="text-xs text-white font-medium">Pro</span>
            </div>
          </div>
        )}
        
        {/* Selection Overlay */}
        {isSelected && !isLocked && (
          <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center">
            <Icon icon="solar:check-circle-bold-duotone" className="h-8 w-8 text-blue-600" />
          </div>
        )}

        {/* Aspect Ratio Badge */}
        <div className="absolute top-2 left-2 px-2 py-1 bg-black bg-opacity-70 rounded text-xs text-white font-medium">
          {preset.aspectRatio}
        </div>

        {/* Selection Indicator */}
        <div className="absolute top-2 right-2">
          {isSelected && !isLocked && (
            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
              <Icon icon="solar:check-bold" className="h-3 w-3 text-white" />
            </div>
          )}
          {!isSelected && !isLocked && canSelect && (
            <div className="w-5 h-5 border-2 border-white rounded-full bg-black bg-opacity-20 hover:bg-blue-500 hover:border-blue-500 transition-colors" />
          )}
        </div>
      </div>

      {/* Label Section */}
      <div className="mt-2 text-center">
        <div className="text-sm font-medium text-gray-900 truncate">
          {preset.name}
        </div>
        <div className="text-xs text-gray-500">
          {preset.width} × {preset.height}
        </div>
        {isLocked && (
          <div className="text-xs text-orange-600 font-medium mt-1">
            Pro Only
          </div>
        )}
      </div>

      {/* Hover Download Button */}
      {isSelected && !isLocked && (
        <div className="absolute bottom-0 left-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button 
            size="sm" 
            className="w-full bg-green-600 hover:bg-green-700 text-white text-xs"
            onClick={(e) => {
              e.stopPropagation();
              // Handle individual download
            }}
          >
            <Icon icon="solar:download-bold-duotone" className="h-3 w-3 mr-1" />
            Download
          </Button>
        </div>
      )}
    </div>
  );
}

interface MasonryPlatformSectionProps {
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

export function MasonryPlatformSection({
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
}: MasonryPlatformSectionProps) {
  const platformPresets = platform.presets;
  const selectedCount = platformPresets.filter(preset => selectedPresets.includes(preset.id)).length;
  const hasSelectedPresets = selectedCount > 0;
  const freePresets = platformPresets.filter(p => !p.isPro);
  const proPresets = platformPresets.filter(p => p.isPro);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Platform Header */}
      <div className="p-6 border-b border-gray-100 bg-gray-50">
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

      {/* Masonry Grid - Shows true size relationships */}
      <div className="p-6">
        {/* Grid container with proper spacing */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 items-start justify-items-center">
          {platformPresets.map((preset) => (
            <div key={preset.id} className="flex justify-center">
              <MasonryPresetCard
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
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <Icon icon="solar:info-circle-bold-duotone" className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800">True Size Representation</p>
              <p className="text-xs text-blue-600 mt-1">
                Each preset is shown at its actual proportions, scaled down to fit. 
                This helps you visualize how different each format really is.
              </p>
            </div>
          </div>
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
