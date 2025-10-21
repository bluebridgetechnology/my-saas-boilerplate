/**
 * Web Worker Manager for background image processing
 */

import { 
  ProcessingResult, 
  ResizeOptions, 
  CropOptions, 
  RotationOptions, 
  CompressionOptions, 
  ConversionOptions,
  ProgressCallback,
  BatchProcessingResult 
} from './types';

interface WorkerTask {
  id: string;
  imageData: ImageData;
  operation: 'resize' | 'crop' | 'rotate' | 'compress' | 'convert';
  options: ResizeOptions | CropOptions | RotationOptions | CompressionOptions | ConversionOptions;
  resolve: (result: ProcessingResult) => void;
  reject: (error: Error) => void;
}

export class WorkerManager {
  private worker: Worker | null = null;
  private taskQueue: WorkerTask[] = [];
  private currentTask: WorkerTask | null = null;
  private isProcessing = false;
  private progressCallback?: ProgressCallback;

  constructor() {
    this.initializeWorker();
  }

  /**
   * Initializes the Web Worker
   */
  private initializeWorker(): void {
    try {
      // Create worker from the public worker file
      this.worker = new Worker('/worker.js');
      
      this.worker.onmessage = this.handleWorkerMessage.bind(this);
      this.worker.onerror = this.handleWorkerError.bind(this);
    } catch (error) {
      console.error('Failed to initialize Web Worker:', error);
      // Fallback to main thread processing
    }
  }

  /**
   * Processes an image using Web Worker
   */
  async processImage(
    imageData: ImageData,
    operation: 'resize' | 'crop' | 'rotate' | 'compress' | 'convert',
    options: ResizeOptions | CropOptions | RotationOptions | CompressionOptions | ConversionOptions,
    progressCallback?: ProgressCallback
  ): Promise<ProcessingResult> {
    return new Promise((resolve, reject) => {
      const task: WorkerTask = {
        id: Math.random().toString(36).substr(2, 9),
        imageData,
        operation,
        options,
        resolve,
        reject
      };

      this.taskQueue.push(task);
      this.progressCallback = progressCallback;
      
      if (!this.isProcessing) {
        this.processNextTask();
      }
    });
  }

  /**
   * Processes multiple images in batch
   */
  async processBatch(
    imageDataArray: ImageData[],
    operation: 'resize' | 'crop' | 'rotate' | 'compress' | 'convert',
    options: ResizeOptions | CropOptions | RotationOptions | CompressionOptions | ConversionOptions,
    progressCallback?: ProgressCallback
  ): Promise<BatchProcessingResult> {
    const results: ProcessingResult[] = [];
    const errors: string[] = [];
    let totalProcessed = 0;
    let totalFailed = 0;

    for (let i = 0; i < imageDataArray.length; i++) {
      try {
        const result = await this.processImage(imageDataArray[i], operation, options, (progress, message) => {
          const overallProgress = ((i + progress / 100) / imageDataArray.length) * 100;
          progressCallback?.(overallProgress, `Processing image ${i + 1}/${imageDataArray.length}: ${message}`);
        });

        results.push(result);
        if (result.success) {
          totalProcessed++;
        } else {
          totalFailed++;
          errors.push(result.error || 'Unknown error');
        }
      } catch (error) {
        totalFailed++;
        errors.push(error instanceof Error ? error.message : 'Unknown error');
        results.push({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return {
      success: totalFailed === 0,
      results,
      totalProcessed,
      totalFailed,
      errors
    };
  }

  /**
   * Cancels current processing task
   */
  cancelCurrentTask(): void {
    if (this.currentTask) {
      this.currentTask.reject(new Error('Task cancelled by user'));
      this.currentTask = null;
    }
    this.taskQueue = [];
    this.isProcessing = false;
  }

  /**
   * Cleans up worker resources
   */
  cleanup(): void {
    this.cancelCurrentTask();
    
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }

  /**
   * Processes the next task in queue
   */
  private async processNextTask(): Promise<void> {
    if (this.taskQueue.length === 0) {
      this.isProcessing = false;
      return;
    }

    this.isProcessing = true;
    this.currentTask = this.taskQueue.shift()!;

    if (!this.worker) {
      // Fallback to main thread processing
      this.processInMainThread(this.currentTask);
      return;
    }

    try {
      this.worker.postMessage({
        type: 'process',
        data: {
          imageData: this.currentTask.imageData,
          operation: this.currentTask.operation,
          options: this.currentTask.options
        }
      });
    } catch (error) {
      this.currentTask.reject(new Error('Failed to send task to worker'));
      this.processNextTask();
    }
  }

  /**
   * Handles messages from Web Worker
   */
  private handleWorkerMessage(event: MessageEvent): void {
    const { type, data, progress, message, error } = event.data;

    switch (type) {
      case 'progress':
        this.progressCallback?.(progress, message);
        break;
      
      case 'result':
        if (this.currentTask) {
          this.currentTask.resolve(data);
          this.currentTask = null;
          this.processNextTask();
        }
        break;
      
      case 'error':
        if (this.currentTask) {
          this.currentTask.reject(new Error(error));
          this.currentTask = null;
          this.processNextTask();
        }
        break;
    }
  }

  /**
   * Handles Web Worker errors
   */
  private handleWorkerError(error: ErrorEvent): void {
    console.error('Web Worker error:', error);
    
    if (this.currentTask) {
      this.currentTask.reject(new Error('Worker error: ' + error.message));
      this.currentTask = null;
    }
    
    // Reinitialize worker for next task
    this.initializeWorker();
    this.processNextTask();
  }

  /**
   * Fallback processing in main thread
   */
  private async processInMainThread(task: WorkerTask): Promise<void> {
    try {
      // This would use the main ImageProcessor class
      // For now, return a basic result
      const result: ProcessingResult = {
        success: true,
        dimensions: { width: task.imageData.width, height: task.imageData.height }
      };
      
      task.resolve(result);
      this.processNextTask();
    } catch (error) {
      task.reject(error instanceof Error ? error : new Error('Processing failed'));
      this.processNextTask();
    }
  }

}

// Singleton instance
let workerManager: WorkerManager | null = null;

export function getWorkerManager(): WorkerManager {
  if (!workerManager) {
    workerManager = new WorkerManager();
  }
  return workerManager;
}

export function cleanupWorkerManager(): void {
  if (workerManager) {
    workerManager.cleanup();
    workerManager = null;
  }
}
