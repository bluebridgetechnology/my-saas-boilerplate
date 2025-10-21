/**
 * Web Worker for background image processing
 * This file will be used as a Web Worker script
 */

// Import types (these will be available in the worker context)
interface ImageDimensions {
  width: number;
  height: number;
}

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ResizeOptions {
  width?: number;
  height?: number;
  percentage?: number;
  maintainAspectRatio: boolean;
  quality?: number;
}

interface CropOptions {
  area: CropArea;
  maintainAspectRatio: boolean;
}

interface RotationOptions {
  angle: number;
  flipHorizontal?: boolean;
  flipVertical?: boolean;
}

interface CompressionOptions {
  quality: number;
  format: 'jpeg' | 'png' | 'webp';
  progressive?: boolean;
}

interface ConversionOptions {
  outputFormat: 'jpeg' | 'png' | 'webp';
  quality?: number;
  preserveTransparency?: boolean;
}

interface ProcessingResult {
  success: boolean;
  data?: Blob;
  error?: string;
  originalSize?: number;
  processedSize?: number;
  dimensions?: ImageDimensions;
}

interface WorkerMessage {
  type: 'process';
  data: {
    imageData: ImageData;
    operation: 'resize' | 'crop' | 'rotate' | 'compress' | 'convert';
    options: ResizeOptions | CropOptions | RotationOptions | CompressionOptions | ConversionOptions;
  };
}

interface WorkerResponse {
  type: 'result' | 'progress' | 'error';
  data?: ProcessingResult;
  progress?: number;
  message?: string;
  error?: string;
}

// Create offscreen canvas for worker processing
const canvas = new OffscreenCanvas(1, 1);
const ctx = canvas.getContext('2d')!;

