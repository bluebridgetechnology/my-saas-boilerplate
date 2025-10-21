/**
 * Download system and free tier limits utilities
 */

export interface DownloadOptions {
  filename?: string;
  format?: 'jpeg' | 'png' | 'webp';
  quality?: number;
}

export interface TierLimits {
  maxImages: number;
  maxFileSize: number; // in bytes
  maxPaletteColors: number;
  maxTemplates: number;
  enableFolderUpload: boolean;
  enablePriorityQueue: boolean;
  enableCustomNaming: boolean;
  enableZIPDownload: boolean;
  enableProjectManagement: boolean;
  enableWatermarkTemplates: boolean;
  enableAdvancedFormats: boolean;
}

export const TIER_LIMITS: Record<'free' | 'pro', TierLimits> = {
  free: {
    maxImages: 5,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxPaletteColors: 5,
    maxTemplates: 2,
    enableFolderUpload: false,
    enablePriorityQueue: false,
    enableCustomNaming: false,
    enableZIPDownload: false,
    enableProjectManagement: false,
    enableWatermarkTemplates: false,
    enableAdvancedFormats: false
  },
  pro: {
    maxImages: 100,
    maxFileSize: 50 * 1024 * 1024, // 50MB
    maxPaletteColors: 20,
    maxTemplates: 10,
    enableFolderUpload: true,
    enablePriorityQueue: true,
    enableCustomNaming: true,
    enableZIPDownload: true,
    enableProjectManagement: true,
    enableWatermarkTemplates: true,
    enableAdvancedFormats: true
  }
};

