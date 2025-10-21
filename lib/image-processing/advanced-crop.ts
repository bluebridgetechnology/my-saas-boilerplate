/**
 * Advanced Crop Processor with AI-powered smart cropping
 * Simplified version that loads TensorFlow.js dynamically
 */

export interface FaceDetectionResult {
  bbox: [number, number, number, number]; // [x, y, width, height]
  score: number;
}

export interface ObjectDetectionResult {
  bbox: [number, number, number, number];
  class: string;
  score: number;
}

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SmartCropResult {
  cropArea: CropArea;
  confidence: number;
  detectedSubjects: Array<FaceDetectionResult | ObjectDetectionResult>;
}

export class AdvancedCropProcessor {
  private faceModel: any = null;
  private objectModel: any = null;
  private isInitialized = false;
  private tf: any = null;

  /**
   * Initialize TensorFlow.js models (lazy loaded)
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Dynamically import TensorFlow.js
      const tfModule = await import('@tensorflow/tfjs');
      const tfBackendModule = await import('@tensorflow/tfjs-backend-webgl');
      const faceDetectionModule = await import('@tensorflow-models/face-detection');
      const cocoSsdModule = await import('@tensorflow-models/coco-ssd');

      this.tf = tfModule;
      
      // Initialize TensorFlow.js backend
      await this.tf.ready();

      // Load face detection model
      this.faceModel = await faceDetectionModule.createDetector(
        faceDetectionModule.SupportedModels.MediaPipeFaceDetector,
        {
          runtime: 'tfjs',
          modelType: 'short' as any
        }
      );

      // Load object detection model
      this.objectModel = await cocoSsdModule.load();

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize TensorFlow.js models:', error);
      // Fallback to basic cropping without AI
      this.isInitialized = true;
    }
  }

  /**
   * Detect faces in image (simplified version)
   */
  async detectFaces(imageElement: HTMLImageElement): Promise<FaceDetectionResult[]> {
    if (!this.faceModel) {
      // Fallback: return empty array
      return [];
    }

    try {
      const faces = await this.faceModel.estimateFaces(imageElement);
      return faces
        .filter((face: any) => face && (face.boundingBox || face.box || face))
        .map((face: any) => {
          // Handle different face detection result formats
          const bbox = face.boundingBox || face.box || face;
          if (!bbox) return null;
          
          const xCenter = bbox.xCenter || bbox.x || bbox.left || 0;
          const yCenter = bbox.yCenter || bbox.y || bbox.top || 0;
          const width = bbox.width || (bbox.right && bbox.left ? bbox.right - bbox.left : 0) || 0;
          const height = bbox.height || (bbox.bottom && bbox.top ? bbox.bottom - bbox.top : 0) || 0;
          
          return {
            bbox: [
              xCenter - width / 2,
              yCenter - height / 2,
              width,
              height
            ],
            score: face.score || 0.9,
            type: 'face'
          };
        })
        .filter((result: any) => result !== null);
    } catch (error) {
      console.error('Face detection failed:', error);
      return [];
    }
  }

  /**
   * Detect objects in image (simplified version)
   */
  async detectObjects(imageElement: HTMLImageElement): Promise<ObjectDetectionResult[]> {
    if (!this.objectModel) {
      // Fallback: return empty array
      return [];
    }

    try {
      const predictions = await this.objectModel.detect(imageElement);
      return predictions.map((prediction: any) => ({
        bbox: [
          prediction.bbox[0],
          prediction.bbox[1],
          prediction.bbox[2],
          prediction.bbox[3]
        ],
        class: prediction.class,
        score: prediction.score
      }));
    } catch (error) {
      console.error('Object detection failed:', error);
      return [];
    }
  }

