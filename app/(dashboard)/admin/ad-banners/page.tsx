'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';

interface AdBanner {
  id: string;
  banner_name: string;
  banner_type: 'image' | 'code' | 'google_adsense';
  banner_content: string;
  banner_position: 'header' | 'sidebar' | 'footer' | 'between_content';
  is_active: boolean;
  display_pages: string[];
  click_url?: string;
  alt_text?: string;
  created_at: string;
  updated_at: string;
}

export default function AdBannersPage() {
  const [banners, setBanners] = useState<AdBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<AdBanner | null>(null);
  const [formData, setFormData] = useState<{
    banner_name: string;
    banner_type: 'image' | 'code' | 'google_adsense';
    banner_content: string;
    banner_position: 'header' | 'sidebar' | 'footer' | 'between_content';
    is_active: boolean;
    display_pages: string[];
    click_url: string;
    alt_text: string;
  }>({
    banner_name: '',
    banner_type: 'google_adsense',
    banner_content: '',
    banner_position: 'between_content',
    is_active: true,
    display_pages: [],
    click_url: '',
    alt_text: ''
  });

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const response = await fetch('/api/admin/ad-banners');
      if (response.ok) {
        const data = await response.json();
        setBanners(data);
      }
    } catch (error) {
      console.error('Error fetching banners:', error);
      toast.error('Failed to fetch ad banners');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingBanner ? `/api/admin/ad-banners/${editingBanner.id}` : '/api/admin/ad-banners';
      const method = editingBanner ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(editingBanner ? 'Banner updated successfully' : 'Banner created successfully');
        setIsDialogOpen(false);
        setEditingBanner(null);
        resetForm();
        fetchBanners();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to save banner');
      }
    } catch (error) {
      console.error('Error saving banner:', error);
      toast.error('Failed to save banner');
    }
  };

  const handleEdit = (banner: AdBanner) => {
    setEditingBanner(banner);
    setFormData({
      banner_name: banner.banner_name,
      banner_type: banner.banner_type,
      banner_content: banner.banner_content,
      banner_position: banner.banner_position,
      is_active: banner.is_active,
      display_pages: banner.display_pages,
      click_url: banner.click_url || '',
      alt_text: banner.alt_text || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;
    
    try {
      const response = await fetch(`/api/admin/ad-banners/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Banner deleted successfully');
        fetchBanners();
      } else {
        toast.error('Failed to delete banner');
      }
    } catch (error) {
      console.error('Error deleting banner:', error);
      toast.error('Failed to delete banner');
    }
  };

  const resetForm = () => {
    setFormData({
      banner_name: '',
      banner_type: 'google_adsense',
      banner_content: '',
      banner_position: 'between_content',
      is_active: true,
      display_pages: [],
      click_url: '',
      alt_text: ''
    });
  };

  const handleNewBanner = () => {
    setEditingBanner(null);
    resetForm();
    setIsDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Icon icon="solar:refresh-bold-duotone" className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Ad Banner Management</h1>
          <p className="text-gray-600">Manage ad banners and Google AdSense integration</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNewBanner}>
              <Icon icon="solar:add-circle-bold-duotone" className="h-4 w-4 mr-2" />
              Add Banner
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingBanner ? 'Edit Banner' : 'Add New Banner'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="banner_name">Banner Name</Label>
                  <Input
                    id="banner_name"
                    value={formData.banner_name}
                    onChange={(e) => setFormData({ ...formData, banner_name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="banner_type">Banner Type</Label>
                  <select
                    id="banner_type"
                    value={formData.banner_type}
                    onChange={(e) => setFormData({ ...formData, banner_type: e.target.value as any })}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="google_adsense">Google AdSense</option>
                    <option value="image">Image Banner</option>
                    <option value="code">Custom HTML Code</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="banner_position">Position</Label>
                <select
                  id="banner_position"
                  value={formData.banner_position}
                  onChange={(e) => setFormData({ ...formData, banner_position: e.target.value as any })}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="between_content">Between Content (Tool Pages)</option>
                  <option value="header">Header</option>
                  <option value="sidebar">Sidebar</option>
                  <option value="footer">Footer</option>
                </select>
              </div>

              <div>
                <Label htmlFor="banner_content">
                  {formData.banner_type === 'google_adsense' ? 'Google AdSense Code' : 
                   formData.banner_type === 'image' ? 'Image URL' : 'HTML Code'}
                </Label>
                <textarea
                  id="banner_content"
                  value={formData.banner_content}
                  onChange={(e) => setFormData({ ...formData, banner_content: e.target.value })}
                  className="w-full p-2 border rounded-md h-32"
                  placeholder={
                    formData.banner_type === 'google_adsense' ? 
                    'Paste your Google AdSense code here...' :
                    formData.banner_type === 'image' ?
                    'Enter image URL...' :
                    'Enter HTML code...'
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="click_url">Click URL (optional)</Label>
                  <Input
                    id="click_url"
                    value={formData.click_url}
                    onChange={(e) => setFormData({ ...formData, click_url: e.target.value })}
                    placeholder="https://example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="alt_text">Alt Text (optional)</Label>
                  <Input
                    id="alt_text"
                    value={formData.alt_text}
                    onChange={(e) => setFormData({ ...formData, alt_text: e.target.value })}
                    placeholder="Banner description"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingBanner ? 'Update Banner' : 'Create Banner'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {banners.map((banner) => (
          <Card key={banner.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {banner.banner_name}
                    {banner.is_active ? (
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                        Inactive
                      </span>
                    )}
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    {banner.banner_type} • {banner.banner_position}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(banner)}
                  >
                    <Icon icon="solar:pen-bold-duotone" className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(banner.id)}
                  >
                    <Icon icon="solar:trash-bin-trash-bold-duotone" className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <strong>Content Preview:</strong>
                  <div className="mt-1 p-2 bg-gray-50 rounded text-sm font-mono">
                    {banner.banner_content.substring(0, 100)}
                    {banner.banner_content.length > 100 && '...'}
                  </div>
                </div>
                {banner.click_url && (
                  <div>
                    <strong>Click URL:</strong> {banner.click_url}
                  </div>
                )}
                <div>
                  <strong>Created:</strong> {new Date(banner.created_at).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {banners.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Icon icon="solar:advertising-bold-duotone" className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Ad Banners</h3>
            <p className="text-gray-600 mb-4">Create your first ad banner to start monetizing your site</p>
            <Button onClick={handleNewBanner}>
              <Icon icon="solar:add-circle-bold-duotone" className="h-4 w-4 mr-2" />
              Add Banner
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
