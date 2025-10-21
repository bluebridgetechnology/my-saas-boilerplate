'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Icon } from '@iconify/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface SocialPreset {
  id: string;
  platform: string;
  preset_name: string;
  width: number;
  height: number;
  quality: number;
  format: string;
  is_public: boolean;
  usage_count: number;
  created_at: string;
}

interface PresetForm {
  platform: string;
  preset_name: string;
  width: number;
  height: number;
  quality: number;
  format: string;
  is_public: boolean;
}

const platformPresets = {
  instagram: [
    { name: 'Instagram Post', width: 1080, height: 1080 },
    { name: 'Instagram Story', width: 1080, height: 1920 },
    { name: 'Instagram Reel', width: 1080, height: 1920 },
    { name: 'Instagram Carousel', width: 1080, height: 1080 },
  ],
  facebook: [
    { name: 'Facebook Post', width: 1200, height: 630 },
    { name: 'Facebook Cover', width: 1200, height: 315 },
    { name: 'Facebook Story', width: 1080, height: 1920 },
    { name: 'Facebook Event', width: 1200, height: 630 },
  ],
  twitter: [
    { name: 'Twitter Post', width: 1200, height: 675 },
    { name: 'Twitter Header', width: 1500, height: 500 },
    { name: 'Twitter Card', width: 1200, height: 600 },
  ],
  linkedin: [
    { name: 'LinkedIn Post', width: 1200, height: 627 },
    { name: 'LinkedIn Cover', width: 1584, height: 396 },
    { name: 'LinkedIn Article', width: 1200, height: 627 },
  ],
  youtube: [
    { name: 'YouTube Thumbnail', width: 1280, height: 720 },
    { name: 'YouTube Channel Art', width: 2560, height: 1440 },
    { name: 'YouTube Shorts', width: 1080, height: 1920 },
  ],
  pinterest: [
    { name: 'Pinterest Pin', width: 1000, height: 1500 },
    { name: 'Pinterest Board', width: 1000, height: 1000 },
  ],
  tiktok: [
    { name: 'TikTok Video', width: 1080, height: 1920 },
    { name: 'TikTok Profile', width: 200, height: 200 },
  ],
};

