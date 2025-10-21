'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@iconify/react';
import { AdvancedCropProcessor, SmartCropResult, CropArea } from '@/lib/image-processing/advanced-crop';
import { toast } from 'sonner';

interface AdvancedCropToolProps {
  files: File[];
  onProcessingStart: () => void;
  onProcessingEnd: () => void;
  onProgress: (progress: number, message?: string) => void;
}

export function AdvancedCropTool({ 
  files, 
  onProcessingStart, 
  onProcessingEnd, 
  onProgress 
}: AdvancedCropToolProps) {
  const [cropSettings, setCropSettings] = useState({
    showRuleOfThirds: false,
    showGoldenRatio: false,
    cropShape: 'rectangle' as 'rectangle' | 'circle' | 'oval',
    aspectRatio: 'free' as 'free' | '1:1' | '4:3' | '16:9' | '3:2',
    smartCropEnabled: true
  });

  const [processedFiles, setProcessedFiles] = useState<Array<{
    file: File;
    result?: Blob;
    error?: string;
    isProcessing: boolean;
    smartCropResult?: SmartCropResult;
  }>>([]);

  const [previewCropArea, setPreviewCropArea] = useState<CropArea | null>(null);
  const [detectedSubjects, setDetectedSubjects] = useState<any[]>([]);
  const [isDraggingCrop, setIsDraggingCrop] = useState(false);
  const dragOffsetRef = useRef<{dx: number; dy: number}>({ dx: 0, dy: 0 });
  
  const processorRef = useRef<AdvancedCropProcessor | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const previewScaleRef = useRef<number>(1);

  const initializeProcessor = useCallback(async () => {
    if (!processorRef.current) {
      processorRef.current = new AdvancedCropProcessor();
      try {
        await processorRef.current.initialize();
        toast.success('AI models loaded successfully');
      } catch (error) {
        toast.error('Failed to load AI models');
        console.error('Processor initialization failed:', error);
      }
    }
  }, []);

  const loadPreview = useCallback(async (file: File) => {
    await initializeProcessor();

    const img = new Image();
    img.onload = async () => {
      imageRef.current = img;
      
      // Set up canvas
      const canvas = previewCanvasRef.current!;
      const ctx = canvas.getContext('2d')!;
      const container = canvas.parentElement as HTMLElement;
      const maxW = Math.min(container?.clientWidth || img.width, 600);
      const maxH = 400;
      const scale = Math.min(maxW / img.width, maxH / img.height, 1);
      previewScaleRef.current = scale;
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Run smart crop detection
      if (cropSettings.smartCropEnabled && processorRef.current) {
        try {
          const faces = await processorRef.current.detectFaces(img);
          const objects = await processorRef.current.detectObjects(img);
          
          const smartCropResult = await processorRef.current.smartCrop(
            img,
            cropSettings.aspectRatio !== 'free' ? 
              { width: parseInt(cropSettings.aspectRatio.split(':')[0]), height: parseInt(cropSettings.aspectRatio.split(':')[1]) } :
              undefined
          );

          setPreviewCropArea(smartCropResult.cropArea);
          setDetectedSubjects(smartCropResult.detectedSubjects);
          
          // Draw crop area and detected subjects
          drawPreviewOverlay(ctx, smartCropResult.cropArea, smartCropResult.detectedSubjects, img.width, img.height);
        } catch (error) {
          console.error('Smart crop detection failed:', error);
          toast.error('Smart crop detection failed');
        }
      }
    };
    
    img.src = URL.createObjectURL(file);
  }, [cropSettings.smartCropEnabled, cropSettings.aspectRatio, initializeProcessor]);

  // Auto-load preview when files change (real-time preview without clicking button)
  useEffect(() => {
    if (files.length > 0) {
      loadPreview(files[0]);
    } else {
      setPreviewCropArea(null);
      setDetectedSubjects([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files]);

  const drawPreviewOverlay = useCallback((
    ctx: CanvasRenderingContext2D,
    cropArea: CropArea,
    subjects: any[],
    imageWidth: number,
    imageHeight: number
  ) => {
    const s = previewScaleRef.current;
    // Clear previous overlays
    ctx.clearRect(0, 0, Math.round(imageWidth * s), Math.round(imageHeight * s));
    ctx.drawImage(imageRef.current!, 0, 0, Math.round(imageWidth * s), Math.round(imageHeight * s));

    // Draw crop area
    ctx.strokeStyle = '#3B82F6';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    if (cropSettings.cropShape === 'rectangle') {
      ctx.strokeRect(cropArea.x * s, cropArea.y * s, cropArea.width * s, cropArea.height * s);
    } else {
      // circle or oval -> draw ellipse that fits the crop rect
      ctx.beginPath();
      ctx.ellipse(
        (cropArea.x + cropArea.width / 2) * s,
        (cropArea.y + cropArea.height / 2) * s,
        (cropArea.width / 2) * s,
        cropSettings.cropShape === 'circle' ? (cropArea.width / 2) * s : (cropArea.height / 2) * s,
        0,
        0,
        Math.PI * 2
      );
      ctx.stroke();
    }
    
    // Draw crop area fill
    ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
    if (cropSettings.cropShape === 'rectangle') {
      ctx.fillRect(cropArea.x * s, cropArea.y * s, cropArea.width * s, cropArea.height * s);
    } else {
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(
        (cropArea.x + cropArea.width / 2) * s,
        (cropArea.y + cropArea.height / 2) * s,
        (cropArea.width / 2) * s,
        cropSettings.cropShape === 'circle' ? (cropArea.width / 2) * s : (cropArea.height / 2) * s,
        0,
        0,
        Math.PI * 2
      );
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // Draw simple drag handle corners
    const handleSize = 6;
    ctx.fillStyle = '#3B82F6';
    ctx.fillRect(cropArea.x * s - handleSize/2, cropArea.y * s - handleSize/2, handleSize, handleSize);
    ctx.fillRect((cropArea.x + cropArea.width) * s - handleSize/2, cropArea.y * s - handleSize/2, handleSize, handleSize);
    ctx.fillRect(cropArea.x * s - handleSize/2, (cropArea.y + cropArea.height) * s - handleSize/2, handleSize, handleSize);
    ctx.fillRect((cropArea.x + cropArea.width) * s - handleSize/2, (cropArea.y + cropArea.height) * s - handleSize/2, handleSize, handleSize);

    // Draw detected subjects
    subjects.forEach((subject, index) => {
      const [x, y, width, height] = subject.bbox;
      const color = subject.type === 'face' ? '#10B981' : '#F59E0B';
      
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.setLineDash([]);
      ctx.strokeRect(x, y, width, height);
      
      // Draw label
      ctx.fillStyle = color;
      ctx.font = '12px Arial';
      ctx.fillText(
        `${subject.type}: ${subject.score?.toFixed(2) || subject.class}`,
        x,
        y - 5
      );
    });

    // Draw Rule of Thirds grid
    if (cropSettings.showRuleOfThirds) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 1;
      ctx.setLineDash([]);
      
      // Draw vertical lines
      const verticalThird = (imageWidth * s) / 3;
      ctx.strokeRect(verticalThird, 0, 0, imageHeight * s);
      ctx.strokeRect(verticalThird * 2, 0, 0, imageHeight * s);
      
      // Draw horizontal lines  
      const horizontalThird = (imageHeight * s) / 3;
      ctx.strokeRect(0, horizontalThird, imageWidth * s, 0);
      ctx.strokeRect(0, horizontalThird * 2, imageWidth * s, 0);
    }

    // Draw Golden Ratio spiral (simplified)
    if (cropSettings.showGoldenRatio) {
      ctx.fillStyle = 'rgba(255, 215, 0, 0.7)';
      // Simple golden ratio visualization
      const centerX = (imageWidth * s) / 2;
      const centerY = (imageHeight * s) / 2;
      const radius = Math.min(imageWidth, imageHeight) * s / 6;
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.fill();
    }
  }, [cropSettings.showRuleOfThirds, cropSettings.showGoldenRatio]);

  // Helpers to constrain crop within image bounds
  const clampCropArea = useCallback((area: CropArea, imageWidth: number, imageHeight: number): CropArea => {
    let { x, y, width, height } = area;
    if (x < 0) x = 0;
    if (y < 0) y = 0;
    if (x + width > imageWidth) x = imageWidth - width;
    if (y + height > imageHeight) y = imageHeight - height;
    return { x, y, width, height } as CropArea;
  }, []);

  // Recompute/redraw crop overlay when settings change (real-time)
  useEffect(() => {
    if (!imageRef.current || !previewCanvasRef.current) return;
    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext('2d')!;
    const img = imageRef.current;

    const run = async () => {
      let area = previewCropArea;
      let subjects = detectedSubjects;
      if (cropSettings.smartCropEnabled && processorRef.current) {
        try {
          const smart = await processorRef.current.smartCrop(
            img,
            cropSettings.aspectRatio !== 'free'
              ? { width: parseInt(cropSettings.aspectRatio.split(':')[0]), height: parseInt(cropSettings.aspectRatio.split(':')[1]) }
              : undefined
          );
          area = smart.cropArea;
          subjects = smart.detectedSubjects;
          setDetectedSubjects(subjects);
          setPreviewCropArea(area);
        } catch {}
      } else if (area) {
        // Adjust to aspect ratio if needed
        if (cropSettings.aspectRatio !== 'free') {
          const [rw, rh] = cropSettings.aspectRatio.split(':').map(n => parseInt(n));
          const targetRatio = rw / rh;
          // Recompute size preserving center
          let width = area.width;
          let height = Math.round(width / targetRatio);
          if (height > img.height) {
            height = img.height;
            width = Math.round(height * targetRatio);
          }
          let x = Math.round(area.x + (area.width - width) / 2);
          let y = Math.round(area.y + (area.height - height) / 2);
          x = Math.min(Math.max(x, 0), img.width - width);
          y = Math.min(Math.max(y, 0), img.height - height);
          area = { x, y, width, height } as CropArea;
          setPreviewCropArea(area);
        }
      }
      if (area) drawPreviewOverlay(ctx, area, subjects || [], img.width, img.height);
    };
    run();
  }, [cropSettings]);

  // Drag-to-move crop area in preview
  useEffect(() => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const img = imageRef.current;
    const onMouseDown = (e: MouseEvent) => {
      if (!previewCropArea) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (
        x >= previewCropArea.x && x <= previewCropArea.x + previewCropArea.width &&
        y >= previewCropArea.y && y <= previewCropArea.y + previewCropArea.height
      ) {
        setIsDraggingCrop(true);
        dragOffsetRef.current = { dx: x - previewCropArea.x, dy: y - previewCropArea.y };
      }
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingCrop || !img || !previewCropArea) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const proposed: CropArea = {
        x: x - dragOffsetRef.current.dx,
        y: y - dragOffsetRef.current.dy,
        width: previewCropArea.width,
        height: previewCropArea.height
      } as CropArea;
      const clamped = clampCropArea(proposed, img.width, img.height);
      setPreviewCropArea(clamped);
      const ctx = canvas.getContext('2d')!;
      drawPreviewOverlay(ctx, clamped, detectedSubjects, img.width, img.height);
    };
    const onMouseUp = () => setIsDraggingCrop(false);

    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [previewCropArea, detectedSubjects, clampCropArea, drawPreviewOverlay, isDraggingCrop]);

  const processFiles = useCallback(async () => {
    if (files.length === 0) {
      toast.error('Please upload images first');
      return;
    }

    await initializeProcessor();
    onProcessingStart();
    const results: typeof processedFiles = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const progress = ((i + 1) / files.length) * 100;
      onProgress(progress, `Processing ${file.name}...`);

      try {
        const img = new Image();
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = URL.createObjectURL(file);
        });

        let smartCropResult: SmartCropResult | undefined;

        // Run smart crop detection
        if (cropSettings.smartCropEnabled && processorRef.current) {
          const faces = await processorRef.current.detectFaces(img);
          const objects = await processorRef.current.detectObjects(img);
          
          smartCropResult = await processorRef.current.smartCrop(
            img,
            cropSettings.aspectRatio !== 'free' ? 
              { width: parseInt(cropSettings.aspectRatio.split(':')[0]), height: parseInt(cropSettings.aspectRatio.split(':')[1]) } :
              undefined
          );
        }

        // Create canvas and crop
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        let croppedCanvas: HTMLCanvasElement;
        
        // Create crop area
        let cropArea;
        if (smartCropResult) {
          cropArea = smartCropResult.cropArea;
        } else {
          // Default center crop
          const cropSize = Math.min(img.width, img.height) * 0.8;
          const centerX = img.width / 2;
          const centerY = img.height / 2;
          cropArea = {
            x: centerX - cropSize / 2,
            y: centerY - cropSize / 2,
            width: cropSize,
            height: cropSize
          };
        }

        // Apply crop shape using the processor
        croppedCanvas = processorRef.current!.applyCropShape(canvas, cropArea, cropSettings.cropShape);

        // Convert to blob
        const blob = await new Promise<Blob>((resolve) => {
          croppedCanvas.toBlob((blob) => {
            if (blob) resolve(blob);
          }, 'image/png', 0.9);
        });

        if (blob) {
          results.push({
            file,
            result: blob,
            isProcessing: false,
            smartCropResult
          });
          toast.success(`Processed ${file.name}`);
        } else {
          throw new Error('Failed to export image');
        }

        URL.revokeObjectURL(img.src);
      } catch (error) {
        console.error(`Error processing ${file.name}:`, error);
        results.push({
          file,
          error: error instanceof Error ? error.message : 'Unknown error',
          isProcessing: false
        });
        toast.error(`Failed to process ${file.name}`);
      }
    }

    setProcessedFiles(results);
    onProcessingEnd();
    onProgress(100, 'Processing complete');
  }, [files, cropSettings, initializeProcessor, onProcessingStart, onProcessingEnd, onProgress]);

  const downloadFile = useCallback((result: Blob, filename: string) => {
    const url = URL.createObjectURL(result);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  const downloadAll = useCallback(async () => {
    const JSZipModule = await import('jszip');
    const JSZip = JSZipModule.default;
    const zip = new JSZip();

    processedFiles.forEach((processedFile, index) => {
      if (processedFile.result) {
        const originalName = processedFile.file.name.replace(/\.[^/.]+$/, '');
        const filename = `${originalName}_cropped.png`;
        zip.file(filename, processedFile.result);
      }
    });

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    downloadFile(zipBlob, 'cropped-images.zip');
    toast.success('Downloading all cropped images as ZIP');
  }, [processedFiles, downloadFile]);

  useEffect(() => {
    return () => {
      if (processorRef.current) {
        processorRef.current.cleanup();
      }
    };
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="text-center space-y-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900">Advanced Crop Tool</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          AI-powered smart cropping with face detection and composition guides. Create perfect crops with intelligent subject detection.
        </p>
      </div>
      {/* Live Preview (always visible once an image is uploaded) */}
      {files.length > 0 && (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Preview</h3>
              <span className="text-sm text-gray-500">Real‑time crop overlay</span>
            </div>
            <div className="text-center">
              <canvas
                ref={previewCanvasRef}
                className="max-w-lg max-h-[400px] border border-gray-200 rounded-lg shadow-sm mx-auto"
                style={{ height: 'auto' }}
              />
            </div>
          </div>
        </Card>
      )}

      {/* Settings Panel */}
      <Card className="p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Advanced Crop Settings</h3>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <Icon icon="solar:check-circle-bold-duotone" className="h-3 w-3 mr-1" />
              Free Feature
            </span>
          </div>

          {/* Smart Crop */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="smartCrop"
                checked={cropSettings.smartCropEnabled}
                onChange={(e) => setCropSettings(prev => ({ ...prev, smartCropEnabled: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="smartCrop" className="text-sm font-medium text-gray-700">
                Smart Crop (AI-powered face/subject detection)
              </label>
            </div>
          </div>

          {/* Crop Shape */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Crop Shape</label>
            <div className="flex space-x-3">
              {(['rectangle', 'circle', 'oval'] as const).map((shape) => (
                <button
                  key={shape}
                  onClick={() => setCropSettings(prev => ({ ...prev, cropShape: shape }))}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    cropSettings.cropShape === shape
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {shape.charAt(0).toUpperCase() + shape.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Aspect Ratio */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Aspect Ratio</label>
            <div className="flex flex-wrap gap-2">
              {(['free', '1:1', '4:3', '16:9', '3:2'] as const).map((ratio) => (
                <button
                  key={ratio}
                  onClick={() => setCropSettings(prev => ({ ...prev, aspectRatio: ratio }))}
                  className={`px-3 py-1 rounded-md border text-sm font-medium transition-colors ${
                    cropSettings.aspectRatio === ratio
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {ratio === 'free' ? 'Free' : ratio}
                </button>
              ))}
            </div>
          </div>

          {/* Grid Overlays */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Grid Overlays</label>
            <div className="flex space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={cropSettings.showRuleOfThirds}
                  onChange={(e) => setCropSettings(prev => ({ ...prev, showRuleOfThirds: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Rule of Thirds</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={cropSettings.showGoldenRatio}
                  onChange={(e) => setCropSettings(prev => ({ ...prev, showGoldenRatio: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Golden Ratio</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={processFiles}
              className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white"
            >
              <Icon icon="solar:crop-bold-duotone" className="h-4 w-4 mr-2" />
              Process Images
            </Button>

          </div>
        </div>
      </Card>


      {/* Results */}
      {processedFiles.length > 0 && (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Cropped Images</h3>
              <Button 
                onClick={downloadAll}
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <Icon icon="solar:download-bold-duotone" className="h-4 w-4 mr-2" />
                Download All (ZIP)
              </Button>
            </div>

            <div className="space-y-3">
              {processedFiles.map((processedFile, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Icon icon="solar:image-bold-duotone" className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{processedFile.file.name}</p>
                      <p className="text-sm text-gray-600">
                        {processedFile.result ? 'Successfully cropped' : 'Processing failed'}
                      </p>
                      {processedFile.smartCropResult && (
                        <p className="text-xs text-green-600">
                          Smart crop confidence: {(processedFile.smartCropResult.confidence * 100).toFixed(1)}%
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {processedFile.result ? (
                    <Button 
                      onClick={() => {
                        const originalName = processedFile.file.name.replace(/\.[^/.]+$/, '');
                        downloadFile(processedFile.result!, `${originalName}_cropped.png`);
                      }}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Icon icon="solar:download-bold-duotone" className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Icon icon="solar:danger-circle-bold-duotone" className="h-4 w-4 text-red-600" />
                      <span className="text-sm text-red-600">Failed</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
