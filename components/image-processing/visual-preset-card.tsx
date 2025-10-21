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
  onDownload: (presetId: string) => void;
  canSelect: boolean;
  isPro: boolean;
}

export function VisualPresetCard({
  preset,
  previewImage,
  isSelected,
  onToggle,
  onDownload,
  canSelect,
  isPro
}: VisualPresetCardProps) {
  // Calculate the aspect ratio for the skeleton
  const aspectRatio = preset.width / preset.height;
  
  // Determine the skeleton size (max width/height for consistent display)
  const maxSize = 120;
  let skeletonWidth = maxSize;
  let skeletonHeight = maxSize;
  
  if (aspectRatio > 1) {
    // Landscape
    skeletonHeight = maxSize / aspectRatio;
  } else if (aspectRatio < 1) {
    // Portrait
    skeletonWidth = maxSize * aspectRatio;
  }
  
  const isLocked = preset.isPro && !isPro;

  return (
    <div 
      className={`relative group cursor-pointer transition-all duration-200 ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      } ${!canSelect ? 'opacity-50' : ''}`}
      onClick={() => canSelect && onToggle(preset.id)}
    >
      {/* Skeleton Card */}
      <div 
        className="bg-gray-200 rounded-lg overflow-hidden relative"
        style={{
          width: `${skeletonWidth}px`,
          height: `${skeletonHeight}px`,
          margin: '0 auto'
        }}
      >
        {/* Image Preview */}
        {previewImage && (
          <img
            src={previewImage}
            alt={preset.name}
            className="w-full h-full object-cover"
            style={{
              objectFit: 'cover',
              objectPosition: 'center'
            }}
          />
        )}
        
        {/* Pro Lock Overlay */}
        {isLocked && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <Icon icon="solar:lock-bold-duotone" className="h-6 w-6 text-white" />
          </div>
        )}
        
        {/* Download Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDownload(preset.id);
          }}
          className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50"
        >
          <Icon icon="solar:download-bold-duotone" className="h-3 w-3 text-gray-600" />
        </button>
      </div>
      
      {/* Preset Info */}
      <div className="mt-2 text-center">
        <div className="text-sm font-medium text-gray-900">{preset.name}</div>
        <div className="text-xs text-gray-500">{preset.width} × {preset.height}</div>
        {isLocked && (
          <div className="text-xs text-orange-600 font-medium">Pro</div>
        )}
      </div>
    </div>
  );
}