export default function UnlimitedSocialPresets() {
  const [presets, setPresets] = useState<SocialPreset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPreset, setEditingPreset] = useState<SocialPreset | null>(null);
  const [formData, setFormData] = useState<PresetForm>({
    platform: 'instagram',
    preset_name: '',
    width: 1080,
    height: 1080,
    quality: 90,
    format: 'jpeg',
    is_public: false,
  });

  useEffect(() => {
    loadPresets();
  }, []);

  const loadPresets = async () => {
    setIsLoading(true);
    try {
      // Simulate API call - replace with actual API endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockPresets: SocialPreset[] = [
        {
          id: '1',
          platform: 'instagram',
          preset_name: 'Instagram Post',
          width: 1080,
          height: 1080,
          quality: 90,
          format: 'jpeg',
          is_public: true,
          usage_count: 45,
          created_at: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          platform: 'facebook',
          preset_name: 'Facebook Post',
          width: 1200,
          height: 630,
          quality: 90,
          format: 'jpeg',
          is_public: true,
          usage_count: 32,
          created_at: '2024-01-01T00:00:00Z',
        },
        {
          id: '3',
          platform: 'twitter',
          preset_name: 'Twitter Post',
          width: 1200,
          height: 675,
          quality: 90,
          format: 'jpeg',
          is_public: true,
          usage_count: 28,
          created_at: '2024-01-01T00:00:00Z',
        },
        {
          id: '4',
          platform: 'youtube',
          preset_name: 'YouTube Thumbnail',
          width: 1280,
          height: 720,
          quality: 90,
          format: 'jpeg',
          is_public: true,
          usage_count: 19,
          created_at: '2024-01-01T00:00:00Z',
        },
        {
          id: '5',
          platform: 'pinterest',
          preset_name: 'Pinterest Pin',
          width: 1000,
          height: 1500,
          quality: 90,
          format: 'jpeg',
          is_public: true,
          usage_count: 15,
          created_at: '2024-01-01T00:00:00Z',
        },
      ];
      
      setPresets(mockPresets);
    } catch (error) {
      console.error('Error loading presets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePreset = async () => {
    try {
      // Simulate API call - replace with actual API endpoint
      console.log('Creating new preset:', formData);
      
      const newPreset: SocialPreset = {
        id: Date.now().toString(),
        platform: formData.platform,
        preset_name: formData.preset_name,
        width: formData.width,
        height: formData.height,
        quality: formData.quality,
        format: formData.format,
        is_public: formData.is_public,
        usage_count: 0,
        created_at: new Date().toISOString(),
      };
      
      setPresets(prev => [...prev, newPreset]);
      setIsDialogOpen(false);
      setFormData({
        platform: 'instagram',
        preset_name: '',
        width: 1080,
        height: 1080,
        quality: 90,
        format: 'jpeg',
        is_public: false,
      });
    } catch (error) {
      console.error('Error creating preset:', error);
    }
  };

  const handleEditPreset = (preset: SocialPreset) => {
    setEditingPreset(preset);
    setFormData({
      platform: preset.platform,
      preset_name: preset.preset_name,
      width: preset.width,
      height: preset.height,
      quality: preset.quality,
      format: preset.format,
      is_public: preset.is_public,
    });
    setIsDialogOpen(true);
  };

  const handleSavePreset = async () => {
    try {
      if (editingPreset) {
        // Update existing preset
        console.log('Updating preset:', formData);
        setPresets(prev => prev.map(preset => 
          preset.id === editingPreset.id 
            ? { ...preset, ...formData }
            : preset
        ));
      } else {
        await handleCreatePreset();
        return;
      }
      
      setIsDialogOpen(false);
      setEditingPreset(null);
      setFormData({
        platform: 'instagram',
        preset_name: '',
        width: 1080,
        height: 1080,
        quality: 90,
        format: 'jpeg',
        is_public: false,
      });
    } catch (error) {
      console.error('Error saving preset:', error);
    }
  };

  const handleDeletePreset = async (presetId: string) => {
    try {
      // Simulate API call - replace with actual API endpoint
      console.log('Deleting preset:', presetId);
      
      setPresets(prev => prev.filter(preset => preset.id !== presetId));
    } catch (error) {
      console.error('Error deleting preset:', error);
    }
  };

  const handlePresetTemplate = (platform: string, template: any) => {
    setFormData(prev => ({
      ...prev,
      platform,
      preset_name: template.name,
      width: template.width,
      height: template.height,
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getPlatformIcon = (platform: string) => {
    const icons: Record<string, string> = {
      instagram: 'solar:instagram-bold-duotone',
      facebook: 'solar:facebook-bold-duotone',
      twitter: 'solar:twitter-bold-duotone',
      linkedin: 'solar:linkedin-bold-duotone',
      youtube: 'solar:youtube-bold-duotone',
      pinterest: 'solar:pinterest-bold-duotone',
      tiktok: 'solar:tiktok-bold-duotone',
    };
    return icons[platform] || 'solar:image-bold-duotone';
  };

  const getPlatformColor = (platform: string) => {
    const colors: Record<string, string> = {
      instagram: 'text-pink-600 bg-pink-50',
      facebook: 'text-blue-600 bg-blue-50',
      twitter: 'text-blue-400 bg-blue-50',
      linkedin: 'text-blue-700 bg-blue-50',
      youtube: 'text-red-600 bg-red-50',
      pinterest: 'text-red-500 bg-red-50',
      tiktok: 'text-gray-900 bg-gray-50',
    };
    return colors[platform] || 'text-gray-600 bg-gray-50';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Unlimited Social Presets</h1>
          <p className="text-gray-600">Create and manage custom social media presets</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button onClick={loadPresets} variant="outline" size="sm">
            <Icon icon="solar:refresh-bold-duotone" className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={() => setEditingPreset(null)}>
                <Icon icon="solar:add-circle-bold-duotone" className="h-4 w-4 mr-2" />
                Create Preset
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingPreset ? 'Edit Preset' : 'Create Preset'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Platform</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.platform}
                    onChange={(e) => setFormData(prev => ({ ...prev, platform: e.target.value }))}
                  >
                    {Object.keys(platformPresets).map(platform => (
                      <option key={platform} value={platform}>
                        {platform.charAt(0).toUpperCase() + platform.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Preset Name</label>
                  <Input
                    value={formData.preset_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, preset_name: e.target.value }))}
                    placeholder="e.g., Instagram Post"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Width</label>
                    <Input
                      type="number"
                      value={formData.width}
                      onChange={(e) => setFormData(prev => ({ ...prev, width: parseInt(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Height</label>
                    <Input
                      type="number"
                      value={formData.height}
                      onChange={(e) => setFormData(prev => ({ ...prev, height: parseInt(e.target.value) }))}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Quality</label>
                    <Input
                      type="number"
                      min="1"
                      max="100"
                      value={formData.quality}
                      onChange={(e) => setFormData(prev => ({ ...prev, quality: parseInt(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Format</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.format}
                      onChange={(e) => setFormData(prev => ({ ...prev, format: e.target.value }))}
                    >
                      <option value="jpeg">JPEG</option>
                      <option value="png">PNG</option>
                      <option value="webp">WebP</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Public Preset</label>
                  <input
                    type="checkbox"
                    checked={formData.is_public}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_public: e.target.checked }))}
                    className="rounded"
                  />
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSavePreset}>
                    {editingPreset ? 'Update' : 'Create'} Preset
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Platform Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon="solar:magic-stick-bold-duotone" className="h-5 w-5" />
            Quick Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(platformPresets).map(([platform, templates]) => (
              <div key={platform} className="space-y-2">
                <h4 className="font-medium text-gray-900 capitalize">{platform}</h4>
                <div className="space-y-1">
                  {templates.map((template, index) => (
                    <button
                      key={index}
                      onClick={() => handlePresetTemplate(platform, template)}
                      className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded"
                    >
                      {template.name} ({template.width}×{template.height})
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Presets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {presets.map((preset) => (
          <Card key={preset.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Icon 
                    icon={getPlatformIcon(preset.platform)} 
                    className="h-6 w-6 text-gray-600" 
                  />
                  <div>
                    <h3 className="font-medium text-gray-900">{preset.preset_name}</h3>
                    <p className="text-sm text-gray-600 capitalize">{preset.platform}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPlatformColor(preset.platform)}`}>
                  {preset.platform}
                </span>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Dimensions:</span>
                  <span className="font-medium">{preset.width} × {preset.height}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Quality:</span>
                  <span className="font-medium">{preset.quality}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Format:</span>
                  <span className="font-medium uppercase">{preset.format}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Usage:</span>
                  <span className="font-medium">{preset.usage_count} times</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Created:</span>
                  <span className="font-medium">{formatDate(preset.created_at)}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditPreset(preset)}
                  >
                    <Icon icon="solar:pen-bold-duotone" className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeletePreset(preset.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Icon icon="solar:trash-bin-trash-bold-duotone" className="h-4 w-4" />
                  </Button>
                </div>
                <Button size="sm">
                  <Icon icon="solar:download-bold-duotone" className="h-4 w-4 mr-2" />
                  Use Preset
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon="solar:chart-bold-duotone" className="h-5 w-5" />
            Preset Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{presets.length}</div>
              <div className="text-sm text-gray-600">Total Presets</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {presets.filter(p => p.is_public).length}
              </div>
              <div className="text-sm text-gray-600">Public Presets</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {presets.reduce((sum, p) => sum + p.usage_count, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Usage</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {new Set(presets.map(p => p.platform)).size}
              </div>
              <div className="text-sm text-gray-600">Platforms</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
