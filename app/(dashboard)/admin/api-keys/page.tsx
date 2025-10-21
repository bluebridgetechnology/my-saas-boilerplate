'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Icon } from '@iconify/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ApiKey {
  id: string;
  user_id: string;
  user_email: string;
  key_name: string;
  api_key: string;
  is_active: boolean;
  rate_limit_per_hour: number;
  usage_count: number;
  last_used?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

interface ApiKeyForm {
  user_id: string;
  key_name: string;
  rate_limit_per_hour: number;
  expires_at?: string;
}

interface User {
  id: string;
  email: string;
  name?: string;
}

export default function ApiKeysManagement() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<ApiKey | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ApiKeyForm>({
    user_id: '',
    key_name: '',
    rate_limit_per_hour: 1000,
    expires_at: '',
  });

  useEffect(() => {
    loadApiKeys();
    loadUsers();
  }, []);

  const loadApiKeys = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/api-keys');
      if (!response.ok) {
        throw new Error('Failed to fetch API keys');
      }

      const data = await response.json();
      setApiKeys(data.apiKeys || []);
    } catch (error) {
      console.error('Error loading API keys:', error);
      setError('Failed to load API keys. Please try again.');
      setApiKeys([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers([]);
    }
  };

  const handleToggleKey = async (keyId: string, active: boolean) => {
    try {
      const response = await fetch(`/api/admin/api-keys/${keyId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_active: active }),
      });

      if (!response.ok) {
        throw new Error('Failed to toggle API key');
      }

      // Update local state
      setApiKeys(prev => prev.map(key => 
        key.id === keyId 
          ? { ...key, is_active: active, updated_at: new Date().toISOString() }
          : key
      ));
    } catch (error) {
      console.error('Error toggling API key:', error);
    }
  };

  const handleUpdateRateLimit = async (keyId: string, rateLimit: number) => {
    try {
      const response = await fetch(`/api/admin/api-keys/${keyId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rate_limit_per_hour: rateLimit }),
      });

      if (!response.ok) {
        throw new Error('Failed to update rate limit');
      }

      // Update local state
      setApiKeys(prev => prev.map(key => 
        key.id === keyId 
          ? { ...key, rate_limit_per_hour: rateLimit, updated_at: new Date().toISOString() }
          : key
      ));
    } catch (error) {
      console.error('Error updating rate limit:', error);
    }
  };

  const handleDeleteKey = async (keyId: string) => {
    try {
      const response = await fetch(`/api/admin/api-keys/${keyId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete API key');
      }

      // Remove from local state
      setApiKeys(prev => prev.filter(key => key.id !== keyId));
    } catch (error) {
      console.error('Error deleting API key:', error);
    }
  };

  const handleCreateKey = async () => {
    try {
      const response = await fetch('/api/admin/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: formData.user_id,
          key_name: formData.key_name,
          rate_limit_per_hour: formData.rate_limit_per_hour,
          expires_at: formData.expires_at || null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create API key');
      }

      const newKey = await response.json();
      
      // Transform the response to match our interface
      const transformedKey: ApiKey = {
        id: newKey.id,
        user_id: newKey.user_id,
        user_email: newKey.user?.email || 'Admin',
        key_name: newKey.key_name,
        api_key: newKey.api_key,
        is_active: newKey.is_active,
        rate_limit_per_hour: newKey.rate_limit_per_hour,
        usage_count: newKey.usage_count,
        last_used: newKey.last_used,
        expires_at: newKey.expires_at,
        created_at: newKey.created_at,
        updated_at: newKey.updated_at,
      };
      
      setApiKeys(prev => [...prev, transformedKey]);
      setIsDialogOpen(false);
      setFormData({
        user_id: '',
        key_name: '',
        rate_limit_per_hour: 1000,
        expires_at: '',
      });
    } catch (error) {
      console.error('Error creating API key:', error);
    }
  };

  const handleEditKey = (key: ApiKey) => {
    setEditingKey(key);
    setFormData({
      user_id: key.user_id,
      key_name: key.key_name,
      rate_limit_per_hour: key.rate_limit_per_hour,
      expires_at: key.expires_at || '',
    });
    setIsDialogOpen(true);
  };

  const handleSaveKey = async () => {
    try {
      if (editingKey) {
        // Update existing key
        const response = await fetch(`/api/admin/api-keys/${editingKey.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            key_name: formData.key_name,
            rate_limit_per_hour: formData.rate_limit_per_hour,
            expires_at: formData.expires_at || null,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to update API key');
        }

        // Update local state
        setApiKeys(prev => prev.map(key => 
          key.id === editingKey.id 
            ? { ...key, key_name: formData.key_name, rate_limit_per_hour: formData.rate_limit_per_hour, expires_at: formData.expires_at || undefined, updated_at: new Date().toISOString() }
            : key
        ));
      } else {
        await handleCreateKey();
        return;
      }
      
      setIsDialogOpen(false);
      setEditingKey(null);
      setFormData({
        user_id: '',
        key_name: '',
        rate_limit_per_hour: 1000,
        expires_at: '',
      });
    } catch (error) {
      console.error('Error saving API key:', error);
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

  const maskApiKey = (key: string) => {
    return key.substring(0, 8) + '...' + key.substring(key.length - 4);
  };

  const getStatusColor = (active: boolean) => {
    return active ? 'text-green-600 bg-green-50' : 'text-gray-600 bg-gray-50';
  };

  const getUsageColor = (usage: number, limit: number) => {
    const percentage = (usage / limit) * 100;
    if (percentage >= 90) return 'text-red-600 bg-red-50';
    if (percentage >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const getApiKeyStats = () => {
    return {
      total: apiKeys.length,
      active: apiKeys.filter(key => key.is_active).length,
      inactive: apiKeys.filter(key => !key.is_active).length,
      totalUsage: apiKeys.reduce((sum, key) => sum + key.usage_count, 0),
    };
  };

  const stats = getApiKeyStats();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
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
          <h1 className="text-2xl font-bold text-gray-900">API Keys Management</h1>
          <p className="text-gray-600">Manage API keys and access controls</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button onClick={loadApiKeys} variant="outline" size="sm">
            <Icon icon="solar:refresh-bold-duotone" className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={() => setEditingKey(null)}>
                <Icon icon="solar:add-circle-bold-duotone" className="h-4 w-4 mr-2" />
                Create API Key
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingKey ? 'Edit API Key' : 'Create API Key'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">User</label>
                  <Select
                    value={formData.user_id}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, user_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a user" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.email} {user.name && `(${user.name})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Key Name</label>
                  <Input
                    value={formData.key_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, key_name: e.target.value }))}
                    placeholder="e.g., Production API"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Rate Limit (per hour)</label>
                  <Input
                    type="number"
                    value={formData.rate_limit_per_hour}
                    onChange={(e) => setFormData(prev => ({ ...prev, rate_limit_per_hour: parseInt(e.target.value) }))}
                    placeholder="1000"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Expires At (optional)</label>
                  <Input
                    type="datetime-local"
                    value={formData.expires_at}
                    onChange={(e) => setFormData(prev => ({ ...prev, expires_at: e.target.value }))}
                  />
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveKey}>
                    {editingKey ? 'Update' : 'Create'} Key
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <Icon icon="solar:danger-triangle-bold-duotone" className="h-5 w-5 text-red-600 mr-2" />
            <p className="text-red-800">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setError(null)}
              className="ml-auto"
            >
              Dismiss
            </Button>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Keys</CardTitle>
            <Icon icon="solar:key-bold-duotone" className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              API keys created
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Keys</CardTitle>
            <Icon icon="solar:check-circle-bold-duotone" className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Keys</CardTitle>
            <Icon icon="solar:close-circle-bold-duotone" className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.inactive}</div>
            <p className="text-xs text-muted-foreground">
              Disabled keys
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
            <Icon icon="solar:activity-bold-duotone" className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsage.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              API calls made
            </p>
          </CardContent>
        </Card>
      </div>

      {/* API Keys List */}
      <div className="space-y-4">
        {apiKeys.map((key) => (
          <Card key={key.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-medium text-gray-900">{key.key_name}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(key.is_active)}`}>
                      {key.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getUsageColor(key.usage_count, key.rate_limit_per_hour)}`}>
                      {key.usage_count}/{key.rate_limit_per_hour} calls
                    </span>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div>User: {key.user_email}</div>
                    <div>API Key: <code className="bg-gray-100 px-2 py-1 rounded text-xs">{maskApiKey(key.api_key)}</code></div>
                    <div>Created: {formatDate(key.created_at)}</div>
                    {key.last_used && <div>Last Used: {formatDate(key.last_used)}</div>}
                    {key.expires_at && <div>Expires: {formatDate(key.expires_at)}</div>}
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={key.is_active}
                      onCheckedChange={(checked) => handleToggleKey(key.id, checked)}
                    />
                    <span className="text-sm text-gray-600">Active</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      value={key.rate_limit_per_hour}
                      onChange={(e) => handleUpdateRateLimit(key.id, parseInt(e.target.value))}
                      className="w-20 text-sm"
                    />
                    <span className="text-sm text-gray-600">/hour</span>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Icon icon="solar:menu-dots-bold-duotone" className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditKey(key)}>
                        <Icon icon="solar:pen-bold-duotone" className="h-4 w-4 mr-2" />
                        Edit Key
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigator.clipboard.writeText(key.api_key)}>
                        <Icon icon="solar:copy-bold-duotone" className="h-4 w-4 mr-2" />
                        Copy Key
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => handleDeleteKey(key.id)}
                      >
                        <Icon icon="solar:trash-bin-trash-bold-duotone" className="h-4 w-4 mr-2" />
                        Delete Key
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* API Documentation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon="solar:book-bold-duotone" className="h-5 w-5" />
            API Documentation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Base URL</h4>
              <code className="text-sm text-blue-800">https://api.resizesuite.com/v1</code>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Authentication</h4>
              <p className="text-sm text-green-800 mb-2">Include your API key in the Authorization header:</p>
              <code className="text-sm text-green-800">Authorization: Bearer rs_your_api_key_here</code>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-900 mb-2">Rate Limits</h4>
              <p className="text-sm text-purple-800">Each API key has a rate limit per hour. Exceeding the limit will result in a 429 status code.</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button asChild variant="outline">
                <a href="/api-docs" target="_blank" rel="noopener noreferrer">
                  <Icon icon="solar:book-bold-duotone" className="h-4 w-4 mr-2" />
                  View Full Documentation
                </a>
              </Button>
              <Button asChild variant="outline">
                <a href="/api-examples" target="_blank" rel="noopener noreferrer">
                  <Icon icon="solar:code-bold-duotone" className="h-4 w-4 mr-2" />
                  Code Examples
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
