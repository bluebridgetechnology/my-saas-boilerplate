/**
 * Image Filters & Effects using Canvas API
 */

import { FilterSettings } from '@/lib/types/enhanced-tools';

export interface FilterPreset {
  id: string;
  name: string;
  category: 'vintage' | 'artistic' | 'instagram' | 'custom';
  config: {
    sepia?: number;
    brightness?: number;
    contrast?: number;
    saturation?: number;
    hue?: number;
    blur?: number;
    sharpen?: number;
    vignette?: number;
  };
  thumbnail?: string;
}

export class ImageFilters {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private originalImageData: ImageData | null = null;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
  }

  /**
   * Load image and prepare for filtering
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
   * Apply filter with intensity control
   */
  applyFilter(filter: FilterPreset, intensity: number = 100): void {
    if (!this.originalImageData) return;

    // Reset to original
    this.ctx.putImageData(this.originalImageData, 0, 0);

    const factor = intensity / 100;
    const config = filter.config;

    // Apply each effect with intensity scaling
    if (config.sepia !== undefined) {
      this.applySepia(config.sepia * factor);
    }
    if (config.brightness !== undefined) {
      this.adjustBrightness(config.brightness * factor);
    }
    if (config.contrast !== undefined) {
      this.adjustContrast(config.contrast * factor);
    }
    if (config.saturation !== undefined) {
      this.adjustSaturation(config.saturation * factor);
    }
    if (config.hue !== undefined) {
      this.adjustHue(config.hue * factor);
    }
    if (config.blur !== undefined) {
      this.applyBlur(config.blur * factor);
    }
    if (config.sharpen !== undefined) {
      this.applySharpen(config.sharpen * factor);
    }
    if (config.vignette !== undefined) {
      this.applyVignette(config.vignette * factor);
    }
  }

  /**
   * Apply custom filter configuration
   */
  applyCustomFilter(config: FilterPreset['config'], intensity: number = 100): void {
    const customFilter: FilterPreset = {
      id: 'custom',
      name: 'Custom',
      category: 'custom',
      config
    };
    this.applyFilter(customFilter, intensity);
  }

  /**
   * Apply sepia effect
   */
  private applySepia(intensity: number): void {
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      const newR = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189));
      const newG = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168));
      const newB = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131));

      data[i] = r + (newR - r) * intensity;
      data[i + 1] = g + (newG - g) * intensity;
      data[i + 2] = b + (newB - b) * intensity;
    }

    this.ctx.putImageData(imageData, 0, 0);
  }

  /**
   * Adjust brightness
   */
  private adjustBrightness(value: number): void {
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.max(0, Math.min(255, data[i] + value));
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + value));
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + value));
    }

    this.ctx.putImageData(imageData, 0, 0);
  }

  /**
   * Adjust contrast
   */
  private adjustContrast(value: number): void {
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const data = imageData.data;
    const factor = (259 * (value + 255)) / (255 * (259 - value));

    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.max(0, Math.min(255, factor * (data[i] - 128) + 128));
      data[i + 1] = Math.max(0, Math.min(255, factor * (data[i + 1] - 128) + 128));
      data[i + 2] = Math.max(0, Math.min(255, factor * (data[i + 2] - 128) + 128));
    }

    this.ctx.putImageData(imageData, 0, 0);
  }

  /**
   * Adjust saturation
   */
  private adjustSaturation(value: number): void {
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      
      data[i] = Math.max(0, Math.min(255, gray + value * (r - gray)));
      data[i + 1] = Math.max(0, Math.min(255, gray + value * (g - gray)));
      data[i + 2] = Math.max(0, Math.min(255, gray + value * (b - gray)));
    }

    this.ctx.putImageData(imageData, 0, 0);
  }

  /**
   * Adjust hue
   */
  private adjustHue(value: number): void {
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const data = imageData.data;
    const hueShift = value * Math.PI / 180;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i] / 255;
      const g = data[i + 1] / 255;
      const b = data[i + 2] / 255;

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

      data[i] = Math.max(0, Math.min(255, Math.round((r2 + m) * 255)));
      data[i + 1] = Math.max(0, Math.min(255, Math.round((g2 + m) * 255)));
      data[i + 2] = Math.max(0, Math.min(255, Math.round((b2 + m) * 255)));
    }

    this.ctx.putImageData(imageData, 0, 0);
  }

  /**
   * Apply blur effect
   */
  private applyBlur(radius: number): void {
    if (radius <= 0) return;

    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const data = imageData.data;
    const tempData = new Uint8ClampedArray(data);

    const blurRadius = Math.floor(radius / 2);
    const kernelSize = blurRadius * 2 + 1;
    const kernel = this.generateGaussianKernel(kernelSize, blurRadius / 3);

    // Horizontal pass
    for (let y = 0; y < this.canvas.height; y++) {
      for (let x = 0; x < this.canvas.width; x++) {
        let r = 0, g = 0, b = 0, a = 0;
        let weightSum = 0;

        for (let kx = 0; kx < kernelSize; kx++) {
          const px = x + kx - blurRadius;
          if (px >= 0 && px < this.canvas.width) {
            const idx = (y * this.canvas.width + px) * 4;
            const weight = kernel[kx];

            r += tempData[idx] * weight;
            g += tempData[idx + 1] * weight;
            b += tempData[idx + 2] * weight;
            a += tempData[idx + 3] * weight;
            weightSum += weight;
          }
        }

        const idx = (y * this.canvas.width + x) * 4;
        data[idx] = r / weightSum;
        data[idx + 1] = g / weightSum;
        data[idx + 2] = b / weightSum;
        data[idx + 3] = a / weightSum;
      }
    }

    this.ctx.putImageData(imageData, 0, 0);
  }

  /**
   * Apply sharpen effect
   */
  private applySharpen(amount: number): void {
    if (amount <= 0) return;

    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const data = imageData.data;
    const tempData = new Uint8ClampedArray(data);

    const kernel = [
      0, -amount, 0,
      -amount, 1 + 4 * amount, -amount,
      0, -amount, 0
    ];

    for (let y = 1; y < this.canvas.height - 1; y++) {
      for (let x = 1; x < this.canvas.width - 1; x++) {
        let r = 0, g = 0, b = 0;

        for (let ky = 0; ky < 3; ky++) {
          for (let kx = 0; kx < 3; kx++) {
            const px = x + kx - 1;
            const py = y + ky - 1;
            const idx = (py * this.canvas.width + px) * 4;
            const weight = kernel[ky * 3 + kx];

            r += tempData[idx] * weight;
            g += tempData[idx + 1] * weight;
            b += tempData[idx + 2] * weight;
          }
        }

        const idx = (y * this.canvas.width + x) * 4;
        data[idx] = Math.max(0, Math.min(255, r));
        data[idx + 1] = Math.max(0, Math.min(255, g));
        data[idx + 2] = Math.max(0, Math.min(255, b));
      }
    }

    this.ctx.putImageData(imageData, 0, 0);
  }

  /**
   * Apply vignette effect
   */
  private applyVignette(intensity: number): void {
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const data = imageData.data;

    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);

    for (let y = 0; y < this.canvas.height; y++) {
      for (let x = 0; x < this.canvas.width; x++) {
        const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        const vignette = 1 - (distance / maxDistance) * intensity;

        const idx = (y * this.canvas.width + x) * 4;
        data[idx] *= vignette;
        data[idx + 1] *= vignette;
        data[idx + 2] *= vignette;
      }
    }

    this.ctx.putImageData(imageData, 0, 0);
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
   * Reset to original image
   */
  reset(): void {
    if (this.originalImageData) {
      this.ctx.putImageData(this.originalImageData, 0, 0);
    }
  }

  /**
   * Export filtered image as blob
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

/**
 * Predefined filter presets
 */
