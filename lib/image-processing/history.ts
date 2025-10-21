/**
 * Undo/Redo system for image processing operations
 */

import { ProcessingResult, ImageDimensions } from './types';

export interface OperationState {
  id: string;
  timestamp: number;
  operation: string;
  imageData: string; // Base64 encoded image data
  metadata: {
    dimensions: ImageDimensions;
    fileSize: number;
    format: string;
  };
  description: string;
}

export class OperationHistory {
  private history: OperationState[] = [];
  private currentIndex: number = -1;
  private maxHistorySize: number = 20;

  constructor(maxSize: number = 20) {
    this.maxHistorySize = maxSize;
  }

  /**
   * Adds a new operation to the history
   */
  async addOperation(
    operation: string,
    imageData: ImageData,
    metadata: OperationState['metadata'],
    description: string
  ): Promise<void> {
    try {
      // Convert ImageData to base64
      const canvas = document.createElement('canvas');
      canvas.width = imageData.width;
      canvas.height = imageData.height;
      const ctx = canvas.getContext('2d')!;
      ctx.putImageData(imageData, 0, 0);
      
      const imageDataUrl = canvas.toDataURL('image/png');
      
      const operationState: OperationState = {
        id: this.generateId(),
        timestamp: Date.now(),
        operation,
        imageData: imageDataUrl,
        metadata,
        description
      };

      // Remove any operations after current index (when branching)
      this.history = this.history.slice(0, this.currentIndex + 1);
      
      // Add new operation
      this.history.push(operationState);
      this.currentIndex = this.history.length - 1;

      // Limit history size
      if (this.history.length > this.maxHistorySize) {
        this.history.shift();
        this.currentIndex--;
      }
    } catch (error) {
      console.error('Failed to add operation to history:', error);
    }
  }

  /**
   * Undoes the last operation
   */
  async undo(): Promise<OperationState | null> {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      return this.history[this.currentIndex];
    }
    return null;
  }

  /**
   * Redoes the next operation
   */
  async redo(): Promise<OperationState | null> {
    if (this.currentIndex < this.history.length - 1) {
      this.currentIndex++;
      return this.history[this.currentIndex];
    }
    return null;
  }

  /**
   * Gets the current operation state
   */
  getCurrentState(): OperationState | null {
    if (this.currentIndex >= 0 && this.currentIndex < this.history.length) {
      return this.history[this.currentIndex];
    }
    return null;
  }

  /**
   * Checks if undo is available
   */
  canUndo(): boolean {
    return this.currentIndex > 0;
  }

  /**
   * Checks if redo is available
   */
  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  /**
   * Gets the history of operations
   */
  getHistory(): OperationState[] {
    return [...this.history];
  }

  /**
   * Clears the entire history
   */
  clear(): void {
    this.history = [];
    this.currentIndex = -1;
  }

  /**
   * Gets the current index in history
   */
  getCurrentIndex(): number {
    return this.currentIndex;
  }

  /**
   * Gets the total number of operations
   */
  getTotalOperations(): number {
    return this.history.length;
  }

  /**
   * Converts base64 image data back to ImageData
   */
  async imageDataToImageData(imageDataUrl: string): Promise<ImageData> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        resolve(imageData);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = imageDataUrl;
    });
  }

  /**
   * Generates a unique ID for operations
   */
  private generateId(): string {
    return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Gets operation statistics
   */
  getStats(): {
    totalOperations: number;
    currentIndex: number;
    canUndo: boolean;
    canRedo: boolean;
    memoryUsage: number; // Estimated in bytes
  } {
    let memoryUsage = 0;
    this.history.forEach(op => {
      // Rough estimate: base64 is ~4/3 the size of binary data
      memoryUsage += op.imageData.length * 0.75;
    });

    return {
      totalOperations: this.history.length,
      currentIndex: this.currentIndex,
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
      memoryUsage
    };
  }
}

// Singleton instance
let operationHistory: OperationHistory | null = null;

export function getOperationHistory(): OperationHistory {
  if (!operationHistory) {
    operationHistory = new OperationHistory();
  }
  return operationHistory;
}

export function clearOperationHistory(): void {
  if (operationHistory) {
    operationHistory.clear();
  }
}
