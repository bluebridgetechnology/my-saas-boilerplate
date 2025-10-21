'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TierManager } from '@/lib/image-processing/download-manager';

interface WatermarkOptions {
  type: 'text' | 'image';
  text: string;
  imageFile?: File;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  opacity: number;
  size: number;
  rotation: number;
  color: string;
  fontFamily: string;
  fontSize: number;
  blendMode: 'normal' | 'multiply' | 'overlay' | 'soft-light' | 'hard-light';
}

interface TextPosition {
  x: number;
  y: number;
}

interface DraggableText {
  id: string;
  text: string;
  position: TextPosition;
  fontSize: number;
  fontFamily: string;
  textColor: string;
  outlineColor: string;
  outlineWidth: number;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  opacity: number;
  rotation: number;
  blendMode: 'normal' | 'multiply' | 'overlay' | 'soft-light' | 'hard-light';
}

interface WatermarkToolProps {
  files: File[];
  onProcessingStart: () => void;
  onProcessingEnd: () => void;
  onProgress: (progress: number) => void;
}

export function WatermarkTool({
  files,
  onProcessingStart,
  onProcessingEnd,
  onProgress
}: WatermarkToolProps) {
  const [watermarkOptions, setWatermarkOptions] = useState<WatermarkOptions>({
    type: 'text',
    text: '© ResizeSuite',
    position: 'bottom-right',
    opacity: 0.7,
    size: 100,
    rotation: 0,
    color: '#FFFFFF',
    fontFamily: 'Arial',
    fontSize: 24,
    blendMode: 'normal'
  });

  const [draggableTexts, setDraggableTexts] = useState<DraggableText[]>([]);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<TextPosition>({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedResults, setProcessedResults] = useState<any[]>([]);
  const watermarkImageRef = useRef<HTMLInputElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const userPlan = TierManager.getUserPlan();
  const canUseProFeatures = userPlan === 'pro';

  const updateWatermarkOption = useCallback((key: keyof WatermarkOptions, value: any) => {
    setWatermarkOptions(prev => ({ ...prev, [key]: value }));
  }, []);

  // Add new draggable text
  const addDraggableText = useCallback((text: string) => {
    if (!text.trim()) return;

    const newText: DraggableText = {
      id: `text-${Date.now()}`,
      text: text.trim(),
      position: { x: 50, y: 50 }, // Center position as percentage
      fontSize: watermarkOptions.fontSize,
      fontFamily: watermarkOptions.fontFamily,
      textColor: watermarkOptions.color,
      outlineColor: '#000000',
      outlineWidth: 2,
      fontWeight: 'normal',
      fontStyle: 'normal',
      opacity: watermarkOptions.opacity,
      rotation: watermarkOptions.rotation,
      blendMode: watermarkOptions.blendMode
    };

    setDraggableTexts(prev => [...prev, newText]);
    setSelectedTextId(newText.id);
  }, [watermarkOptions]);

  // Update selected text
  const updateSelectedText = useCallback((updates: Partial<DraggableText>) => {
    if (!selectedTextId) return;
    
    setDraggableTexts(prev => 
      prev.map(text => 
        text.id === selectedTextId 
          ? { ...text, ...updates }
          : text
      )
    );
  }, [selectedTextId]);

  // Delete selected text
  const deleteSelectedText = useCallback(() => {
    if (!selectedTextId) return;
    
    setDraggableTexts(prev => prev.filter(text => text.id !== selectedTextId));
    setSelectedTextId(null);
  }, [selectedTextId]);

  const generatePreview = useCallback(async () => {
    if (files.length === 0) return;

    const canvas = previewCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      // Set canvas size to match image
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw original image
      ctx.drawImage(img, 0, 0);
      
      // Apply draggable texts
      draggableTexts.forEach(text => {
        drawTextOnCanvas(ctx, text, canvas.width, canvas.height);
      });
      
      // Update preview
      setPreviewImage(canvas.toDataURL());
    };
    
    img.src = URL.createObjectURL(files[0]);
  }, [files, draggableTexts]);

  // Real-time preview effect
  useEffect(() => {
    if (files.length > 0) {
      generatePreview();
    }
  }, [files, watermarkOptions, draggableTexts, generatePreview]);

  // Initial preview when files are uploaded
  useEffect(() => {
    if (files.length > 0 && !previewImage) {
      generatePreview();
    }
  }, [files, generatePreview, previewImage]);

  const drawTextOnCanvas = useCallback((ctx: CanvasRenderingContext2D, text: DraggableText, width: number, height: number) => {
    const x = (text.position.x / 100) * width;
    const y = (text.position.y / 100) * height;

    ctx.save();
    ctx.globalAlpha = text.opacity;
    ctx.globalCompositeOperation = text.blendMode as GlobalCompositeOperation;
    
    // Set font
    const fontWeight = text.fontWeight === 'bold' ? 'bold' : 'normal';
    const fontStyle = text.fontStyle === 'italic' ? 'italic' : 'normal';
    ctx.font = `${fontStyle} ${fontWeight} ${text.fontSize}px ${text.fontFamily}`;
    
    // Draw outline if specified
    if (text.outlineWidth > 0) {
      ctx.strokeStyle = text.outlineColor;
      ctx.lineWidth = text.outlineWidth;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.strokeText(text.text, x, y);
    }
    
    // Draw text
    ctx.fillStyle = text.textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text.text, x, y);
    
    ctx.restore();
  }, []);

  // Mouse event handlers for canvas interaction
  const handleCanvasMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;

    // Check if clicking on a text element
    const clickedText = draggableTexts.find(text => {
      const textX = (text.position.x / 100) * canvas.width;
      const textY = (text.position.y / 100) * canvas.height;
      
      // Create a temporary context to measure text
      ctx.font = `${text.fontSize}px ${text.fontFamily}`;
      const textWidth = ctx.measureText(text.text).width;
      const textHeight = text.fontSize;
      
      return x >= textX - textWidth/2 && x <= textX + textWidth/2 &&
             y >= textY - textHeight/2 && y <= textY + textHeight/2;
    });

    if (clickedText) {
      setSelectedTextId(clickedText.id);
      setIsDragging(true);
      setDragOffset({
        x: x - (clickedText.position.x / 100) * canvas.width,
        y: y - (clickedText.position.y / 100) * canvas.height
      });
    } else {
      setSelectedTextId(null);
    }
  }, [draggableTexts]);

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !selectedTextId) return;

    const canvas = previewCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;

    const newX = (x / canvas.width) * 100;
    const newY = (y / canvas.height) * 100;

    updateSelectedText({ position: { x: newX, y: newY } });
  }, [isDragging, selectedTextId, updateSelectedText]);

  const handleCanvasMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragOffset({ x: 0, y: 0 });
  }, []);

  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      updateWatermarkOption('imageFile', file);
      updateWatermarkOption('type', 'image');
    }
  }, [updateWatermarkOption]);

  const applyWatermarkToCanvas = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const { type, text, position, opacity, size, rotation, color, fontFamily, fontSize, blendMode } = watermarkOptions;

    ctx.globalAlpha = opacity;
    ctx.globalCompositeOperation = blendMode as GlobalCompositeOperation;

    if (type === 'text') {
      ctx.font = `${fontSize}px ${fontFamily}`;
      ctx.fillStyle = color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Calculate position
      const { x, y } = getWatermarkPosition(position, width, height, size);
      
      // Apply rotation
      if (rotation !== 0) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.fillText(text, 0, 0);
        ctx.restore();
      } else {
        ctx.fillText(text, x, y);
      }
    } else if (type === 'image' && watermarkOptions.imageFile) {
      const img = new Image();
      img.onload = () => {
        const { x, y } = getWatermarkPosition(position, width, height, size);
        
        if (rotation !== 0) {
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate((rotation * Math.PI) / 180);
          ctx.drawImage(img, -size/2, -size/2, size, size);
          ctx.restore();
        } else {
          ctx.drawImage(img, x - size/2, y - size/2, size, size);
        }
      };
      img.src = URL.createObjectURL(watermarkOptions.imageFile);
    }

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }, [watermarkOptions]);

  const getWatermarkPosition = useCallback((position: string, width: number, height: number, size: number) => {
    const margin = 20;
    switch (position) {
      case 'top-left':
        return { x: margin + size/2, y: margin + size/2 };
      case 'top-right':
        return { x: width - margin - size/2, y: margin + size/2 };
      case 'bottom-left':
        return { x: margin + size/2, y: height - margin - size/2 };
      case 'bottom-right':
        return { x: width - margin - size/2, y: height - margin - size/2 };
      case 'center':
        return { x: width/2, y: height/2 };
      default:
        return { x: width - margin - size/2, y: height - margin - size/2 };
    }
  }, []);

  const processAllImages = useCallback(async () => {
    if (files.length === 0) return;

    setIsProcessing(true);
    onProcessingStart();

    try {
      const results: any[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const progress = Math.round(((i + 1) / files.length) * 100);
        onProgress(progress);

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) continue;

        const img = new Image();
        await new Promise((resolve) => {
          img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            
            // Draw original image
            ctx.drawImage(img, 0, 0);
            
            // Apply watermark
            applyWatermarkToCanvas(ctx, canvas.width, canvas.height);
            
            canvas.toBlob((blob) => {
              if (blob) {
                results.push({
                  file,
                  processedData: blob,
                  originalSize: file.size,
                  processedSize: blob.size
                });
              }
              resolve(undefined);
            }, 'image/jpeg', 0.9);
          };
          img.src = URL.createObjectURL(file);
        });
      }

      setProcessedResults(results);
    } catch (error) {
      console.error('Watermark processing error:', error);
    } finally {
      setIsProcessing(false);
      onProcessingEnd();
    }
  }, [files, watermarkOptions, onProcessingStart, onProcessingEnd, onProgress, applyWatermarkToCanvas]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side - Preview */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-900">Live Preview</h4>
          
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 sticky top-4">
            <div className="relative">
              {files.length > 0 ? (
                <div className="relative inline-block">
                  <img
                    src={previewImage || URL.createObjectURL(files[0])}
                    alt="Watermark preview"
                    className="max-w-full h-auto max-h-96 mx-auto rounded-lg shadow-sm"
                  />
                  {/* Interactive overlay canvas */}
                  <canvas
                    ref={previewCanvasRef}
                    className="absolute top-0 left-0 w-full h-full cursor-pointer"
                    style={{ 
                      width: '100%', 
                      height: '100%',
                      pointerEvents: 'auto'
                    }}
                    onMouseDown={handleCanvasMouseDown}
                    onMouseMove={handleCanvasMouseMove}
                    onMouseUp={handleCanvasMouseUp}
                    onMouseLeave={handleCanvasMouseUp}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
                  <div className="text-center">
                    <Icon icon="solar:image-bold-duotone" className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">
                      {files.length === 0 ? 'Upload images to see preview' : 'Preview will appear here'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Text management */}
          {draggableTexts.length > 0 && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h5 className="text-sm font-medium text-gray-700">Text Elements</h5>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedTextId(null)}
                    className="text-xs"
                  >
                    Deselect All
                  </Button>
                  {selectedTextId && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={deleteSelectedText}
                      className="text-xs"
                    >
                      <Icon icon="solar:trash-bin-trash-bold-duotone" className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                {draggableTexts.map((text) => (
                  <div
                    key={text.id}
                    className={`p-2 rounded border cursor-pointer transition-colors ${
                      selectedTextId === text.id 
                        ? 'border-blue-500 bg-blue-100' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedTextId(text.id)}
                  >
                    <div className="text-sm font-medium text-gray-900">{text.text}</div>
                    <div className="text-xs text-gray-500">
                      {text.fontSize}px {text.fontFamily} • {Math.round(text.position.x)}%, {Math.round(text.position.y)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Side - Controls */}
        <div className="space-y-8">
        <h3 className="text-xl font-semibold text-gray-900">Watermark Settings</h3>
        
        {/* Watermark Type */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-3 block">
            Watermark Type
          </Label>
          <div className="space-y-3">
            <label className="flex items-center space-x-3">
              <input
                type="radio"
                name="watermarkType"
                value="text"
                checked={watermarkOptions.type === 'text'}
                onChange={(e) => updateWatermarkOption('type', e.target.value)}
                className="text-blue-600"
              />
              <span className="text-gray-700">Text Watermark</span>
            </label>
            <label className="flex items-center space-x-3">
              <input
                type="radio"
                name="watermarkType"
                value="image"
                checked={watermarkOptions.type === 'image'}
                onChange={(e) => updateWatermarkOption('type', e.target.value)}
                className="text-blue-600"
                disabled={!canUseProFeatures}
              />
              <span className={`${!canUseProFeatures ? 'text-gray-400' : 'text-gray-700'}`}>
                Logo/Image Watermark
                {!canUseProFeatures && <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs ml-2">Pro</span>}
              </span>
            </label>
          </div>
        </div>

        <hr className="border-gray-200" />

        {/* Text Watermark Settings */}
        {watermarkOptions.type === 'text' && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="watermarkText" className="text-sm font-medium text-gray-700">
                Watermark Text
              </Label>
              <div className="flex gap-2 mt-1">
              <Input
                id="watermarkText"
                value={watermarkOptions.text}
                onChange={(e) => updateWatermarkOption('text', e.target.value)}
                placeholder="Enter watermark text"
                  className="flex-1"
                />
                <Button
                  onClick={() => addDraggableText(watermarkOptions.text)}
                  disabled={!watermarkOptions.text.trim()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Icon icon="solar:add-circle-bold-duotone" className="h-4 w-4 mr-1" />
                  Add Text
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fontSize" className="text-sm font-medium text-gray-700">
                  Font Size
                </Label>
                <Input
                  id="fontSize"
                  type="number"
                  value={selectedTextId ? draggableTexts.find(t => t.id === selectedTextId)?.fontSize || watermarkOptions.fontSize : watermarkOptions.fontSize}
                  onChange={(e) => {
                    const fontSize = parseInt(e.target.value);
                    updateWatermarkOption('fontSize', fontSize);
                    if (selectedTextId) {
                      updateSelectedText({ fontSize });
                    }
                  }}
                  min="8"
                  max="72"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="fontFamily" className="text-sm font-medium text-gray-700">
                  Font Family
                </Label>
                <select
                  id="fontFamily"
                  value={selectedTextId ? draggableTexts.find(t => t.id === selectedTextId)?.fontFamily || watermarkOptions.fontFamily : watermarkOptions.fontFamily}
                  onChange={(e) => {
                    updateWatermarkOption('fontFamily', e.target.value);
                    if (selectedTextId) {
                      updateSelectedText({ fontFamily: e.target.value });
                    }
                  }}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Arial">Arial</option>
                  <option value="Helvetica">Helvetica</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Verdana">Verdana</option>
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="textColor" className="text-sm font-medium text-gray-700">
                Text Color
              </Label>
              <div className="mt-1 flex items-center space-x-3">
                <input
                  id="textColor"
                  type="color"
                  value={selectedTextId ? draggableTexts.find(t => t.id === selectedTextId)?.textColor || watermarkOptions.color : watermarkOptions.color}
                  onChange={(e) => {
                    updateWatermarkOption('color', e.target.value);
                    if (selectedTextId) {
                      updateSelectedText({ textColor: e.target.value });
                    }
                  }}
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <Input
                  value={selectedTextId ? draggableTexts.find(t => t.id === selectedTextId)?.textColor || watermarkOptions.color : watermarkOptions.color}
                  onChange={(e) => {
                    updateWatermarkOption('color', e.target.value);
                    if (selectedTextId) {
                      updateSelectedText({ textColor: e.target.value });
                    }
                  }}
                  placeholder="#FFFFFF"
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        )}

        {/* Image Watermark Settings */}
        {watermarkOptions.type === 'image' && canUseProFeatures && (
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-3 block">
              Upload Logo/Image
            </Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                ref={watermarkImageRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <Icon icon="solar:image-bold-duotone" className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                {watermarkOptions.imageFile ? watermarkOptions.imageFile.name : 'Click to upload logo/image'}
              </p>
              <Button
                variant="outline"
                onClick={() => watermarkImageRef.current?.click()}
              >
                <Icon icon="solar:upload-bold-duotone" className="h-4 w-4 mr-2" />
                Choose Image
              </Button>
            </div>
          </div>
        )}

        <hr className="border-gray-200" />

        {/* Position Settings */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-3 block">
            Quick Position
          </Label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'top-left', icon: 'solar:arrow-up-left-bold-duotone', label: 'Top Left' },
              { value: 'top-right', icon: 'solar:arrow-up-right-bold-duotone', label: 'Top Right' },
              { value: 'center', icon: 'solar:target-bold-duotone', label: 'Center' },
              { value: 'bottom-left', icon: 'solar:arrow-down-left-bold-duotone', label: 'Bottom Left' },
              { value: 'bottom-right', icon: 'solar:arrow-down-right-bold-duotone', label: 'Bottom Right' }
            ].map((pos) => (
              <button
                key={pos.value}
                onClick={() => {
                  updateWatermarkOption('position', pos.value);
                  if (selectedTextId) {
                    // Convert position to percentage
                    let x = 50, y = 50;
                    switch (pos.value) {
                      case 'top-left': x = 20; y = 20; break;
                      case 'top-right': x = 80; y = 20; break;
                      case 'center': x = 50; y = 50; break;
                      case 'bottom-left': x = 20; y = 80; break;
                      case 'bottom-right': x = 80; y = 80; break;
                    }
                    updateSelectedText({ position: { x, y } });
                  }
                }}
                className={`p-3 rounded-lg border-2 transition-colors flex flex-col items-center gap-1 ${
                  watermarkOptions.position === pos.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
                title={pos.label}
              >
                <Icon icon={pos.icon} className="h-5 w-5" />
                <span className="text-xs font-medium">{pos.label}</span>
              </button>
            ))}
          </div>
        </div>

        <hr className="border-gray-200" />

        {/* Appearance Settings */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="opacity" className="text-sm font-medium text-gray-700">
              Opacity: {Math.round((selectedTextId ? draggableTexts.find(t => t.id === selectedTextId)?.opacity || watermarkOptions.opacity : watermarkOptions.opacity) * 100)}%
            </Label>
            <input
              id="opacity"
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={selectedTextId ? draggableTexts.find(t => t.id === selectedTextId)?.opacity || watermarkOptions.opacity : watermarkOptions.opacity}
              onChange={(e) => {
                const opacity = parseFloat(e.target.value);
                updateWatermarkOption('opacity', opacity);
                if (selectedTextId) {
                  updateSelectedText({ opacity });
                }
              }}
              className="mt-1 w-full"
            />
          </div>

          <div>
            <Label htmlFor="size" className="text-sm font-medium text-gray-700">
              Size: {selectedTextId ? draggableTexts.find(t => t.id === selectedTextId)?.fontSize || watermarkOptions.fontSize : watermarkOptions.fontSize}px
            </Label>
            <input
              id="size"
              type="range"
              min="8"
              max="72"
              step="2"
              value={selectedTextId ? draggableTexts.find(t => t.id === selectedTextId)?.fontSize || watermarkOptions.fontSize : watermarkOptions.fontSize}
              onChange={(e) => {
                const fontSize = parseInt(e.target.value);
                updateWatermarkOption('fontSize', fontSize);
                if (selectedTextId) {
                  updateSelectedText({ fontSize });
                }
              }}
              className="mt-1 w-full"
            />
          </div>

          <div>
            <Label htmlFor="rotation" className="text-sm font-medium text-gray-700">
              Rotation: {selectedTextId ? draggableTexts.find(t => t.id === selectedTextId)?.rotation || watermarkOptions.rotation : watermarkOptions.rotation}°
            </Label>
            <input
              id="rotation"
              type="range"
              min="-180"
              max="180"
              step="15"
              value={selectedTextId ? draggableTexts.find(t => t.id === selectedTextId)?.rotation || watermarkOptions.rotation : watermarkOptions.rotation}
              onChange={(e) => {
                const rotation = parseInt(e.target.value);
                updateWatermarkOption('rotation', rotation);
                if (selectedTextId) {
                  updateSelectedText({ rotation });
                }
              }}
              className="mt-1 w-full"
            />
          </div>

          <div>
            <Label htmlFor="blendMode" className="text-sm font-medium text-gray-700">
              Blend Mode
            </Label>
            <select
              id="blendMode"
              value={selectedTextId ? draggableTexts.find(t => t.id === selectedTextId)?.blendMode || watermarkOptions.blendMode : watermarkOptions.blendMode}
              onChange={(e) => {
                updateWatermarkOption('blendMode', e.target.value);
                if (selectedTextId) {
                  updateSelectedText({ blendMode: e.target.value as 'normal' | 'multiply' | 'overlay' | 'soft-light' | 'hard-light' });
                }
              }}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="normal">Normal</option>
              <option value="multiply">Multiply</option>
              <option value="overlay">Overlay</option>
              <option value="soft-light">Soft Light</option>
              <option value="hard-light">Hard Light</option>
            </select>
          </div>
        </div>

        <hr className="border-gray-200" />

        {/* Process Button */}
        <Button
          onClick={processAllImages}
          className="w-full h-14 text-lg font-semibold bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
          disabled={files.length === 0 || isProcessing}
        >
          {isProcessing ? (
            <div className="flex items-center gap-3">
              <Icon icon="solar:refresh-bold-duotone" className="h-5 w-5 animate-spin" />
              Processing Images...
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Icon icon="solar:waterdrops-bold-duotone" className="h-5 w-5" />
              Apply Watermark to {files.length} Image{files.length !== 1 ? 's' : ''}
            </div>
          )}
        </Button>
        </div>
      </div>

      {/* Results */}
      {processedResults.length > 0 && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Watermarked Images</h3>
          <div className="space-y-3">
            {processedResults.map((result, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Icon icon="solar:check-circle-bold-duotone" className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">{result.file.name}</div>
                    <div className="text-xs text-gray-500">
                      {(result.processedSize / (1024 * 1024)).toFixed(1)} MB
                    </div>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  <Icon icon="solar:download-bold-duotone" className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
