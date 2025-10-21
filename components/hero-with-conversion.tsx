'use client';

import { useState, useCallback } from 'react';
import JSZip from 'jszip';
import { HeroSection } from '@/components/layout/hero-section';
import { TinyPNGStyleResults } from '@/components/tinypng-style-results';

interface ConvertedVersion {
  format: string;
  file: File;
  downloadUrl: string;
  sizeChange: number;
}

interface UploadedFile {
  id: string;
  file: File;
  preview: string;
  name: string;
  size: number;
  converted?: boolean;
  downloadUrl?: string;
  originalFile?: File;
  convertedVersions?: ConvertedVersion[];
  isConverting?: boolean;
  convertingFormat?: string;
}

export function HeroWithConversion() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [autoConvert, setAutoConvert] = useState(false);
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  const [quality, setQuality] = useState(0.8);
  const [conversionMode, setConversionMode] = useState<'smart' | 'custom'>('smart');
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);

  const handleFormatToggle = useCallback((format: string) => {
    setSelectedFormats(prev =>
      prev.includes(format) ? prev.filter(f => f !== format) : [...prev, format]
    );
  }, []);

  const handleSelectAllFormats = useCallback(() => {
    if (selectedFormats.length === 4) {
      setSelectedFormats([]);
    } else {
      setSelectedFormats(['AVIF', 'JPEG', 'PNG', 'WEBP']);
    }
  }, [selectedFormats.length]);

  const convertImage = useCallback(async (file: File, targetFormat: string, quality: number = 0.8): Promise<File> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0);

          const mimeType = `image/${targetFormat.toLowerCase()}`;
          
          let outputQuality = quality;
          if (targetFormat === 'PNG') {
            outputQuality = 1.0;
          } else if (targetFormat === 'AVIF') {
            outputQuality = Math.max(0.6, quality);
          } else if (targetFormat === 'WEBP') {
            outputQuality = Math.max(0.7, quality);
          } else if (targetFormat === 'JPEG') {
            outputQuality = Math.max(0.6, quality);
          }

          canvas.toBlob((blob) => {
            if (blob) {
              const convertedFile = new File([blob], `${file.name.split('.')[0]}.${targetFormat.toLowerCase()}`, { type: mimeType });
              resolve(convertedFile);
            } else {
              resolve(file);
            }
          }, mimeType, outputQuality);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const getSmartFormat = (file: File): string => {
    const fileType = file.type;
    const fileSize = file.size;
    
    if (fileSize < 500 * 1024) return 'WEBP';
    if (fileSize < 2 * 1024 * 1024) return 'AVIF';
    return 'JPEG';
  };

  const handleFileUpload = useCallback(async (files: FileList | null) => {
    if (!files) return;

    console.log('Files received:', files.length);
    const maxFiles = 5;
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp'];

    // Check if adding these files would exceed the limit
    if (uploadedFiles.length + files.length > maxFiles) {
      alert(`You can only upload up to ${maxFiles} images at once. You currently have ${uploadedFiles.length} images.`);
      return;
    }

    for (const file of Array.from(files)) {
      console.log('Processing file:', file.name, 'Type:', file.type, 'Size:', file.size);
      
      if (uploadedFiles.length >= maxFiles) {
        console.log('Max files reached');
        alert(`Maximum ${maxFiles} images allowed.`);
        break;
      }
      if (file.size > maxSize) {
        console.log('File too large:', file.size);
        alert(`File "${file.name}" is too large. Maximum size is 10MB.`);
        continue;
      }
      if (!allowedTypes.includes(file.type)) {
        console.log('File type not allowed:', file.type);
        alert(`File "${file.name}" is not a supported image format.`);
        continue;
      }

      const reader = new FileReader();
      reader.onload = async (e) => {
        const preview = e.target?.result as string;
        const uploadedFile: UploadedFile = {
          id: Math.random().toString(36).substr(2, 9),
          file,
          preview,
          name: file.name,
          size: file.size,
          downloadUrl: URL.createObjectURL(file),
        };
        
        console.log('Adding file to state:', uploadedFile);
        setUploadedFiles(prev => {
          const newFiles = [...prev, uploadedFile];
          console.log('New files state:', newFiles);
          return newFiles;
        });

        // Don't auto-convert - let user choose formats
        // if (conversionMode === 'smart') {
        //   console.log('Auto-converting to all formats like TinyPNG');
        //   
        //   // Add a small delay to show the file first, then convert to all formats
        //   setTimeout(async () => {
        //     const formats = ['JPEG', 'PNG', 'WEBP'];
        //     for (const format of formats) {
        //       await handleConvertFile(uploadedFile.id, format);
        //       // Small delay between conversions
        //       await new Promise(resolve => setTimeout(resolve, 300));
        //     }
        //   }, 500);
        // }
      };
      
      reader.readAsDataURL(file);
    }
  }, [uploadedFiles.length, selectedFormats.length, conversionMode]);

  const handleDownload = useCallback((file: UploadedFile) => {
    if (file.downloadUrl) {
      const link = document.createElement('a');
      link.href = file.downloadUrl;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, []);

  const handleDownloadAll = useCallback(async () => {
    if (uploadedFiles.length === 0) return;

    setIsDownloadingAll(true);
    
    try {
      const zip = new JSZip();
      let fileCount = 0;

      // Add original files
      uploadedFiles.forEach(file => {
        if (file.downloadUrl) {
          const fileName = file.name;
          zip.file(`originals/${fileName}`, file.file);
          fileCount++;
        }
      });

      // Add converted files
      uploadedFiles.forEach(file => {
        if (file.convertedVersions) {
          file.convertedVersions.forEach(version => {
            const fileName = `${file.name.split('.')[0]}.${version.format.toLowerCase()}`;
            zip.file(`converted/${fileName}`, version.file);
            fileCount++;
          });
        }
      });

      if (fileCount === 0) {
        alert('No files to download');
        return;
      }

      // Generate ZIP file
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      
      // Create download link
      const link = document.createElement('a');
      link.href = URL.createObjectURL(zipBlob);
      link.download = `resize-suite-images-${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL
      URL.revokeObjectURL(link.href);
      
    } catch (error) {
      console.error('Error creating ZIP file:', error);
      alert('Error creating ZIP file. Please try downloading files individually.');
    } finally {
      setIsDownloadingAll(false);
    }
  }, [uploadedFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  }, [handleFileUpload]);

  const handleConvertFile = useCallback(async (fileId: string, format: string) => {
    const file = uploadedFiles.find(f => f.id === fileId);
    if (!file) return;

    // Set loading state
    setUploadedFiles(prev => prev.map(f => 
      f.id === fileId 
        ? { 
            ...f, 
            isConverting: true,
            convertingFormat: format
          }
        : f
    ));

    try {
      const convertedFile = await convertImage(file.file, format, quality);
      const newDownloadUrl = URL.createObjectURL(convertedFile);
      const sizeChange = Math.round(((convertedFile.size - file.size) / file.size) * 100);
      
      const newVersion: ConvertedVersion = {
        format,
        file: convertedFile,
        downloadUrl: newDownloadUrl,
        sizeChange
      };
      
      setUploadedFiles(prev => prev.map(f => 
        f.id === fileId 
          ? { 
              ...f, 
              convertedVersions: [...(f.convertedVersions || []), newVersion],
              converted: true,
              isConverting: false,
              convertingFormat: undefined
            }
          : f
      ));
    } catch (error) {
      console.error('Conversion failed:', error);
      // Reset loading state on error
      setUploadedFiles(prev => prev.map(f => 
        f.id === fileId 
          ? { 
              ...f, 
              isConverting: false,
              convertingFormat: undefined
            }
          : f
      ));
    }
  }, [uploadedFiles, convertImage, quality]);

  const handleDownloadConverted = useCallback((version: ConvertedVersion, originalName: string) => {
    const link = document.createElement('a');
    link.href = version.downloadUrl;
    link.download = `${originalName.split('.')[0]}.${version.format.toLowerCase()}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const handleRemoveFile = useCallback((fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  }, []);

  const handleClearAll = useCallback(() => {
    setUploadedFiles([]);
  }, []);

  return (
    <>
      <HeroSection 
        uploadedFiles={uploadedFiles}
        isDragOver={isDragOver}
        onFileUpload={handleFileUpload}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <TinyPNGStyleResults
          uploadedFiles={uploadedFiles}
          onRemoveFile={handleRemoveFile}
          onClearAll={handleClearAll}
          onDownloadAll={handleDownloadAll}
          onConvertFile={handleConvertFile}
          onDownloadFile={handleDownload}
          onDownloadConverted={handleDownloadConverted}
          isDownloadingAll={isDownloadingAll}
        />
      </HeroSection>
    </>
  );
}
