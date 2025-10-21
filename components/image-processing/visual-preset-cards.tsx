'use client';

import React from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { SocialPreset } from '@/lib/image-processing/social-presets-data';

interface VisualPresetCardProps {
  preset: SocialPreset;
  previewImage: string | null;
  isSelected: boolean;
  onToggle: (presetId: string) => void;
  canSelect: boolean;
  isPro: boolean;
  isFreeLimitReached: boolean;
}

export function VisualPresetCard({ 
  preset, 
  previewImage, 
  isSelected, 
  onToggle, 
  canSelect, 
  isPro, 
  isFreeLimitReached 
}: VisualPresetCardProps) {
  // Calculate aspect ratio for proper scaling
  const aspectRatio = preset.width / preset.height;
  
  // Base dimensions for consistent sizing
  const baseWidth = 120;
  const baseHeight = Math.round(baseWidth / aspectRatio);
  
  // Ensure minimum height for very wide images
  const minHeight = 40;
  const maxHeight = 200;
  const finalHeight = Math.max(minHeight, Math.min(maxHeight, baseHeight));
  const finalWidth = Math.round(finalHeight * aspectRatio);

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
        relative group cursor-pointer transition-all duration-200
        ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
      `}
      onClick={handleClick}
    >
      {/* Visual Container - Canvas-like appearance */}
      <div 
        className={`
          bg-gray-100 border border-gray-200 rounded-lg overflow-hidden
          ${isSelected ? 'bg-blue-50 border-blue-300' : ''}
          ${isLocked ? 'bg-gray-200 border-gray-300' : ''}
        `}
        style={{
          width: `${finalWidth}px`,
          height: `${finalHeight}px`,
          minWidth: '60px',
          minHeight: '40px'
        }}
      >
        {/* Image Preview */}
        {previewImage && !isLocked && (
          <img
            src={previewImage}
            alt={preset.name}
            className="w-full h-full object-cover"
            style={{ objectFit: 'cover' }}
          />
        )}
        
        {/* Lock Overlay for Pro Features */}
        {isLocked && (
          <div className="absolute inset-0 bg-gray-800 bg-opacity-60 flex items-center justify-center">
            <div className="text-center">
              <Icon icon="solar:lock-bold-duotone" className="h-6 w-6 text-white mx-auto mb-1" />
              <span className="text-xs text-white font-medium">Pro</span>
            </div>
          </div>
        )}
        
        {/* Selection Overlay */}
        {isSelected && !isLocked && (
          <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center">
            <Icon icon="solar:check-circle-bold-duotone" className="h-6 w-6 text-blue-600" />
          </div>
        )}
      </div>

      {/* Preset Info */}
      <div className="mt-2 text-center">
        <div className="text-xs font-medium text-gray-900 truncate">
          {preset.name}
        </div>
        <div className="text-xs text-gray-500">
          {preset.width} × {preset.height}
        </div>
        {isLocked && (
          <div className="text-xs text-orange-600 font-medium">
            Pro Only
          </div>
        )}
      </div>

      {/* Download Icon */}
      {!isLocked && (
        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-white rounded-full p-1 shadow-sm">
            <Icon icon="solar:download-bold-duotone" className="h-3 w-3 text-gray-600" />
          </div>
        </div>
      )}
    </div>
  );
}

interface PlatformSectionProps {
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

export function PlatformSection({
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
}: PlatformSectionProps) {
  const platformPresets = platform.presets;
  const selectedCount = platformPresets.filter(preset => selectedPresets.includes(preset.id)).length;
  const hasSelectedPresets = selectedCount > 0;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Platform Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${platform.color}`}>
            <Icon icon={platform.icon} className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{platform.name}</h3>
            <p className="text-sm text-gray-600">{platform.description}</p>
          </div>
        </div>
        
        {/* Download All Button */}
        {hasSelectedPresets && (
          <Button
            onClick={() => onDownloadAll(platform.id)}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Icon icon="solar:download-bold-duotone" className="h-4 w-4 mr-1" />
            Download All
          </Button>
        )}
      </div>

      {/* Presets Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {platformPresets.map((preset) => (
          <VisualPresetCard
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

      {/* Selection Summary */}
      {selectedCount > 0 && (
        <div className="mt-4 text-center">
          <span className="text-sm text-gray-600">
            {selectedCount} preset{selectedCount !== 1 ? 's' : ''} selected
            {!isPro && (
              <span className="ml-2 text-orange-600">
                ({freeConversionsUsed}/{maxFreeConversions} free conversions used)
              </span>
            )}
          </span>
        </div>
      )}
    </div>
  );
}