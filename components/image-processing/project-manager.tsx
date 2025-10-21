'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { TierManager } from '@/lib/image-processing/download-manager';

interface ProjectSettings {
  id: string;
  name: string;
  description: string;
  toolType: string;
  settings: any;
  files: File[];
  createdAt: string;
  updatedAt: string;
  thumbnail?: string;
}

interface ProjectManagerProps {
  currentSettings?: any;
  currentFiles?: File[];
  toolType: string;
  onLoadProject?: (project: ProjectSettings) => void;
}

export function ProjectManager({
  currentSettings,
  currentFiles = [],
  toolType,
  onLoadProject
}: ProjectManagerProps) {
  const [projects, setProjects] = useState<ProjectSettings[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState<ProjectSettings | null>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [loadDialogOpen, setLoadDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');

  const userPlan = TierManager.getUserPlan();
  const canUseProFeatures = userPlan === 'pro';

  // Load projects from localStorage
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = useCallback(() => {
    try {
      const savedProjects = localStorage.getItem('resizesuite-projects');
      if (savedProjects) {
        const parsedProjects = JSON.parse(savedProjects);
        setProjects(parsedProjects.filter((p: ProjectSettings) => p.toolType === toolType));
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  }, [toolType]);

  const saveProject = useCallback(async () => {
    if (!currentSettings || !canUseProFeatures) return;

    setIsSaving(true);
    try {
      const projectId = `project_${Date.now()}`;
      const thumbnail = await generateThumbnail();

      const newProject: ProjectSettings = {
        id: projectId,
        name: newProjectName || `Project ${new Date().toLocaleDateString()}`,
        description: newProjectDescription,
        toolType,
        settings: currentSettings,
        files: currentFiles.map(file => ({
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified
        })) as any,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        thumbnail
      };

      const updatedProjects = [...projects, newProject];
      setProjects(updatedProjects);
      localStorage.setItem('resizesuite-projects', JSON.stringify(updatedProjects));

      setNewProjectName('');
      setNewProjectDescription('');
      setSaveDialogOpen(false);
    } catch (error) {
      console.error('Error saving project:', error);
    } finally {
      setIsSaving(false);
    }
  }, [currentSettings, currentFiles, toolType, projects, newProjectName, newProjectDescription, canUseProFeatures]);

  const loadProject = useCallback((project: ProjectSettings) => {
    if (!canUseProFeatures) return;
    
    setSelectedProject(project);
    onLoadProject?.(project);
    setLoadDialogOpen(false);
  }, [canUseProFeatures, onLoadProject]);

  const deleteProject = useCallback((projectId: string) => {
    if (!canUseProFeatures) return;
    
    const updatedProjects = projects.filter(p => p.id !== projectId);
    setProjects(updatedProjects);
    localStorage.setItem('resizesuite-projects', JSON.stringify(updatedProjects));
  }, [projects, canUseProFeatures]);

  const generateThumbnail = useCallback(async (): Promise<string | undefined> => {
    if (currentFiles.length === 0) return undefined;

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return undefined;

      const img = new Image();
      await new Promise((resolve) => {
        img.onload = () => {
          // Create thumbnail
          const maxSize = 150;
          const ratio = Math.min(maxSize / img.width, maxSize / img.height);
          canvas.width = img.width * ratio;
          canvas.height = img.height * ratio;
          
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(undefined);
        };
        img.src = URL.createObjectURL(currentFiles[0]);
      });

      return canvas.toDataURL('image/jpeg', 0.7);
    } catch (error) {
      console.error('Error generating thumbnail:', error);
      return undefined;
    }
  }, [currentFiles]);

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Project Actions */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900">Project Management</h3>
        <div className="flex items-center gap-2">
          <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                disabled={!canUseProFeatures || !currentSettings}
                className="flex items-center gap-2"
              >
                <Icon icon="solar:diskette-bold-duotone" className="h-4 w-4" />
                Save Project
                {!canUseProFeatures && <span className="text-blue-600 ml-1">(Pro)</span>}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Save Project</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="projectName">Project Name</Label>
                  <Input
                    id="projectName"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder="Enter project name"
                  />
                </div>
                <div>
                  <Label htmlFor="projectDescription">Description</Label>
                  <Input
                    id="projectDescription"
                    value={newProjectDescription}
                    onChange={(e) => setNewProjectDescription(e.target.value)}
                    placeholder="Enter project description"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={saveProject} disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Project'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={loadDialogOpen} onOpenChange={setLoadDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                disabled={!canUseProFeatures}
                className="flex items-center gap-2"
              >
                <Icon icon="solar:folder-open-bold-duotone" className="h-4 w-4" />
                Load Project
                {!canUseProFeatures && <span className="text-blue-600 ml-1">(Pro)</span>}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Load Project</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Input
                    placeholder="Search projects..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="max-h-96 overflow-y-auto space-y-3">
                  {filteredProjects.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Icon icon="solar:folder-bold-duotone" className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No projects found</p>
                      <p className="text-sm">Save your first project to get started</p>
                    </div>
                  ) : (
                    filteredProjects.map((project) => (
                      <Card key={project.id} className="p-4">
                        <div className="flex items-center space-x-4">
                          {project.thumbnail ? (
                            <img
                              src={project.thumbnail}
                              alt="Project thumbnail"
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                              <Icon icon="solar:image-bold-duotone" className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                          
                          <div className="flex-1 min-w-0">
                            <h4 className="text-lg font-semibold text-gray-900 truncate">
                              {project.name}
                            </h4>
                            <p className="text-sm text-gray-600 truncate">
                              {project.description || 'No description'}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                              <span>{project.files.length} files</span>
                              <span>Updated {formatDate(project.updatedAt)}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              onClick={() => loadProject(project)}
                            >
                              <Icon icon="solar:play-bold-duotone" className="h-4 w-4 mr-1" />
                              Load
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteProject(project.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Icon icon="solar:trash-bin-trash-bold-duotone" className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Pro Features Info */}
      {!canUseProFeatures && (
        <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <div className="flex items-center gap-3">
            <Icon icon="solar:crown-bold-duotone" className="h-6 w-6 text-blue-600" />
            <div>
              <h4 className="font-semibold text-blue-900">Pro Feature</h4>
              <p className="text-sm text-blue-700">
                Save and load projects with all your settings. Upgrade to Pro to access project management.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Recent Projects */}
      {canUseProFeatures && projects.length > 0 && (
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-4">Recent Projects</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.slice(0, 6).map((project) => (
              <Card key={project.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="space-y-3">
                  {project.thumbnail ? (
                    <img
                      src={project.thumbnail}
                      alt="Project thumbnail"
                      className="w-full h-24 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Icon icon="solar:image-bold-duotone" className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                  
                  <div>
                    <h5 className="font-semibold text-gray-900 truncate">{project.name}</h5>
                    <p className="text-sm text-gray-600 truncate">
                      {project.description || 'No description'}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">
                        {project.files.length} files
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => loadProject(project)}
                      >
                        Load
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Project Templates */}
      {canUseProFeatures && (
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-4">Project Templates</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Icon icon="solar:instagram-bold-duotone" className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h5 className="font-semibold text-gray-900">Social Media Pack</h5>
                  <p className="text-sm text-gray-600">Instagram, Facebook, Twitter presets</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Icon icon="solar:compress-bold-duotone" className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h5 className="font-semibold text-gray-900">Web Optimization</h5>
                  <p className="text-sm text-gray-600">Compressed images for web</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
