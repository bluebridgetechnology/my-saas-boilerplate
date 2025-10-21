'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Icon } from '@iconify/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface AdminSetting {
  id: string;
  setting_key: string;
  setting_value: any;
  description: string;
  created_at: string;
  updated_at: string;
}

interface SettingForm {
  setting_key: string;
  setting_value: string;
  description: string;
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<AdminSetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSetting, setEditingSetting] = useState<AdminSetting | null>(null);
  const [formData, setFormData] = useState<SettingForm>({
    setting_key: '',
    setting_value: '',
    description: '',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/settings');
      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }

      const data = await response.json();
      setSettings(data || []);
    } catch (error) {
      console.error('Error loading settings:', error);
      // Fallback to empty array on error
      setSettings([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateSetting = async (settingId: string, newValue: string) => {
    try {
      const response = await fetch(`/api/admin/settings/${settingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ setting_value: newValue }),
      });

      if (!response.ok) {
        throw new Error('Failed to update setting');
      }

      // Reload settings to get updated data
      await loadSettings();
    } catch (error) {
      console.error('Error updating setting:', error);
    }
  };

  const handleEditSetting = (setting: AdminSetting) => {
    setEditingSetting(setting);
    setFormData({
      setting_key: setting.setting_key,
      setting_value: setting.setting_value.toString(),
      description: setting.description,
    });
    setIsDialogOpen(true);
  };

  const handleSaveSetting = async () => {
    try {
      if (editingSetting) {
        // Update existing setting
        const response = await fetch(`/api/admin/settings/${editingSetting.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            setting_value: formData.setting_value,
            description: formData.description,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to update setting');
        }
      } else {
        // Create new setting
        const response = await fetch('/api/admin/settings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          throw new Error('Failed to create setting');
        }
      }
      
      setIsDialogOpen(false);
      setEditingSetting(null);
      setFormData({
        setting_key: '',
        setting_value: '',
        description: '',
      });

      // Reload settings to get updated data
      await loadSettings();
    } catch (error) {
      console.error('Error saving setting:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFileSize = (bytes: string) => {
    const size = parseInt(bytes);
    if (size === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(size) / Math.log(k));
    return parseFloat((size / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getSettingValue = (setting: AdminSetting) => {
    if (setting.setting_key.includes('file_size')) {
      return formatFileSize(setting.setting_value);
    }
    if (setting.setting_key.includes('price')) {
      return `$${setting.setting_value}`;
    }
    if (setting.setting_key.includes('days')) {
      return `${setting.setting_value} days`;
    }
    if (setting.setting_key.includes('images')) {
      return `${setting.setting_value} images`;
    }
    return setting.setting_value;
  };

  const isBooleanSetting = (setting: AdminSetting) => {
    return setting.setting_value === 'true' || setting.setting_value === 'false';
  };

  const handleBooleanToggle = (settingId: string, currentValue: string) => {
    const newValue = currentValue === 'true' ? 'false' : 'true';
    handleUpdateSetting(settingId, newValue);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-gray-200 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Settings</h1>
            <p className="mt-2 text-gray-600">Configure application settings and parameters</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button onClick={loadSettings} variant="outline" size="sm">
              <Icon icon="solar:refresh-bold-duotone" className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" onClick={() => setEditingSetting(null)}>
                  <Icon icon="solar:add-circle-bold-duotone" className="h-4 w-4 mr-2" />
                  Add Setting
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingSetting ? 'Edit Setting' : 'Add Setting'}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Setting Key</label>
                    <Input
                      value={formData.setting_key}
                      onChange={(e) => setFormData(prev => ({ ...prev, setting_key: e.target.value }))}
                      placeholder="e.g., new_setting"
                      disabled={!!editingSetting}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Setting Value</label>
                    <Input
                      value={formData.setting_value}
                      onChange={(e) => setFormData(prev => ({ ...prev, setting_value: e.target.value }))}
                      placeholder="Enter setting value"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Description</label>
                    <Input
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe what this setting does"
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveSetting}>
                      {editingSetting ? 'Update' : 'Create'} Setting
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="space-y-8">
        {/* Application Settings */}
        <div>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Icon icon="solar:settings-bold-duotone" className="h-5 w-5 text-blue-600" />
              </div>
              Application Settings
            </h2>
            <p className="text-gray-600 mt-1">Basic application configuration and features</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {settings.filter(setting => 
              ['app_name', 'app_description', 'maintenance_mode', 'registration_enabled', 'email_notifications'].includes(setting.setting_key)
            ).map((setting) => (
              <Card key={setting.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {setting.setting_key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{setting.description}</p>
                      {!isBooleanSetting(setting) && (
                        <div className="mt-2 text-sm font-medium text-blue-600">
                          {getSettingValue(setting)}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-3 ml-4">
                      {isBooleanSetting(setting) && (
                        <Switch
                          checked={setting.setting_value === 'true'}
                          onCheckedChange={() => handleBooleanToggle(setting.id, setting.setting_value)}
                        />
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditSetting(setting)}
                      >
                        <Icon icon="solar:pen-bold-duotone" className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Pricing Settings */}
        <div>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Icon icon="solar:dollar-bold-duotone" className="h-5 w-5 text-green-600" />
              </div>
              Pricing Settings
            </h2>
            <p className="text-gray-600 mt-1">Subscription pricing and trial configuration</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {settings.filter(setting => 
              ['pro_monthly_price', 'pro_yearly_price', 'trial_days'].includes(setting.setting_key)
            ).map((setting) => (
              <Card key={setting.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="text-center">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {setting.setting_key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </h3>
                    <div className="text-2xl font-bold text-green-600 mb-2">
                      {getSettingValue(setting)}
                    </div>
                    <p className="text-sm text-gray-600 mb-4">{setting.description}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditSetting(setting)}
                      className="w-full"
                    >
                      <Icon icon="solar:pen-bold-duotone" className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* User Limits */}
        <div>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Icon icon="solar:shield-bold-duotone" className="h-5 w-5 text-purple-600" />
              </div>
              User Limits
            </h2>
            <p className="text-gray-600 mt-1">File size and usage limits for free and pro users</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {settings.filter(setting => 
              ['max_free_images', 'max_pro_images', 'max_free_file_size', 'max_pro_file_size'].includes(setting.setting_key)
            ).map((setting) => (
              <Card key={setting.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="mb-3">
                      <Icon 
                        icon={setting.setting_key.includes('free') ? "solar:user-bold-duotone" : "solar:crown-bold-duotone"} 
                        className={`h-8 w-8 mx-auto ${setting.setting_key.includes('free') ? 'text-gray-500' : 'text-yellow-500'}`} 
                      />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2 text-sm">
                      {setting.setting_key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </h3>
                    <div className="text-xl font-bold text-purple-600 mb-2">
                      {getSettingValue(setting)}
                    </div>
                    <p className="text-xs text-gray-600 mb-4">{setting.description}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditSetting(setting)}
                      className="w-full"
                    >
                      <Icon icon="solar:pen-bold-duotone" className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* System Status */}
        <div>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Icon icon="solar:server-bold-duotone" className="h-5 w-5 text-orange-600" />
              </div>
              System Status
            </h2>
            <p className="text-gray-600 mt-1">Current status of system services and integrations</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Icon icon="solar:check-circle-bold-duotone" className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-green-900">System Online</h3>
                      <p className="text-sm text-green-700">All services operational</p>
                    </div>
                  </div>
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Icon icon="solar:database-bold-duotone" className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-900">Database</h3>
                      <p className="text-sm text-blue-700">Connected</p>
                    </div>
                  </div>
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-purple-200 bg-purple-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Icon icon="solar:card-bold-duotone" className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-purple-900">Payment Processing</h3>
                      <p className="text-sm text-purple-700">Stripe Connected</p>
                    </div>
                  </div>
                  <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