export class DownloadManager {
  /**
   * Downloads a blob as a file
   */
  static downloadBlob(blob: Blob, options: DownloadOptions = {}): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = options.filename || `processed-image-${Date.now()}.${options.format || 'jpg'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Downloads multiple files as a ZIP (Pro feature)
   */
  static async downloadMultipleAsZip(
    files: Array<{ blob: Blob; filename: string }>,
    zipFilename: string = 'processed-images.zip'
  ): Promise<void> {
    // This would require a ZIP library like JSZip
    // For now, we'll download files individually
    files.forEach((file, index) => {
      setTimeout(() => {
        this.downloadBlob(file.blob, { filename: file.filename });
      }, index * 100); // Small delay between downloads
    });
  }

  /**
   * Generates a filename with suffix
   */
  static generateFilename(
    originalName: string,
    suffix: string,
    format: string = 'jpg'
  ): string {
    const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
    return `${nameWithoutExt}-${suffix}.${format}`;
  }
}

export class TierManager {
  private static userPlan: 'free' | 'pro' = 'free';

  /**
   * Sets the user plan (in real app, this would come from auth context)
   */
  static setUserPlan(plan: 'free' | 'pro'): void {
    this.userPlan = plan;
  }

  /**
   * Gets the current user plan
   */
  static getUserPlan(): 'free' | 'pro' {
    return this.userPlan;
  }

  /**
   * Gets limits for current user plan
   */
  static getLimits(): TierLimits {
    return TIER_LIMITS[this.userPlan] || TIER_LIMITS.free;
  }

  /**
   * Checks if user can process more images
   */
  static canProcessMoreImages(currentCount: number): boolean {
    const limits = this.getLimits();
    return currentCount < limits.maxImages;
  }

  /**
   * Checks if file size is within limits
   */
  static isFileSizeAllowed(fileSize: number): boolean {
    const limits = this.getLimits();
    return fileSize <= limits.maxFileSize;
  }

  /**
   * Checks if user can add more colors to palette
   */
  static canAddMoreColors(currentCount: number): boolean {
    const limits = this.getLimits();
    return currentCount < limits.maxPaletteColors;
  }

  /**
   * Checks if user can use more templates
   */
  static canUseMoreTemplates(currentCount: number): boolean {
    const limits = this.getLimits();
    return currentCount < limits.maxTemplates;
  }

  /**
   * Gets upgrade message for specific limit
   */
  static getUpgradeMessage(limitType: keyof TierLimits): string {
    const freeLimit = TIER_LIMITS.free[limitType];
    const proLimit = TIER_LIMITS.pro[limitType];
    
    switch (limitType) {
      case 'maxImages':
        return `Free tier limited to ${freeLimit} images. Upgrade to Pro for ${proLimit} images per batch.`;
      case 'maxFileSize':
        return `Free tier limited to ${Math.round(Number(freeLimit) / (1024 * 1024))}MB files. Upgrade to Pro for ${Math.round(Number(proLimit) / (1024 * 1024))}MB files.`;
      case 'maxPaletteColors':
        return `Free tier limited to ${freeLimit} colors per palette. Upgrade to Pro for ${proLimit} colors.`;
      case 'maxTemplates':
        return `Free tier limited to ${freeLimit} templates. Upgrade to Pro for ${proLimit} templates.`;
      case 'enableFolderUpload':
        return 'Folder upload is a Pro feature. Upgrade to upload entire folders at once.';
      case 'enablePriorityQueue':
        return 'Priority processing queue is a Pro feature. Upgrade for faster processing.';
      case 'enableCustomNaming':
        return 'Custom file naming is a Pro feature. Upgrade for advanced naming rules.';
      case 'enableZIPDownload':
        return 'ZIP download is a Pro feature. Upgrade to download all files as a single ZIP.';
      case 'enableProjectManagement':
        return 'Project management is a Pro feature. Upgrade to save and load projects.';
      case 'enableWatermarkTemplates':
        return 'Watermark templates are a Pro feature. Upgrade for advanced watermarking.';
      case 'enableAdvancedFormats':
        return 'Advanced formats (TIFF, SVG, PDF) are Pro features. Upgrade for more format support.';
      default:
        return 'Upgrade to Pro for more features!';
    }
  }

  /**
   * Checks if a Pro feature is enabled
   */
  static isProFeatureEnabled(feature: keyof Pick<TierLimits, 'enableFolderUpload' | 'enablePriorityQueue' | 'enableCustomNaming' | 'enableZIPDownload' | 'enableProjectManagement' | 'enableWatermarkTemplates' | 'enableAdvancedFormats'>): boolean {
    const limits = this.getLimits();
    return limits[feature];
  }

  /**
   * Checks if user can use folder upload
   */
  static canUseFolderUpload(): boolean {
    return this.isProFeatureEnabled('enableFolderUpload');
  }

  /**
   * Checks if user can use priority queue
   */
  static canUsePriorityQueue(): boolean {
    return this.isProFeatureEnabled('enablePriorityQueue');
  }

  /**
   * Checks if user can use custom naming
   */
  static canUseCustomNaming(): boolean {
    return this.isProFeatureEnabled('enableCustomNaming');
  }

  /**
   * Checks if user can use ZIP download
   */
  static canUseZIPDownload(): boolean {
    return this.isProFeatureEnabled('enableZIPDownload');
  }

  /**
   * Checks if user can use project management
   */
  static canUseProjectManagement(): boolean {
    return this.isProFeatureEnabled('enableProjectManagement');
  }

  /**
   * Checks if user can use watermark templates
   */
  static canUseWatermarkTemplates(): boolean {
    return this.isProFeatureEnabled('enableWatermarkTemplates');
  }

  /**
   * Checks if user can use advanced formats
   */
  static canUseAdvancedFormats(): boolean {
    return this.isProFeatureEnabled('enableAdvancedFormats');
  }
}

export class FileValidator {
  /**
   * Validates file against tier limits
   */
  static validateFile(file: File): { valid: boolean; error?: string; file?: File } {
    const limits = TierManager.getLimits();
    
    if (!TierManager.isFileSizeAllowed(file.size)) {
      return {
        valid: false,
        error: `File too large. Maximum size: ${Math.round(limits.maxFileSize / (1024 * 1024))}MB`
      };
    }

    // Basic formats for all users
    const basicTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    
    // Advanced formats for Pro users
    const advancedTypes = ['image/tiff', 'image/svg+xml', 'application/pdf'];
    
    const allowedTypes = TierManager.canUseAdvancedFormats() 
      ? [...basicTypes, ...advancedTypes]
      : basicTypes;

    if (!allowedTypes.includes(file.type)) {
      const formatMessage = TierManager.canUseAdvancedFormats()
        ? 'Please use JPG, PNG, WebP, GIF, TIFF, SVG, or PDF.'
        : 'Please use JPG, PNG, WebP, or GIF. Upgrade to Pro for TIFF, SVG, and PDF support.';
      
      return {
        valid: false,
        error: `Unsupported file type. ${formatMessage}`
      };
    }

    return { valid: true, file };
  }

  /**
   * Validates multiple files against tier limits
   */
  static validateFiles(files: File[]): { valid: boolean; error?: string; validFiles: File[] } {
    const limits = TierManager.getLimits();
    
    if (files.length > limits.maxImages) {
      return {
        valid: false,
        error: `Too many files. Maximum: ${limits.maxImages} files per batch`,
        validFiles: []
      };
    }

    const validFiles: File[] = [];
    const errors: string[] = [];

    files.forEach((file, index) => {
      const validation = this.validateFile(file);
      if (validation.valid && validation.file) {
        validFiles.push(validation.file);
      } else {
        errors.push(`File ${index + 1}: ${validation.error}`);
      }
    });

    return {
      valid: validFiles.length > 0,
      error: errors.length > 0 ? errors.join('; ') : undefined,
      validFiles
    };
  }
}

export class UpgradePrompts {
  /**
   * Shows upgrade prompt for specific limit
   */
  static showUpgradePrompt(limitType: keyof TierLimits): void {
    const message = TierManager.getUpgradeMessage(limitType);
    // In a real app, this would show a modal or toast
    console.log('Upgrade prompt:', message);
  }

  /**
   * Gets upgrade prompt component props
   */
  static getUpgradePromptProps(limitType: keyof TierLimits) {
    return {
      title: 'Upgrade to Pro',
      message: TierManager.getUpgradeMessage(limitType),
      ctaText: 'Upgrade Now',
      ctaLink: '/pricing'
    };
  }
}
