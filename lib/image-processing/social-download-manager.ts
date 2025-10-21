/**
 * Enhanced Download Manager for Social Media Presets
 * Supports individual and bulk downloads with ZIP functionality
 */

import JSZip from 'jszip';

export interface SocialDownloadOptions {
  filename?: string;
  format?: 'jpeg' | 'png' | 'webp';
  quality?: number;
}

export interface ProcessedSocialFile {
  id: string;
  file: File;
  result?: Blob;
  preset?: string;
  platform?: string;
  suffix?: string;
  error?: string;
}

export class SocialDownloadManager {
  /**
   * Download a single processed file
   */
  static downloadSingle(
    processedFile: ProcessedSocialFile, 
    options: SocialDownloadOptions = {}
  ): void {
    if (!processedFile.result) {
      console.error('No result to download');
      return;
    }

    const filename = this.generateFilename(processedFile, options);
    const url = URL.createObjectURL(processedFile.result);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  /**
   * Download multiple files as individual downloads
   */
  static downloadMultiple(
    processedFiles: ProcessedSocialFile[],
    options: SocialDownloadOptions = {}
  ): void {
    const successfulFiles = processedFiles.filter(f => f.result && !f.error);
    
    if (successfulFiles.length === 0) {
      console.error('No successful files to download');
      return;
    }

    // Download each file individually with a small delay
    successfulFiles.forEach((file, index) => {
      setTimeout(() => {
        this.downloadSingle(file, options);
      }, index * 100); // 100ms delay between downloads
    });
  }

  /**
   * Download multiple files as a ZIP archive
   */
  static async downloadAsZip(
    processedFiles: ProcessedSocialFile[],
    options: SocialDownloadOptions = {}
  ): Promise<void> {
    const successfulFiles = processedFiles.filter(f => f.result && !f.error);
    
    if (successfulFiles.length === 0) {
      console.error('No successful files to download');
      return;
    }

    try {
      const zip = new JSZip();
      
      // Group files by platform for better organization
      const filesByPlatform = successfulFiles.reduce((acc, file) => {
        const platform = file.platform || 'unknown';
        if (!acc[platform]) {
          acc[platform] = [];
        }
        acc[platform].push(file);
        return acc;
      }, {} as Record<string, ProcessedSocialFile[]>);

      // Add files to ZIP with organized folder structure
      for (const [platform, files] of Object.entries(filesByPlatform)) {
        const platformFolder = zip.folder(platform);
        
        for (const file of files) {
          if (file.result) {
            const filename = this.generateFilename(file, options);
            platformFolder?.file(filename, file.result);
          }
        }
      }

      // Generate and download ZIP
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `social-media-resized-${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error creating ZIP file:', error);
      // Fallback to individual downloads
      this.downloadMultiple(processedFiles, options);
    }
  }

  /**
   * Download all sizes for a specific platform
   */
  static async downloadPlatformSizes(
    processedFiles: ProcessedSocialFile[],
    platform: string,
    options: SocialDownloadOptions = {}
  ): Promise<void> {
    const platformFiles = processedFiles.filter(f => f.platform === platform && f.result && !f.error);
    
    if (platformFiles.length === 0) {
      console.error(`No files found for platform: ${platform}`);
      return;
    }

    if (platformFiles.length === 1) {
      this.downloadSingle(platformFiles[0], options);
    } else {
      await this.downloadAsZip(platformFiles, options);
    }
  }

  /**
   * Generate filename for downloaded file
   */
  private static generateFilename(
    processedFile: ProcessedSocialFile, 
    options: SocialDownloadOptions
  ): string {
    const originalName = processedFile.file.name.split('.')[0];
    const extension = options.format || 'jpg';
    const suffix = processedFile.suffix ? `-${processedFile.suffix}` : '';
    const platform = processedFile.platform ? `-${processedFile.platform.toLowerCase()}` : '';
    
    return `${originalName}${platform}${suffix}.${extension}`;
  }

  /**
   * Get download statistics
   */
  static getDownloadStats(processedFiles: ProcessedSocialFile[]): {
    total: number;
    successful: number;
    failed: number;
    byPlatform: Record<string, number>;
  } {
    const successful = processedFiles.filter(f => f.result && !f.error);
    const failed = processedFiles.filter(f => f.error);
    
    const byPlatform = successful.reduce((acc, file) => {
      const platform = file.platform || 'unknown';
      acc[platform] = (acc[platform] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: processedFiles.length,
      successful: successful.length,
      failed: failed.length,
      byPlatform
    };
  }

  /**
   * Preview file before download
   */
  static previewFile(processedFile: ProcessedSocialFile): string | null {
    if (!processedFile.result) {
      return null;
    }
    return URL.createObjectURL(processedFile.result);
  }

  /**
   * Clean up preview URLs
   */
  static cleanupPreview(url: string): void {
    URL.revokeObjectURL(url);
  }
}
