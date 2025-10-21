/**
 * Type definitions for image processing functionality
 */

export interface ImageDimensions {
  width: number;
  height: number;
}

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ResizeOptions {
  width?: number;
  height?: number;
  percentage?: number;
  maintainAspectRatio: boolean;
  quality?: number;
}

export interface CropOptions {
  area: CropArea;
  maintainAspectRatio: boolean;
}

export interface RotationOptions {
  angle: number; // degrees
  flipHorizontal?: boolean;
  flipVertical?: boolean;
}

export interface CompressionOptions {
  quality: number; // 0.1 to 1.0
  format: 'jpeg' | 'png' | 'webp';
  progressive?: boolean;
}

export interface ConversionOptions {
  outputFormat: 'jpeg' | 'png' | 'webp' | 'gif' | 'tiff' | 'bmp' | 'ico' | 'svg' | 'pdf';
  quality?: number;
  preserveTransparency?: boolean;
}

export interface ProcessingResult {
  success: boolean;
  data?: Blob;
  error?: string;
  originalSize?: number;
  processedSize?: number;
  dimensions?: ImageDimensions;
}

export interface BatchProcessingResult {
  success: boolean;
  results: ProcessingResult[];
  totalProcessed: number;
  totalFailed: number;
  errors: string[];
}

export interface ProgressCallback {
  (progress: number, message?: string): void;
}

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  file?: File;
}

export type SupportedFormat = 'jpeg' | 'png' | 'webp' | 'gif' | 'tiff' | 'bmp' | 'ico' | 'svg' | 'pdf' | 'avif' | 'heic' | 'heif';

export interface ImageMetadata {
  format: SupportedFormat;
  dimensions: ImageDimensions;
  fileSize: number;
  hasTransparency: boolean;
  colorSpace?: string;
}

export interface ProcessingPreset {
  id: string;
  name: string;
  description: string;
  options: ResizeOptions | CompressionOptions | ConversionOptions;
  category: 'resize' | 'compress' | 'convert';
}
