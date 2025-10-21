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

interface CodeInjection {
  id: string;
  injection_name: string;
  injection_type: 'head' | 'body_start' | 'body_end' | 'analytics';
  injection_code: string;
  is_active: boolean;
  target_pages: string[];
  priority: number;
  created_at: string;
  updated_at: string;
}

export default function CodeInjectionPage() {
  const [injections, setInjections] = useState<CodeInjection[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingInjection, setEditingInjection] = useState<CodeInjection | null>(null);
  const [formData, setFormData] = useState<{
    injection_name: string;
    injection_type: 'head' | 'body_start' | 'body_end' | 'analytics';
    injection_code: string;
    is_active: boolean;
    target_pages: string[];
    priority: number;
  }>({
    injection_name: '',
    injection_type: 'analytics',
    injection_code: '',
    is_active: true,
    target_pages: [],
    priority: 0
  });

  useEffect(() => {
    fetchInjections();
  }, []);

  const fetchInjections = async () => {
    try {
      const response = await fetch('/api/admin/code-injections');
      if (response.ok) {
        const data = await response.json();
        setInjections(data);
      }
    } catch (error) {
      console.error('Error fetching injections:', error);
      toast.error('Failed to fetch code injections');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingInjection ? `/api/admin/code-injections/${editingInjection.id}` : '/api/admin/code-injections';
      const method = editingInjection ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(editingInjection ? 'Code injection updated successfully' : 'Code injection created successfully');
        setIsDialogOpen(false);
        setEditingInjection(null);
        resetForm();
        fetchInjections();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to save code injection');
      }
    } catch (error) {
      console.error('Error saving injection:', error);
      toast.error('Failed to save code injection');
    }
  };

  const handleEdit = (injection: CodeInjection) => {
    setEditingInjection(injection);
    setFormData({
      injection_name: injection.injection_name,
      injection_type: injection.injection_type,
      injection_code: injection.injection_code,
      is_active: injection.is_active,
      target_pages: injection.target_pages,
      priority: injection.priority
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this code injection?')) return;
    
    try {
      const response = await fetch(`/api/admin/code-injections/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Code injection deleted successfully');
        fetchInjections();
      } else {
        toast.error('Failed to delete code injection');
      }
    } catch (error) {
      console.error('Error deleting injection:', error);
      toast.error('Failed to delete code injection');
    }
  };

  const resetForm = () => {
    setFormData({
      injection_name: '',
      injection_type: 'analytics',
      injection_code: '',
      is_active: true,
      target_pages: [],
      priority: 0
    });
  };

  const handleNewInjection = () => {
    setEditingInjection(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const getInjectionTypeDescription = (type: string) => {
    switch (type) {
      case 'head':
        return 'Injected in <head> section - for meta tags, CSS, etc.';
      case 'body_start':
        return 'Injected at start of <body> - for tracking scripts';
      case 'body_end':
        return 'Injected at end of <body> - for analytics scripts';
      case 'analytics':
        return 'Analytics scripts (Google Analytics, etc.)';
      default:
        return '';
    }
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
          <h1 className="text-3xl font-bold">Code Injection Management</h1>
          <p className="text-gray-600">Manage Google Analytics and custom code injections</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNewInjection}>
              <Icon icon="solar:add-circle-bold-duotone" className="h-4 w-4 mr-2" />
              Add Code Injection
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingInjection ? 'Edit Code Injection' : 'Add New Code Injection'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="injection_name">Injection Name</Label>
                  <Input
                    id="injection_name"
                    value={formData.injection_name}
                    onChange={(e) => setFormData({ ...formData, injection_name: e.target.value })}
                    placeholder="e.g., Google Analytics"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="injection_type">Injection Type</Label>
                  <select
                    id="injection_type"
                    value={formData.injection_type}
                    onChange={(e) => setFormData({ ...formData, injection_type: e.target.value as any })}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="analytics">Analytics</option>
                    <option value="head">Head Section</option>
                    <option value="body_start">Body Start</option>
                    <option value="body_end">Body End</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="injection_code">Code</Label>
                <textarea
                  id="injection_code"
                  value={formData.injection_code}
                  onChange={(e) => setFormData({ ...formData, injection_code: e.target.value })}
                  className="w-full p-2 border rounded-md h-40 font-mono text-sm"
                  placeholder="Paste your code here (e.g., Google Analytics tracking code)..."
                  required
                />
                <p className="text-sm text-gray-600 mt-1">
                  {getInjectionTypeDescription(formData.injection_type)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Input
                    id="priority"
                    type="number"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                  <p className="text-sm text-gray-600">Higher numbers inject first</p>
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingInjection ? 'Update Injection' : 'Create Injection'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {injections.map((injection) => (
          <Card key={injection.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {injection.injection_name}
                    {injection.is_active ? (
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
                    {injection.injection_type} • Priority: {injection.priority}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(injection)}
                  >
                    <Icon icon="solar:pen-bold-duotone" className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(injection.id)}
                  >
                    <Icon icon="solar:trash-bin-trash-bold-duotone" className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <strong>Code Preview:</strong>
                  <div className="mt-1 p-2 bg-gray-50 rounded text-sm font-mono">
                    {injection.injection_code.substring(0, 150)}
                    {injection.injection_code.length > 150 && '...'}
                  </div>
                </div>
                <div>
                  <strong>Created:</strong> {new Date(injection.created_at).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {injections.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Icon icon="solar:code-bold-duotone" className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Code Injections</h3>
            <p className="text-gray-600 mb-4">Add Google Analytics or other tracking scripts</p>
            <Button onClick={handleNewInjection}>
              <Icon icon="solar:add-circle-bold-duotone" className="h-4 w-4 mr-2" />
              Add Code Injection
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
