/**
 * ZIP Download Helper for Batch Processing
 */

import JSZip from 'jszip';
import { ProcessedFile } from '@/lib/types/enhanced-tools';

export interface ZipFile {
  filename: string;
  data: Blob;
  originalName?: string;
}

/**
 * Create ZIP file from processed files
 */
export async function createZipFromFiles(files: ProcessedFile[]): Promise<Blob> {
  const zip = new JSZip();
  
  for (const processedFile of files) {
    if (processedFile.result?.data) {
      const filename = processedFile.result.filename || processedFile.file.name;
      zip.file(filename, processedFile.result.data);
    }
  }
  
  return await zip.generateAsync({ type: 'blob' });
}

/**
 * Create ZIP file from array of files with data
 */
export async function createZipFromFileData(files: ZipFile[]): Promise<Blob> {
  const zip = new JSZip();
  
  for (const file of files) {
    zip.file(file.filename, file.data);
  }
  
  return await zip.generateAsync({ type: 'blob' });
}

/**
 * Download ZIP file
 */
export function downloadZip(blob: Blob, filename: string = 'processed-images.zip'): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Download ZIP file with progress callback
 */
export async function downloadZipWithProgress(
  files: ProcessedFile[], 
  filename: string = 'processed-images.zip',
  onProgress?: (progress: number) => void
): Promise<void> {
  const zip = new JSZip();
  let processedCount = 0;
  
  for (const processedFile of files) {
    if (processedFile.result?.data) {
      const fileFilename = processedFile.result.filename || processedFile.file.name;
      zip.file(fileFilename, processedFile.result.data);
    }
    processedCount++;
    
    if (onProgress) {
      onProgress((processedCount / files.length) * 100);
    }
  }
  
  const zipBlob = await zip.generateAsync({ 
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: {
      level: 6
    }
  });
  
  downloadZip(zipBlob, filename);
}

/**
 * Create ZIP with custom naming pattern
 */
export async function createZipWithPattern(
  files: ProcessedFile[],
  pattern: (originalName: string, index: number) => string
): Promise<Blob> {
  const zip = new JSZip();
  
  files.forEach((processedFile, index) => {
    if (processedFile.result?.data) {
      const originalName = processedFile.file.name.replace(/\.[^/.]+$/, '');
      const extension = processedFile.file.name.split('.').pop() || 'png';
      const customFilename = pattern(originalName, index);
      const filename = `${customFilename}.${extension}`;
      
      zip.file(filename, processedFile.result.data);
    }
  });
  
  return await zip.generateAsync({ type: 'blob' });
}

/**
 * Get ZIP file size estimate
 */
export function getZipSizeEstimate(files: ProcessedFile[]): number {
  return files.reduce((total, file) => {
    return total + (file.result?.processedSize || file.file.size);
  }, 0);
}

/**
 * Validate files before creating ZIP
 */
export function validateFilesForZip(files: ProcessedFile[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (files.length === 0) {
    errors.push('No files to process');
  }
  
  const processedCount = files.filter(f => f.result?.data).length;
  if (processedCount === 0) {
    errors.push('No successfully processed files');
  }
  
  const totalSize = getZipSizeEstimate(files);
  const maxSize = 100 * 1024 * 1024; // 100MB limit
  if (totalSize > maxSize) {
    errors.push(`Total file size (${Math.round(totalSize / 1024 / 1024)}MB) exceeds 100MB limit`);
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Create ZIP with metadata file
 */
export async function createZipWithMetadata(
  files: ProcessedFile[],
  metadata?: {
    tool?: string;
    settings?: Record<string, any>;
    timestamp?: Date;
    version?: string;
  }
): Promise<Blob> {
  const zip = new JSZip();
  
  // Add processed files
  for (const processedFile of files) {
    if (processedFile.result?.data) {
      const filename = processedFile.result.filename || processedFile.file.name;
      zip.file(filename, processedFile.result.data);
    }
  }
  
  // Add metadata file
  if (metadata) {
    const metadataContent = {
      tool: metadata.tool || 'ResizeSuite',
      version: metadata.version || '1.0.0',
      timestamp: metadata.timestamp?.toISOString() || new Date().toISOString(),
      settings: metadata.settings || {},
      files: files.map(f => ({
        originalName: f.file.name,
        processedName: f.result?.filename || f.file.name,
        originalSize: f.file.size,
        processedSize: f.result?.processedSize || f.file.size,
        success: !!f.result?.data,
        error: f.error || null
      }))
    };
    
    zip.file('metadata.json', JSON.stringify(metadataContent, null, 2));
  }
  
  return await zip.generateAsync({ type: 'blob' });
}

/**
 * Extract files from ZIP (for future use)
 */
export async function extractZipFiles(zipBlob: Blob): Promise<ZipFile[]> {
  const zip = await JSZip.loadAsync(zipBlob);
  const files: ZipFile[] = [];
  
  for (const [filename, file] of Object.entries(zip.files)) {
    if (!file.dir) {
      const data = await file.async('blob');
      files.push({
        filename,
        data
      });
    }
  }
  
  return files;
}

/**
 * Get ZIP file info without extracting
 */
export async function getZipInfo(zipBlob: Blob): Promise<{
  fileCount: number;
  totalSize: number;
  filenames: string[];
}> {
  const zip = await JSZip.loadAsync(zipBlob);
  const filenames: string[] = [];
  let totalSize = 0;
  
  for (const [filename, file] of Object.entries(zip.files)) {
    if (!file.dir) {
      filenames.push(filename);
      totalSize += (file as any)._data?.uncompressedSize || 0;
    }
  }
  
  return {
    fileCount: filenames.length,
    totalSize,
    filenames
  };
}