  /**
   * Smart crop based on detected subjects
   */
  async smartCrop(
    imageElement: HTMLImageElement,
    aspectRatio?: { width: number; height: number }
  ): Promise<SmartCropResult> {
    try {
      // Detect faces and objects
      const faces = await this.detectFaces(imageElement);
      const objects = await this.detectObjects(imageElement);
      
      const detectedSubjects = [...faces, ...objects];
      
      if (detectedSubjects.length === 0) {
        // No subjects detected, use center crop
        return this.centerCrop(imageElement, aspectRatio);
      }

      // Find the best subject to focus on
      const bestSubject = detectedSubjects.reduce((best, current) => 
        current.score > best.score ? current : best
      );

      // Calculate crop area around the best subject
      const subjectBbox = bestSubject.bbox;
      const imageWidth = imageElement.width;
      const imageHeight = imageElement.height;

      // Expand the crop area around the subject
      const padding = 0.2; // 20% padding
      const cropWidth = subjectBbox[2] * (1 + padding * 2);
      const cropHeight = subjectBbox[3] * (1 + padding * 2);

      // Apply aspect ratio if specified
      let finalWidth = cropWidth;
      let finalHeight = cropHeight;

      if (aspectRatio) {
        const targetRatio = aspectRatio.width / aspectRatio.height;
        const currentRatio = cropWidth / cropHeight;

        if (currentRatio > targetRatio) {
          finalHeight = cropWidth / targetRatio;
        } else {
          finalWidth = cropHeight * targetRatio;
        }
      }

      // Center the crop around the subject
      const centerX = subjectBbox[0] + subjectBbox[2] / 2;
      const centerY = subjectBbox[1] + subjectBbox[3] / 2;

      const cropX = Math.max(0, centerX - finalWidth / 2);
      const cropY = Math.max(0, centerY - finalHeight / 2);

      // Ensure crop doesn't exceed image boundaries
      const finalCropX = Math.min(cropX, imageWidth - finalWidth);
      const finalCropY = Math.min(cropY, imageHeight - finalHeight);
      
      return {
        cropArea: {
          x: Math.max(0, finalCropX),
          y: Math.max(0, finalCropY),
          width: Math.min(finalWidth, imageWidth),
          height: Math.min(finalHeight, imageHeight)
        },
        confidence: bestSubject.score,
        detectedSubjects
      };
    } catch (error) {
      console.error('Smart crop failed:', error);
      // Fallback to center crop
      return this.centerCrop(imageElement, aspectRatio);
    }
  }

  /**
   * Center crop fallback
   */
  private centerCrop(
    imageElement: HTMLImageElement,
    aspectRatio?: { width: number; height: number }
  ): SmartCropResult {
    const imageWidth = imageElement.width;
    const imageHeight = imageElement.height;

    let cropWidth = imageWidth;
    let cropHeight = imageHeight;

    if (aspectRatio) {
      const targetRatio = aspectRatio.width / aspectRatio.height;
      const currentRatio = imageWidth / imageHeight;

      if (currentRatio > targetRatio) {
        cropWidth = imageHeight * targetRatio;
      } else {
        cropHeight = imageWidth / targetRatio;
      }
    }

    const cropX = (imageWidth - cropWidth) / 2;
    const cropY = (imageHeight - cropHeight) / 2;

    return {
      cropArea: {
        x: cropX,
        y: cropY,
        width: cropWidth,
        height: cropHeight
      },
      confidence: 0.5,
      detectedSubjects: []
    };
  }

  /**
   * Apply crop shape to canvas (circle, oval, rectangle)
   */
  applyCropShape(
    canvas: HTMLCanvasElement,
    cropArea: CropArea,
    shape: 'rectangle' | 'circle' | 'oval'
  ): HTMLCanvasElement {
    const { x, y, width, height } = cropArea;
    
    // Create a new canvas for the shaped crop
    const shapedCanvas = document.createElement('canvas');
    const shapedCtx = shapedCanvas.getContext('2d')!;
    
    if (shape === 'rectangle') {
      // Simple rectangular crop
      shapedCanvas.width = width;
      shapedCanvas.height = height;
      shapedCtx.drawImage(
        canvas,
        x, y, width, height,
        0, 0, width, height
      );
    } else {
      // For circle/oval, we need to create a mask
      shapedCanvas.width = width;
      shapedCanvas.height = height;
      
      // Create clipping path
      shapedCtx.beginPath();
      if (shape === 'circle') {
        // Perfect circle
        const radius = Math.min(width, height) / 2;
        shapedCtx.arc(width / 2, height / 2, radius, 0, 2 * Math.PI);
      } else {
        // Oval/ellipse
        shapedCtx.ellipse(width / 2, height / 2, width / 2, height / 2, 0, 0, 2 * Math.PI);
      }
      shapedCtx.clip();
      
      // Draw the cropped image
      shapedCtx.drawImage(
        canvas,
        x, y, width, height,
        0, 0, width, height
      );
    }
    
    return shapedCanvas;
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    if (this.faceModel) {
      this.faceModel.dispose?.();
      this.faceModel = null;
    }
    
    if (this.objectModel) {
      this.objectModel.dispose?.();
      this.objectModel = null;
    }
    
    this.isInitialized = false;
  }
}