'use client';

import { Icon } from '@iconify/react';

interface UploadedFile {
  id: string;
  file: File;
  preview: string;
  name: string;
  size: number;
  converted?: boolean;
  downloadUrl?: string;
  originalFile?: File;
  convertedVersions?: any[];
  isConverting?: boolean;
  convertingFormat?: string;
}

interface HeroSectionProps {
  uploadedFiles: UploadedFile[];
  isDragOver: boolean;
  onFileUpload: (files: FileList | null) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  children?: React.ReactNode;
}

export function HeroSection({ 
  uploadedFiles, 
  isDragOver, 
  onFileUpload, 
  onDragOver, 
  onDragLeave, 
  onDrop,
  children
}: HeroSectionProps) {

  return (
        <section className="relative overflow-hidden pt-16" style={{ background: 'linear-gradient(135deg, #f0f4f8 0%, #e8edf2 100%)' }}>
          <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
            {/* Single Column Layout */}
            <div className="text-center">
              {/* Main Headline */}
              <h1 className="mx-auto max-w-4xl text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl lg:text-4xl xl:text-5xl leading-tight">
                Professional Image Resizer -{' '}
                <span className="text-black">
                  Fast, Free, and 100% Private
                </span>
              </h1>

              {/* Subheadline */}
              <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-gray-600 sm:text-lg">
                Resize, compress, and optimize images instantly without uploading files to server. 
                Perfect for social media, websites, and professional projects.
              </p>

              {/* Trust Indicators */}
              <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Icon icon="solar:shield-check-bold-duotone" className="h-5 w-5 text-blue-600" />
                  <span>100% Private</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Icon icon="solar:server-minimalistic-bold-duotone" className="h-5 w-5 text-blue-600" />
                  <span>No Server Upload</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Icon icon="solar:flash-bold-duotone" className="h-5 w-5 text-blue-600" />
                  <span>Instant Results</span>
                </div>
              </div>

              {/* Upload Area */}
              <div className="mt-8 max-w-xl mx-auto">
                <div
                  className={`relative rounded-2xl p-12 text-center transition-all duration-500 ${
                    isDragOver
                      ? 'bg-gradient-to-br from-blue-50 via-white to-blue-50 scale-105 shadow-2xl border-2 border-blue-200'
                      : uploadedFiles.length > 0
                      ? 'bg-gradient-to-br from-green-50 via-white to-green-50 shadow-xl border border-green-200/50'
                      : 'bg-gradient-to-br from-white via-gray-50/50 to-white shadow-xl border border-gray-200/50 hover:shadow-2xl hover:scale-102'
                  }`}
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onDrop={onDrop}
                >
                  <div className="space-y-6">
                    <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full transition-all duration-500 ${
                      isDragOver 
                        ? 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg scale-110' 
                        : uploadedFiles.length > 0
                        ? 'bg-gradient-to-br from-green-500 to-green-600 shadow-lg'
                        : 'bg-gradient-to-br from-blue-100 to-blue-200 shadow-md'
                    }`}>
                      <Icon 
                        icon={uploadedFiles.length > 0 ? "solar:check-circle-bold-duotone" : "solar:cloud-upload-bold-duotone"}
                        className={`h-10 w-10 transition-all duration-500 ${
                          isDragOver || uploadedFiles.length > 0 ? 'text-white' : 'text-blue-600'
                        }`} 
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <h3 className={`text-xl font-bold transition-colors duration-300 ${
                        isDragOver ? 'text-blue-700' : uploadedFiles.length > 0 ? 'text-green-700' : 'text-gray-800'
                      }`}>
                        {uploadedFiles.length > 0 ? 'Files uploaded successfully!' : 'Drop your images here!'}
                      </h3>
                      <p className="text-base text-gray-500 font-medium">
                        {uploadedFiles.length > 0 ? `${uploadedFiles.length} image${uploadedFiles.length !== 1 ? 's' : ''} ready for conversion` : 'Up to 5 images, max 10MB each'}
                      </p>
                      {uploadedFiles.length > 0 && (
                        <div className="flex items-center justify-center space-x-4 text-xs text-green-600 mt-4">
                          <div className="flex items-center space-x-1">
                            <Icon icon="solar:check-circle-bold-duotone" className="h-3 w-3" />
                            <span>Uploaded</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Icon icon="solar:settings-bold-duotone" className="h-3 w-3" />
                            <span>Choose formats below</span>
                          </div>
                        </div>
                      )}
                      {uploadedFiles.length === 0 && (
                        <div className="flex items-center justify-center space-x-4 text-xs text-gray-400 mt-4">
                          <div className="flex items-center space-x-1">
                            <Icon icon="solar:shield-check-bold-duotone" className="h-3 w-3" />
                            <span>Secure</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Icon icon="solar:flash-bold-duotone" className="h-3 w-3" />
                            <span>Fast</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Icon icon="solar:lock-bold-duotone" className="h-3 w-3" />
                            <span>Private</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => onFileUpload(e.target.files)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                  
                  {/* Subtle animated background elements */}
                  <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
                    <div className={`absolute -top-2 -right-2 w-16 h-16 rounded-full blur-xl animate-pulse ${
                      uploadedFiles.length > 0 ? 'bg-green-200/20' : 'bg-blue-200/20'
                    }`}></div>
                    <div className={`absolute -bottom-2 -left-2 w-20 h-20 rounded-full blur-xl animate-pulse delay-1000 ${
                      uploadedFiles.length > 0 ? 'bg-green-200/20' : 'bg-green-200/20'
                    }`}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Results Section */}
          {children}

      {/* Floating Elements */}
      <div className="absolute -top-10 -right-10 h-20 w-20 rounded-full bg-blue-400/20 blur-xl"></div>
      <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-green-400/20 blur-xl"></div>
    </section>
  );
}
