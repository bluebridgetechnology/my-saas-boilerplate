'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@iconify/react';
import { ImageFilters, FILTER_PRESETS, FilterPreset } from '@/lib/image-processing/filters';
import { toast } from 'sonner';

interface FiltersToolProps {
  files: File[];
  onProcessingStart: () => void;
  onProcessingEnd: () => void;
  onProgress: (progress: number, message?: string) => void;
}

export function FiltersTool({ 
  files, 
  onProcessingStart, 
  onProcessingEnd, 
  onProgress 
}: FiltersToolProps) {
  const [selectedFilter, setSelectedFilter] = useState<FilterPreset | null>(null);
  const [filterIntensity, setFilterIntensity] = useState(100);
  const [customConfig, setCustomConfig] = useState({
    sepia: 0,
    brightness: 0,
    contrast: 0,
    saturation: 0,
    hue: 0,
    blur: 0,
    sharpen: 0,
    vignette: 0
  });

  const [processedFiles, setProcessedFiles] = useState<Array<{
    file: File;
    result?: Blob;
    error?: string;
    isProcessing: boolean;
    appliedFilter?: string;
  }>>([]);

  const filtersRef = useRef<ImageFilters | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const previewScaleRef = useRef<number>(1);

  const loadPreview = useCallback(async (file: File) => {
    if (!previewCanvasRef.current) return;

    const filters = new ImageFilters();
    filtersRef.current = filters;
    
    const success = await filters.loadImage(file);
    if (success) {
      // Store original image for real-time updates
      const img = new Image();
      img.onload = () => {
        imageRef.current = img;
        
        // Set up canvas with proper scaling
        const canvas = previewCanvasRef.current!;
        const ctx = canvas.getContext('2d')!;
        const container = canvas.parentElement as HTMLElement;
        const maxW = Math.min(container?.clientWidth || img.width, 600);
        const maxH = 400;
        const scale = Math.min(maxW / img.width, maxH / img.height, 1);
        previewScaleRef.current = scale;
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        
        // Draw original image
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Apply current filter settings
        applyCurrentFilterToPreview();
      };
      img.src = URL.createObjectURL(file);
    } else {
      toast.error('Failed to load image for preview');
    }
  }, []);

  const applyCurrentFilterToPreview = useCallback(() => {
    if (!imageRef.current || !previewCanvasRef.current) return;
    
    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext('2d')!;
    const img = imageRef.current;
    const scale = previewScaleRef.current;
    
    // Clear and redraw original image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    
    // Apply preset filter effects first
    if (selectedFilter) {
      applyPresetFilterToCanvas(ctx, selectedFilter, filterIntensity);
    }
    
    // Always apply custom adjustments on top
    applyCustomFilterToCanvas(ctx, customConfig, filterIntensity);
  }, [selectedFilter, filterIntensity, customConfig]);

  const applyPresetFilterToCanvas = useCallback((ctx: CanvasRenderingContext2D, filter: FilterPreset, intensity: number) => {
    const actualIntensity = intensity / 100;
    const config = filter.config;
    
    // For artistic filters, use custom algorithms
    if (filter.category === 'artistic') {
      applyArtisticEffect(ctx, filter.name, actualIntensity);
      return;
    }
    
    // Build filter string from config for other filters
    const filters = [];
    
    if (config.sepia) filters.push(`sepia(${config.sepia * actualIntensity})`);
    if (config.brightness) filters.push(`brightness(${1 + config.brightness * actualIntensity * 0.01})`);
    if (config.contrast) filters.push(`contrast(${1 + config.contrast * actualIntensity * 0.01})`);
    if (config.saturation) filters.push(`saturate(${1 + config.saturation * actualIntensity * 0.01})`);
    if (config.hue) filters.push(`hue-rotate(${config.hue * actualIntensity}deg)`);
    if (config.blur) filters.push(`blur(${config.blur * actualIntensity}px)`);
    
    ctx.filter = filters.join(' ') || 'none';
    
    // Redraw with filter
    const img = imageRef.current!;
    const scale = previewScaleRef.current;
    ctx.drawImage(img, 0, 0, Math.round(img.width * scale), Math.round(img.height * scale));
    
    // Reset filter
    ctx.filter = 'none';
  }, []);

  const applyArtisticEffect = useCallback((ctx: CanvasRenderingContext2D, effectName: string, intensity: number) => {
    const img = imageRef.current!;
    const scale = previewScaleRef.current;
    const canvas = previewCanvasRef.current!;
    
    // Get image data
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d')!;
    tempCanvas.width = Math.round(img.width * scale);
    tempCanvas.height = Math.round(img.height * scale);
    tempCtx.drawImage(img, 0, 0, tempCanvas.width, tempCanvas.height);
    
    const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    
    let processedData: ImageData;
    
    switch (effectName) {
      case 'Oil Painting':
        processedData = applyOilPaintingEffect(imageData, intensity);
        break;
      case 'Watercolor':
        processedData = applyWatercolorEffect(imageData, intensity);
        break;
      case 'Sketch':
        processedData = applySketchEffect(imageData, intensity);
        break;
      default:
        processedData = imageData;
    }
    
    // Draw the processed image
    ctx.putImageData(processedData, 0, 0);
  }, []);


  const applyOilPaintingEffect = useCallback((imageData: ImageData, intensity: number) => {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const newData = new Uint8ClampedArray(data);
    
    const brushSize = Math.max(2, Math.floor(4 * intensity));
    const intensityLevels = Math.max(4, Math.floor(12 * intensity));
    
    // Apply oil painting effect with improved algorithm
    for (let y = 0; y < height; y += brushSize) {
      for (let x = 0; x < width; x += brushSize) {
        // Sample colors in the brush area
        const colors: { r: number; g: number; b: number; count: number }[] = [];
        
        for (let by = 0; by < brushSize && y + by < height; by++) {
          for (let bx = 0; bx < brushSize && x + bx < width; bx++) {
            const idx = ((y + by) * width + (x + bx)) * 4;
            const r = Math.floor(data[idx] / (256 / intensityLevels)) * (256 / intensityLevels);
            const g = Math.floor(data[idx + 1] / (256 / intensityLevels)) * (256 / intensityLevels);
            const b = Math.floor(data[idx + 2] / (256 / intensityLevels)) * (256 / intensityLevels);
            
            const existingColor = colors.find(c => c.r === r && c.g === g && c.b === b);
            if (existingColor) {
              existingColor.count++;
            } else {
              colors.push({ r, g, b, count: 1 });
            }
          }
        }
        
        // Find the most frequent color
        const dominantColor = colors.reduce((prev, current) => 
          current.count > prev.count ? current : prev
        );
        
        // Apply the dominant color to the brush area with some variation
        for (let by = 0; by < brushSize && y + by < height; by++) {
          for (let bx = 0; bx < brushSize && x + bx < width; bx++) {
            const idx = ((y + by) * width + (x + bx)) * 4;
            // Add slight variation for more natural look
            const variation = (Math.random() - 0.5) * 20 * intensity;
            newData[idx] = Math.max(0, Math.min(255, dominantColor.r + variation));
            newData[idx + 1] = Math.max(0, Math.min(255, dominantColor.g + variation));
            newData[idx + 2] = Math.max(0, Math.min(255, dominantColor.b + variation));
          }
        }
      }
    }
    
    return new ImageData(newData, width, height);
  }, []);

  const applyWatercolorEffect = useCallback((imageData: ImageData, intensity: number) => {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const newData = new Uint8ClampedArray(data);
    
    // Copy original data
    for (let i = 0; i < data.length; i++) {
      newData[i] = data[i];
    }
    
    const blurRadius = Math.max(2, Math.floor(3 * intensity));
    
    // Apply watercolor effect: multiple blur passes + saturation boost
    for (let pass = 0; pass < 2; pass++) {
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          let r = 0, g = 0, b = 0, count = 0;
          
          // Apply blur with weighted kernel
          for (let dy = -blurRadius; dy <= blurRadius; dy++) {
            for (let dx = -blurRadius; dx <= blurRadius; dx++) {
              const nx = x + dx;
              const ny = y + dy;
              
              if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                const idx = (ny * width + nx) * 4;
                const weight = 1 / (1 + Math.sqrt(dx * dx + dy * dy) / blurRadius);
                r += newData[idx] * weight;
                g += newData[idx + 1] * weight;
                b += newData[idx + 2] * weight;
                count += weight;
              }
            }
          }
          
          const idx = (y * width + x) * 4;
          const avgR = r / count;
          const avgG = g / count;
          const avgB = b / count;
          
          // Apply watercolor effect: boost saturation and soften colors
          const gray = avgR * 0.299 + avgG * 0.587 + avgB * 0.114;
          const saturation = 1 + intensity * 0.8;
          
          newData[idx] = Math.min(255, gray + (avgR - gray) * saturation);
          newData[idx + 1] = Math.min(255, gray + (avgG - gray) * saturation);
          newData[idx + 2] = Math.min(255, gray + (avgB - gray) * saturation);
        }
      }
    }
    
    return new ImageData(newData, width, height);
  }, []);

  const applySketchEffect = useCallback((imageData: ImageData, intensity: number) => {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const newData = new Uint8ClampedArray(data);
    
    // Convert to grayscale first
    for (let i = 0; i < data.length; i += 4) {
      const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
      newData[i] = gray;
      newData[i + 1] = gray;
      newData[i + 2] = gray;
    }
    
    // Apply edge detection (Sobel operator) - improved version
    const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
    const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let gx = 0, gy = 0;
        
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = ((y + ky) * width + (x + kx)) * 4;
            const gray = newData[idx];
            const kernelIdx = (ky + 1) * 3 + (kx + 1);
            
            gx += gray * sobelX[kernelIdx];
            gy += gray * sobelY[kernelIdx];
          }
        }
        
        const magnitude = Math.sqrt(gx * gx + gy * gy);
        // Improved sketch calculation with better intensity scaling
        const sketchValue = Math.min(255, magnitude * intensity * 6);
        
        const idx = (y * width + x) * 4;
        // Create proper sketch effect (white lines on dark background)
        const finalValue = Math.max(0, 255 - sketchValue);
        newData[idx] = finalValue;
        newData[idx + 1] = finalValue;
        newData[idx + 2] = finalValue;
      }
    }
    
    return new ImageData(newData, width, height);
  }, []);

  const applyCustomFilterToCanvas = useCallback((ctx: CanvasRenderingContext2D, config: typeof customConfig, intensity: number) => {
    const actualIntensity = intensity / 100;
    
    // Build filter string
    const filters = [];
    if (config.sepia !== 0) filters.push(`sepia(${config.sepia * actualIntensity}%)`);
    if (config.brightness !== 0) filters.push(`brightness(${1 + config.brightness * actualIntensity * 0.01})`);
    if (config.contrast !== 0) filters.push(`contrast(${1 + config.contrast * actualIntensity * 0.01})`);
    if (config.saturation !== 0) filters.push(`saturate(${1 + config.saturation * actualIntensity * 0.01})`);
    if (config.hue !== 0) filters.push(`hue-rotate(${config.hue * actualIntensity}deg)`);
    if (config.blur !== 0) filters.push(`blur(${config.blur * actualIntensity}px)`);
    
    ctx.filter = filters.join(' ') || 'none';
    
    // Redraw with filter
    const img = imageRef.current!;
    const scale = previewScaleRef.current;
    ctx.drawImage(img, 0, 0, Math.round(img.width * scale), Math.round(img.height * scale));
    
    // Reset filter
    ctx.filter = 'none';
  }, []);

  // Auto-load preview when files change
  useEffect(() => {
    if (files.length > 0) {
      loadPreview(files[0]);
    }
  }, [files, loadPreview]);

  // Real-time preview updates
  useEffect(() => {
    applyCurrentFilterToPreview();
  }, [selectedFilter, filterIntensity, customConfig, applyCurrentFilterToPreview]);

  const processFiles = useCallback(async () => {
    if (files.length === 0) {
      toast.error('Please upload images first');
      return;
    }

    if (!selectedFilter && Object.values(customConfig).every(v => v === 0)) {
      toast.error('Please select a filter or configure custom settings');
      return;
    }

    onProcessingStart();
    const results: typeof processedFiles = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const progress = ((i + 1) / files.length) * 100;
      onProgress(progress, `Processing ${file.name}...`);

      try {
        const filters = new ImageFilters();
        const success = await filters.loadImage(file);
        
        if (!success) {
          throw new Error('Failed to load image');
        }

        // Apply filter
        if (selectedFilter) {
          filters.applyFilter(selectedFilter, filterIntensity);
        } else {
          filters.applyCustomFilter(customConfig, filterIntensity);
        }

        const result = await filters.exportImage('image/png', 0.9);
        
        if (result) {
          results.push({
            file,
            result,
            isProcessing: false,
            appliedFilter: selectedFilter?.name || 'Custom'
          });
          toast.success(`Processed ${file.name}`);
        } else {
          throw new Error('Failed to export image');
        }

        filters.cleanup();
      } catch (error) {
        console.error(`Error processing ${file.name}:`, error);
        results.push({
          file,
          error: error instanceof Error ? error.message : 'Unknown error',
          isProcessing: false
        });
        toast.error(`Failed to process ${file.name}`);
      }
    }

    setProcessedFiles(results);
    onProcessingEnd();
    onProgress(100, 'Processing complete');
  }, [files, selectedFilter, filterIntensity, customConfig, onProcessingStart, onProcessingEnd, onProgress]);

  const downloadFile = useCallback((result: Blob, filename: string) => {
    const url = URL.createObjectURL(result);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  const downloadAll = useCallback(async () => {
    const JSZipModule = await import('jszip');
    const JSZip = JSZipModule.default;
    const zip = new JSZip();

    processedFiles.forEach((processedFile, index) => {
      if (processedFile.result) {
        const originalName = processedFile.file.name.replace(/\.[^/.]+$/, '');
        const filterName = processedFile.appliedFilter?.toLowerCase().replace(/\s+/g, '-') || 'filtered';
        const filename = `${originalName}_${filterName}.png`;
        zip.file(filename, processedFile.result);
      }
    });

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    downloadFile(zipBlob, 'filtered-images.zip');
    toast.success('Downloading all filtered images as ZIP');
  }, [processedFiles, downloadFile]);

  const resetSettings = useCallback(() => {
    setSelectedFilter(null);
    setFilterIntensity(100);
    setCustomConfig({
      sepia: 0,
      brightness: 0,
      contrast: 0,
      saturation: 0,
      hue: 0,
      blur: 0,
      sharpen: 0,
      vignette: 0
    });
    
    if (filtersRef.current) {
      filtersRef.current.reset();
      const previewCtx = previewCanvasRef.current?.getContext('2d');
      if (previewCtx && previewCanvasRef.current) {
        const canvas = filtersRef.current.getCanvas();
        previewCtx.clearRect(0, 0, previewCanvasRef.current.width, previewCanvasRef.current.height);
        previewCtx.drawImage(canvas, 0, 0);
      }
    }
  }, []);

  useEffect(() => {
    return () => {
      if (filtersRef.current) {
        filtersRef.current.cleanup();
      }
    };
  }, []);

  // Group filters by category
  const filtersByCategory = FILTER_PRESETS.reduce((acc, filter) => {
    if (!acc[filter.category]) {
      acc[filter.category] = [];
    }
    acc[filter.category].push(filter);
    return acc;
  }, {} as Record<string, FilterPreset[]>);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="text-center space-y-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900">Image Filters & Effects</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Transform your images with professional filters and effects. Choose from vintage, artistic, Instagram-style presets, or create custom combinations.
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Preview */}
        <div className="lg:col-span-2 space-y-6">
          {/* Live Preview */}
          {files.length > 0 && (
            <Card className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Preview</h3>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Real-time</span>
                </div>
                <div className="text-center bg-gray-50 rounded-lg p-4">
                  <canvas
                    ref={previewCanvasRef}
                    className="max-w-full max-h-[400px] border border-gray-200 rounded-lg shadow-sm mx-auto"
                    style={{ height: 'auto' }}
                  />
                </div>
              </div>
            </Card>
          )}

          {/* Filter Presets */}
          <Card className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Filter Presets</h3>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  <Icon icon="solar:crown-bold-duotone" className="h-3 w-3 mr-1" />
                  Pro
                </span>
              </div>

              {/* Filter Categories */}
              {Object.entries(filtersByCategory).map(([category, filters]) => (
                <div key={category} className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700 uppercase tracking-wide">{category} Filters</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {filters.map((filter) => (
                      <button
                        key={filter.id}
                        onClick={() => setSelectedFilter(filter)}
                        className={`p-2 rounded-md border text-sm font-medium transition-all duration-200 ${
                          selectedFilter?.id === filter.id
                            ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                            : 'border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                        }`}
                      >
                        {filter.name}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column - Controls */}
        <div className="space-y-6">
          {/* Filter Intensity */}
          <Card className="p-4">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">Filter Intensity</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>0%</span>
                  <span className="font-medium">{filterIntensity}%</span>
                  <span>100%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filterIntensity}
                  onChange={(e) => setFilterIntensity(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            </div>
          </Card>

          {/* Custom Filter Builder */}
          <Card className="p-4">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Custom Adjustments</h3>
              <div className="space-y-3">
                {Object.entries(customConfig).map(([key, value]) => (
                  <div key={key} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-700 capitalize">{key}</span>
                      <span className="text-gray-500">{value}</span>
                    </div>
                    <input
                      type="range"
                      min={key === 'sepia' || key === 'vignette' ? '0' : '-100'}
                      max="100"
                      value={value}
                      onChange={(e) => {
                        const newValue = parseInt(e.target.value);
                        setCustomConfig(prev => ({ ...prev, [key]: newValue }));
                      }}
                      className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <Card className="p-4">
            <div className="space-y-3">
              <Button 
                onClick={processFiles}
                className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white"
                disabled={files.length === 0}
              >
                <Icon icon="solar:magic-stick-bold-duotone" className="h-4 w-4 mr-2" />
                Apply Filters
              </Button>
              
              <div className="grid grid-cols-1 gap-2">
                <Button 
                  onClick={() => {
                    setSelectedFilter(null);
                    setCustomConfig({
                      sepia: 0, brightness: 0, contrast: 0, saturation: 0,
                      hue: 0, blur: 0, sharpen: 0, vignette: 0
                    });
                    setFilterIntensity(100);
                  }}
                  variant="outline"
                  size="sm"
                  className="text-gray-600"
                >
                  <Icon icon="solar:refresh-bold-duotone" className="h-4 w-4 mr-1" />
                  Reset
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>


      {/* Results */}
      {processedFiles.length > 0 && (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Filtered Images</h3>
              <Button 
                onClick={downloadAll}
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <Icon icon="solar:download-bold-duotone" className="h-4 w-4 mr-2" />
                Download All (ZIP)
              </Button>
            </div>

            <div className="space-y-3">
              {processedFiles.map((processedFile, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Icon icon="solar:image-bold-duotone" className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{processedFile.file.name}</p>
                      <p className="text-sm text-gray-600">
                        {processedFile.result ? 'Successfully filtered' : 'Processing failed'}
                      </p>
                      {processedFile.appliedFilter && (
                        <p className="text-xs text-blue-600">
                          Filter: {processedFile.appliedFilter}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {processedFile.result ? (
                    <Button 
                      onClick={() => {
                        const originalName = processedFile.file.name.replace(/\.[^/.]+$/, '');
                        const filterName = processedFile.appliedFilter?.toLowerCase().replace(/\s+/g, '-') || 'filtered';
                        downloadFile(processedFile.result!, `${originalName}_${filterName}.png`);
                      }}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Icon icon="solar:download-bold-duotone" className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Icon icon="solar:danger-circle-bold-duotone" className="h-4 w-4 text-red-600" />
                      <span className="text-sm text-red-600">Failed</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
