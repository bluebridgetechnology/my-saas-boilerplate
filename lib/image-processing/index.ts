/**
 * Main export file for image processing functionality
 */

export { ImageProcessor } from './processor';
export { EnhancedImageProcessor } from './enhanced-processor';
export { FileValidator } from './validation';
export { WorkerManager, getWorkerManager, cleanupWorkerManager } from './worker-manager';
export { OperationHistory, getOperationHistory, clearOperationHistory } from './history';

export type {
  ImageDimensions,
  CropArea,
  ResizeOptions,
  CropOptions,
  RotationOptions,
  CompressionOptions,
  ConversionOptions,
  ProcessingResult,
  BatchProcessingResult,
  ProgressCallback,
  FileValidationResult,
  SupportedFormat,
  ImageMetadata,
  ProcessingPreset
} from './types';

// Re-export commonly used types for convenience
export type { 
  ResizeOptions as ResizeSettings,
  CropOptions as CropSettings,
  RotationOptions as RotationSettings,
  CompressionOptions as CompressionSettings,
  ConversionOptions as ConversionSettings
} from './types';
