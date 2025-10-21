/**
 * TypeScript interfaces for enhanced image processing tools
 */

export interface ImageEditorSettings {
  brightness: number; // -100 to 100
  contrast: number; // -100 to 100
  saturation: number; // -100 to 100
  hue: number; // -180 to 180
  sharpen: number; // 0 to 100
  blur: number; // 0 to 100
  noiseReduction: boolean;
  autoEnhance: boolean;
}

export interface FilterSettings {
  type: 'vintage' | 'artistic' | 'instagram' | 'custom';
  name: string;
  intensity: number; // 0 to 100
  customConfig?: {
    sepia?: number;
    brightness?: number;
    contrast?: number;
    saturation?: number;
    hue?: number;
    blur?: number;
    sharpen?: number;
  };
}

export interface TextOverlaySettings {
  text: string;
  font: string;
  fontSize: number;
  color: string;
  position: {
    x: number;
    y: number;
  };
  formatting: {
    bold: boolean;
    italic: boolean;
    underline: boolean;
    strikethrough: boolean;
  };
  effects: {
    outline: {
      enabled: boolean;
      color: string;
      width: number;
    };
    shadow: {
      enabled: boolean;
      blur: number;
      offsetX: number;
      offsetY: number;
      color: string;
    };
    gradient: {
      enabled: boolean;
      startColor: string;
      endColor: string;
      direction: 'horizontal' | 'vertical' | 'diagonal';
    };
  };
  alignment: 'left' | 'center' | 'right';
  maxWidth?: number;
}







export interface ProcessedFile {
  file: File;
  result?: {
    data: Blob;
    dataUrl: string;
    filename: string;
    outputFormat: string;
    processedSize: number;
  };
  error?: string;
  isProcessing: boolean;
}

export interface ToolSettings {
  imageEditor?: ImageEditorSettings;
  filters?: FilterSettings;
  textOverlay?: TextOverlaySettings[];
}

export interface ProcessingProgress {
  current: number;
  total: number;
  percentage: number;
  message: string;
}

export interface ToolResult {
  success: boolean;
  data?: Blob;
  error?: string;
  metadata?: {
    originalSize: number;
    processedSize: number;
    compressionRatio?: number;
    dimensions?: {
      width: number;
      height: number;
    };
  };
}
