'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface MemeGeneratorToolProps {
  files: File[];
}

interface MemeSettings {
  topText: string;
  bottomText: string;
  fontSize: number;
  fontFamily: string;
  textColor: string;
  outlineColor: string;
  outlineWidth: number;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
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
}

const ALL_FONTS = [
  { value: 'Impact', label: 'Impact' },
  { value: 'Arial', label: 'Arial' },
  { value: 'Comic Sans MS', label: 'Comic Sans MS' },
  { value: 'Helvetica', label: 'Helvetica' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Verdana', label: 'Verdana' },
  { value: 'Courier New', label: 'Courier New' },
  { value: 'Trebuchet MS', label: 'Trebuchet MS' },
  { value: 'Palatino', label: 'Palatino' }
];

export function MemeGeneratorTool({ files }: MemeGeneratorToolProps) {
  const [settings, setSettings] = useState<MemeSettings>({
    topText: '',
    bottomText: '',
    fontSize: 48,
    fontFamily: 'Impact',
    textColor: '#FFFFFF',
    outlineColor: '#000000',
    outlineWidth: 3,
    fontWeight: 'normal',
    fontStyle: 'normal'
  });

  const [draggableTexts, setDraggableTexts] = useState<DraggableText[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedFiles, setProcessedFiles] = useState<Array<{ file: File; result?: string; error?: string }>>([]);
  const [isDragging, setIsDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<TextPosition>({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  // Add new draggable text
  const addDraggableText = useCallback((text: string, isTop: boolean = true) => {
    if (!text.trim()) return;

    // Check if text already exists to prevent duplication
    const existingText = draggableTexts.find(t => t.text === text.trim());
    if (existingText) return;

    const newText: DraggableText = {
      id: `text-${Date.now()}`,
      text: text.trim(),
      position: isTop ? { x: 50, y: 20 } : { x: 50, y: 80 },
      fontSize: settings.fontSize,
      fontFamily: settings.fontFamily,
      textColor: settings.textColor,
      outlineColor: settings.outlineColor,
      outlineWidth: settings.outlineWidth,
      fontWeight: settings.fontWeight,
      fontStyle: settings.fontStyle
    };

    setDraggableTexts(prev => [...prev, newText]);
    
    // Clear the input field after adding
    if (isTop) {
      setSettings(prev => ({ ...prev, topText: '' }));
    } else {
      setSettings(prev => ({ ...prev, bottomText: '' }));
    }
  }, [settings, draggableTexts]);

  // Update draggable text
  const updateDraggableText = useCallback((id: string, updates: Partial<DraggableText>) => {
    setDraggableTexts(prev => prev.map(text => 
      text.id === id ? { ...text, ...updates } : text
    ));
  }, []);

  // Remove draggable text
  const removeDraggableText = useCallback((id: string) => {
    setDraggableTexts(prev => prev.filter(text => text.id !== id));
  }, []);

  // Update individual text element settings
  const updateTextElementSettings = useCallback((id: string, updates: Partial<DraggableText>) => {
    setDraggableTexts(prev => prev.map(text => 
      text.id === id ? { ...text, ...updates } : text
    ));
  }, []);

  // Handle drag start
  const handleDragStart = useCallback((e: React.MouseEvent, textId: string) => {
    setIsDragging(textId);
    const rect = previewRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  }, []);

  // Handle drag move
  const handleDragMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !previewRef.current) return;

    const rect = previewRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    updateDraggableText(isDragging, {
      position: { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) }
    });
  }, [isDragging, updateDraggableText]);

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    setIsDragging(null);
    setDragOffset({ x: 0, y: 0 });
  }, []);

  // Generate meme with canvas
  const generateMemePreview = useCallback((file: File, texts: DraggableText[]): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = canvasRef.current;
      if (!canvas) {
        reject(new Error('Canvas not available'));
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      // Debug: Log the text elements being processed
      console.log('Generating meme with text elements:', texts.map(t => ({
        text: t.text,
        outlineWidth: t.outlineWidth,
        outlineColor: t.outlineColor,
        textColor: t.textColor
      })));

      const img = new Image();
      img.onload = () => {
        // Set canvas size to image size
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw image
        ctx.drawImage(img, 0, 0);

        // Draw each text element
        texts.forEach(textElement => {
          const x = (textElement.position.x / 100) * canvas.width;
          const y = (textElement.position.y / 100) * canvas.height;

          // Reset context properties for each text element
          ctx.save();
          
          // Set font properties
          ctx.font = `${textElement.fontStyle} ${textElement.fontWeight} ${textElement.fontSize}px ${textElement.fontFamily}`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          // Draw outline first (if outline width > 0)
          if (textElement.outlineWidth > 0) {
            ctx.strokeStyle = textElement.outlineColor;
            ctx.lineWidth = textElement.outlineWidth;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.strokeText(textElement.text, x, y);
          }
          
          // Draw fill on top
          ctx.fillStyle = textElement.textColor;
          ctx.fillText(textElement.text, x, y);
          
          // Restore context
          ctx.restore();
        });

        // Convert to data URL
        resolve(canvas.toDataURL('image/png', 0.9));
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }, []);

  // Process all images
  const processAllImages = useCallback(async () => {
    if (files.length === 0 || draggableTexts.length === 0) return;

    setIsProcessing(true);
    // Clear previous results to ensure fresh generation
    setProcessedFiles([]);
    
    const results = [];

    for (const file of files) {
      try {
        const result = await generateMemePreview(file, draggableTexts);
        results.push({ file, result });
      } catch (error) {
        results.push({ file, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    }

    setProcessedFiles(results);
    setIsProcessing(false);
  }, [files, draggableTexts, generateMemePreview]);

  // Download image
  const downloadImage = (dataUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.download = filename.replace(/\.[^/.]+$/, '_meme.png');
    link.href = dataUrl;
    link.click();
  };

  // Update preview canvas
  const updatePreviewCanvas = useCallback(() => {
    if (!files[0] || !previewCanvasRef.current) return;

    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      // Set canvas size to match preview container
      const container = previewRef.current;
      if (!container) return;
      
      const containerRect = container.getBoundingClientRect();
      canvas.width = containerRect.width;
      canvas.height = containerRect.height;

      // Calculate image dimensions to fit container
      const imgAspect = img.width / img.height;
      const containerAspect = canvas.width / canvas.height;
      
      let drawWidth, drawHeight, offsetX, offsetY;
      
      if (imgAspect > containerAspect) {
        drawHeight = canvas.height;
        drawWidth = drawHeight * imgAspect;
        offsetX = (canvas.width - drawWidth) / 2;
        offsetY = 0;
      } else {
        drawWidth = canvas.width;
        drawHeight = drawWidth / imgAspect;
        offsetX = 0;
        offsetY = (canvas.height - drawHeight) / 2;
      }

      // Draw image
      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

            // Draw text elements
            draggableTexts.forEach(textElement => {
              const x = (textElement.position.x / 100) * canvas.width;
              const y = (textElement.position.y / 100) * canvas.height;

              // Reset context properties for each text element
              ctx.save();
              
              // Set font properties
              ctx.font = `${textElement.fontStyle} ${textElement.fontWeight} ${Math.min(textElement.fontSize * 0.3, 24)}px ${textElement.fontFamily}`;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';

              // Draw outline first (if outline width > 0)
              if (textElement.outlineWidth > 0) {
                ctx.strokeStyle = textElement.outlineColor;
                ctx.lineWidth = textElement.outlineWidth;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.strokeText(textElement.text, x, y);
              }
              
              // Draw fill on top
              ctx.fillStyle = textElement.textColor;
              ctx.fillText(textElement.text, x, y);
              
              // Restore context
              ctx.restore();
            });
    };

    img.src = URL.createObjectURL(files[0]);
  }, [files, draggableTexts]);

  // Update preview when texts change
  useEffect(() => {
    updatePreviewCanvas();
  }, [draggableTexts, updatePreviewCanvas]);

  return (
    <div className="space-y-6">
      {/* Meme Preview */}
      {files.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Meme Preview</h3>
          <div className="relative bg-gray-100 rounded-lg p-4">
            <div className="max-w-md mx-auto">
              <div 
                ref={previewRef}
                className="relative cursor-move"
                onMouseMove={handleDragMove}
                onMouseUp={handleDragEnd}
                onMouseLeave={handleDragEnd}
              >
                {/* Canvas-based preview with proper outline rendering */}
                <canvas
                  ref={previewCanvasRef}
                  className="w-full h-auto rounded-lg border border-gray-200"
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
                
                {/* Invisible draggable areas for text positioning */}
                {draggableTexts.map((textElement) => (
                  <div
                    key={textElement.id}
                    className="absolute cursor-move select-none opacity-0 hover:opacity-20"
                    style={{
                      left: `${textElement.position.x}%`,
                      top: `${textElement.position.y}%`,
                      transform: 'translate(-50%, -50%)',
                      width: '100px',
                      height: '30px',
                      backgroundColor: 'rgba(255, 0, 0, 0.3)',
                      borderRadius: '4px',
                      zIndex: 10
                    }}
                    onMouseDown={(e) => handleDragStart(e, textElement.id)}
                  >
                    <div className="relative group w-full h-full flex items-center justify-center">
                      <button
                        onClick={() => removeDraggableText(textElement.id)}
                        className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-100 transition-opacity"
                        style={{ fontSize: '12px', width: '20px', height: '20px' }}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-3 text-center">
                <p className="text-sm text-gray-600">
                  💡 Drag text to reposition • Click × to remove
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Text Input */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Add Text</h3>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="textInput" className="text-sm font-medium text-gray-700">Text Content</Label>
            <div className="flex gap-2">
              <Input
                id="textInput"
                placeholder="Enter your text..."
                value={settings.topText}
                onChange={(e) => setSettings(prev => ({ ...prev, topText: e.target.value }))}
                className="flex-1"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && settings.topText.trim()) {
                    addDraggableText(settings.topText, true);
                  }
                }}
              />
              <Button
                onClick={() => {
                  if (settings.topText.trim()) addDraggableText(settings.topText, true);
                }}
                variant="outline"
                size="sm"
                disabled={!settings.topText.trim()}
              >
                <Icon icon="solar:add-circle-bold-duotone" className="h-4 w-4 mr-1" />
                Add Text
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              💡 You can drag text anywhere on the image after adding it
            </p>
          </div>
        </div>

        {/* Active Text Elements */}
        {draggableTexts.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-gray-700">Active Text Elements ({draggableTexts.length})</Label>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setDraggableTexts(prev => prev.map(text => ({
                      ...text,
                      fontSize: settings.fontSize,
                      fontFamily: settings.fontFamily,
                      textColor: settings.textColor,
                      outlineColor: settings.outlineColor,
                      outlineWidth: settings.outlineWidth,
                      fontWeight: settings.fontWeight,
                      fontStyle: settings.fontStyle
                    })));
                  }}
                  variant="outline"
                  size="sm"
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  <Icon icon="solar:refresh-bold-duotone" className="h-4 w-4 mr-1" />
                  Apply Settings
                </Button>
                <Button
                  onClick={() => setDraggableTexts([])}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Icon icon="solar:trash-bin-trash-bold-duotone" className="h-4 w-4 mr-1" />
                  Clear All
                </Button>
              </div>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {draggableTexts.map((textElement) => (
                <div key={textElement.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Icon icon="solar:text-bold-duotone" className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{textElement.text}</div>
                      <div className="text-xs text-gray-500">
                        {textElement.fontFamily} • {textElement.fontSize}px • Outline: {textElement.outlineWidth}px
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => removeDraggableText(textElement.id)}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Icon icon="solar:trash-bin-trash-bold-duotone" className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500">
              💡 Use "Apply Settings" to update all text with current style settings
            </p>
          </div>
        )}
      </div>

      <hr className="border-gray-200" />

      {/* Style Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Style Settings</h3>
        
        {/* Font Settings */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fontSize" className="text-sm font-medium text-gray-700">Font Size</Label>
            <Input
              id="fontSize"
              type="number"
              min="12"
              max="120"
              value={settings.fontSize}
              onChange={(e) => setSettings(prev => ({ ...prev, fontSize: parseInt(e.target.value) || 48 }))}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fontFamily" className="text-sm font-medium text-gray-700">Font Family</Label>
            <select
              id="fontFamily"
              value={settings.fontFamily}
              onChange={(e) => setSettings(prev => ({ ...prev, fontFamily: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {ALL_FONTS.map((font) => (
                <option key={font.value} value={font.value}>
                  {font.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <hr className="border-gray-200" />

        {/* Color Settings */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="textColor" className="text-sm font-medium text-gray-700">Text Color</Label>
            <div className="flex items-center space-x-2">
              <input
                id="textColor"
                type="color"
                value={settings.textColor}
                onChange={(e) => setSettings(prev => ({ ...prev, textColor: e.target.value }))}
                className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
              />
              <Input
                value={settings.textColor}
                onChange={(e) => setSettings(prev => ({ ...prev, textColor: e.target.value }))}
                className="flex-1"
                placeholder="#FFFFFF"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="outlineColor" className="text-sm font-medium text-gray-700">Outline Color</Label>
            <div className="flex items-center space-x-2">
              <input
                id="outlineColor"
                type="color"
                value={settings.outlineColor}
                onChange={(e) => setSettings(prev => ({ ...prev, outlineColor: e.target.value }))}
                className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
              />
              <Input
                value={settings.outlineColor}
                onChange={(e) => setSettings(prev => ({ ...prev, outlineColor: e.target.value }))}
                className="flex-1"
                placeholder="#000000"
              />
            </div>
          </div>
        </div>

        <hr className="border-gray-200" />

        {/* Outline Settings */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="outlineWidth" className="text-sm font-medium text-gray-700">
              Outline Width: {settings.outlineWidth}px
            </Label>
            <div className="space-y-2">
              <input
                id="outlineWidth"
                type="range"
                min="0"
                max="10"
                step="1"
                value={settings.outlineWidth}
                onChange={(e) => setSettings(prev => ({ ...prev, outlineWidth: parseInt(e.target.value) }))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${(settings.outlineWidth / 10) * 100}%, #E5E7EB ${(settings.outlineWidth / 10) * 100}%, #E5E7EB 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>No Outline</span>
                <span>Thin</span>
                <span>Medium</span>
                <span>Thick</span>
              </div>
            </div>
          </div>
          
          {/* Quick Outline Presets */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Quick Presets</Label>
            <div className="flex gap-2">
              <Button
                onClick={() => setSettings(prev => ({ ...prev, outlineWidth: 0 }))}
                variant="outline"
                size="sm"
                className={settings.outlineWidth === 0 ? "bg-blue-50 border-blue-300" : ""}
              >
                No Outline
              </Button>
              <Button
                onClick={() => setSettings(prev => ({ ...prev, outlineWidth: 2 }))}
                variant="outline"
                size="sm"
                className={settings.outlineWidth === 2 ? "bg-blue-50 border-blue-300" : ""}
              >
                Thin
              </Button>
              <Button
                onClick={() => setSettings(prev => ({ ...prev, outlineWidth: 4 }))}
                variant="outline"
                size="sm"
                className={settings.outlineWidth === 4 ? "bg-blue-50 border-blue-300" : ""}
              >
                Medium
              </Button>
              <Button
                onClick={() => setSettings(prev => ({ ...prev, outlineWidth: 6 }))}
                variant="outline"
                size="sm"
                className={settings.outlineWidth === 6 ? "bg-blue-50 border-blue-300" : ""}
              >
                Thick
              </Button>
            </div>
          </div>
        </div>

        <hr className="border-gray-200" />

        {/* Text Effects */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700">Text Style</h4>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={settings.fontWeight === 'bold' ? "default" : "outline"}
              size="sm"
              className="flex items-center justify-center"
              onClick={() => setSettings(prev => ({ 
                ...prev, 
                fontWeight: prev.fontWeight === 'bold' ? 'normal' : 'bold' 
              }))}
            >
              <Icon icon="solar:text-bold-duotone" className="h-4 w-4 mr-1" />
              Bold
            </Button>
            <Button
              variant={settings.fontStyle === 'italic' ? "default" : "outline"}
              size="sm"
              className="flex items-center justify-center"
              onClick={() => setSettings(prev => ({ 
                ...prev, 
                fontStyle: prev.fontStyle === 'italic' ? 'normal' : 'italic' 
              }))}
            >
              <Icon icon="solar:text-italic-bold-duotone" className="h-4 w-4 mr-1" />
              Italic
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            💡 Text alignment is automatic since you can drag text anywhere
          </p>
        </div>
      </div>

      {/* Generate Button */}
      <Button 
        onClick={processAllImages}
        className="w-full h-14 text-lg font-semibold bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
        disabled={files.length === 0 || draggableTexts.length === 0 || isProcessing}
      >
        {isProcessing ? (
          <div className="flex items-center gap-3">
            <Icon icon="solar:refresh-bold-duotone" className="h-5 w-5 animate-spin" />
            Generating Memes...
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Icon icon="solar:play-bold-duotone" className="h-5 w-5" />
            Generate {files.length} Meme{files.length !== 1 ? 's' : ''}
          </div>
        )}
      </Button>

      {/* Results */}
      {processedFiles.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Generated Memes</h3>
            <Button
              onClick={() => setProcessedFiles([])}
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Icon icon="solar:trash-bin-trash-bold-duotone" className="h-4 w-4 mr-1" />
              Clear Results
            </Button>
          </div>
          <div className="space-y-4">
            {processedFiles.map((item, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center space-x-4 min-w-0 flex-1">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon icon="solar:image-bold-duotone" className="h-8 w-8 text-gray-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-gray-900 truncate">{item.file.name}</div>
                      <div className="text-sm text-gray-500">
                        {item.result ? 'Ready for download' : `Error: ${item.error}`}
                      </div>
                    </div>
                  </div>
                  {item.result && (
                    <div className="flex-shrink-0">
                      <Button
                        onClick={() => downloadImage(item.result!, item.file.name)}
                        className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                      >
                        <Icon icon="solar:download-bold-duotone" className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              💡 <strong>Tip:</strong> Make changes to your text or settings, then click "Generate" again to create updated memes. 
              Previous results will be automatically cleared.
            </p>
          </div>
        </Card>
      )}

      {/* Hidden canvas for image processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}