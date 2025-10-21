'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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

export function CropTool({ 
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
  const [showPreview, setShowPreview] = useState(false);
  const [processedFiles, setProcessedFiles] = useState<File[]>([]);
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);

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
      // The actual processing will be handled by the lazy-loaded core component
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
      {/* Settings Panel */}
      <Card className="p-6 bg-gradient-to-br from-white to-gray-50 border-0 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-green-100 border-2 border-green-200">
            <Icon icon="solar:crop-bold-duotone" className="h-5 w-5 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Crop Settings</h3>
        </div>
            
        <div className="grid grid-cols-1 gap-8">
          {/* Aspect Ratio */}
          <div className="space-y-4">
            <Label className="text-base font-semibold text-gray-800 flex items-center gap-2">
              <Icon icon="solar:aspect-ratio-bold-duotone" className="h-4 w-4 text-blue-600" />
              Aspect Ratio
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {/* Free */}
              <div className="relative">
                <input
                  type="radio"
                  id="free"
                  name="aspectRatio"
                  value="free"
                  checked={settings.aspectRatio === 'free'}
                  onChange={(e) => handleSettingChange('aspectRatio', e.target.value)}
                  className="sr-only"
                />
                <label
                  htmlFor="free"
                  className={`flex flex-col items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                    settings.aspectRatio === 'free'
                      ? 'border-green-500 bg-green-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="w-12 h-12 rounded-lg border-2 border-gray-300 bg-gradient-to-br from-gray-100 to-gray-200 mb-2 flex items-center justify-center">
                    <Icon icon="solar:expand-bold-duotone" className="h-6 w-6 text-gray-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Free</span>
                  <span className="text-xs text-gray-500">Any size</span>
                </label>
              </div>

              {/* 1:1 Square */}
              <div className="relative">
                <input
                  type="radio"
                  id="1:1"
                  name="aspectRatio"
                  value="1:1"
                  checked={settings.aspectRatio === '1:1'}
                  onChange={(e) => handleSettingChange('aspectRatio', e.target.value)}
                  className="sr-only"
                />
                <label
                  htmlFor="1:1"
                  className={`flex flex-col items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                    settings.aspectRatio === '1:1'
                      ? 'border-green-500 bg-green-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="w-12 h-12 rounded-lg border-2 border-gray-300 bg-gradient-to-br from-blue-100 to-blue-200 mb-2 flex items-center justify-center">
                    <div className="w-8 h-8 rounded bg-blue-500"></div>
                  </div>
                  <span className="text-sm font-medium text-gray-700">1:1</span>
                  <span className="text-xs text-gray-500">Square</span>
                </label>
              </div>

              {/* 4:3 */}
              <div className="relative">
                <input
                  type="radio"
                  id="4:3"
                  name="aspectRatio"
                  value="4:3"
                  checked={settings.aspectRatio === '4:3'}
                  onChange={(e) => handleSettingChange('aspectRatio', e.target.value)}
                  className="sr-only"
                />
                <label
                  htmlFor="4:3"
                  className={`flex flex-col items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                    settings.aspectRatio === '4:3'
                      ? 'border-green-500 bg-green-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="w-12 h-9 rounded-lg border-2 border-gray-300 bg-gradient-to-br from-purple-100 to-purple-200 mb-2 flex items-center justify-center">
                    <div className="w-8 h-6 rounded bg-purple-500"></div>
                  </div>
                  <span className="text-sm font-medium text-gray-700">4:3</span>
                  <span className="text-xs text-gray-500">Standard</span>
                </label>
              </div>

              {/* 16:9 */}
              <div className="relative">
                <input
                  type="radio"
                  id="16:9"
                  name="aspectRatio"
                  value="16:9"
                  checked={settings.aspectRatio === '16:9'}
                  onChange={(e) => handleSettingChange('aspectRatio', e.target.value)}
                  className="sr-only"
                />
                <label
                  htmlFor="16:9"
                  className={`flex flex-col items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                    settings.aspectRatio === '16:9'
                      ? 'border-green-500 bg-green-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="w-12 h-7 rounded-lg border-2 border-gray-300 bg-gradient-to-br from-orange-100 to-orange-200 mb-2 flex items-center justify-center">
                    <div className="w-10 h-4 rounded bg-orange-500"></div>
                  </div>
                  <span className="text-sm font-medium text-gray-700">16:9</span>
                  <span className="text-xs text-gray-500">Widescreen</span>
                </label>
              </div>

              {/* 3:2 */}
              <div className="relative">
                <input
                  type="radio"
                  id="3:2"
                  name="aspectRatio"
                  value="3:2"
                  checked={settings.aspectRatio === '3:2'}
                  onChange={(e) => handleSettingChange('aspectRatio', e.target.value)}
                  className="sr-only"
                />
                <label
                  htmlFor="3:2"
                  className={`flex flex-col items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                    settings.aspectRatio === '3:2'
                      ? 'border-green-500 bg-green-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="w-12 h-8 rounded-lg border-2 border-gray-300 bg-gradient-to-br from-emerald-100 to-emerald-200 mb-2 flex items-center justify-center">
                    <div className="w-9 h-6 rounded bg-emerald-500"></div>
                  </div>
                  <span className="text-sm font-medium text-gray-700">3:2</span>
                  <span className="text-xs text-gray-500">Photo</span>
                </label>
              </div>

              {/* Custom */}
              <div className="relative">
                <input
                  type="radio"
                  id="custom"
                  name="aspectRatio"
                  value="custom"
                  checked={settings.aspectRatio === 'custom'}
                  onChange={(e) => handleSettingChange('aspectRatio', e.target.value)}
                  className="sr-only"
                />
                <label
                  htmlFor="custom"
                  className={`flex flex-col items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                    settings.aspectRatio === 'custom'
                      ? 'border-green-500 bg-green-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="w-12 h-12 rounded-lg border-2 border-gray-300 bg-gradient-to-br from-indigo-100 to-indigo-200 mb-2 flex items-center justify-center">
                    <Icon icon="solar:settings-bold-duotone" className="h-6 w-6 text-indigo-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Custom</span>
                  <span className="text-xs text-gray-500">Set ratio</span>
                </label>
              </div>
            </div>
          </div>

          {/* Custom Ratio */}
          {settings.aspectRatio === 'custom' && (
            <div className="space-y-4 p-4 bg-indigo-50 rounded-xl border border-indigo-200">
              <Label className="text-base font-semibold text-indigo-800 flex items-center gap-2">
                <Icon icon="solar:settings-bold-duotone" className="h-4 w-4 text-indigo-600" />
                Custom Ratio
              </Label>
              <div className="flex items-center space-x-3">
                <div className="flex flex-col items-center">
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    value={settings.customRatio.width}
                    onChange={(e) => handleCustomRatioChange('width', parseInt(e.target.value))}
                    className="w-16 text-center font-semibold border-indigo-300 focus:border-indigo-500"
                  />
                  <span className="text-xs text-indigo-600 mt-1">Width</span>
                </div>
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-200">
                  <span className="text-indigo-700 font-bold">:</span>
                </div>
                <div className="flex flex-col items-center">
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    value={settings.customRatio.height}
                    onChange={(e) => handleCustomRatioChange('height', parseInt(e.target.value))}
                    className="w-16 text-center font-semibold border-indigo-300 focus:border-indigo-500"
                  />
                  <span className="text-xs text-indigo-600 mt-1">Height</span>
                </div>
              </div>
            </div>
          )}

          {/* Rotation */}
          <div className="space-y-4">
            <Label className="text-base font-semibold text-gray-800 flex items-center gap-2">
              <Icon icon="solar:refresh-bold-duotone" className="h-4 w-4 text-purple-600" />
              Rotation
            </Label>
            <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-purple-800">Current: {settings.rotation}°</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSettingChange('rotation', 0)}
                  className="text-purple-600 border-purple-300 hover:bg-purple-100"
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
                style={{
                  background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${((settings.rotation + 180) / 360) * 100}%, #e5e7eb ${((settings.rotation + 180) / 360) * 100}%, #e5e7eb 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-purple-600 mt-2">
                <span>-180°</span>
                <span>0°</span>
                <span>180°</span>
              </div>
              <div className="flex gap-2 mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSettingChange('rotation', settings.rotation - 90)}
                  className="flex-1 text-purple-600 border-purple-300 hover:bg-purple-100"
                >
                  <Icon icon="solar:rotate-left-bold-duotone" className="h-4 w-4 mr-1" />
                  -90°
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSettingChange('rotation', settings.rotation + 90)}
                  className="flex-1 text-purple-600 border-purple-300 hover:bg-purple-100"
                >
                  <Icon icon="solar:rotate-right-bold-duotone" className="h-4 w-4 mr-1" />
                  +90°
                </Button>
              </div>
            </div>
          </div>

          {/* Flip Options */}
          <div className="space-y-4">
            <Label className="text-base font-semibold text-gray-800 flex items-center gap-2">
              <Icon icon="solar:mirror-bold-duotone" className="h-4 w-4 text-orange-600" />
              Flip Options
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <div className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                settings.flipHorizontal 
                  ? 'border-orange-500 bg-orange-50' 
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}>
                <div className="flex items-center space-x-3">
                  <Switch
                    checked={settings.flipHorizontal}
                    onCheckedChange={(checked) => handleSettingChange('flipHorizontal', checked)}
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-700">Flip Horizontal</span>
                    <span className="text-xs text-gray-500">Left ↔ Right</span>
                  </div>
                </div>
              </div>
              <div className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                settings.flipVertical 
                  ? 'border-orange-500 bg-orange-50' 
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}>
                <div className="flex items-center space-x-3">
                  <Switch
                    checked={settings.flipVertical}
                    onCheckedChange={(checked) => handleSettingChange('flipVertical', checked)}
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-700">Flip Vertical</span>
                    <span className="text-xs text-gray-500">Top ↔ Bottom</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Smart Features */}
          <div className="space-y-4">
            <Label className="text-base font-semibold text-gray-800 flex items-center gap-2">
              <Icon icon="solar:magic-stick-bold-duotone" className="h-4 w-4 text-emerald-600" />
              Smart Features
            </Label>
            <div className="grid grid-cols-1 gap-3">
              <div className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                settings.smartCrop 
                  ? 'border-emerald-500 bg-emerald-50' 
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}>
                <div className="flex items-center space-x-3">
                  <Switch
                    checked={settings.smartCrop}
                    onCheckedChange={(checked) => handleSettingChange('smartCrop', checked)}
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-700">Smart Crop (AI)</span>
                    <span className="text-xs text-gray-500">Auto-detect subjects</span>
                  </div>
                </div>
              </div>
              <div className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                settings.faceDetection 
                  ? 'border-emerald-500 bg-emerald-50' 
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}>
                <div className="flex items-center space-x-3">
                  <Switch
                    checked={settings.faceDetection}
                    onCheckedChange={(checked) => handleSettingChange('faceDetection', checked)}
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-700">Face Detection</span>
                    <span className="text-xs text-gray-500">Focus on faces</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Output Format */}
          <div className="space-y-4">
            <Label className="text-base font-semibold text-gray-800 flex items-center gap-2">
              <Icon icon="solar:file-bold-duotone" className="h-4 w-4 text-blue-600" />
              Output Format
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'original', label: 'Original', desc: 'Keep format', color: 'gray' },
                { value: 'jpeg', label: 'JPEG', desc: 'Smaller size', color: 'blue' },
                { value: 'png', label: 'PNG', desc: 'High quality', color: 'green' },
                { value: 'webp', label: 'WebP', desc: 'Modern format', color: 'purple' }
              ].map((format) => (
                <div key={format.value} className="relative">
                  <input
                    type="radio"
                    id={format.value}
                    name="outputFormat"
                    value={format.value}
                    checked={settings.outputFormat === format.value}
                    onChange={(e) => handleSettingChange('outputFormat', e.target.value)}
                    className="sr-only"
                  />
                  <label
                    htmlFor={format.value}
                    className={`flex flex-col items-center p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                      settings.outputFormat === format.value
                        ? `border-${format.color}-500 bg-${format.color}-50 shadow-md`
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg border-2 border-gray-300 bg-gradient-to-br from-${format.color}-100 to-${format.color}-200 mb-2 flex items-center justify-center`}>
                      <div className={`w-4 h-4 rounded bg-${format.color}-500`}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-700">{format.label}</span>
                    <span className="text-xs text-gray-500">{format.desc}</span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Processing Tool */}
      <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-0 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-green-100 border-2 border-green-200">
            <Icon icon="solar:magic-stick-bold-duotone" className="h-5 w-5 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Process Images</h3>
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