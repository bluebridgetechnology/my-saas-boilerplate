/**
 * File validation utilities for image processing
 */

import { FileValidationResult, SupportedFormat } from './types';

const SUPPORTED_FORMATS: SupportedFormat[] = ['jpeg', 'png', 'webp', 'gif', 'tiff', 'bmp', 'ico', 'svg', 'pdf', 'avif', 'heic', 'heif'];
const SUPPORTED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/webp',
  'image/gif',
  'image/tiff',
  'image/tif',
  'image/bmp',
  'image/x-icon',
  'image/vnd.microsoft.icon',
  'image/svg+xml',
  'application/pdf',
  'image/avif',
  'image/heic',
  'image/heif'
];

const MAX_FILE_SIZE_FREE = 10 * 1024 * 1024; // 10MB
const MAX_FILE_SIZE_PRO = 50 * 1024 * 1024; // 50MB

export class FileValidator {
  /**
   * Validates a file for image processing
   */
  static validateFile(file: File, userPlan: 'free' | 'pro' = 'free'): FileValidationResult {
    // Check if file exists
    if (!file) {
      return {
        valid: false,
        error: 'No file provided'
      };
    }

    // Check file type
    if (!this.isValidImageType(file)) {
      return {
        valid: false,
        error: `Unsupported file type. Supported formats: ${SUPPORTED_FORMATS.join(', ')}`
      };
    }

    // Check file size
    const maxSize = userPlan === 'pro' ? MAX_FILE_SIZE_PRO : MAX_FILE_SIZE_FREE;
    if (file.size > maxSize) {
      const maxSizeMB = Math.round(maxSize / (1024 * 1024));
      return {
        valid: false,
        error: `File too large. Maximum size: ${maxSizeMB}MB`
      };
    }

    // Check if file is empty
    if (file.size === 0) {
      return {
        valid: false,
        error: 'File is empty'
      };
    }

    return {
      valid: true,
      file
    };
  }

  /**
   * Validates multiple files for batch processing
   */
  static validateFiles(files: File[], userPlan: 'free' | 'pro' = 'free'): {
    validFiles: File[];
    errors: string[];
  } {
    const validFiles: File[] = [];
    const errors: string[] = [];

    files.forEach((file, index) => {
      const result = this.validateFile(file, userPlan);
      if (result.valid && result.file) {
        validFiles.push(result.file);
      } else {
        errors.push(`File ${index + 1} (${file.name}): ${result.error}`);
      }
    });

    return { validFiles, errors };
  }

  /**
   * Checks if file type is supported
   */
  private static isValidImageType(file: File): boolean {
    return SUPPORTED_MIME_TYPES.includes(file.type.toLowerCase());
  }

  /**
   * Gets file format from MIME type
   */
  static getFileFormat(file: File): SupportedFormat | null {
    const mimeType = file.type.toLowerCase();
    
    switch (mimeType) {
      case 'image/jpeg':
      case 'image/jpg':
        return 'jpeg';
      case 'image/png':
        return 'png';
      case 'image/webp':
        return 'webp';
      case 'image/gif':
        return 'gif';
      case 'image/tiff':
      case 'image/tif':
        return 'tiff';
      case 'image/bmp':
        return 'bmp';
      case 'image/x-icon':
      case 'image/vnd.microsoft.icon':
        return 'ico';
      case 'image/svg+xml':
        return 'svg';
      case 'application/pdf':
        return 'pdf';
      case 'image/avif':
        return 'avif';
      case 'image/heic':
        return 'heic';
      case 'image/heif':
        return 'heif';
      default:
        return null;
    }
  }

  /**
   * Checks if format supports transparency
   */
  static supportsTransparency(format: SupportedFormat): boolean {
    return format === 'png' || format === 'webp' || format === 'gif' || format === 'tiff' || format === 'ico' || format === 'svg';
  }

  /**
   * Gets human-readable file size
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Calculates compression ratio
   */
  static calculateCompressionRatio(originalSize: number, compressedSize: number): number {
    if (originalSize === 0) return 0;
    return Math.round(((originalSize - compressedSize) / originalSize) * 100);
  }
}