export const FILTER_PRESETS: FilterPreset[] = [
  // Vintage Filters
  {
    id: 'sepia',
    name: 'Sepia',
    category: 'vintage',
    config: { sepia: 1.0 }
  },
  {
    id: 'vintage',
    name: 'Vintage',
    category: 'vintage',
    config: { sepia: 0.8, brightness: -10, contrast: 20, saturation: -30 }
  },
  {
    id: 'aged',
    name: 'Aged',
    category: 'vintage',
    config: { sepia: 0.6, brightness: -15, contrast: 15, saturation: -20, vignette: 0.3 }
  },

  // Artistic Filters
  {
    id: 'oil-painting',
    name: 'Oil Painting',
    category: 'artistic',
    config: { saturation: 30, sharpen: 0.3, blur: 0.1 }
  },
  {
    id: 'watercolor',
    name: 'Watercolor',
    category: 'artistic',
    config: { saturation: 40, blur: 0.2, brightness: 10 }
  },
  {
    id: 'sketch',
    name: 'Sketch',
    category: 'artistic',
    config: { brightness: 20, contrast: 50, saturation: -100 }
  },

  // Instagram-style Filters
  {
    id: 'nashville',
    name: 'Nashville',
    category: 'instagram',
    config: { brightness: 10, contrast: 20, saturation: -20, hue: 10 }
  },
  {
    id: 'valencia',
    name: 'Valencia',
    category: 'instagram',
    config: { brightness: 15, contrast: 10, saturation: 20, hue: 5 }
  },
  {
    id: 'xpro2',
    name: 'X-Pro II',
    category: 'instagram',
    config: { brightness: 5, contrast: 30, saturation: -10, hue: -10 }
  },
  {
    id: 'willow',
    name: 'Willow',
    category: 'instagram',
    config: { brightness: -10, contrast: 15, saturation: -30, hue: -20 }
  },
  {
    id: '1977',
    name: '1977',
    category: 'instagram',
    config: { brightness: 20, contrast: 10, saturation: 30, hue: 15 }
  },
  {
    id: 'amaro',
    name: 'Amaro',
    category: 'instagram',
    config: { brightness: 10, contrast: 20, saturation: 10, hue: 5 }
  }
];
