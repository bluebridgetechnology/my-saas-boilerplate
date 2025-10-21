'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@iconify/react';

interface ColorData {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  cmyk: { c: number; m: number; y: number; k: number };
}

interface ColorPickerToolProps {
  files?: File[];
  onProcessingStart?: () => void;
  onProcessingEnd?: () => void;
  onProgress?: (progress: number, message?: string) => void;
}

export function ColorPickerTool({ 
  files = [], 
  onProcessingStart, 
  onProcessingEnd, 
  onProgress 
}: ColorPickerToolProps) {
  const [selectedColor, setSelectedColor] = useState<ColorData | null>(null);
  const [colorPalette, setColorPalette] = useState<ColorData[]>([]);
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [userPlan, setUserPlan] = useState<'free' | 'pro'>('free');
  const [hoveredColor, setHoveredColor] = useState<ColorData | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  // Mock user plan - in real app, this would come from auth context
  useEffect(() => {
    setUserPlan('free');
  }, []);

  const extractImageData = useCallback((img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.error('Canvas ref not available');
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Canvas context not available');
      return;
    }

    console.log('Extracting image data for:', img.width, 'x', img.height);

    // Calculate display dimensions (max 400px height, maintain aspect ratio)
    const maxHeight = 400;
    const aspectRatio = img.width / img.height;
    let displayWidth = img.width;
    let displayHeight = img.height;

    if (img.height > maxHeight) {
      displayHeight = maxHeight;
      displayWidth = displayHeight * aspectRatio;
    }

    console.log('Display dimensions:', displayWidth, 'x', displayHeight);

    // Set canvas internal dimensions to match image (for accurate pixel data)
    canvas.width = img.width;
    canvas.height = img.height;

    // Set canvas display size
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw image to canvas
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Get image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setImageData(imageData);
    
    console.log('Image loaded successfully:', img.width, 'x', img.height, 'Display:', displayWidth, 'x', displayHeight);
    console.log('Canvas dimensions:', canvas.width, 'x', canvas.height);
    console.log('ImageData dimensions:', imageData.width, 'x', imageData.height);
  }, []);

  // Load image when files change
  useEffect(() => {
    console.log('Files changed:', files.length, files);
    if (files.length > 0) {
      const file = files[0];
      console.log('Loading file:', file.name, file.type, file.size);
      const img = new Image();
      img.onload = () => {
        console.log('Image loaded successfully:', img.width, 'x', img.height);
        imageRef.current = img;
        // Use requestAnimationFrame to ensure canvas is rendered
        requestAnimationFrame(() => {
          extractImageData(img);
        });
      };
      img.onerror = (error) => {
        console.error('Image load error:', error);
      };
      img.src = URL.createObjectURL(file);
    } else {
      // Clear image when no files
      imageRef.current = null;
      setImageData(null);
      setSelectedColor(null);
      setHoveredColor(null);
    }
  }, [files, extractImageData]);

  const rgbToHex = useCallback((r: number, g: number, b: number): string => {
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
  }, []);

  const rgbToHsl = useCallback((r: number, g: number, b: number): { h: number; s: number; l: number } => {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  }, []);

  const rgbToCmyk = useCallback((r: number, g: number, b: number): { c: number; m: number; y: number; k: number } => {
    r /= 255;
    g /= 255;
    b /= 255;

    const k = 1 - Math.max(r, g, b);
    const c = (1 - r - k) / (1 - k) || 0;
    const m = (1 - g - k) / (1 - k) || 0;
    const y = (1 - b - k) / (1 - k) || 0;

    return {
      c: Math.round(c * 100),
      m: Math.round(m * 100),
      y: Math.round(y * 100),
      k: Math.round(k * 100)
    };
  }, []);

  const extractColorAtPosition = useCallback((x: number, y: number): ColorData | null => {
    if (!imageData) return null;

    const pixelIndex = (y * imageData.width + x) * 4;
    const r = imageData.data[pixelIndex];
    const g = imageData.data[pixelIndex + 1];
    const b = imageData.data[pixelIndex + 2];

    return {
      hex: rgbToHex(r, g, b),
      rgb: { r, g, b },
      hsl: rgbToHsl(r, g, b),
      cmyk: rgbToCmyk(r, g, b)
    };
  }, [imageData, rgbToHex, rgbToHsl, rgbToCmyk]);

  const getColorAtPosition = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!imageRef.current || !imageData) return null;

    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    
    // Calculate the scale factors
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    // Get coordinates relative to canvas
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;
    
    // Convert to image coordinates
    const x = Math.floor(clickX * scaleX);
    const y = Math.floor(clickY * scaleY);
    
    // Ensure coordinates are within bounds
    if (x >= 0 && x < canvas.width && y >= 0 && y < canvas.height) {
      return extractColorAtPosition(x, y);
    }
    
    return null;
  }, [extractColorAtPosition, imageData]);

  const handleImageClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const color = getColorAtPosition(event);
    if (color) {
      setSelectedColor(color);
    }
  }, [getColorAtPosition]);

  const handleImageMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const color = getColorAtPosition(event);
    setHoveredColor(color);
  }, [getColorAtPosition]);

  const handleImageMouseLeave = useCallback(() => {
    setHoveredColor(null);
  }, []);

  const generateColorPalette = useCallback(async () => {
    if (!imageData) return;

    setIsProcessing(true);
    onProcessingStart?.();

    try {
      const palette: ColorData[] = [];
      const maxColors = userPlan === 'pro' ? 20 : 5;
      
      // More intelligent sampling - sample from different regions
      const regions = [
        { x: 0, y: 0, width: imageData.width / 3, height: imageData.height / 3 }, // Top-left
        { x: imageData.width / 3, y: 0, width: imageData.width / 3, height: imageData.height / 3 }, // Top-center
        { x: (imageData.width * 2) / 3, y: 0, width: imageData.width / 3, height: imageData.height / 3 }, // Top-right
        { x: 0, y: imageData.height / 3, width: imageData.width / 3, height: imageData.height / 3 }, // Middle-left
        { x: imageData.width / 3, y: imageData.height / 3, width: imageData.width / 3, height: imageData.height / 3 }, // Center
        { x: (imageData.width * 2) / 3, y: imageData.height / 3, width: imageData.width / 3, height: imageData.height / 3 }, // Middle-right
        { x: 0, y: (imageData.height * 2) / 3, width: imageData.width / 3, height: imageData.height / 3 }, // Bottom-left
        { x: imageData.width / 3, y: (imageData.height * 2) / 3, width: imageData.width / 3, height: imageData.height / 3 }, // Bottom-center
        { x: (imageData.width * 2) / 3, y: (imageData.height * 2) / 3, width: imageData.width / 3, height: imageData.height / 3 }, // Bottom-right
      ];

      // Sample from each region
      for (const region of regions) {
        if (palette.length >= maxColors) break;
        
        const centerX = Math.floor(region.x + region.width / 2);
        const centerY = Math.floor(region.y + region.height / 2);
        
        const color = extractColorAtPosition(centerX, centerY);
        if (color && !palette.some(c => c.hex === color.hex)) {
          palette.push(color);
        }
      }

      // If we need more colors, sample randomly from the entire image
      while (palette.length < maxColors) {
        const randomX = Math.floor(Math.random() * imageData.width);
        const randomY = Math.floor(Math.random() * imageData.height);
        
        const color = extractColorAtPosition(randomX, randomY);
        if (color && !palette.some(c => c.hex === color.hex)) {
          palette.push(color);
        }
        
        // Prevent infinite loop
        if (palette.length === 0) break;
      }

      setColorPalette(palette);
      onProgress?.(100, `Generated ${palette.length} color palette!`);
    } catch (error) {
      console.error('Palette generation failed:', error);
      onProgress?.(0, 'Failed to generate palette');
    } finally {
      setIsProcessing(false);
      onProcessingEnd?.();
    }
  }, [imageData, userPlan, extractColorAtPosition, onProcessingStart, onProcessingEnd, onProgress]);

  const copyToClipboard = useCallback(async (text: string, feedbackMessage?: string) => {
    try {
      await navigator.clipboard.writeText(text);
      console.log('Copied to clipboard:', text);
      
      // Show feedback
      if (feedbackMessage) {
        setCopyFeedback(feedbackMessage);
        setTimeout(() => setCopyFeedback(null), 2000);
      }
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      // Show feedback even for fallback
      if (feedbackMessage) {
        setCopyFeedback(feedbackMessage);
        setTimeout(() => setCopyFeedback(null), 2000);
      }
    }
  }, []);

  const downloadAsText = useCallback((content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  const convertColorFormat = useCallback((color: ColorData, format: 'hex' | 'rgb' | 'hsl' | 'cmyk') => {
    switch (format) {
      case 'hex':
        return color.hex;
      case 'rgb':
        return `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`;
      case 'hsl':
        return `hsl(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%)`;
      case 'cmyk':
        return `cmyk(${color.cmyk.c}%, ${color.cmyk.m}%, ${color.cmyk.y}%, ${color.cmyk.k}%)`;
      default:
        return color.hex;
    }
  }, []);

  const downloadPalette = useCallback((format: 'hex' | 'rgb' | 'hsl' | 'cmyk') => {
    if (colorPalette.length === 0) return;

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `color-palette-${timestamp}.txt`;
    
    let content = `Color Palette - ${timestamp}\n`;
    content += `Generated from ResizeSuite Color Picker\n`;
    content += `Total Colors: ${colorPalette.length}\n\n`;
    
    colorPalette.forEach((color, index) => {
      content += `Color ${index + 1}:\n`;
      content += `  HEX: ${color.hex}\n`;
      content += `  RGB: rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})\n`;
      content += `  HSL: hsl(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%)\n`;
      content += `  CMYK: cmyk(${color.cmyk.c}%, ${color.cmyk.m}%, ${color.cmyk.y}%, ${color.cmyk.k}%)\n\n`;
    });

    downloadAsText(content, filename);
  }, [colorPalette, downloadAsText]);

  const copyPalette = useCallback((format: 'hex' | 'rgb' | 'hsl' | 'cmyk') => {
    if (colorPalette.length === 0) return;

    const colors = colorPalette.map(color => convertColorFormat(color, format));
    const text = colors.join(', ');
    copyToClipboard(text, `Copied ${colorPalette.length} ${format.toUpperCase()} colors to clipboard!`);
  }, [colorPalette, convertColorFormat, copyToClipboard]);

  const addToPalette = useCallback(() => {
    if (!selectedColor) return;
    
    const maxColors = userPlan === 'pro' ? 20 : 5;
    if (colorPalette.length >= maxColors) return;

    if (!colorPalette.some(c => c.hex === selectedColor.hex)) {
      setColorPalette(prev => [...prev, selectedColor]);
    }
  }, [selectedColor, colorPalette, userPlan]);

  const removeFromPalette = useCallback((index: number) => {
    setColorPalette(prev => prev.filter((_, i) => i !== index));
  }, []);

  const clearPalette = useCallback(() => {
    setColorPalette([]);
  }, []);

  return (
    <div className="space-y-6">
      <div className="space-y-8">
        <h3 className="text-xl font-semibold text-gray-900">Color Picker</h3>
        
        {/* No Image Uploaded State */}
        {files.length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Icon icon="solar:image-bold-duotone" className="h-10 w-10 text-gray-400" />
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">Upload an Image to Get Started</h4>
            <p className="text-gray-600 mb-4">
              Upload an image to extract colors and create beautiful color palettes
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
              <div className="flex items-center gap-2 mb-2">
                <Icon icon="solar:info-circle-bold-duotone" className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">How it works:</span>
              </div>
              <ul className="text-sm text-blue-800 space-y-1 text-left">
                <li>• Upload any image (JPG, PNG, WebP, GIF)</li>
                <li>• Click anywhere on the image to pick colors</li>
                <li>• Generate automatic color palettes</li>
                <li>• Copy color values in multiple formats</li>
              </ul>
            </div>
          </div>
        )}
        
        {/* Image Display */}
        {files.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-medium text-gray-900">Click to Pick Colors</h4>
              {imageRef.current && (
                <div className="text-sm text-gray-500">
                  {imageRef.current.width} × {imageRef.current.height}px
                </div>
              )}
            </div>
            <div className="relative inline-block">
              <canvas
                ref={canvasRef}
                onClick={handleImageClick}
                onMouseMove={handleImageMouseMove}
                onMouseLeave={handleImageMouseLeave}
                className="rounded-lg shadow-sm cursor-crosshair border border-gray-200"
                style={{ 
                  maxWidth: '100%',
                  height: 'auto',
                  display: 'block',
                  maxHeight: '400px',
                  visibility: imageData ? 'visible' : 'hidden'
                }}
              />
              
              {/* Fallback image display if canvas doesn't work */}
              {imageRef.current && (
                <img
                  src={imageRef.current.src}
                  alt="Color picker preview"
                  className="rounded-lg shadow-sm cursor-crosshair border border-gray-200"
                  style={{ 
                    maxWidth: '100%',
                    height: 'auto',
                    maxHeight: '400px',
                    display: 'none' // Hidden by default, show if canvas fails
                  }}
                />
              )}
              
              <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                Click anywhere to pick a color
              </div>
              {hoveredColor && (
                <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                  {hoveredColor.hex}
                </div>
              )}
            </div>
            
            {/* Debug info */}
            <div className="mt-2 text-xs text-gray-500">
              Canvas: {canvasRef.current?.width || 0} × {canvasRef.current?.height || 0}px
              {imageData && ` | ImageData: ${imageData.width} × ${imageData.height}px`}
            </div>
          </div>
        )}
        
        {/* Selected Color */}
        {selectedColor && (
          <>
            <hr className="border-gray-200" />
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">Selected Color</h4>
            <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
              <div 
                className="w-16 h-16 rounded-lg border border-gray-300 shadow-sm"
                style={{ backgroundColor: selectedColor.hex }}
              />
                <div className="flex-1 space-y-3">
                  <div className="grid grid-cols-1 gap-3 text-sm">
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center">
                        <span className="font-medium text-gray-700 mr-2">HEX:</span>
                        <span className="font-mono">{selectedColor.hex}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(selectedColor.hex, 'HEX color copied!')}
                        className="h-7 px-2"
                      >
                        <Icon icon="solar:copy-bold-duotone" className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center">
                        <span className="font-medium text-gray-700 mr-2">RGB:</span>
                        <span className="font-mono">{selectedColor.rgb.r}, {selectedColor.rgb.g}, {selectedColor.rgb.b}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(`rgb(${selectedColor.rgb.r}, ${selectedColor.rgb.g}, ${selectedColor.rgb.b})`, 'RGB color copied!')}
                        className="h-7 px-2"
                      >
                        <Icon icon="solar:copy-bold-duotone" className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center">
                        <span className="font-medium text-gray-700 mr-2">HSL:</span>
                        <span className="font-mono">{selectedColor.hsl.h}°, {selectedColor.hsl.s}%, {selectedColor.hsl.l}%</span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(`hsl(${selectedColor.hsl.h}, ${selectedColor.hsl.s}%, ${selectedColor.hsl.l}%)`, 'HSL color copied!')}
                        className="h-7 px-2"
                      >
                        <Icon icon="solar:copy-bold-duotone" className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center">
                        <span className="font-medium text-gray-700 mr-2">CMYK:</span>
                        <span className="font-mono">{selectedColor.cmyk.c}%, {selectedColor.cmyk.m}%, {selectedColor.cmyk.y}%, {selectedColor.cmyk.k}%</span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(`cmyk(${selectedColor.cmyk.c}%, ${selectedColor.cmyk.m}%, ${selectedColor.cmyk.y}%, ${selectedColor.cmyk.k}%)`, 'CMYK color copied!')}
                        className="h-7 px-2"
                      >
                        <Icon icon="solar:copy-bold-duotone" className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={addToPalette}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
                      disabled={colorPalette.length >= (userPlan === 'pro' ? 20 : 5)}
                    >
                      <Icon icon="solar:add-circle-bold-duotone" className="h-4 w-4 mr-2" />
                      Add to Palette
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadAsText(
                        `Selected Color - ${new Date().toISOString().split('T')[0]}\n\nHEX: ${selectedColor.hex}\nRGB: rgb(${selectedColor.rgb.r}, ${selectedColor.rgb.g}, ${selectedColor.rgb.b})\nHSL: hsl(${selectedColor.hsl.h}, ${selectedColor.hsl.s}%, ${selectedColor.hsl.l}%)\nCMYK: cmyk(${selectedColor.cmyk.c}%, ${selectedColor.cmyk.m}%, ${selectedColor.cmyk.y}%, ${selectedColor.cmyk.k}%)`,
                        `color-${selectedColor.hex.replace('#', '')}.txt`
                      )}
                      className="h-8 px-3"
                    >
                      <Icon icon="solar:download-bold-duotone" className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
            </div>
          </div>
          </>
        )}
        
        {/* Color Palette */}
        {files.length > 0 && (
          <>
            <hr className="border-gray-200" />
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-medium text-gray-900">Color Palette ({colorPalette.length})</h4>
                <div className="flex gap-2">
                  <Button 
                    onClick={generateColorPalette}
                    size="sm"
                    variant="outline"
                    disabled={!imageData || isProcessing}
                  >
                    {isProcessing ? (
                      <Icon icon="solar:refresh-bold-duotone" className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Icon icon="solar:magic-stick-3-bold-duotone" className="h-4 w-4 mr-2" />
                    )}
                    Generate Palette
                  </Button>
                  {colorPalette.length > 0 && (
                    <>
                      <Button 
                        onClick={clearPalette}
                        size="sm"
                        variant="outline"
                      >
                        <Icon icon="solar:trash-bin-trash-bold-duotone" className="h-4 w-4 mr-2" />
                        Clear
                      </Button>
                      <Button 
                        onClick={() => downloadPalette('hex')}
                        size="sm"
                        variant="outline"
                      >
                        <Icon icon="solar:download-bold-duotone" className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Bulk Operations */}
              {colorPalette.length > 0 && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Bulk Operations:</span>
                    {copyFeedback && (
                      <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                        <Icon icon="solar:check-circle-bold-duotone" className="h-3 w-3" />
                        {copyFeedback}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyPalette('hex')}
                      className="text-xs"
                    >
                      <Icon icon="solar:copy-bold-duotone" className="h-3 w-3 mr-1" />
                      Copy HEX
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyPalette('rgb')}
                      className="text-xs"
                    >
                      <Icon icon="solar:copy-bold-duotone" className="h-3 w-3 mr-1" />
                      Copy RGB
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyPalette('hsl')}
                      className="text-xs"
                    >
                      <Icon icon="solar:copy-bold-duotone" className="h-3 w-3 mr-1" />
                      Copy HSL
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyPalette('cmyk')}
                      className="text-xs"
                    >
                      <Icon icon="solar:copy-bold-duotone" className="h-3 w-3 mr-1" />
                      Copy CMYK
                    </Button>
                  </div>
                </div>
              )}
          
          {colorPalette.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {colorPalette.map((color, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow">
                  <div 
                    className="w-full h-16 rounded mb-2 border border-gray-300"
                    style={{ backgroundColor: color.hex }}
                  />
                  <div className="text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono">{color.hex}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(color.hex, 'HEX copied!')}
                        className="h-5 w-5 p-0"
                      >
                        <Icon icon="solar:copy-bold-duotone" className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-gray-600">
                        {color.rgb.r}, {color.rgb.g}, {color.rgb.b}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(`rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`, 'RGB copied!')}
                        className="h-5 w-5 p-0"
                      >
                        <Icon icon="solar:copy-bold-duotone" className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <Button 
                      onClick={() => removeFromPalette(index)}
                      size="sm"
                      variant="ghost"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 h-7 w-7 p-0"
                      title="Remove color"
                    >
                      <Icon icon="solar:trash-bin-trash-bold-duotone" className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadAsText(
                        `Color ${index + 1} - ${new Date().toISOString().split('T')[0]}\n\nHEX: ${color.hex}\nRGB: rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})\nHSL: hsl(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%)\nCMYK: cmyk(${color.cmyk.c}%, ${color.cmyk.m}%, ${color.cmyk.y}%, ${color.cmyk.k}%)`,
                        `color-${index + 1}-${color.hex.replace('#', '')}.txt`
                      )}
                      className="h-7 w-7 p-0"
                      title="Download color"
                    >
                      <Icon icon="solar:download-bold-duotone" className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Icon icon="solar:palette-bold-duotone" className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>No colors in palette yet</p>
              <p className="text-sm">Click on the image or generate a palette to get started</p>
            </div>
          )}
          
          {/* Upgrade prompt for more colors */}
          {userPlan === 'free' && (
            <div className="mt-3 p-4 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg">
              <div className="flex items-center gap-2">
                <Icon icon="solar:crown-bold-duotone" className="h-5 w-5 text-white" />
                <span className="text-sm text-white font-semibold">Want more colors?</span>
              </div>
              <p className="text-xs text-white/90 mt-2 leading-relaxed">
                Upgrade to Pro for palettes with up to 20 colors and advanced color tools!
              </p>
            </div>
          )}
        </div>
          </>
        )}
      </div>
    </div>
  );
}
