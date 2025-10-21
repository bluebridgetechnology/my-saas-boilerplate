/**
 * Image Editor Suite - Advanced image editing using Canvas API
 */

import { ImageEditorSettings } from '@/lib/types/enhanced-tools';

export class ImageEditor {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private originalImageData: ImageData | null = null;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
  }

  /**
   * Load image and prepare for editing
   */
  async loadImage(file: File): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        this.canvas.width = img.width;
        this.canvas.height = img.height;
        this.ctx.drawImage(img, 0, 0);
        this.originalImageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        resolve(true);
      };
      img.onerror = () => resolve(false);
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Adjust image brightness (-100 to 100)
   */
  adjustBrightness(value: number): void {
    if (!this.originalImageData) return;

    const imageData = this.ctx.createImageData(this.originalImageData);
    const data = imageData.data;
    const originalData = this.originalImageData.data;
    
    const factor = value / 100;
    
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.max(0, Math.min(255, originalData[i] + (255 * factor)));     // R
      data[i + 1] = Math.max(0, Math.min(255, originalData[i + 1] + (255 * factor))); // G
      data[i + 2] = Math.max(0, Math.min(255, originalData[i + 2] + (255 * factor))); // B
      data[i + 3] = originalData[i + 3]; // A
    }
    
    this.ctx.putImageData(imageData, 0, 0);
  }

  /**
   * Adjust image contrast (-100 to 100)
   */
  adjustContrast(value: number): void {
    if (!this.originalImageData) return;

    const imageData = this.ctx.createImageData(this.originalImageData);
    const data = imageData.data;
    const originalData = this.originalImageData.data;
    
    const factor = (259 * (value + 255)) / (255 * (259 - value));
    
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.max(0, Math.min(255, factor * (originalData[i] - 128) + 128));     // R
      data[i + 1] = Math.max(0, Math.min(255, factor * (originalData[i + 1] - 128) + 128)); // G
      data[i + 2] = Math.max(0, Math.min(255, factor * (originalData[i + 2] - 128) + 128)); // B
      data[i + 3] = originalData[i + 3]; // A
    }
    
    this.ctx.putImageData(imageData, 0, 0);
  }

  /**
   * Adjust image saturation (-100 to 100)
   */
  adjustSaturation(value: number): void {
    if (!this.originalImageData) return;

    const imageData = this.ctx.createImageData(this.originalImageData);
    const data = imageData.data;
    const originalData = this.originalImageData.data;
    
    const factor = value / 100;
    
    for (let i = 0; i < data.length; i += 4) {
      const r = originalData[i];
      const g = originalData[i + 1];
      const b = originalData[i + 2];
      
      // Convert to grayscale
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      
      // Apply saturation adjustment
      data[i] = Math.max(0, Math.min(255, gray + factor * (r - gray)));     // R
      data[i + 1] = Math.max(0, Math.min(255, gray + factor * (g - gray))); // G
      data[i + 2] = Math.max(0, Math.min(255, gray + factor * (b - gray))); // B
      data[i + 3] = originalData[i + 3]; // A
    }
    
    this.ctx.putImageData(imageData, 0, 0);
  }

  /**
   * Adjust image hue (-180 to 180)
   */
  adjustHue(value: number): void {
    if (!this.originalImageData) return;

    const imageData = this.ctx.createImageData(this.originalImageData);
    const data = imageData.data;
    const originalData = this.originalImageData.data;
    
    const hueShift = value * Math.PI / 180;
    
    for (let i = 0; i < data.length; i += 4) {
      const r = originalData[i] / 255;
      const g = originalData[i + 1] / 255;
      const b = originalData[i + 2] / 255;
      
      // Convert RGB to HSL
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h = 0;
      
      if (max !== min) {
        if (max === r) h = ((g - b) / (max - min)) % 6;
        else if (max === g) h = (b - r) / (max - min) + 2;
        else h = (r - g) / (max - min) + 4;
      }
      
      h = h * 60 + hueShift;
      if (h < 0) h += 360;
      if (h >= 360) h -= 360;
      
      // Convert back to RGB
      const c = (max - min);
      const x = c * (1 - Math.abs((h / 60) % 2 - 1));
      const m = min;
      
      let r2 = 0, g2 = 0, b2 = 0;
      if (h < 60) { r2 = c; g2 = x; b2 = 0; }
      else if (h < 120) { r2 = x; g2 = c; b2 = 0; }
      else if (h < 180) { r2 = 0; g2 = c; b2 = x; }
      else if (h < 240) { r2 = 0; g2 = x; b2 = c; }
      else if (h < 300) { r2 = x; g2 = 0; b2 = c; }
      else { r2 = c; g2 = 0; b2 = x; }
      
      data[i] = Math.max(0, Math.min(255, Math.round((r2 + m) * 255)));     // R
      data[i + 1] = Math.max(0, Math.min(255, Math.round((g2 + m) * 255))); // G
      data[i + 2] = Math.max(0, Math.min(255, Math.round((b2 + m) * 255))); // B
      data[i + 3] = originalData[i + 3]; // A
    }
    
    this.ctx.putImageData(imageData, 0, 0);
  }

  /**
   * Apply sharpening filter (0 to 100)
   */
  sharpen(amount: number): void {
    if (!this.originalImageData) return;

    const imageData = this.ctx.createImageData(this.originalImageData);
    const data = imageData.data;
    const originalData = this.originalImageData.data;
    
    const factor = amount / 100;
    const kernel = [
      0, -factor, 0,
      -factor, 1 + 4 * factor, -factor,
      0, -factor, 0
    ];
    
    this.applyConvolution(originalData, data, kernel, this.canvas.width, this.canvas.height);
    this.ctx.putImageData(imageData, 0, 0);
  }

  /**
   * Apply blur filter (0 to 100)
   */
  blur(radius: number): void {
    if (!this.originalImageData) return;

    const imageData = this.ctx.createImageData(this.originalImageData);
    const data = imageData.data;
    const originalData = this.originalImageData.data;
    
    const blurRadius = Math.floor(radius / 10);
    if (blurRadius <= 0) {
      this.ctx.putImageData(this.originalImageData, 0, 0);
      return;
    }
    
    this.applyGaussianBlur(originalData, data, blurRadius, this.canvas.width, this.canvas.height);
    this.ctx.putImageData(imageData, 0, 0);
  }

  /**
   * Reduce noise using median filter
   */
  reduceNoise(): void {
    if (!this.originalImageData) return;

    const imageData = this.ctx.createImageData(this.originalImageData);
    const data = imageData.data;
    const originalData = this.originalImageData.data;
    
    this.applyMedianFilter(originalData, data, this.canvas.width, this.canvas.height);
    this.ctx.putImageData(imageData, 0, 0);
  }

  /**
   * Auto-enhance using histogram equalization
   */
  autoEnhance(): void {
    if (!this.originalImageData) return;

    const imageData = this.ctx.createImageData(this.originalImageData);
    const data = imageData.data;
    const originalData = this.originalImageData.data;
    
    // Calculate histogram
    const histogram = new Array(256).fill(0);
    for (let i = 0; i < originalData.length; i += 4) {
      const gray = Math.round(0.299 * originalData[i] + 0.587 * originalData[i + 1] + 0.114 * originalData[i + 2]);
      histogram[gray]++;
    }
    
    // Calculate cumulative distribution
    const cdf = new Array(256);
    cdf[0] = histogram[0];
    for (let i = 1; i < 256; i++) {
      cdf[i] = cdf[i - 1] + histogram[i];
    }
    
    // Normalize CDF
    const totalPixels = this.canvas.width * this.canvas.height;
    for (let i = 0; i < 256; i++) {
      cdf[i] = Math.round((cdf[i] / totalPixels) * 255);
    }
    
    // Apply equalization
    for (let i = 0; i < data.length; i += 4) {
      const gray = Math.round(0.299 * originalData[i] + 0.587 * originalData[i + 1] + 0.114 * originalData[i + 2]);
      const enhanced = cdf[gray];
      
      const ratio = enhanced / gray;
      data[i] = Math.max(0, Math.min(255, originalData[i] * ratio));     // R
      data[i + 1] = Math.max(0, Math.min(255, originalData[i + 1] * ratio)); // G
      data[i + 2] = Math.max(0, Math.min(255, originalData[i + 2] * ratio)); // B
      data[i + 3] = originalData[i + 3]; // A
    }
    
    this.ctx.putImageData(imageData, 0, 0);
  }

  /**
   * Apply convolution kernel to image data
   */
  private applyConvolution(source: Uint8ClampedArray, target: Uint8ClampedArray, kernel: number[], width: number, height: number): void {
    const kernelSize = Math.sqrt(kernel.length);
    const half = Math.floor(kernelSize / 2);
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let r = 0, g = 0, b = 0;
        
        for (let ky = 0; ky < kernelSize; ky++) {
          for (let kx = 0; kx < kernelSize; kx++) {
            const px = x + kx - half;
            const py = y + ky - half;
            
            if (px >= 0 && px < width && py >= 0 && py < height) {
              const idx = (py * width + px) * 4;
              const weight = kernel[ky * kernelSize + kx];
              
              r += source[idx] * weight;
              g += source[idx + 1] * weight;
              b += source[idx + 2] * weight;
            }
          }
        }
        
        const idx = (y * width + x) * 4;
        target[idx] = Math.max(0, Math.min(255, r));     // R
        target[idx + 1] = Math.max(0, Math.min(255, g)); // G
        target[idx + 2] = Math.max(0, Math.min(255, b)); // B
        target[idx + 3] = source[idx + 3]; // A
      }
    }
  }

  /**
   * Apply Gaussian blur
   */
  private applyGaussianBlur(source: Uint8ClampedArray, target: Uint8ClampedArray, radius: number, width: number, height: number): void {
    const sigma = radius / 3;
    const kernelSize = radius * 2 + 1;
    const kernel = this.generateGaussianKernel(kernelSize, sigma);
    
    // Horizontal pass
    const temp = new Uint8ClampedArray(source.length);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let r = 0, g = 0, b = 0, a = 0;
        let weightSum = 0;
        
        for (let kx = 0; kx < kernelSize; kx++) {
          const px = x + kx - radius;
          if (px >= 0 && px < width) {
            const idx = (y * width + px) * 4;
            const weight = kernel[kx];
            
            r += source[idx] * weight;
            g += source[idx + 1] * weight;
            b += source[idx + 2] * weight;
            a += source[idx + 3] * weight;
            weightSum += weight;
          }
        }
        
        const idx = (y * width + x) * 4;
        temp[idx] = r / weightSum;
        temp[idx + 1] = g / weightSum;
        temp[idx + 2] = b / weightSum;
        temp[idx + 3] = a / weightSum;
      }
    }
    
    // Vertical pass
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let r = 0, g = 0, b = 0, a = 0;
        let weightSum = 0;
        
        for (let ky = 0; ky < kernelSize; ky++) {
          const py = y + ky - radius;
          if (py >= 0 && py < height) {
            const idx = (py * width + x) * 4;
            const weight = kernel[ky];
            
            r += temp[idx] * weight;
            g += temp[idx + 1] * weight;
            b += temp[idx + 2] * weight;
            a += temp[idx + 3] * weight;
            weightSum += weight;
          }
        }
        
        const idx = (y * width + x) * 4;
        target[idx] = r / weightSum;
        target[idx + 1] = g / weightSum;
        target[idx + 2] = b / weightSum;
        target[idx + 3] = a / weightSum;
      }
    }
  }

  /**
   * Generate Gaussian kernel
   */
  private generateGaussianKernel(size: number, sigma: number): number[] {
    const kernel = new Array(size);
    const half = Math.floor(size / 2);
    let sum = 0;
    
    for (let i = 0; i < size; i++) {
      const x = i - half;
      kernel[i] = Math.exp(-(x * x) / (2 * sigma * sigma));
      sum += kernel[i];
    }
    
    // Normalize
    for (let i = 0; i < size; i++) {
      kernel[i] /= sum;
    }
    
    return kernel;
  }

  /**
   * Apply median filter for noise reduction
   */
  private applyMedianFilter(source: Uint8ClampedArray, target: Uint8ClampedArray, width: number, height: number): void {
    const windowSize = 3;
    const half = Math.floor(windowSize / 2);
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const rValues: number[] = [];
        const gValues: number[] = [];
        const bValues: number[] = [];
        
        for (let wy = 0; wy < windowSize; wy++) {
          for (let wx = 0; wx < windowSize; wx++) {
            const px = x + wx - half;
            const py = y + wy - half;
            
            if (px >= 0 && px < width && py >= 0 && py < height) {
              const idx = (py * width + px) * 4;
              rValues.push(source[idx]);
              gValues.push(source[idx + 1]);
              bValues.push(source[idx + 2]);
            }
          }
        }
        
        rValues.sort((a, b) => a - b);
        gValues.sort((a, b) => a - b);
        bValues.sort((a, b) => a - b);
        
        const medianIdx = Math.floor(rValues.length / 2);
        const idx = (y * width + x) * 4;
        
        target[idx] = rValues[medianIdx];     // R
        target[idx + 1] = gValues[medianIdx]; // G
        target[idx + 2] = bValues[medianIdx]; // B
        target[idx + 3] = source[idx + 3];    // A
      }
    }
  }

  /**
   * Reset to original image
   */
  reset(): void {
    if (this.originalImageData) {
      this.ctx.putImageData(this.originalImageData, 0, 0);
    }
  }

  /**
   * Export edited image as blob
   */
  async exportImage(format: string = 'image/png', quality: number = 0.9): Promise<Blob | null> {
    return new Promise((resolve) => {
      this.canvas.toBlob(resolve, format, quality);
    });
  }

  /**
   * Get canvas element for preview
   */
  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    this.originalImageData = null;
    this.canvas.width = 0;
    this.canvas.height = 0;
  }
}
