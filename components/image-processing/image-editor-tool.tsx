'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@iconify/react';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { fabric } from 'fabric';

interface ImageEditorToolProps {
  files: File[];
  onProcessingStart: () => void;
  onProcessingEnd: () => void;
  onProgress: (progress: number, message?: string) => void;
}

interface EditorSettings {
  brightness: number;
  contrast: number;
  saturation: number;
  hue: number;
  sharpen: number;
  blur: number;
  noiseReduction: boolean;
  autoEnhance: boolean;
}

export function ImageEditorTool({ 
  files, 
  onProcessingStart, 
  onProcessingEnd, 
  onProgress 
}: ImageEditorToolProps) {
  const [settings, setSettings] = useState<EditorSettings>({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    hue: 0,
    sharpen: 0,
    blur: 0,
    noiseReduction: false,
    autoEnhance: false
  });

  const [processedFiles, setProcessedFiles] = useState<Array<{
    file: File;
    result?: Blob;
    error?: string;
    isProcessing: boolean;
  }>>([]);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const originalImageRef = useRef<fabric.Image | null>(null);

  // Initialize Fabric.js canvas
  useEffect(() => {
    if (canvasRef.current && !fabricCanvasRef.current) {
      fabricCanvasRef.current = new fabric.Canvas(canvasRef.current, {
        width: 800,
        height: 600,
        backgroundColor: '#f8f9fa'
      });

      // Enable drag-to-pan and centered wheel zoom
      const canvas = fabricCanvasRef.current;
      let isDragging = false;
      let lastPosX = 0;
      let lastPosY = 0;

      canvas.on('mouse:down', (opt) => {
        const evt = opt.e as MouseEvent;
        isDragging = true;
        canvas.setCursor('grabbing');
        lastPosX = evt.clientX;
        lastPosY = evt.clientY;
        evt.preventDefault();
        evt.stopPropagation();
      });

      canvas.on('mouse:move', (opt) => {
        if (!isDragging || !canvas.viewportTransform) return;
        const evt = opt.e as MouseEvent;
        const vpt = canvas.viewportTransform;
        vpt[4] += evt.clientX - lastPosX;
        vpt[5] += evt.clientY - lastPosY;
        canvas.requestRenderAll();
        lastPosX = evt.clientX;
        lastPosY = evt.clientY;
      });

      canvas.on('mouse:up', () => {
        isDragging = false;
        canvas.setCursor('default');
      });

      canvas.on('mouse:wheel', (opt) => {
        const evt = opt.e as WheelEvent;
        let zoomLevel = canvas.getZoom();
        zoomLevel *= evt.deltaY > 0 ? 0.9 : 1.1;
        zoomLevel = Math.min(Math.max(zoomLevel, 0.1), 5);
        const center = new fabric.Point(canvas.getWidth() / 2, canvas.getHeight() / 2);
        canvas.zoomToPoint(center, zoomLevel);
        evt.preventDefault();
        evt.stopPropagation();
      });
    }

    return () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
      }
    };
  }, []);

  // Load image into Fabric.js canvas
  const loadImageToCanvas = useCallback(async (file: File) => {
    if (!fabricCanvasRef.current) return false;

    try {
      const imgElement = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
      });

      // Clear previous image
      fabricCanvasRef.current.clear();

      // Add image to canvas
      const fabricImage = new fabric.Image(imgElement, {
        left: 0,
        top: 0,
        scaleX: 1,
        scaleY: 1,
        selectable: false,
        evented: false
      });

      // Scale image to fit canvas
      const canvasWidth = fabricCanvasRef.current.getWidth();
      const canvasHeight = fabricCanvasRef.current.getHeight();
      const imgWidth = imgElement.width;
      const imgHeight = imgElement.height;

      const scaleX = canvasWidth / imgWidth;
      const scaleY = canvasHeight / imgHeight;
      const scale = Math.min(scaleX, scaleY) * 0.8; // 80% of canvas

      fabricImage.set({
        scaleX: scale,
        scaleY: scale,
        left: (canvasWidth - imgWidth * scale) / 2,
        top: (canvasHeight - imgHeight * scale) / 2
      });

      fabricCanvasRef.current.add(fabricImage);
      originalImageRef.current = fabricImage;
      fabricCanvasRef.current.renderAll();

      return true;
    } catch (error) {
      console.error('Error loading image:', error);
      return false;
    }
  }, []);

  // Apply filters to the image
  const applyFilters = useCallback(() => {
    if (!fabricCanvasRef.current || !originalImageRef.current) return;

    const canvas = fabricCanvasRef.current;
    const image = originalImageRef.current;

    // Reset filters
    image.filters = [];

    // Apply brightness
    if (settings.brightness !== 0) {
      image.filters.push(new fabric.Image.filters.Brightness({
        brightness: settings.brightness / 100
      }));
    }

    // Apply contrast
    if (settings.contrast !== 0) {
      image.filters.push(new fabric.Image.filters.Contrast({
        contrast: settings.contrast / 100
      }));
    }

    // Apply saturation
    if (settings.saturation !== 0) {
      image.filters.push(new fabric.Image.filters.Saturation({
        saturation: settings.saturation / 100
      }));
    }

    // Apply hue rotation
    if (settings.hue !== 0) {
      image.filters.push(new fabric.Image.filters.HueRotation({
        rotation: settings.hue * Math.PI / 180
      }));
    }

    // Apply blur
    if (settings.blur > 0) {
      image.filters.push(new fabric.Image.filters.Blur({
        blur: settings.blur / 100
      }));
    }

    // Apply sharpen
    if (settings.sharpen > 0) {
      image.filters.push(new fabric.Image.filters.Convolute({
        matrix: [
          0, -settings.sharpen / 100, 0,
          -settings.sharpen / 100, 1 + 4 * settings.sharpen / 100, -settings.sharpen / 100,
          0, -settings.sharpen / 100, 0
        ]
      }));
    }

    // Apply noise reduction (median filter simulation)
    if (settings.noiseReduction) {
      // Use a subtle sharpen filter to reduce noise instead of blur
      image.filters.push(new fabric.Image.filters.Convolute({
        matrix: [
          0, -0.1, 0,
          -0.1, 1.4, -0.1,
          0, -0.1, 0
        ]
      }));
    }

    // Apply auto enhance (brightness + contrast boost)
    if (settings.autoEnhance) {
      image.filters.push(new fabric.Image.filters.Brightness({
        brightness: 0.1
      }));
      image.filters.push(new fabric.Image.filters.Contrast({
        contrast: 0.2
      }));
    }

    // Apply filters
    image.applyFilters();
    canvas.renderAll();
  }, [settings]);

  // Apply filters when settings change
  useEffect(() => {
    if (originalImageRef.current) {
      applyFilters();
    }
  }, [settings, applyFilters]);

  // Load image when files change
  useEffect(() => {
    if (files.length > 0) {
      loadImageToCanvas(files[currentImageIndex]);
    }
  }, [files, currentImageIndex, loadImageToCanvas]);

  const handleSettingChange = useCallback((key: keyof EditorSettings, value: number | boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleResetSettings = useCallback(() => {
    setSettings({
      brightness: 0,
      contrast: 0,
      saturation: 0,
      hue: 0,
      sharpen: 0,
      blur: 0,
      noiseReduction: false,
      autoEnhance: false
    });
  }, []);

  const handleZoomIn = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (canvas) {
      const currentZoom = canvas.getZoom();
      const nextZoom = Math.min(currentZoom * 1.2, 5);
      const center = new fabric.Point(canvas.getWidth() / 2, canvas.getHeight() / 2);
      canvas.zoomToPoint(center, nextZoom);
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (canvas) {
      const currentZoom = canvas.getZoom();
      const nextZoom = Math.max(currentZoom / 1.2, 0.1);
      const center = new fabric.Point(canvas.getWidth() / 2, canvas.getHeight() / 2);
      canvas.zoomToPoint(center, nextZoom);
    }
  }, []);

  const handleResetZoom = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (canvas) {
      canvas.setZoom(1);
      canvas.viewportTransform = [1, 0, 0, 1, 0, 0];
      canvas.requestRenderAll();
    }
  }, []);

  const switchImage = useCallback((index: number) => {
    if (index >= 0 && index < files.length) {
      setCurrentImageIndex(index);
    }
  }, [files.length]);

  const processImage = useCallback(async (file: File, index: number) => {
    try {
      onProcessingStart();
      onProgress(0, `Processing ${file.name}...`);

      // Create a temporary canvas for processing
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d')!;
      
      // Load image
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = URL.createObjectURL(file);
      });

      tempCanvas.width = img.width;
      tempCanvas.height = img.height;
      tempCtx.drawImage(img, 0, 0);

      onProgress(50, 'Applying effects...');

      // Apply filters using canvas context
      const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
      const data = imageData.data;

      // Apply brightness
      if (settings.brightness !== 0) {
        const brightness = settings.brightness / 100;
        for (let i = 0; i < data.length; i += 4) {
          data[i] = Math.max(0, Math.min(255, data[i] + brightness * 255));     // R
          data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + brightness * 255)); // G
          data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + brightness * 255)); // B
        }
      }

      // Apply contrast
      if (settings.contrast !== 0) {
        const contrast = settings.contrast / 100;
        const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
        for (let i = 0; i < data.length; i += 4) {
          data[i] = Math.max(0, Math.min(255, factor * (data[i] - 128) + 128));     // R
          data[i + 1] = Math.max(0, Math.min(255, factor * (data[i + 1] - 128) + 128)); // G
          data[i + 2] = Math.max(0, Math.min(255, factor * (data[i + 2] - 128) + 128)); // B
        }
      }

      tempCtx.putImageData(imageData, 0, 0);

      onProgress(75, 'Finalizing...');

      // Convert to blob
      const blob = await new Promise<Blob>((resolve) => {
        tempCanvas.toBlob((blob) => {
          resolve(blob!);
        }, 'image/jpeg', 0.9);
      });

      onProgress(100, 'Processing complete!');

      return blob;
    } catch (error) {
      console.error('Error processing image:', error);
      throw error;
    }
  }, [settings, onProcessingStart, onProgress]);

  const handleProcessAll = useCallback(async () => {
    if (files.length === 0) return;

    onProcessingStart();
    
    const results = files.map((file, index) => ({
      file,
      isProcessing: true,
      error: undefined,
      result: undefined
    }));
    
    setProcessedFiles(results);

    try {
      for (let i = 0; i < files.length; i++) {
        onProgress((i / files.length) * 100, `Processing ${files[i].name}...`);
        
        try {
          const result = await processImage(files[i], i);
          
          setProcessedFiles(prev => prev.map((item, index) => 
            index === i 
              ? { ...item, result, isProcessing: false }
              : item
          ));
        } catch (error) {
          setProcessedFiles(prev => prev.map((item, index) => 
            index === i 
              ? { ...item, error: error instanceof Error ? error.message : 'Unknown error', isProcessing: false }
              : item
          ));
        }
      }
      
      onProgress(100, 'All images processed!');
    } catch (error) {
      console.error('Error processing images:', error);
      toast.error('Error processing images');
    } finally {
      onProcessingEnd();
    }
  }, [files, processImage, onProcessingStart, onProcessingEnd, onProgress]);

  const downloadProcessedImage = useCallback((index: number) => {
    const processedFile = processedFiles[index];
    if (!processedFile?.result) return;

    const url = URL.createObjectURL(processedFile.result);
    const a = document.createElement('a');
    a.href = url;
    a.download = `processed_${processedFile.file.name}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [processedFiles]);

  const downloadAll = useCallback(() => {
    processedFiles.forEach((processedFile, index) => {
      if (processedFile.result) {
        setTimeout(() => downloadProcessedImage(index), index * 100);
      }
    });
  }, [processedFiles, downloadProcessedImage]);

  if (files.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Icon icon="solar:image-bold-duotone" className="h-16 w-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Images Selected</h3>
        <p className="text-gray-600">Upload some images to start editing</p>
      </Card>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="text-center space-y-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900">Image Editor</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Professional image editing with real-time preview. Adjust brightness, contrast, saturation, and apply advanced effects with precision.
        </p>
      </div>
      {/* Image Navigation */}
      {files.length > 1 && (
          <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => switchImage(currentImageIndex - 1)}
              disabled={currentImageIndex === 0}
            >
              <Icon icon="solar:arrow-left-bold-duotone" className="h-4 w-4" />
              Previous
            </Button>
            
            <span className="text-sm text-gray-600">
              {currentImageIndex + 1} of {files.length}
              </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => switchImage(currentImageIndex + 1)}
              disabled={currentImageIndex === files.length - 1}
            >
              Next
              <Icon icon="solar:arrow-right-bold-duotone" className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="text-sm text-gray-500">
            {files[currentImageIndex]?.name}
          </div>
        </div>
      )}

      {/* Main Editor Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Image Preview Section */}
        <div className="lg:col-span-2">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Image Editor</h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleZoomOut}
                  title="Zoom Out"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetZoom}
                  title="Reset Zoom"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleZoomIn}
                  title="Zoom In"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="border rounded-lg bg-gray-50 overflow-hidden">
              <canvas
                ref={canvasRef}
                className="w-full h-auto"
                style={{ maxHeight: '600px' }}
              />
            </div>
          </Card>
          </div>

        {/* Settings Panel */}
        <div className="space-y-6">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Adjustments</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetSettings}
                title="Reset All Settings"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
            
            <div className="space-y-4">
              {/* Brightness */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brightness: {settings.brightness}
                </label>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={settings.brightness}
                  onChange={(e) => handleSettingChange('brightness', parseInt(e.target.value))}
                  className="slider w-full"
                />
              </div>

              {/* Contrast */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contrast: {settings.contrast}
                </label>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={settings.contrast}
                  onChange={(e) => handleSettingChange('contrast', parseInt(e.target.value))}
                  className="slider w-full"
                />
              </div>

              {/* Saturation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Saturation: {settings.saturation}
                </label>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={settings.saturation}
                  onChange={(e) => handleSettingChange('saturation', parseInt(e.target.value))}
                  className="slider w-full"
                />
              </div>

              {/* Hue */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hue: {settings.hue}
                </label>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  value={settings.hue}
                  onChange={(e) => handleSettingChange('hue', parseInt(e.target.value))}
                  className="slider w-full"
                />
          </div>

              {/* Sharpen */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sharpen: {settings.sharpen}
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.sharpen}
                  onChange={(e) => handleSettingChange('sharpen', parseInt(e.target.value))}
                  className="slider w-full"
                />
              </div>

              {/* Blur */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Blur: {settings.blur}
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.blur}
                  onChange={(e) => handleSettingChange('blur', parseInt(e.target.value))}
                  className="slider w-full"
                />
            </div>

              {/* Noise Reduction */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Noise Reduction
                </label>
                <input
                  type="checkbox"
                  checked={settings.noiseReduction}
                  onChange={(e) => handleSettingChange('noiseReduction', e.target.checked)}
                  className="rounded"
                />
              </div>

              {/* Auto Enhance */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Auto Enhance
                </label>
                <input
                  type="checkbox"
                  checked={settings.autoEnhance}
                  onChange={(e) => handleSettingChange('autoEnhance', e.target.checked)}
                  className="rounded"
                />
              </div>
            </div>
          </Card>

          {/* Process Button */}
          <Card className="p-4">
            <Button 
              onClick={handleProcessAll}
              className="w-full"
              size="lg"
            >
              <Icon icon="solar:magic-stick-bold-duotone" className="h-5 w-5 mr-2" />
              Process All Images
            </Button>
          </Card>
        </div>
            </div>
            
      {/* Results Section */}
      {processedFiles.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Processed Images</h3>
              <Button 
                onClick={downloadAll}
                variant="outline"
              size="sm"
              >
                <Icon icon="solar:download-bold-duotone" className="h-4 w-4 mr-2" />
              Download All
              </Button>
            </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {processedFiles.map((processedFile, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium truncate">
                    {processedFile.file.name}
                  </span>
                  {processedFile.isProcessing && (
                    <Icon icon="solar:loading-bold-duotone" className="h-4 w-4 animate-spin text-blue-600" />
                  )}
                    </div>
                
                {processedFile.error && (
                  <div className="text-sm text-red-600 mb-2">
                    Error: {processedFile.error}
                  </div>
                )}
                  
                {processedFile.result && (
                    <Button 
                    onClick={() => downloadProcessedImage(index)}
                      size="sm"
                    className="w-full"
                    >
                      <Icon icon="solar:download-bold-duotone" className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  )}
                </div>
              ))}
          </div>
        </Card>
      )}
    </div>
  );
}