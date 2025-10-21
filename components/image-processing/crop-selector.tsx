'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CropArea } from '@/lib/image-processing';

interface CropSelectorProps {
  imageUrl: string;
  imageDimensions: { width: number; height: number };
  onCropChange: (cropArea: CropArea) => void;
  aspectRatio?: number;
  className?: string;
}

interface CropHandle {
  x: number;
  y: number;
  type: 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w';
}

export function CropSelector({
  imageUrl,
  imageDimensions,
  onCropChange,
  aspectRatio,
  className = ''
}: CropSelectorProps) {
  const [cropArea, setCropArea] = useState<CropArea>({
    x: 0,
    y: 0,
    width: imageDimensions.width,
    height: imageDimensions.height
  });
  
  const [isDragging, setIsDragging] = useState(false);
  const [dragHandle, setDragHandle] = useState<CropHandle | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageScale, setImageScale] = useState(1);
  const [imageOffset, setImageOffset] = useState({ x: 0, y: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Calculate image scale and position
  useEffect(() => {
    if (containerRef.current && imageRef.current) {
      const container = containerRef.current;
      const image = imageRef.current;
      
      const containerWidth = container.offsetWidth;
      const containerHeight = container.offsetHeight;
      
      const scaleX = containerWidth / imageDimensions.width;
      const scaleY = containerHeight / imageDimensions.height;
      const scale = Math.min(scaleX, scaleY, 1);
      
      setImageScale(scale);
      
      const scaledWidth = imageDimensions.width * scale;
      const scaledHeight = imageDimensions.height * scale;
      
      setImageOffset({
        x: (containerWidth - scaledWidth) / 2,
        y: (containerHeight - scaledHeight) / 2
      });
    }
  }, [imageDimensions]);

  // Convert screen coordinates to image coordinates
  const screenToImage = useCallback((screenX: number, screenY: number) => {
    return {
      x: (screenX - imageOffset.x) / imageScale,
      y: (screenY - imageOffset.y) / imageScale
    };
  }, [imageOffset, imageScale]);

  // Convert image coordinates to screen coordinates
  const imageToScreen = useCallback((imageX: number, imageY: number) => {
    return {
      x: imageX * imageScale + imageOffset.x,
      y: imageY * imageScale + imageOffset.y
    };
  }, [imageScale, imageOffset]);

  // Constrain crop area to image boundaries
  const constrainCropArea = useCallback((area: CropArea): CropArea => {
    let { x, y, width, height } = area;
    
    // Ensure crop area is within image bounds
    x = Math.max(0, Math.min(x, imageDimensions.width - width));
    y = Math.max(0, Math.min(y, imageDimensions.height - height));
    width = Math.max(10, Math.min(width, imageDimensions.width - x));
    height = Math.max(10, Math.min(height, imageDimensions.height - y));
    
    // Apply aspect ratio constraint
    if (aspectRatio) {
      if (width / height > aspectRatio) {
        width = height * aspectRatio;
      } else {
        height = width / aspectRatio;
      }
      
      // Re-constrain after aspect ratio adjustment
      x = Math.max(0, Math.min(x, imageDimensions.width - width));
      y = Math.max(0, Math.min(y, imageDimensions.height - height));
    }
    
    return { x, y, width, height };
  }, [imageDimensions, aspectRatio]);

  // Update crop area and notify parent
  const updateCropArea = useCallback((newArea: CropArea) => {
    const constrainedArea = constrainCropArea(newArea);
    setCropArea(constrainedArea);
    onCropChange(constrainedArea);
  }, [constrainCropArea, onCropChange]);

  // Handle mouse down on crop handles
  const handleMouseDown = useCallback((e: React.MouseEvent, handle: CropHandle) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsDragging(true);
    setDragHandle(handle);
    setDragStart({ x: e.clientX, y: e.clientY });
  }, []);

  // Handle mouse down on crop area for moving
  const handleCropAreaMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsDragging(true);
    setDragHandle({ x: cropArea.x, y: cropArea.y, type: 'nw' }); // Use as move handle
    setDragStart({ x: e.clientX, y: e.clientY });
  }, [cropArea]);

  // Handle mouse move
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !dragHandle) return;
      
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      
      const deltaImageX = deltaX / imageScale;
      const deltaImageY = deltaY / imageScale;
      
      let newArea = { ...cropArea };
      
      // Resize crop area
      switch (dragHandle.type) {
        case 'nw':
            newArea.x += deltaImageX;
            newArea.y += deltaImageY;
            newArea.width -= deltaImageX;
            newArea.height -= deltaImageY;
            break;
          case 'ne':
            newArea.y += deltaImageY;
            newArea.width += deltaImageX;
            newArea.height -= deltaImageY;
            break;
          case 'sw':
            newArea.x += deltaImageX;
            newArea.width -= deltaImageX;
            newArea.height += deltaImageY;
            break;
          case 'se':
            newArea.width += deltaImageX;
            newArea.height += deltaImageY;
            break;
          case 'n':
            newArea.y += deltaImageY;
            newArea.height -= deltaImageY;
            break;
          case 's':
            newArea.height += deltaImageY;
            break;
          case 'e':
            newArea.width += deltaImageX;
            break;
          case 'w':
            newArea.x += deltaImageX;
            newArea.width -= deltaImageX;
            break;
        }
      
      updateCropArea(newArea);
      setDragStart({ x: e.clientX, y: e.clientY });
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
      setDragHandle(null);
    };
    
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragHandle, dragStart, cropArea, imageScale, updateCropArea]);

  // Reset crop area to full image
  const resetCrop = useCallback(() => {
    updateCropArea({
      x: 0,
      y: 0,
      width: imageDimensions.width,
      height: imageDimensions.height
    });
  }, [imageDimensions, updateCropArea]);

  // Get screen coordinates for crop area
  const screenCropArea = {
    x: imageToScreen(cropArea.x, cropArea.y).x,
    y: imageToScreen(cropArea.x, cropArea.y).y,
    width: cropArea.width * imageScale,
    height: cropArea.height * imageScale
  };

  // Render crop handles
  const renderHandle = (type: CropHandle['type'], x: number, y: number) => (
    <div
      key={type}
      className={`absolute w-3 h-3 bg-blue-500 border-2 border-white rounded-full cursor-${getCursor(type)} hover:bg-blue-600 transition-colors`}
      style={{
        left: x - 6,
        top: y - 6,
        transform: 'translate(0, 0)'
      }}
      onMouseDown={(e) => handleMouseDown(e, { x, y, type })}
    />
  );

  const getCursor = (type: CropHandle['type']): string => {
    switch (type) {
      case 'nw':
      case 'se':
        return 'nw-resize';
      case 'ne':
      case 'sw':
        return 'ne-resize';
      case 'n':
      case 's':
        return 'ns-resize';
      case 'e':
      case 'w':
        return 'ew-resize';
      default:
        return 'move';
    }
  };

  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-4">
        {/* Controls */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Crop Selector</h3>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={resetCrop}>
              <Icon icon="solar:refresh-bold-duotone" className="h-4 w-4 mr-1" />
              Reset
            </Button>
            {aspectRatio && (
              <span className="text-sm text-gray-600">
                Aspect Ratio: {aspectRatio.toFixed(2)}
              </span>
            )}
          </div>
        </div>

        {/* Image Container */}
        <div
          ref={containerRef}
          className="relative bg-gray-100 rounded-lg overflow-hidden"
          style={{ height: '400px' }}
        >
          {/* Image */}
          <img
            ref={imageRef}
            src={imageUrl}
            alt="Crop preview"
            className="absolute inset-0 w-full h-full object-contain"
            draggable={false}
          />

          {/* Crop Overlay */}
          <div
            className="absolute border-2 border-blue-500 bg-blue-500/20 cursor-move"
            style={{
              left: screenCropArea.x,
              top: screenCropArea.y,
              width: screenCropArea.width,
              height: screenCropArea.height
            }}
            onMouseDown={handleCropAreaMouseDown}
          >
            {/* Grid Lines */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute left-1/3 top-0 bottom-0 w-px bg-blue-400 opacity-50" />
              <div className="absolute left-2/3 top-0 bottom-0 w-px bg-blue-400 opacity-50" />
              <div className="absolute top-1/3 left-0 right-0 h-px bg-blue-400 opacity-50" />
              <div className="absolute top-2/3 left-0 right-0 h-px bg-blue-400 opacity-50" />
            </div>

            {/* Corner Handles */}
            {renderHandle('nw', 0, 0)}
            {renderHandle('ne', screenCropArea.width, 0)}
            {renderHandle('sw', 0, screenCropArea.height)}
            {renderHandle('se', screenCropArea.width, screenCropArea.height)}

            {/* Edge Handles */}
            {renderHandle('n', screenCropArea.width / 2, 0)}
            {renderHandle('s', screenCropArea.width / 2, screenCropArea.height)}
            {renderHandle('e', screenCropArea.width, screenCropArea.height / 2)}
            {renderHandle('w', 0, screenCropArea.height / 2)}
          </div>

          {/* Dark Overlay */}
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="absolute bg-black/50"
              style={{
                left: 0,
                top: 0,
                right: 0,
                bottom: 0,
                clipPath: `polygon(0% 0%, 0% 100%, ${screenCropArea.x}px 100%, ${screenCropArea.x}px ${screenCropArea.y}px, ${screenCropArea.x + screenCropArea.width}px ${screenCropArea.y}px, ${screenCropArea.x + screenCropArea.width}px ${screenCropArea.y + screenCropArea.height}px, ${screenCropArea.x}px ${screenCropArea.y + screenCropArea.height}px, ${screenCropArea.x}px 100%, 100% 100%, 100% 0%)`
              }}
            />
          </div>
        </div>

        {/* Crop Information */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="font-medium text-gray-900 mb-1">Crop Area</div>
            <div className="text-gray-600">
              {Math.round(cropArea.x)}, {Math.round(cropArea.y)} - {Math.round(cropArea.width)} × {Math.round(cropArea.height)}
            </div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="font-medium text-gray-900 mb-1">Position</div>
            <div className="text-gray-600">
              X: {Math.round(cropArea.x)}, Y: {Math.round(cropArea.y)}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
