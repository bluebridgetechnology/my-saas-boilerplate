'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LazyToolWrapper } from './lazy-tool-wrapper';
import { FileValidator } from '@/lib/image-processing';

// Lazy load the heavy background removal component
const BackgroundRemovalToolCore = React.lazy(() => 
  import('./background-removal-tool-core').then(module => ({
    default: module.BackgroundRemovalToolCore
  }))
);

interface BackgroundRemovalToolProps {
  files?: File[];
  onProcessingStart?: () => void;
  onProcessingEnd?: () => void;
  onProgress?: (progress: number) => void;
}

interface BackgroundRemovalSettings {
  model: 'standard' | 'precise';
  edgeRefinement: boolean;
  outputFormat: 'png' | 'jpg';
  quality: number;
  replaceBackground: boolean;
  backgroundColor: string;
  customBackground?: File;
}

export function BackgroundRemovalTool({ 
  files = [], 
  onProcessingStart = () => {}, 
  onProcessingEnd = () => {}, 
  onProgress = () => {} 
}: BackgroundRemovalToolProps = {}) {
  const [settings, setSettings] = useState<BackgroundRemovalSettings>({
    model: 'standard',
    edgeRefinement: true,
    outputFormat: 'png',
    quality: 90,
    replaceBackground: false,
    backgroundColor: '#ffffff'
  });
  const [showPreview, setShowPreview] = useState(false);
  const [processedFiles, setProcessedFiles] = useState<File[]>([]);

  const handleSettingChange = (key: keyof BackgroundRemovalSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleProcess = useCallback(async () => {
    if (files.length === 0) return;

    onProcessingStart();
    try {
      // The actual processing will be handled by the lazy-loaded core component
      // This is just a placeholder for the interface
      onProgress(100);
    } catch (error) {
      console.error('Background removal failed:', error);
    } finally {
      onProcessingEnd();
    }
  }, [files, onProcessingStart, onProcessingEnd, onProgress]);

  const downloadResults = () => {
    processedFiles.forEach((file, index) => {
      const url = URL.createObjectURL(file);
      const a = document.createElement('a');
      a.href = url;
      a.download = `background-removed-${index + 1}.${settings.outputFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  };

  if (files.length === 0) {
    return (
      <div className="text-center py-12">
        <Icon icon="solar:magic-stick-bold-duotone" className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h4 className="text-lg font-medium text-gray-500 mb-2">No Images Selected</h4>
        <p className="text-gray-400">
          Upload images to start removing backgrounds with AI-powered technology
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Settings Panel */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Background Removal Settings</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Model Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">AI Model</Label>
            <RadioGroup
              value={settings.model}
              onValueChange={(value) => handleSettingChange('model', value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="standard" id="standard" />
                <Label htmlFor="standard" className="text-sm">Standard (Faster)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="precise" id="precise" />
                <Label htmlFor="precise" className="text-sm">Precise (Better Quality)</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Edge Refinement */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Edge Refinement</Label>
            <div className="flex items-center space-x-2">
              <Switch
                checked={settings.edgeRefinement}
                onCheckedChange={(checked) => handleSettingChange('edgeRefinement', checked)}
              />
              <Label className="text-sm">Improve edge quality</Label>
            </div>
          </div>

          {/* Output Format */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Output Format</Label>
            <RadioGroup
              value={settings.outputFormat}
              onValueChange={(value) => handleSettingChange('outputFormat', value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="png" id="png" />
                <Label htmlFor="png" className="text-sm">PNG (Transparent)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="jpg" id="jpg" />
                <Label htmlFor="jpg" className="text-sm">JPG (Solid Background)</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Quality */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Quality: {settings.quality}%</Label>
            <Input
              type="range"
              min="50"
              max="100"
              value={settings.quality}
              onChange={(e) => handleSettingChange('quality', parseInt(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        {/* Background Replacement */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center space-x-2 mb-4">
            <Switch
              checked={settings.replaceBackground}
              onCheckedChange={(checked) => handleSettingChange('replaceBackground', checked)}
            />
            <Label className="text-sm font-medium">Replace Background</Label>
          </div>
          
          {settings.replaceBackground && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Background Color</Label>
              <div className="flex items-center space-x-2">
                <Input
                  type="color"
                  value={settings.backgroundColor}
                  onChange={(e) => handleSettingChange('backgroundColor', e.target.value)}
                  className="w-12 h-8 p-1"
                />
                <Input
                  type="text"
                  value={settings.backgroundColor}
                  onChange={(e) => handleSettingChange('backgroundColor', e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Processing Tool */}
      <LazyToolWrapper toolName="Background Removal">
        <BackgroundRemovalToolCore
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
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Processed Images ({processedFiles.length})
            </h3>
            <Button onClick={downloadResults} className="bg-emerald-600 hover:bg-emerald-700">
              <Icon icon="solar:download-bold-duotone" className="h-4 w-4 mr-2" />
              Download All
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {processedFiles.map((file, index) => (
              <div key={index} className="relative group">
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Processed ${index + 1}`}
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
                      a.download = `background-removed-${index + 1}.${settings.outputFormat}`;
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