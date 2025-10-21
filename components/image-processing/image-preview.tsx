'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ImagePreviewProps {
  originalImage: string;
  processedImage?: string;
  originalSize?: number;
  processedSize?: number;
  originalDimensions?: { width: number; height: number };
  processedDimensions?: { width: number; height: number };
  isLoading?: boolean;
  className?: string;
}

export function ImagePreview({
  originalImage,
  processedImage,
  originalSize,
  processedSize,
  originalDimensions,
  processedDimensions,
  isLoading = false,
  className = ''
}: ImagePreviewProps) {
  const [comparisonMode, setComparisonMode] = useState<'side-by-side' | 'slider' | 'overlay'>('side-by-side');
  const [sliderPosition, setSliderPosition] = useState(50);
  const [zoom, setZoom] = useState(100);
  const [showGrid, setShowGrid] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const calculateCompressionRatio = (original: number, compressed: number): number => {
    if (original === 0) return 0;
    return Math.round(((original - compressed) / original) * 100);
  };

  const resetZoom = () => {
    setZoom(100);
  };

  const fitToScreen = () => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const containerHeight = containerRef.current.offsetHeight;
      const imageWidth = originalDimensions?.width || 800;
      const imageHeight = originalDimensions?.height || 600;
      
      const scaleX = (containerWidth - 40) / imageWidth;
      const scaleY = (containerHeight - 40) / imageHeight;
      const scale = Math.min(scaleX, scaleY, 1) * 100;
      
      setZoom(Math.round(scale));
    }
  };

  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-4">
        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium text-gray-700">View Mode:</Label>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant={comparisonMode === 'side-by-side' ? 'default' : 'outline'}
                onClick={() => setComparisonMode('side-by-side')}
              >
                <Icon icon="solar:sidebar-bold-duotone" className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant={comparisonMode === 'slider' ? 'default' : 'outline'}
                onClick={() => setComparisonMode('slider')}
              >
                <Icon icon="solar:slider-vertical-bold-duotone" className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant={comparisonMode === 'overlay' ? 'default' : 'outline'}
                onClick={() => setComparisonMode('overlay')}
              >
                <Icon icon="solar:layers-bold-duotone" className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Zoom Controls */}
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => setZoom(Math.max(25, zoom - 25))}>
                <Icon icon="solar:zoom-out-bold-duotone" className="h-4 w-4" />
              </Button>
              <span className="text-sm text-gray-600 min-w-12 text-center">{zoom}%</span>
              <Button size="sm" variant="outline" onClick={() => setZoom(Math.min(400, zoom + 25))}>
                <Icon icon="solar:zoom-in-bold-duotone" className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={resetZoom}>
                <Icon icon="solar:refresh-bold-duotone" className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={fitToScreen}>
                <Icon icon="solar:maximize-bold-duotone" className="h-4 w-4" />
              </Button>
            </div>

            {/* Grid Toggle */}
            <Button
              size="sm"
              variant={showGrid ? 'default' : 'outline'}
              onClick={() => setShowGrid(!showGrid)}
            >
              <Icon icon="solar:grid-bold-duotone" className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Image Comparison */}
        <div 
          ref={containerRef}
          className="relative bg-gray-100 rounded-lg overflow-hidden min-h-96"
          style={{ height: '500px' }}
        >
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-gray-600">Processing...</span>
              </div>
            </div>
          )}

          {comparisonMode === 'side-by-side' && (
            <div className="flex h-full">
              {/* Original Image */}
              <div className="flex-1 relative">
                <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium z-10">
                  Original
                </div>
                <img
                  src={originalImage}
                  alt="Original"
                  className="w-full h-full object-contain"
                  style={{ 
                    transform: `scale(${zoom / 100})`,
                    transformOrigin: 'top left'
                  }}
                />
                {showGrid && (
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="grid-overlay" />
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="w-px bg-gray-300" />

              {/* Processed Image */}
              <div className="flex-1 relative">
                <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium z-10">
                  {processedImage ? 'Processed' : 'No processed image'}
                </div>
                {processedImage ? (
                  <img
                    src={processedImage}
                    alt="Processed"
                    className="w-full h-full object-contain"
                    style={{ 
                      transform: `scale(${zoom / 100})`,
                      transformOrigin: 'top left'
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <Icon icon="solar:image-bold-duotone" className="h-12 w-12 mx-auto mb-2" />
                      <p>No processed image</p>
                    </div>
                  </div>
                )}
                {showGrid && (
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="grid-overlay" />
                  </div>
                )}
              </div>
            </div>
          )}

          {comparisonMode === 'slider' && processedImage && (
            <div className="relative h-full">
              {/* Original Image */}
              <img
                src={originalImage}
                alt="Original"
                className="absolute inset-0 w-full h-full object-contain"
                style={{ 
                  transform: `scale(${zoom / 100})`,
                  transformOrigin: 'center'
                }}
              />
              
              {/* Processed Image with Clip */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ 
                  clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
                  transform: `scale(${zoom / 100})`,
                  transformOrigin: 'center'
                }}
              >
                <img
                  src={processedImage}
                  alt="Processed"
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Slider Handle */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-blue-500 cursor-ew-resize z-10"
                style={{ left: `${sliderPosition}%` }}
                onMouseDown={(e) => {
                  const handleMouseMove = (e: MouseEvent) => {
                    if (containerRef.current) {
                      const rect = containerRef.current.getBoundingClientRect();
                      const x = e.clientX - rect.left;
                      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
                      setSliderPosition(percentage);
                    }
                  };

                  const handleMouseUp = () => {
                    document.removeEventListener('mousemove', handleMouseMove);
                    document.removeEventListener('mouseup', handleMouseUp);
                  };

                  document.addEventListener('mousemove', handleMouseMove);
                  document.addEventListener('mouseup', handleMouseUp);
                }}
              >
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-8 bg-blue-500 rounded-full" />
              </div>

              {/* Labels */}
              <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
                Original
              </div>
              <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
                Processed
              </div>
            </div>
          )}

          {comparisonMode === 'overlay' && processedImage && (
            <div className="relative h-full">
              {/* Original Image */}
              <img
                src={originalImage}
                alt="Original"
                className="absolute inset-0 w-full h-full object-contain opacity-50"
                style={{ 
                  transform: `scale(${zoom / 100})`,
                  transformOrigin: 'center'
                }}
              />
              
              {/* Processed Image */}
              <img
                src={processedImage}
                alt="Processed"
                className="absolute inset-0 w-full h-full object-contain mix-blend-difference"
                style={{ 
                  transform: `scale(${zoom / 100})`,
                  transformOrigin: 'center'
                }}
              />

              {/* Labels */}
              <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
                Difference View
              </div>
            </div>
          )}
        </div>

        {/* Image Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Original Image Info */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Original Image</h4>
            <div className="space-y-1 text-sm text-gray-600">
              {originalDimensions && (
                <div className="flex justify-between">
                  <span>Dimensions:</span>
                  <span>{originalDimensions.width} × {originalDimensions.height}px</span>
                </div>
              )}
              {originalSize && (
                <div className="flex justify-between">
                  <span>File Size:</span>
                  <span>{formatFileSize(originalSize)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Processed Image Info */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Processed Image</h4>
            <div className="space-y-1 text-sm text-gray-600">
              {processedDimensions ? (
                <>
                  <div className="flex justify-between">
                    <span>Dimensions:</span>
                    <span>{processedDimensions.width} × {processedDimensions.height}px</span>
                  </div>
                  {processedSize && (
                    <div className="flex justify-between">
                      <span>File Size:</span>
                      <span>{formatFileSize(processedSize)}</span>
                    </div>
                  )}
                  {originalSize && processedSize && (
                    <div className="flex justify-between font-medium">
                      <span>Size Change:</span>
                      <span className={processedSize < originalSize ? 'text-green-600' : 'text-red-600'}>
                        {processedSize < originalSize ? '-' : '+'}
                        {formatFileSize(Math.abs(processedSize - originalSize))} 
                        ({calculateCompressionRatio(originalSize, processedSize)}%)
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-gray-500">No processed image available</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .grid-overlay {
          background-image: 
            linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}</style>
    </Card>
  );
}
