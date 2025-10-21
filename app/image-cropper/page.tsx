'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Navigation } from '@/components/layout/navigation';
import { Footer } from '@/components/layout/footer';
import { FileValidator } from '@/lib/image-processing';
import Link from 'next/link';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface CropSettings {
  aspectRatio: 'free' | '1:1' | '4:3' | '16:9' | '3:2' | 'custom';
  customRatio: { width: number; height: number };
  customWidth: number;
  customHeight: number;
  rotation: number;
  flipHorizontal: boolean;
  flipVertical: boolean;
  outputFormat: 'original' | 'jpeg' | 'png' | 'webp';
  quality: number;
  smartCrop: boolean;
  faceDetection: boolean;
}

export default function ImageCropperPage() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processedFiles, setProcessedFiles] = useState<{ file: File; url: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  
  const [settings, setSettings] = useState<CropSettings>({
    aspectRatio: 'free',
    customRatio: { width: 800, height: 600 },
    customWidth: 800,
    customHeight: 600,
    rotation: 0,
    flipHorizontal: false,
    flipVertical: false,
    outputFormat: 'original',
    quality: 95,
    smartCrop: false,
    faceDetection: false,
  });

  const handleFileSelect = useCallback((files: File[]) => {
    try {
      const validFiles = files.filter(file => {
        try {
          const result = FileValidator.validateFile(file);
          return result.valid;
        } catch (error) {
          console.error('File validation error:', error);
          return false;
        }
      });
      
      if (validFiles.length > 0) {
        setSelectedFiles(validFiles);
        setCurrentFileIndex(0);
        // Only reset crop if this is the first file or if files actually changed
        if (selectedFiles.length === 0 || validFiles[0] !== selectedFiles[0]) {
          setCrop(undefined);
          setCompletedCrop(undefined);
        }
      }
    } catch (error) {
      console.error('Error in handleFileSelect:', error);
    }
  }, []);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const files = Array.from(e.target.files || []);
      handleFileSelect(files);
    } catch (error) {
      console.error('Error in handleFileInputChange:', error);
    }
  }, [handleFileSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    try {
      e.preventDefault();
      const files = Array.from(e.dataTransfer.files);
      handleFileSelect(files);
    } catch (error) {
      console.error('Error in handleDrop:', error);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    try {
      e.preventDefault();
    } catch (error) {
      console.error('Error in handleDragOver:', error);
    }
  }, []);

  const handleSettingChange = useCallback((key: keyof CropSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  // Get aspect ratio value
  const getAspectRatio = useCallback(() => {
    switch (settings.aspectRatio) {
      case '1:1':
        return 1;
      case '4:3':
        return 4 / 3;
      case '16:9':
        return 16 / 9;
      case '3:2':
        return 3 / 2;
      case 'custom':
        return settings.customWidth / settings.customHeight;
      case 'free':
      default:
        return undefined; // Free means no aspect ratio constraint
    }
  }, [settings.aspectRatio, settings.customWidth, settings.customHeight]);

  // Initialize crop when image loads
  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const aspectRatio = getAspectRatio();
    
    // Only set crop if it doesn't exist yet
    if (!crop) {
      if (aspectRatio) {
        const newCrop = centerCrop(
          makeAspectCrop(
            {
              unit: '%',
              width: 80,
            },
            aspectRatio,
            width,
            height
          ),
          width,
          height
        );
        setCrop(newCrop);
      } else {
        // Free crop - start with a centered crop
        setCrop({
          unit: '%',
          x: 10,
          y: 10,
          width: 80,
          height: 80,
        });
      }
    }
  }, [getAspectRatio, crop]);

  // Convert crop to canvas and create cropped image
  const getCroppedImg = useCallback((
    image: HTMLImageElement,
    crop: PixelCrop,
    fileName: string,
    format: string = 'image/jpeg',
    quality: number = 0.9
  ): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('No 2d context');
      }

      // Calculate the scale factors between the displayed image and the natural image
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      // Calculate actual crop dimensions in natural image coordinates
      const actualCropWidth = crop.width * scaleX;
      const actualCropHeight = crop.height * scaleY;

      // Set canvas size to the actual crop dimensions (use natural image resolution)
      canvas.width = actualCropWidth;
      canvas.height = actualCropHeight;

      // Enable high-quality image rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Clear the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Apply transformations
      ctx.save();

      // Apply rotation
      if (settings.rotation !== 0) {
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((settings.rotation * Math.PI) / 180);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);
      }

      // Apply flip
      if (settings.flipHorizontal || settings.flipVertical) {
        ctx.scale(
          settings.flipHorizontal ? -1 : 1,
          settings.flipVertical ? -1 : 1
        );
        if (settings.flipHorizontal) {
          ctx.translate(-canvas.width, 0);
        }
        if (settings.flipVertical) {
          ctx.translate(0, -canvas.height);
        }
      }

      // Draw the cropped portion of the image
      ctx.drawImage(
        image,
        crop.x * scaleX,           // Source x
        crop.y * scaleY,           // Source y
        actualCropWidth,           // Source width
        actualCropHeight,          // Source height
        0,                         // Destination x
        0,                         // Destination y
        actualCropWidth,           // Destination width
        actualCropHeight           // Destination height
      );

      ctx.restore();

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            throw new Error('Canvas is empty');
          }
          const file = new File([blob], fileName, { type: format });
          resolve(file);
        },
        format,
        quality
      );
    });
  }, [settings.rotation, settings.flipHorizontal, settings.flipVertical]);

  const handleProcess = useCallback(async () => {
    if (!completedCrop || !imgRef.current) {
      alert('Please select a crop area first');
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(0);

    try {
      const results: { file: File; url: string }[] = [];

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        
        // Use the current image element for cropping
        const img = imgRef.current;
        if (!img) continue;

        const croppedFile = await getCroppedImg(
          img,
          completedCrop,
          `cropped_${file.name}`,
          settings.outputFormat === 'original' ? file.type : `image/${settings.outputFormat}`,
          settings.quality / 100
        );

        results.push({
          file: croppedFile,
          url: URL.createObjectURL(croppedFile)
        });

        setProcessingProgress((i + 1) / selectedFiles.length * 100);
      }

      setProcessedFiles(results);
    } catch (error) {
      console.error('Error processing images:', error);
      alert('Error processing images. Please try again.');
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  }, [completedCrop, selectedFiles, getCroppedImg, settings.outputFormat, settings.quality]);

  const handleDownload = useCallback((url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const handleDownloadAll = useCallback(() => {
    processedFiles.forEach(({ file, url }) => {
      const link = document.createElement('a');
      link.href = url;
      link.download = `cropped_${file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }, [processedFiles]);

  const aspectRatioPresets = [
    { value: 'free', label: 'Free', icon: 'solar:crop-bold-duotone' },
    { value: '1:1', label: '1:1 Square', icon: 'solar:square-bold-duotone' },
    { value: '4:3', label: '4:3 Standard', icon: 'solar:rectangle-bold-duotone' },
    { value: '16:9', label: '16:9 Widescreen', icon: 'solar:rectangle-bold-duotone' },
    { value: '3:2', label: '3:2 Photo', icon: 'solar:rectangle-bold-duotone' },
    { value: 'custom', label: 'Custom', icon: 'solar:settings-bold-duotone' },
  ];

  const outputFormats = [
    { value: 'original', label: 'Original Format' },
    { value: 'jpeg', label: 'JPEG' },
    { value: 'png', label: 'PNG' },
    { value: 'webp', label: 'WebP' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <Navigation />
      
      {/* Header Section */}
      <section className="relative pt-24 pb-12 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1)_0%,transparent_50%)]"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight tracking-tight">
              Free Image Cropper
            </h1>
            <p className="text-xl md:text-2xl text-slate-200 mb-6 font-medium">
              Crop images with precision using our professional crop tool
            </p>
            <p className="text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
              Professional-grade image cropping with aspect ratio presets, rotation controls, and visual crop handles. 
              No registration required - start cropping for free!
            </p>
          </div>
        </div>
      </section>

      {/* Ad Section */}
      <div className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-32 bg-gray-200 rounded-lg flex items-center justify-center">
            <span className="text-gray-400">Google AdSense Banner</span>
          </div>
        </div>
      </div>

      {/* Main Cropping Interface */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Crop Your Images</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Upload your images and crop them with our professional tools
            </p>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Uploader and Preview */}
            <div className="space-y-6">
              {/* Upload Area */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Images</h3>
                
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-400 transition-colors cursor-pointer bg-gray-50"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => {
                    try {
                      fileInputRef.current?.click();
                    } catch (error) {
                      console.error('Error clicking file input:', error);
                    }
                  }}
                >
                  <Icon icon="solar:upload-bold-duotone" className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    Drop images here or click to browse
                  </h4>
                  <p className="text-gray-600 mb-4">
                    Supports JPG, PNG, WEBP, GIF (max 10MB each)
                  </p>
                  <Button size="lg" className="bg-green-600 hover:bg-green-700">
                    <Icon icon="solar:upload-bold-duotone" className="h-5 w-5 mr-2" />
                    Choose Images
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                </div>
              </Card>

              {/* Image Preview with Crop */}
              {selectedFiles.length > 0 && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Crop Preview</h3>
                  <div className="relative bg-gray-100 rounded-lg border border-gray-200 overflow-hidden">
                    <ReactCrop
                      crop={crop}
                      onChange={(_, percentCrop) => setCrop(percentCrop)}
                      onComplete={(c) => setCompletedCrop(c)}
                      aspect={getAspectRatio()}
                      className="max-h-96"
                      minWidth={50}
                      minHeight={50}
                    >
                      <img
                        ref={imgRef}
                        alt="Crop me"
                        src={URL.createObjectURL(selectedFiles[currentFileIndex])}
                        style={{ 
                          maxHeight: '500px',
                          width: '100%',
                          height: 'auto',
                          display: 'block',
                          imageRendering: 'auto'
                        }}
                        onLoad={onImageLoad}
                      />
                    </ReactCrop>
                  </div>
                  
                  {/* File Info */}
                  <div className="mt-4">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {selectedFiles[currentFileIndex]?.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {selectedFiles[currentFileIndex] && FileValidator.formatFileSize(selectedFiles[currentFileIndex].size)}
                    </div>
                  </div>
                  
                  {/* File Navigation */}
                  {selectedFiles.length > 1 && (
                    <div className="flex items-center justify-between mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentFileIndex(Math.max(0, currentFileIndex - 1))}
                        disabled={currentFileIndex === 0}
                      >
                        <Icon icon="solar:arrow-left-bold-duotone" className="h-4 w-4 mr-1" />
                        Previous
                      </Button>
                      <span className="text-sm text-gray-500">
                        {currentFileIndex + 1} of {selectedFiles.length}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentFileIndex(Math.min(selectedFiles.length - 1, currentFileIndex + 1))}
                        disabled={currentFileIndex === selectedFiles.length - 1}
                      >
                        Next
                        <Icon icon="solar:arrow-right-bold-duotone" className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  )}
                </Card>
              )}
            </div>

            {/* Right Column - Tools */}
            <div className="space-y-6">
              {/* Aspect Ratio */}
              <Card className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Aspect Ratio</h3>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="aspect-ratio">Preset</Label>
                    <Select
                      value={settings.aspectRatio}
                      onValueChange={(value) => {
                        handleSettingChange('aspectRatio', value);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {aspectRatioPresets.map((preset) => (
                          <SelectItem key={preset.value} value={preset.value}>
                            <div className="flex items-center gap-2">
                              <Icon icon={preset.icon} className="h-4 w-4" />
                              {preset.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {settings.aspectRatio === 'custom' && (
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="width">Width</Label>
                        <Input
                          id="width"
                          type="number"
                          value={settings.customWidth}
                          onChange={(e) => {
                            const width = parseInt(e.target.value);
                            handleSettingChange('customWidth', width);
                            handleSettingChange('customRatio', { width, height: settings.customHeight });
                          }}
                        />
                      </div>
                      <div>
                        <Label htmlFor="height">Height</Label>
                        <Input
                          id="height"
                          type="number"
                          value={settings.customHeight}
                          onChange={(e) => {
                            const height = parseInt(e.target.value);
                            handleSettingChange('customHeight', height);
                            handleSettingChange('customRatio', { width: settings.customWidth, height });
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Rotation */}
              <Card className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Rotation</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="rotation">Angle: {settings.rotation}°</Label>
                    <Slider
                      id="rotation"
                      min={-180}
                      max={180}
                      step={1}
                      value={[settings.rotation]}
                      onValueChange={(value) => handleSettingChange('rotation', value[0])}
                      className="mt-2"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSettingChange('rotation', settings.rotation - 90)}
                      className="flex-1"
                    >
                      <Icon icon="solar:rotate-left-bold-duotone" className="h-4 w-4 mr-1" />
                      -90°
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSettingChange('rotation', settings.rotation + 90)}
                      className="flex-1"
                    >
                      <Icon icon="solar:rotate-right-bold-duotone" className="h-4 w-4 mr-1" />
                      +90°
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Flip */}
              <Card className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Flip</h3>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSettingChange('flipHorizontal', !settings.flipHorizontal)}
                    className="flex-1"
                  >
                    <Icon icon="solar:mirror-bold-duotone" className="h-4 w-4 mr-1" />
                    Flip H
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSettingChange('flipVertical', !settings.flipVertical)}
                    className="flex-1"
                  >
                    <Icon icon="solar:mirror-bold-duotone" className="h-4 w-4 mr-1" />
                    Flip V
                  </Button>
                </div>
              </Card>

              {/* Output Settings */}
              <Card className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Output Settings</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="format">Format</Label>
                    <Select
                      value={settings.outputFormat}
                      onValueChange={(value) => handleSettingChange('outputFormat', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {outputFormats.map((format) => (
                          <SelectItem key={format.value} value={format.value}>
                            {format.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {settings.outputFormat === 'jpeg' && (
                    <div>
                      <Label htmlFor="quality">Quality: {settings.quality}%</Label>
                      <Slider
                        id="quality"
                        min={10}
                        max={100}
                        step={5}
                        value={[settings.quality]}
                        onValueChange={(value) => handleSettingChange('quality', value[0])}
                        className="mt-2"
                      />
                    </div>
                  )}
                </div>
              </Card>

              {/* Advanced Features */}
              <Card className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Advanced Features</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="smart-crop">Smart Crop</Label>
                    <Switch
                      id="smart-crop"
                      checked={settings.smartCrop}
                      onCheckedChange={(checked) => handleSettingChange('smartCrop', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="face-detection">Face Detection</Label>
                    <Switch
                      id="face-detection"
                      checked={settings.faceDetection}
                      onCheckedChange={(checked) => handleSettingChange('faceDetection', checked)}
                    />
                  </div>
                </div>
              </Card>

              {/* Process Button */}
              <Card className="p-4">
                <Button
                  onClick={handleProcess}
                  className="w-full bg-green-600 hover:bg-green-700"
                  size="lg"
                  disabled={selectedFiles.length === 0 || !completedCrop}
                >
                  <Icon icon="solar:crop-bold-duotone" className="h-5 w-5 mr-2" />
                  Crop Images ({selectedFiles.length})
                </Button>
                
                {/* Processing Status */}
                {isProcessing && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-medium text-gray-700">Processing...</span>
                      <span className="text-lg text-gray-500">{Math.round(processingProgress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-green-600 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${processingProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Download Results */}
                {processedFiles.length > 0 && (
                  <div className="mt-4">
                    <Button
                      onClick={handleDownloadAll}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      size="lg"
                    >
                      <Icon icon="solar:download-bold-duotone" className="h-5 w-5 mr-2" />
                      Download All ({processedFiles.length})
                    </Button>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Ad Section */}
      <div className="py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-32 bg-gray-200 rounded-lg flex items-center justify-center">
            <span className="text-gray-400">Google AdSense Banner</span>
          </div>
        </div>
      </div>

      {/* How-to Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How to Crop Images</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Follow these simple steps to crop your images with precision
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 border-2 border-green-200 mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">1</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Images</h3>
              <p className="text-gray-600">
                Drag and drop your images or click to browse. Supports JPG, PNG, WEBP, and GIF formats.
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 border-2 border-green-200 mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Select Crop Area</h3>
              <p className="text-gray-600">
                Use the interactive crop tool to drag and resize the crop area. Choose from aspect ratio presets.
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 border-2 border-green-200 mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">3</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Adjust Settings</h3>
              <p className="text-gray-600">
                Fine-tune your crop with rotation controls, flip options, and custom aspect ratios.
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 border-2 border-green-200 mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">4</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Download Results</h3>
              <p className="text-gray-600">
                Click "Crop Images" and download your cropped images. All processing happens in your browser.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}