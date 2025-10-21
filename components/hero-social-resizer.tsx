'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@iconify/react';
import { FileUpload } from '@/components/image-processing/file-upload';
import { EnhancedSocialPresetsTool } from '@/components/image-processing/enhanced-social-presets-tool';
import { useAuth } from '@/lib/auth/auth-context';
import Link from 'next/link';

export function HeroSocialResizer() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingMessage, setProcessingMessage] = useState('');
  const { profile } = useAuth();

  const handleFilesSelected = useCallback((files: File[]) => {
    setSelectedFiles(files);
  }, []);

  const handleProcessingStart = useCallback(() => {
    setIsProcessing(true);
    setProcessingProgress(0);
  }, []);

  const handleProcessingEnd = useCallback(() => {
    setIsProcessing(false);
  }, []);

  const handleProgress = useCallback((progress: number, message?: string) => {
    setProcessingProgress(progress);
    if (message) {
      setProcessingMessage(message);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">ResizeSuite</h1>
            </div>
            <div className="flex items-center gap-4">
              {profile ? (
                <div className="flex items-center gap-3">
                  <div className="text-sm text-gray-600">
                    Welcome, {profile.name || profile.email}
                  </div>
                  <Link href="/dashboard">
                    <Button variant="outline" size="sm">
                      Dashboard
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link href="/sign-in">
                    <Button variant="ghost" size="sm">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/sign-up">
                    <Button size="sm">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
              <Link href="/pricing">
                <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white">
                  <Icon icon="solar:crown-bold-duotone" className="h-4 w-4 mr-2" />
                  Upgrade
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Free online image resizer for social media and custom sizes
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Transform your images into the perfect sizes for Facebook, Instagram, Twitter, YouTube, LinkedIn, Pinterest, and more. 
            Upload once, resize for all platforms instantly.
          </p>
        </div>

        {/* Main Resizer Interface */}
        <Card className="bg-white shadow-xl rounded-2xl p-8 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upload Section */}
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon icon="solar:cloud-upload-bold-duotone" className="h-12 w-12 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Drag & drop your image or click to upload
                </h3>
                <FileUpload
                  onFilesSelected={handleFilesSelected}
                  maxFiles={profile?.plan_name === 'pro' ? 100 : 5}
                  acceptedTypes={['image/jpeg', 'image/png', 'image/webp', 'image/gif']}
                />
                {selectedFiles.length > 0 && (
                  <div className="mt-4">
                    <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white">
                      <Icon icon="solar:upload-bold-duotone" className="h-4 w-4 mr-2" />
                      Upload now
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Custom Resize Section */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Custom resize</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Width</label>
                    <div className="relative">
                      <input
                        type="number"
                        defaultValue="1000"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex flex-col">
                        <button className="text-gray-400 hover:text-gray-600">
                          <Icon icon="solar:alt-arrow-up-bold-duotone" className="h-3 w-3" />
                        </button>
                        <button className="text-gray-400 hover:text-gray-600">
                          <Icon icon="solar:alt-arrow-down-bold-duotone" className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Height</label>
                    <div className="relative">
                      <input
                        type="number"
                        defaultValue="1000"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex flex-col">
                        <button className="text-gray-400 hover:text-gray-600">
                          <Icon icon="solar:alt-arrow-up-bold-duotone" className="h-3 w-3" />
                        </button>
                        <button className="text-gray-400 hover:text-gray-600">
                          <Icon icon="solar:alt-arrow-down-bold-duotone" className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <Button className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white">
                  <Icon icon="solar:resize-bold-duotone" className="h-4 w-4 mr-2" />
                  Resize now
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Social Media Presets */}
        {selectedFiles.length > 0 && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Resize your image for social media</h2>
              <p className="text-gray-600">
                Choose from our comprehensive collection of social media presets or select custom sizes
              </p>
            </div>

            <EnhancedSocialPresetsTool
              files={selectedFiles}
              onProcessingStart={handleProcessingStart}
              onProcessingEnd={handleProcessingEnd}
              onProgress={handleProgress}
            />
          </div>
        )}

        {/* Processing Progress */}
        {isProcessing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="bg-white p-8 max-w-md w-full mx-4">
              <div className="text-center">
                <Icon icon="solar:refresh-bold-duotone" className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Processing Images</h3>
                <p className="text-gray-600 mb-4">{processingMessage}</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-600 to-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${processingProgress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">{Math.round(processingProgress)}% complete</p>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
