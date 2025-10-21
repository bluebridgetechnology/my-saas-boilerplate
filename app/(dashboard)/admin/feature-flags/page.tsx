'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Icon } from '@iconify/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface FeatureFlag {
  id: string;
  flag_name: string;
  is_enabled: boolean;
  rollout_percentage: number;
  target_user_groups: string[];
  description: string;
  created_at: string;
  updated_at: string;
}

interface FeatureFlagForm {
  flag_name: string;
  is_enabled: boolean;
  rollout_percentage: number;
  target_user_groups: string[];
  description: string;
}

export default function FeatureFlagsManagement() {
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFlag, setEditingFlag] = useState<FeatureFlag | null>(null);
  const [formData, setFormData] = useState<FeatureFlagForm>({
    flag_name: '',
    is_enabled: false,
    rollout_percentage: 0,
    target_user_groups: [],
    description: '',
  });

  useEffect(() => {
    loadFeatureFlags();
  }, []);

  const loadFeatureFlags = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/feature-flags');
      if (!response.ok) {
        throw new Error('Failed to fetch feature flags');
      }

      const data = await response.json();
      setFeatureFlags(data || []);
    } catch (error) {
      console.error('Error loading feature flags:', error);
      // Fallback to empty array on error
      setFeatureFlags([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFlag = async (flagId: string, enabled: boolean) => {
    try {
      const response = await fetch(`/api/admin/feature-flags/${flagId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_enabled: enabled }),
      });

      if (!response.ok) {
        throw new Error('Failed to toggle feature flag');
      }

      // Reload flags to get updated data
      await loadFeatureFlags();
    } catch (error) {
      console.error('Error toggling feature flag:', error);
    }
  };

  const handleUpdateRollout = async (flagId: string, percentage: number) => {
    try {
      const response = await fetch(`/api/admin/feature-flags/${flagId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rollout_percentage: percentage }),
      });

      if (!response.ok) {
        throw new Error('Failed to update rollout percentage');
      }

      // Reload flags to get updated data
      await loadFeatureFlags();
    } catch (error) {
      console.error('Error updating rollout percentage:', error);
    }
  };

  const handleEditFlag = (flag: FeatureFlag) => {
    setEditingFlag(flag);
    setFormData({
      flag_name: flag.flag_name,
      is_enabled: flag.is_enabled,
      rollout_percentage: flag.rollout_percentage,
      target_user_groups: flag.target_user_groups,
      description: flag.description,
    });
    setIsDialogOpen(true);
  };

  const handleSaveFlag = async () => {
    try {
      if (editingFlag) {
        // Update existing flag
        const response = await fetch(`/api/admin/feature-flags/${editingFlag.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          throw new Error('Failed to update feature flag');
        }
      } else {
        // Create new flag
        const response = await fetch('/api/admin/feature-flags', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          throw new Error('Failed to create feature flag');
        }
      }
      
      setIsDialogOpen(false);
      setEditingFlag(null);
      setFormData({
        flag_name: '',
        is_enabled: false,
        rollout_percentage: 0,
        target_user_groups: [],
        description: '',
      });

      // Reload flags to get updated data
      await loadFeatureFlags();
    } catch (error) {
      console.error('Error saving feature flag:', error);
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

  const getStatusColor = (enabled: boolean) => {
    return enabled ? 'text-green-600 bg-green-50' : 'text-gray-600 bg-gray-50';
  };

  const getRolloutColor = (percentage: number) => {
    if (percentage === 0) return 'text-gray-600 bg-gray-50';
    if (percentage < 50) return 'text-yellow-600 bg-yellow-50';
    if (percentage < 100) return 'text-orange-600 bg-orange-50';
    return 'text-green-600 bg-green-50';
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Feature Flags</h1>
          <p className="text-gray-600">Manage feature flags and rollout percentages</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button onClick={loadFeatureFlags} variant="outline" size="sm">
            <Icon icon="solar:refresh-bold-duotone" className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={() => setEditingFlag(null)}>
                <Icon icon="solar:add-circle-bold-duotone" className="h-4 w-4 mr-2" />
                Add Flag
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingFlag ? 'Edit Feature Flag' : 'Add Feature Flag'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Flag Name</label>
                  <Input
                    value={formData.flag_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, flag_name: e.target.value }))}
                    placeholder="e.g., new_feature"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Description</label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what this flag does"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Enabled</label>
                  <Switch
                    checked={formData.is_enabled}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_enabled: checked }))}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Rollout Percentage ({formData.rollout_percentage}%)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formData.rollout_percentage}
                    onChange={(e) => setFormData(prev => ({ ...prev, rollout_percentage: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveFlag}>
                    {editingFlag ? 'Update' : 'Create'} Flag
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Feature Flags List */}
      <div className="space-y-4">
        {featureFlags.map((flag) => (
          <Card key={flag.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-medium text-gray-900">
                      {flag.flag_name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(flag.is_enabled)}`}>
                      {flag.is_enabled ? 'Enabled' : 'Disabled'}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRolloutColor(flag.rollout_percentage)}`}>
                      {flag.rollout_percentage}% rollout
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{flag.description}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>Created: {formatDate(flag.created_at)}</span>
                    <span>Updated: {formatDate(flag.updated_at)}</span>
                    <span>Target: {flag.target_user_groups.join(', ') || 'All users'}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={flag.is_enabled}
                      onCheckedChange={(checked) => handleToggleFlag(flag.id, checked)}
                    />
                    <span className="text-sm text-gray-600">Enable</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={flag.rollout_percentage}
                      onChange={(e) => handleUpdateRollout(flag.id, parseInt(e.target.value))}
                      className="w-20"
                    />
                    <span className="text-sm text-gray-600 w-8">{flag.rollout_percentage}%</span>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditFlag(flag)}
                  >
                    <Icon icon="solar:pen-bold-duotone" className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon="solar:chart-bold-duotone" className="h-5 w-5" />
            Feature Flags Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{featureFlags.length}</div>
              <div className="text-sm text-gray-600">Total Flags</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {featureFlags.filter(flag => flag.is_enabled).length}
              </div>
              <div className="text-sm text-gray-600">Enabled Flags</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {featureFlags.filter(flag => flag.rollout_percentage === 100).length}
              </div>
              <div className="text-sm text-gray-600">Full Rollout</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
