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
import { Badge } from '@/components/ui/badge';
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
}

export function CropToolV2({ 
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
    quality: 90
  });
  const [processedFiles, setProcessedFiles] = useState<File[]>([]);
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [previewMode, setPreviewMode] = useState<'before' | 'after' | 'split'>('before');
  const [isAdvancedModalOpen, setIsAdvancedModalOpen] = useState(false);

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
    <div className="space-y-6">
      {/* Clean Professional Layout */}
      <div className="space-y-6">
        
        {/* Live Preview - Moved to Top */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Icon icon="solar:eye-bold-duotone" className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Preview</h3>
            </div>
            
            {/* Preview Mode Toggle */}
            <div className="flex items-center gap-2">
              <Button
                variant={previewMode === 'before' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPreviewMode('before')}
              >
                Before
              </Button>
              <Button
                variant={previewMode === 'after' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPreviewMode('after')}
              >
                After
              </Button>
              <Button
                variant={previewMode === 'split' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPreviewMode('split')}
              >
                Split
              </Button>
            </div>
          </div>

          {/* Image Preview Area */}
          <div className="relative bg-gray-100 rounded-lg overflow-hidden mb-4" style={{ aspectRatio: '16/9' }}>
            {files[selectedFileIndex] && (
              <img
                src={URL.createObjectURL(files[selectedFileIndex])}
                alt="Preview"
                className="w-full h-full object-contain"
              />
            )}
            
            {/* Crop Overlay */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-8 border-2 border-dashed border-blue-500 rounded-lg">
                <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-blue-500"></div>
                <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-blue-500"></div>
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-blue-500"></div>
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-blue-500"></div>
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
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Current: {files[selectedFileIndex]?.name}</span>
            <span>Aspect: {settings.aspectRatio}</span>
            <span>Rotation: {settings.rotation}°</span>
          </div>
        </Card>

        {/* Professional Tool Controls Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Aspect Ratio Tool */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Icon icon="solar:aspect-ratio-bold-duotone" className="h-4 w-4 text-gray-600" />
              <Label className="text-sm font-medium text-gray-700">Aspect Ratio</Label>
            </div>
            
            <div className="space-y-3">
              {/* Main Dropdown */}
              <div className="relative">
                <select
                  value={settings.aspectRatio}
                  onChange={(e) => handleSettingChange('aspectRatio', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="free">Free (Any size)</option>
                  <option value="1:1">1:1 (Square)</option>
                  <option value="4:3">4:3 (Standard)</option>
                  <option value="16:9">16:9 (Widescreen)</option>
                  <option value="3:2">3:2 (Photo)</option>
                  <option value="custom">Custom Ratio</option>
                </select>
              </div>

              {/* Custom Ratio Input */}
              {settings.aspectRatio === 'custom' && (
                <div className="flex items-center gap-2">
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
          </Card>

          {/* Quick Actions Tool */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Icon icon="solar:refresh-bold-duotone" className="h-4 w-4 text-gray-600" />
              <Label className="text-sm font-medium text-gray-700">Transform</Label>
            </div>
            
            <div className="space-y-3">
              {/* Rotation Controls */}
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
              
              {/* Flip Controls - Fixed to be momentary actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Apply flip and immediately reset the visual state
                    handleSettingChange('flipHorizontal', !settings.flipHorizontal);
                    // Reset visual state after a brief moment
                    setTimeout(() => {
                      // This ensures the button doesn't stay "selected"
                    }, 100);
                  }}
                  className="flex-1"
                >
                  <Icon icon="solar:mirror-bold-duotone" className="h-4 w-4 mr-1" />
                  Flip H
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Apply flip and immediately reset the visual state
                    handleSettingChange('flipVertical', !settings.flipVertical);
                    // Reset visual state after a brief moment
                    setTimeout(() => {
                      // This ensures the button doesn't stay "selected"
                    }, 100);
                  }}
                  className="flex-1"
                >
                  <Icon icon="solar:mirror-bold-duotone" className="h-4 w-4 mr-1" />
                  Flip V
                </Button>
              </div>
              
              {/* Reset Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  handleSettingChange('rotation', 0);
                  handleSettingChange('flipHorizontal', false);
                  handleSettingChange('flipVertical', false);
                }}
                className="w-full"
              >
                <Icon icon="solar:refresh-bold-duotone" className="h-4 w-4 mr-1" />
                Reset All
              </Button>
            </div>
          </Card>

          {/* Output Format Tool */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Icon icon="solar:file-bold-duotone" className="h-4 w-4 text-gray-600" />
              <Label className="text-sm font-medium text-gray-700">Output Format</Label>
            </div>
            
            <div className="space-y-3">
              <div className="relative">
                <select
                  value={settings.outputFormat}
                  onChange={(e) => handleSettingChange('outputFormat', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="original">Original Format</option>
                  <option value="jpeg">JPEG (Smaller)</option>
                  <option value="png">PNG (High Quality)</option>
                  <option value="webp">WebP (Modern)</option>
                </select>
              </div>
              
              {/* Quality Slider for JPEG/WebP */}
              {(settings.outputFormat === 'jpeg' || settings.outputFormat === 'webp') && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
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
          </Card>
        </div>

        {/* Advanced Settings */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Icon icon="solar:magic-stick-bold-duotone" className="h-4 w-4 text-gray-600" />
              <Label className="text-sm font-medium text-gray-700">Advanced Features</Label>
            </div>
            
            <Dialog open={isAdvancedModalOpen} onOpenChange={setIsAdvancedModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Icon icon="solar:settings-bold-duotone" className="h-4 w-4 mr-1" />
                  More Settings
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
                    {/* Smart Features */}
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
                    {/* Rotation */}
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
                    {/* Quality Settings */}
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

          {/* Quick Smart Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </Card>
      </div>

      {/* Clean Process Button */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon icon="solar:crop-bold-duotone" className="h-5 w-5 text-green-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Process Images</h3>
              <p className="text-sm text-gray-600">AI-powered smart cropping with face detection</p>
            </div>
          </div>
          
          <Button
            onClick={handleProcess}
            className="bg-green-600 hover:bg-green-700 px-6 py-3"
            size="lg"
          >
            <Icon icon="solar:crop-bold-duotone" className="h-5 w-5 mr-2" />
            Crop Images ({files.length})
          </Button>
        </div>
        
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
      </Card>

      {/* Results */}
      {processedFiles.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Cropped Images ({processedFiles.length})
            </h3>
            <Button onClick={downloadResults} className="bg-green-600 hover:bg-green-700">
              <Icon icon="solar:download-bold-duotone" className="h-4 w-4 mr-2" />
              Download All
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
        </Card>
      )}
    </div>
  );
}
