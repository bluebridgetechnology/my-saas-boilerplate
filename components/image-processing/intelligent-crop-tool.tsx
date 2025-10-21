'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LazyToolWrapper } from './lazy-tool-wrapper';
import { FileValidator } from '@/lib/image-processing';

// Lazy load the heavy crop component with TensorFlow.js
const CropToolCore = React.lazy(() => 
  import('./crop-tool-core').then(module => ({
    default: module.CropToolCore
  }))
);

interface CropToolProps {
  files: File[];
  onProcessingStart: () => void;
  onProcessingEnd: () => void;
  onProgress: (progress: number) => void;
}

interface CropSettings {
  aspectRatio: 'free' | '1:1' | '4:3' | '16:9' | '3:2' | 'custom';
  customRatio: { width: number; height: number };
  rotation: number;
  flipHorizontal: boolean;
  flipVertical: boolean;
  smartCrop: boolean;
  faceDetection: boolean;
  outputFormat: 'original' | 'jpeg' | 'png' | 'webp';
  quality: number;
  cropArea: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export function IntelligentCropTool({ 
  files, 
  onProcessingStart, 
  onProcessingEnd, 
  onProgress 
}: CropToolProps) {
  const [settings, setSettings] = useState<CropSettings>({
    aspectRatio: 'free',
    customRatio: { width: 1, height: 1 },
    rotation: 0,
    flipHorizontal: false,
    flipVertical: false,
    smartCrop: false,
    faceDetection: false,
    outputFormat: 'original',
    quality: 90,
    cropArea: { x: 0, y: 0, width: 0, height: 0 }
  });
  const [processedFiles, setProcessedFiles] = useState<File[]>([]);
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [isAdvancedModalOpen, setIsAdvancedModalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleSettingChange = (key: keyof CropSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleCustomRatioChange = (field: 'width' | 'height', value: number) => {
    setSettings(prev => ({
      ...prev,
      customRatio: { ...prev.customRatio, [field]: value }
    }));
  };

  const handleProcess = useCallback(async () => {
    if (files.length === 0) return;

    onProcessingStart();
    try {
      onProgress(100);
    } catch (error) {
      console.error('Crop processing failed:', error);
    } finally {
      onProcessingEnd();
    }
  }, [files, onProcessingStart, onProcessingEnd, onProgress]);

  const downloadResults = () => {
    processedFiles.forEach((file, index) => {
      const url = URL.createObjectURL(file);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cropped-${index + 1}.${settings.outputFormat === 'original' ? 'jpg' : settings.outputFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  };

  // Initialize crop area when image loads
  useEffect(() => {
    if (files[selectedFileIndex]) {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (canvas) {
          const rect = canvas.getBoundingClientRect();
          const scaleX = img.width / rect.width;
          const scaleY = img.height / rect.height;
          
          setSettings(prev => ({
            ...prev,
            cropArea: {
              x: 0,
              y: 0,
              width: img.width,
              height: img.height
            }
          }));
        }
      };
      img.src = URL.createObjectURL(files[selectedFileIndex]);
    }
  }, [files, selectedFileIndex]);

  if (files.length === 0) {
    return (
      <div className="text-center py-12">
        <Icon icon="solar:crop-bold-duotone" className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h4 className="text-lg font-medium text-gray-500 mb-2">No Images Selected</h4>
        <p className="text-gray-400">
          Upload images to start cropping them with precision tools
        </p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-gray-900">Image Cropper</h1>
            <span className="text-sm text-gray-500">{files[selectedFileIndex]?.name}</span>
          </div>
          <Button
            onClick={downloadResults}
            className="bg-green-600 hover:bg-green-700"
            disabled={processedFiles.length === 0}
          >
            <Icon icon="solar:download-bold-duotone" className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - File Management */}
        <div className="w-64 bg-white border-r border-gray-200 p-4">
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Files</h3>
            {files.map((file, index) => (
              <div 
                key={index}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedFileIndex === index 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedFileIndex(index)}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="w-10 h-10 object-cover rounded border"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {FileValidator.formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center - Image Preview with Interactive Crop */}
        <div className="flex-1 flex flex-col">
          {/* Image Canvas */}
          <div className="flex-1 relative bg-gray-100 overflow-hidden">
            <canvas
              ref={canvasRef}
              className="w-full h-full object-contain cursor-crosshair"
              onMouseDown={(e) => {
                setIsDragging(true);
                const rect = e.currentTarget.getBoundingClientRect();
                setDragStart({
                  x: e.clientX - rect.left,
                  y: e.clientY - rect.top
                });
              }}
              onMouseMove={(e) => {
                if (isDragging) {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const currentX = e.clientX - rect.left;
                  const currentY = e.clientY - rect.top;
                  
                  // Update crop area based on drag
                  const newX = Math.min(dragStart.x, currentX);
                  const newY = Math.min(dragStart.y, currentY);
                  const newWidth = Math.abs(currentX - dragStart.x);
                  const newHeight = Math.abs(currentY - dragStart.y);
                  
                  setSettings(prev => ({
                    ...prev,
                    cropArea: {
                      x: newX,
                      y: newY,
                      width: newWidth,
                      height: newHeight
                    }
                  }));
                }
              }}
              onMouseUp={() => setIsDragging(false)}
            />
            
            {/* Crop Overlay */}
            <div className="absolute inset-0 pointer-events-none">
              <div 
                className="absolute border-2 border-blue-500 bg-blue-500 bg-opacity-20"
                style={{
                  left: settings.cropArea.x,
                  top: settings.cropArea.y,
                  width: settings.cropArea.width,
                  height: settings.cropArea.height
                }}
              >
                {/* Corner handles */}
                <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></div>
                <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></div>
              </div>
            </div>

            {/* Zoom Controls */}
            <div className="absolute bottom-4 right-4 flex flex-col gap-2">
              <Button size="sm" variant="secondary" className="w-8 h-8 p-0">
                <Icon icon="solar:zoom-in-bold-duotone" className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="secondary" className="w-8 h-8 p-0">
                <Icon icon="solar:zoom-out-bold-duotone" className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Preview Info */}
          <div className="bg-white border-t border-gray-200 px-6 py-3">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Crop: {Math.round(settings.cropArea.width)} × {Math.round(settings.cropArea.height)} px</span>
              <span>Aspect: {settings.aspectRatio}</span>
              <span>Rotation: {settings.rotation}°</span>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Tools */}
        <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto">
          <div className="space-y-6">
            
            {/* Aspect Ratio */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Aspect Ratio</h3>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'free', label: 'Free', icon: 'solar:expand-bold-duotone' },
                  { value: '1:1', label: '1:1', icon: 'solar:square-bold-duotone' },
                  { value: '4:3', label: '4:3', icon: 'solar:rectangle-bold-duotone' },
                  { value: '16:9', label: '16:9', icon: 'solar:rectangle-bold-duotone' },
                  { value: '3:2', label: '3:2', icon: 'solar:rectangle-bold-duotone' },
                  { value: 'custom', label: 'Custom', icon: 'solar:settings-bold-duotone' }
                ].map((ratio) => (
                  <Button
                    key={ratio.value}
                    variant={settings.aspectRatio === ratio.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleSettingChange('aspectRatio', ratio.value)}
                    className="flex flex-col items-center gap-1 h-auto py-2"
                  >
                    <Icon icon={ratio.icon} className="h-4 w-4" />
                    <span className="text-xs">{ratio.label}</span>
                  </Button>
                ))}
              </div>
              
              {/* Custom Ratio Input */}
              {settings.aspectRatio === 'custom' && (
                <div className="mt-3 flex items-center gap-2">
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    value={settings.customRatio.width}
                    onChange={(e) => handleCustomRatioChange('width', parseInt(e.target.value))}
                    className="w-16 text-center"
                    placeholder="W"
                  />
                  <span className="text-gray-500">:</span>
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    value={settings.customRatio.height}
                    onChange={(e) => handleCustomRatioChange('height', parseInt(e.target.value))}
                    className="w-16 text-center"
                    placeholder="H"
                  />
                </div>
              )}
            </div>

            {/* Crop Dimensions */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Crop Dimensions</h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-gray-600">Width</Label>
                  <Input
                    type="number"
                    value={Math.round(settings.cropArea.width)}
                    onChange={(e) => {
                      const width = parseInt(e.target.value) || 0;
                      setSettings(prev => ({
                        ...prev,
                        cropArea: { ...prev.cropArea, width }
                      }));
                    }}
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Height</Label>
                  <Input
                    type="number"
                    value={Math.round(settings.cropArea.height)}
                    onChange={(e) => {
                      const height = parseInt(e.target.value) || 0;
                      setSettings(prev => ({
                        ...prev,
                        cropArea: { ...prev.cropArea, height }
                      }));
                    }}
                    className="text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Position */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Position</h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-gray-600">X</Label>
                  <Input
                    type="number"
                    value={Math.round(settings.cropArea.x)}
                    onChange={(e) => {
                      const x = parseInt(e.target.value) || 0;
                      setSettings(prev => ({
                        ...prev,
                        cropArea: { ...prev.cropArea, x }
                      }));
                    }}
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Y</Label>
                  <Input
                    type="number"
                    value={Math.round(settings.cropArea.y)}
                    onChange={(e) => {
                      const y = parseInt(e.target.value) || 0;
                      setSettings(prev => ({
                        ...prev,
                        cropArea: { ...prev.cropArea, y }
                      }));
                    }}
                    className="text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Rotate */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Rotate</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-gray-600">Angle</Label>
                  <Input
                    type="number"
                    value={settings.rotation}
                    onChange={(e) => handleSettingChange('rotation', parseInt(e.target.value))}
                    className="flex-1 text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSettingChange('rotation', 0)}
                  >
                    Reset
                  </Button>
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
            </div>

            {/* Flip - Fixed to be momentary actions */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Flip</h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Apply flip transformation immediately
                    handleSettingChange('flipHorizontal', !settings.flipHorizontal);
                  }}
                  className="flex-1"
                >
                  <Icon icon="solar:mirror-bold-duotone" className="h-4 w-4 mr-1" />
                  Horizontal
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Apply flip transformation immediately
                    handleSettingChange('flipVertical', !settings.flipVertical);
                  }}
                  className="flex-1"
                >
                  <Icon icon="solar:mirror-bold-duotone" className="h-4 w-4 mr-1" />
                  Vertical
                </Button>
              </div>
            </div>

            {/* Output Settings */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Output Settings</h3>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-gray-600">Format</Label>
                  <select
                    value={settings.outputFormat}
                    onChange={(e) => handleSettingChange('outputFormat', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="original">Original Format</option>
                    <option value="jpeg">JPEG</option>
                    <option value="png">PNG</option>
                    <option value="webp">WebP</option>
                  </select>
                </div>
                
                {(settings.outputFormat === 'jpeg' || settings.outputFormat === 'webp') && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <Label className="text-xs text-gray-600">Quality</Label>
                      <span className="text-xs text-gray-600">{settings.quality}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      step="10"
                      value={settings.quality}
                      onChange={(e) => handleSettingChange('quality', parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Advanced Features */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-700">Advanced Features</h3>
                <Dialog open={isAdvancedModalOpen} onOpenChange={setIsAdvancedModalOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Icon icon="solar:settings-bold-duotone" className="h-4 w-4 mr-1" />
                      More
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Advanced Crop Settings</DialogTitle>
                    </DialogHeader>
                    
                    <Tabs defaultValue="crop" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="crop">Crop</TabsTrigger>
                        <TabsTrigger value="transform">Transform</TabsTrigger>
                        <TabsTrigger value="output">Output</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="crop" className="space-y-4">
                        <div className="space-y-3">
                          <Label className="text-base font-semibold">Smart Features</Label>
                          <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                              <Switch
                                checked={settings.smartCrop}
                                onCheckedChange={(checked) => handleSettingChange('smartCrop', checked)}
                              />
                              <div>
                                <Label className="text-sm font-medium">Smart Crop (AI)</Label>
                                <p className="text-xs text-gray-500">Auto-detect subjects</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <Switch
                                checked={settings.faceDetection}
                                onCheckedChange={(checked) => handleSettingChange('faceDetection', checked)}
                              />
                              <div>
                                <Label className="text-sm font-medium">Face Detection</Label>
                                <p className="text-xs text-gray-500">Focus on faces</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="transform" className="space-y-4">
                        <div className="space-y-3">
                          <Label className="text-base font-semibold">Rotation</Label>
                          <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-sm font-medium">Current: {settings.rotation}°</span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSettingChange('rotation', 0)}
                              >
                                Reset
                              </Button>
                            </div>
                            <input
                              type="range"
                              min="-180"
                              max="180"
                              step="15"
                              value={settings.rotation}
                              onChange={(e) => handleSettingChange('rotation', parseInt(e.target.value))}
                              className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer slider"
                            />
                            <div className="flex justify-between text-xs text-purple-600 mt-2">
                              <span>-180°</span>
                              <span>0°</span>
                              <span>180°</span>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="output" className="space-y-4">
                        <div className="space-y-3">
                          <Label className="text-base font-semibold">Quality</Label>
                          <div className="p-4 bg-gray-50 rounded-xl">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-sm font-medium">Quality: {settings.quality}%</span>
                            </div>
                            <input
                              type="range"
                              min="10"
                              max="100"
                              step="10"
                              value={settings.quality}
                              onChange={(e) => handleSettingChange('quality', parseInt(e.target.value))}
                              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="flex justify-between text-xs text-gray-600 mt-2">
                              <span>10%</span>
                              <span>100%</span>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Switch
                    checked={settings.smartCrop}
                    onCheckedChange={(checked) => handleSettingChange('smartCrop', checked)}
                  />
                  <div>
                    <Label className="text-sm font-medium">Smart Crop (AI)</Label>
                    <p className="text-xs text-gray-500">Auto-detect subjects</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Switch
                    checked={settings.faceDetection}
                    onCheckedChange={(checked) => handleSettingChange('faceDetection', checked)}
                  />
                  <div>
                    <Label className="text-sm font-medium">Face Detection</Label>
                    <p className="text-xs text-gray-500">Focus on faces</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Apply Crop Button */}
            <div className="pt-4 border-t border-gray-200">
              <Button
                onClick={handleProcess}
                className="w-full bg-green-600 hover:bg-green-700"
                size="lg"
              >
                <Icon icon="solar:crop-bold-duotone" className="h-5 w-5 mr-2" />
                Apply Crop
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Processing Tool */}
      <LazyToolWrapper toolName="Image Cropper">
        <CropToolCore
          files={files}
          settings={settings}
          onProcessingStart={onProcessingStart}
          onProcessingEnd={onProcessingEnd}
          onProgress={onProgress}
          onResults={setProcessedFiles}
        />
      </LazyToolWrapper>

      {/* Results */}
      {processedFiles.length > 0 && (
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Cropped Images ({processedFiles.length})
            </h3>
            <div className="flex gap-2">
              <Button onClick={downloadResults} variant="outline">
                <Icon icon="solar:download-bold-duotone" className="h-4 w-4 mr-2" />
                Download All
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-4 mt-4">
            {processedFiles.map((file, index) => (
              <div key={index} className="relative group">
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Cropped ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg border border-gray-200"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => {
                      const url = URL.createObjectURL(file);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `cropped-${index + 1}.${settings.outputFormat === 'original' ? 'jpg' : settings.outputFormat}`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    }}
                  >
                    <Icon icon="solar:download-bold-duotone" className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
