/**
 * Core ImageProcessor class for client-side image processing
 */

import { 
  ImageDimensions, 
  CropArea, 
  ResizeOptions, 
  CropOptions, 
  RotationOptions, 
  CompressionOptions, 
  ConversionOptions, 
  ProcessingResult, 
  ImageMetadata,
  SupportedFormat
} from './types';
import { FileValidator } from './validation';

export class ImageProcessor {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private originalImage: HTMLImageElement | null = null;
  private originalMetadata: ImageMetadata | null = null;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
  }

  /**
   * Loads an image from file and prepares it for processing
   */
  async loadImage(file: File): Promise<ProcessingResult> {
    try {
      // Validate file first
      const validation = FileValidator.validateFile(file);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error
        };
      }

      return new Promise((resolve) => {
        const img = new Image();
        
        img.onload = () => {
          this.originalImage = img;
          this.originalMetadata = this.extractMetadata(file, img);
          
          // Set canvas dimensions to match image
          this.canvas.width = img.width;
          this.canvas.height = img.height;
          
          // Draw original image to canvas
          this.ctx.drawImage(img, 0, 0);
          
          resolve({
            success: true,
            originalSize: file.size,
            dimensions: { width: img.width, height: img.height }
          });
        };
        
        img.onerror = () => {
          resolve({
            success: false,
            error: 'Failed to load image. File may be corrupted.'
          });
        };
        
        img.src = URL.createObjectURL(file);
      });
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }

    // Cleanup object URL after loading
    setTimeout(() => {
      if (this.originalImage?.src.startsWith('blob:')) {
        URL.revokeObjectURL(this.originalImage.src);
      }
    }, 1000);
  }

  /**
   * Resizes the image according to specified options
   */
  async resize(options: ResizeOptions): Promise<ProcessingResult> {
    if (!this.originalImage) {
      return { success: false, error: 'No image loaded' };
    }

    try {
      let newWidth: number;
      let newHeight: number;

      if (options.percentage) {
        // Percentage-based resizing
        newWidth = Math.round(this.originalImage.width * (options.percentage / 100));
        newHeight = Math.round(this.originalImage.height * (options.percentage / 100));
      } else if (options.width && options.height) {
        // Specific dimensions
        newWidth = options.width;
        newHeight = options.height;
      } else if (options.width) {
        // Width specified, calculate height
        newWidth = options.width;
        newHeight = options.maintainAspectRatio 
          ? Math.round((this.originalImage.height * options.width) / this.originalImage.width)
          : this.originalImage.height;
      } else if (options.height) {
        // Height specified, calculate width
        newHeight = options.height;
        newWidth = options.maintainAspectRatio
          ? Math.round((this.originalImage.width * options.height) / this.originalImage.height)
          : this.originalImage.width;
      } else {
        return { success: false, error: 'No resize dimensions specified' };
      }

      // Update canvas dimensions
      this.canvas.width = newWidth;
      this.canvas.height = newHeight;

      // Clear canvas and draw resized image
      this.ctx.clearRect(0, 0, newWidth, newHeight);
      this.ctx.drawImage(this.originalImage, 0, 0, newWidth, newHeight);

      return {
        success: true,
        dimensions: { width: newWidth, height: newHeight }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Resize operation failed'
      };
    }
  }

  /**
   * Crops the image according to specified area
   */
  async crop(options: CropOptions): Promise<ProcessingResult> {
    if (!this.originalImage) {
      return { success: false, error: 'No image loaded' };
    }

    try {
      const { area } = options;
      
      // Validate crop area
      if (area.x < 0 || area.y < 0 || 
          area.x + area.width > this.originalImage.width || 
          area.y + area.height > this.originalImage.height) {
        return { success: false, error: 'Crop area exceeds image boundaries' };
      }

      // Update canvas dimensions to crop size
      this.canvas.width = area.width;
      this.canvas.height = area.height;

      // Clear canvas and draw cropped portion
      this.ctx.clearRect(0, 0, area.width, area.height);
      this.ctx.drawImage(
        this.originalImage,
        area.x, area.y, area.width, area.height,
        0, 0, area.width, area.height
      );

      return {
        success: true,
        dimensions: { width: area.width, height: area.height }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Crop operation failed'
      };
    }
  }

  /**
   * Rotates the image according to specified options
   */
  async rotate(options: RotationOptions): Promise<ProcessingResult> {
    if (!this.originalImage) {
      return { success: false, error: 'No image loaded' };
    }

    try {
      const { angle, flipHorizontal = false, flipVertical = false } = options;
      
      // Calculate new dimensions for rotation
      const radians = (angle * Math.PI) / 180;
      const cos = Math.abs(Math.cos(radians));
      const sin = Math.abs(Math.sin(radians));
      
      const newWidth = Math.round(this.originalImage.width * cos + this.originalImage.height * sin);
      const newHeight = Math.round(this.originalImage.width * sin + this.originalImage.height * cos);

      // Update canvas dimensions
      this.canvas.width = newWidth;
      this.canvas.height = newHeight;

      // Clear canvas
      this.ctx.clearRect(0, 0, newWidth, newHeight);

      // Apply transformations
      this.ctx.save();
      
      // Move to center of canvas
      this.ctx.translate(newWidth / 2, newHeight / 2);
      
      // Apply rotation
      this.ctx.rotate(radians);
      
      // Apply flips
      if (flipHorizontal) {
        this.ctx.scale(-1, 1);
      }
      if (flipVertical) {
        this.ctx.scale(1, -1);
      }
      
      // Draw image centered
      this.ctx.drawImage(
        this.originalImage,
        -this.originalImage.width / 2,
        -this.originalImage.height / 2
      );
      
      this.ctx.restore();

      return {
        success: true,
        dimensions: { width: newWidth, height: newHeight }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Rotation operation failed'
      };
    }
  }

  /**
   * Compresses the image with specified quality
   */
  async compress(options: CompressionOptions): Promise<ProcessingResult> {
    try {
      const { quality, format, progressive = false } = options;
      
      // Validate quality
      if (quality < 0.1 || quality > 1.0) {
        return { success: false, error: 'Quality must be between 0.1 and 1.0' };
      }

      // Convert canvas to blob with specified format and quality
      const blob = await this.canvasToBlob(format, quality);
      
      if (!blob) {
        return { success: false, error: 'Failed to compress image' };
      }

      return {
        success: true,
        data: blob,
        processedSize: blob.size
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Compression operation failed'
      };
    }
  }

  /**
   * Converts image to specified format
   */
  async convert(options: ConversionOptions): Promise<ProcessingResult> {
    try {
      const { outputFormat, quality = 0.9, preserveTransparency = true } = options;
      
      // Check if transparency preservation is possible
      if (!preserveTransparency && this.originalMetadata?.hasTransparency) {
        // Add white background for formats that don't support transparency
        this.addBackground();
      }

      const blob = await this.canvasToBlob(outputFormat, quality);
      
      if (!blob) {
        return { success: false, error: 'Failed to convert image' };
      }

      return {
        success: true,
        data: blob,
        processedSize: blob.size
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Conversion operation failed'
      };
    }
  }

  /**
   * Gets the current canvas as a blob
   */
  async getCanvasBlob(format: SupportedFormat = 'png', quality: number = 0.9): Promise<Blob | null> {
    return this.canvasToBlob(format, quality);
  }

  /**
   * Gets current image dimensions
   */
  getCurrentDimensions(): ImageDimensions | null {
    if (!this.canvas.width || !this.canvas.height) {
      return null;
    }
    return {
      width: this.canvas.width,
      height: this.canvas.height
    };
  }

  /**
   * Gets original image metadata
   */
  getOriginalMetadata(): ImageMetadata | null {
    return this.originalMetadata;
  }

  /**
   * Resets the processor to original image state
   */
  reset(): void {
    if (this.originalImage) {
      this.canvas.width = this.originalImage.width;
      this.canvas.height = this.originalImage.height;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.drawImage(this.originalImage, 0, 0);
    }
  }

  /**
   * Cleans up resources
   */
  cleanup(): void {
    if (this.originalImage?.src.startsWith('blob:')) {
      URL.revokeObjectURL(this.originalImage.src);
    }
    this.originalImage = null;
    this.originalMetadata = null;
  }

  /**
   * Converts canvas to blob with specified format and quality
   */
  private async canvasToBlob(format: SupportedFormat, quality: number): Promise<Blob | null> {
    return new Promise((resolve) => {
      const mimeType = this.getMimeType(format);
      this.canvas.toBlob(resolve, mimeType, quality);
    });
  }

  /**
   * Gets MIME type for format
   */
  private getMimeType(format: SupportedFormat): string {
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

  /**
   * Extracts metadata from image file
   */
  private extractMetadata(file: File, img: HTMLImageElement): ImageMetadata {
    const format = FileValidator.getFileFormat(file) || 'png';
    
    return {
      format,
      dimensions: { width: img.width, height: img.height },
      fileSize: file.size,
      hasTransparency: FileValidator.supportsTransparency(format),
      colorSpace: 'sRGB' // Default assumption
    };
  }

  /**
   * Adds white background to canvas (for formats without transparency)
   */
  private addBackground(): void {
    this.ctx.save();
    this.ctx.globalCompositeOperation = 'destination-over';
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.restore();
  }
}