// Listen for messages from main thread
self.addEventListener('message', async (event: MessageEvent<WorkerMessage>) => {
  const { type, data } = event.data;
  
  if (type === 'process') {
    try {
      await processImage(data);
    } catch (error) {
      self.postMessage({
        type: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
});

async function processImage(data: WorkerMessage['data']): Promise<void> {
  const { imageData, operation, options } = data;
  
  try {
    // Set canvas dimensions
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    
    // Put image data on canvas
    ctx.putImageData(imageData, 0, 0);
    
    let result: ProcessingResult;
    
    // Report progress
    self.postMessage({
      type: 'progress',
      progress: 10,
      message: `Starting ${operation} operation...`
    });
    
    switch (operation) {
      case 'resize':
        result = await processResize(options as ResizeOptions);
        break;
      case 'crop':
        result = await processCrop(options as CropOptions);
        break;
      case 'rotate':
        result = await processRotate(options as RotationOptions);
        break;
      case 'compress':
        result = await processCompress(options as CompressionOptions);
        break;
      case 'convert':
        result = await processConvert(options as ConversionOptions);
        break;
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
    
    // Report completion
    self.postMessage({
      type: 'progress',
      progress: 100,
      message: 'Processing complete'
    });
    
    // Send result
    self.postMessage({
      type: 'result',
      data: result
    });
    
  } catch (error) {
    self.postMessage({
      type: 'error',
      error: error instanceof Error ? error.message : 'Processing failed'
    });
  }
}

async function processResize(options: ResizeOptions): Promise<ProcessingResult> {
  const { width, height, percentage, maintainAspectRatio } = options;
  
  let newWidth: number;
  let newHeight: number;
  
  if (percentage) {
    newWidth = Math.round(canvas.width * (percentage / 100));
    newHeight = Math.round(canvas.height * (percentage / 100));
  } else if (width && height) {
    newWidth = width;
    newHeight = height;
  } else if (width) {
    newWidth = width;
    newHeight = maintainAspectRatio 
      ? Math.round((canvas.height * width) / canvas.width)
      : canvas.height;
  } else if (height) {
    newHeight = height;
    newWidth = maintainAspectRatio
      ? Math.round((canvas.width * height) / canvas.height)
      : canvas.width;
  } else {
    throw new Error('No resize dimensions specified');
  }
  
  // Create new canvas with target dimensions
  const newCanvas = new OffscreenCanvas(newWidth, newHeight);
  const newCtx = newCanvas.getContext('2d')!;
  
  // Draw resized image
  newCtx.drawImage(canvas, 0, 0, newWidth, newHeight);
  
  // Convert to blob
  const blob = await newCanvas.convertToBlob({
    type: 'image/png',
    quality: options.quality || 0.9
  });
  
  return {
    success: true,
    data: blob,
    processedSize: blob.size,
    dimensions: { width: newWidth, height: newHeight }
  };
}

async function processCrop(options: CropOptions): Promise<ProcessingResult> {
  const { area } = options;
  
  // Validate crop area
  if (area.x < 0 || area.y < 0 || 
      area.x + area.width > canvas.width || 
      area.y + area.height > canvas.height) {
    throw new Error('Crop area exceeds image boundaries');
  }
  
  // Create new canvas with crop dimensions
  const newCanvas = new OffscreenCanvas(area.width, area.height);
  const newCtx = newCanvas.getContext('2d')!;
  
  // Draw cropped portion
  newCtx.drawImage(
    canvas,
    area.x, area.y, area.width, area.height,
    0, 0, area.width, area.height
  );
  
  // Convert to blob
  const blob = await newCanvas.convertToBlob({
    type: 'image/png',
    quality: 0.9
  });
  
  return {
    success: true,
    data: blob,
    processedSize: blob.size,
    dimensions: { width: area.width, height: area.height }
  };
}

async function processRotate(options: RotationOptions): Promise<ProcessingResult> {
  const { angle, flipHorizontal = false, flipVertical = false } = options;
  
  // Calculate new dimensions for rotation
  const radians = (angle * Math.PI) / 180;
  const cos = Math.abs(Math.cos(radians));
  const sin = Math.abs(Math.sin(radians));
  
  const newWidth = Math.round(canvas.width * cos + canvas.height * sin);
  const newHeight = Math.round(canvas.width * sin + canvas.height * cos);
  
  // Create new canvas with calculated dimensions
  const newCanvas = new OffscreenCanvas(newWidth, newHeight);
  const newCtx = newCanvas.getContext('2d')!;
  
  // Apply transformations
  newCtx.save();
  
  // Move to center of canvas
  newCtx.translate(newWidth / 2, newHeight / 2);
  
  // Apply rotation
  newCtx.rotate(radians);
  
  // Apply flips
  if (flipHorizontal) {
    newCtx.scale(-1, 1);
  }
  if (flipVertical) {
    newCtx.scale(1, -1);
  }
  
  // Draw image centered
  newCtx.drawImage(
    canvas,
    -canvas.width / 2,
    -canvas.height / 2
  );
  
  newCtx.restore();
  
  // Convert to blob
  const blob = await newCanvas.convertToBlob({
    type: 'image/png',
    quality: 0.9
  });
  
  return {
    success: true,
    data: blob,
    processedSize: blob.size,
    dimensions: { width: newWidth, height: newHeight }
  };
}

async function processCompress(options: CompressionOptions): Promise<ProcessingResult> {
  const { quality, format } = options;
  
  // Convert canvas to blob
  const blob = await canvas.convertToBlob({
    type: getMimeType(format),
    quality: quality
  });
  
  if (!blob) {
    throw new Error('Failed to compress image');
  }
  
  return {
    success: true,
    data: blob,
    processedSize: blob.size
  };
}

async function processConvert(options: ConversionOptions): Promise<ProcessingResult> {
  const { outputFormat, quality = 0.9 } = options;
  
  // Convert canvas to blob
  const blob = await canvas.convertToBlob({
    type: getMimeType(outputFormat),
    quality: quality
  });
  
  if (!blob) {
    throw new Error('Failed to convert image');
  }
  
  return {
    success: true,
    data: blob,
    processedSize: blob.size
  };
}

function getMimeType(format: string): string {
  switch (format) {
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'gif':
      return 'image/gif';
    default:
      return 'image/png';
  }
}
