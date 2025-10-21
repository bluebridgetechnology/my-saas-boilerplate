'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@iconify/react';
import { TextOverlayProcessor, TEXT_TEMPLATES, GOOGLE_FONTS } from '@/lib/image-processing/text-overlay';
import { TextOverlaySettings } from '@/lib/types/enhanced-tools';
import { toast } from 'sonner';

interface TextOverlayToolProps {
  files: File[];
  onProcessingStart: () => void;
  onProcessingEnd: () => void;
  onProgress: (progress: number, message?: string) => void;
}

export function TextOverlayTool({ 
  files, 
  onProcessingStart, 
  onProcessingEnd, 
  onProgress 
}: TextOverlayToolProps) {
  const [textSettings, setTextSettings] = useState<TextOverlaySettings>({
    text: '',
    font: 'Arial',
    fontSize: 24,
    color: '#000000',
    position: { x: 100, y: 100 },
    formatting: {
      bold: false,
      italic: false,
      underline: false,
      strikethrough: false
    },
    effects: {
      outline: { enabled: false, color: '#000000', width: 2 },
      shadow: { enabled: false, blur: 4, offsetX: 2, offsetY: 2, color: 'rgba(0,0,0,0.5)' },
      gradient: {
        enabled: false,
        startColor: '#FF0000',
        endColor: '#0000FF',
        direction: 'horizontal'
      }
    },
    alignment: 'left',
    maxWidth: undefined
  });

  const [processedFiles, setProcessedFiles] = useState<Array<{
    file: File;
    result?: Blob;
    error?: string;
    isProcessing: boolean;
    textElements?: Array<{
      id: string;
      text: string;
      font: string;
      fontSize: number;
      color: string;
      position: { x: number; y: number };
      formatting: TextOverlaySettings['formatting'];
      effects: TextOverlaySettings['effects'];
      alignment: 'left' | 'center' | 'right';
      maxWidth?: number;
      rotation: number;
      opacity: number;
    }>;
  }>>([]);

  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [textElements, setTextElements] = useState<Array<{
    id: string;
    text: string;
    font: string;
    fontSize: number;
    color: string;
    position: { x: number; y: number };
    formatting: TextOverlaySettings['formatting'];
    effects: TextOverlaySettings['effects'];
    alignment: 'left' | 'center' | 'right';
    maxWidth?: number;
    rotation: number;
    opacity: number;
  }>>([]);
  
  const processorRef = useRef<TextOverlayProcessor | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const loadPreview = useCallback(async (file: File) => {
    if (!previewCanvasRef.current) return;

    const processor = new TextOverlayProcessor(previewCanvasRef.current);
    processorRef.current = processor;
    
    const success = await processor.loadBackgroundImage(file);
    if (success) {
      setPreviewFile(file);
      setTextElements([]);
    } else {
      toast.error('Failed to load image for preview');
    }
  }, []);

  const addTextElement = useCallback(() => {
    if (!processorRef.current || !textSettings.text.trim()) {
      toast.error('Please enter text first');
      return;
    }

    // Convert TextOverlaySettings to TextSettings for the processor
    const processorSettings = {
      text: textSettings.text,
      font: textSettings.font,
      fontSize: textSettings.fontSize,
      color: textSettings.color,
      position: textSettings.position,
      formatting: textSettings.formatting,
      effects: {
        outline: textSettings.effects.outline,
        shadow: textSettings.effects.shadow,
        gradient: textSettings.effects.gradient
      },
      alignment: textSettings.alignment,
      maxWidth: textSettings.maxWidth
    };

    const id = processorRef.current.addTextElement(processorSettings);
    const newElement = {
      id,
      text: textSettings.text,
      font: textSettings.font,
      fontSize: textSettings.fontSize,
      color: textSettings.color,
      position: textSettings.position,
      formatting: textSettings.formatting,
      effects: textSettings.effects,
      alignment: textSettings.alignment,
      maxWidth: textSettings.maxWidth,
      rotation: 0,
      opacity: 1
    };

    setTextElements(prev => [...prev, newElement]);
    
    // Reset text input but keep other settings
    setTextSettings(prev => ({ ...prev, text: '' }));
  }, [textSettings]);

  const removeTextElement = useCallback((id: string) => {
    if (processorRef.current) {
      processorRef.current.removeTextElement(id);
      setTextElements(prev => prev.filter(el => el.id !== id));
    }
  }, []);

  const applyTemplate = useCallback((templateName: keyof typeof TEXT_TEMPLATES) => {
    const template = TEXT_TEMPLATES[templateName];
    setTextSettings(prev => ({
      ...prev,
      text: template.text,
      font: (template as any).font || prev.font,
      fontSize: template.fontSize || prev.fontSize,
      color: (template as any).color || prev.color,
      alignment: template.alignment || prev.alignment,
      formatting: template.formatting || { 
        bold: prev.formatting.bold, 
        italic: prev.formatting.italic, 
        underline: prev.formatting.underline, 
        strikethrough: prev.formatting.strikethrough 
      },
      effects: {
        ...prev.effects,
        outline: template.effects?.outline || prev.effects.outline,
        shadow: template.effects?.shadow || prev.effects.shadow,
        gradient: template.effects?.gradient || prev.effects.gradient
      }
    }));
    toast.info(`Applied "${templateName}" template`);
  }, []);

  const loadGoogleFont = useCallback(async (fontName: string) => {
    if (processorRef.current) {
      const success = await processorRef.current.loadGoogleFont(fontName);
      if (success) {
        toast.success(`Font "${fontName}" loaded successfully`);
      } else {
        toast.error(`Failed to load font "${fontName}"`);
      }
    }
  }, []);

  const processFiles = useCallback(async () => {
    if (files.length === 0) {
      toast.error('Please upload images first');
      return;
    }

    if (!textSettings.text.trim()) {
      toast.error('Please enter text first');
      return;
    }

    setIsProcessing(true);
    onProcessingStart();
    const results: typeof processedFiles = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const progress = ((i + 1) / files.length) * 100;
      onProgress(progress, `Processing ${file.name}...`);

      try {
        // Create temporary canvas for processing
        const tempCanvas = document.createElement('canvas');
        const processor = new TextOverlayProcessor(tempCanvas);
        
        const success = await processor.loadBackgroundImage(file);
        if (!success) {
          throw new Error('Failed to load image');
        }

        // Get the actual position from the preview canvas if text exists
        let actualPosition = textSettings.position;
        if (processorRef.current && textSettings.text.trim()) {
          const previewProcessor = processorRef.current;
          const canvas = previewProcessor.getCanvas();
          const objects = canvas.getObjects();
          const textObject = objects.find(obj => obj.type === 'text' && (obj as any).text === textSettings.text);
          
          if (textObject) {
            actualPosition = {
              x: textObject.left || textSettings.position.x,
              y: textObject.top || textSettings.position.y
            };
          }
        }

        // Add text element using actual position from preview
        processor.addTextElement({
          text: textSettings.text,
          font: textSettings.font,
          fontSize: textSettings.fontSize,
          color: textSettings.color,
          position: actualPosition,
          formatting: textSettings.formatting,
          effects: textSettings.effects,
          alignment: textSettings.alignment,
          maxWidth: textSettings.maxWidth
        });

        const result = await processor.exportWithText('image/png', 0.9);
        
        if (result) {
          results.push({
            file,
            result,
            isProcessing: false,
            textElements: [{
              id: 'current_text',
              text: textSettings.text,
              font: textSettings.font,
              fontSize: textSettings.fontSize,
              color: textSettings.color,
              position: textSettings.position,
              formatting: textSettings.formatting,
              effects: textSettings.effects,
              alignment: textSettings.alignment,
              maxWidth: textSettings.maxWidth,
              rotation: 0,
              opacity: 1
            }]
          });
          toast.success(`Processed ${file.name}`);
        } else {
          throw new Error('Failed to export image');
        }

        processor.cleanup();
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
    setIsProcessing(false);
    onProcessingEnd();
    onProgress(100, 'Processing complete');

    // Download all processed files
    if (results.length > 0) {
      const successfulResults = results.filter(r => r.result);
      if (successfulResults.length > 0) {
        // Create zip file for multiple images
        if (successfulResults.length > 1) {
          try {
            const JSZip = (await import('jszip')).default;
            const zip = new JSZip();
            
            successfulResults.forEach((result, index) => {
              const fileName = result.file.name.replace(/\.[^/.]+$/, '') + '_with_text.png';
              zip.file(fileName, result.result!);
            });
            
            const zipBlob = await zip.generateAsync({ type: 'blob' });
            const zipUrl = URL.createObjectURL(zipBlob);
            const zipLink = document.createElement('a');
            zipLink.href = zipUrl;
            zipLink.download = `text_overlay_images_${new Date().toISOString().split('T')[0]}.zip`;
            document.body.appendChild(zipLink);
            zipLink.click();
            document.body.removeChild(zipLink);
            URL.revokeObjectURL(zipUrl);
            
            toast.success(`Downloaded ${successfulResults.length} images as ZIP file`);
          } catch (error) {
            console.error('Error creating ZIP:', error);
            // Fallback to individual downloads
            successfulResults.forEach((result, index) => {
              const fileName = result.file.name.replace(/\.[^/.]+$/, '') + '_with_text.png';
              const url = URL.createObjectURL(result.result!);
              const link = document.createElement('a');
              link.href = url;
              link.download = fileName;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
            });
            toast.success(`Downloaded ${successfulResults.length} images individually`);
          }
        } else {
          // Single image download
          const result = successfulResults[0];
          const fileName = result.file.name.replace(/\.[^/.]+$/, '') + '_with_text.png';
          const url = URL.createObjectURL(result.result!);
          const link = document.createElement('a');
          link.href = url;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          
          toast.success(`Downloaded ${fileName}`);
        }
      }
    }
  }, [files, textSettings, onProcessingStart, onProcessingEnd, onProgress]);

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
        const filename = `${originalName}_with_text.png`;
        zip.file(filename, processedFile.result);
      }
    });

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    downloadFile(zipBlob, 'text-overlay-images.zip');
    toast.success('Downloading all images with text as ZIP');
  }, [processedFiles, downloadFile]);

  const clearAllText = useCallback(() => {
    if (processorRef.current) {
      processorRef.current.clearAllText();
      setTextElements([]);
    }
  }, []);

  // Auto-load preview when files are uploaded
  useEffect(() => {
    if (files.length > 0) {
      loadPreview(files[0]);
    }
  }, [files, loadPreview]);

  // Real-time preview update when text settings change
  useEffect(() => {
    if (processorRef.current && textSettings.text.trim()) {
      // Clear existing text elements
      processorRef.current.clearAllText();
      
      // Convert TextOverlaySettings to TextSettings for the processor
      const processorSettings = {
        text: textSettings.text,
        font: textSettings.font,
        fontSize: textSettings.fontSize,
        color: textSettings.color,
        position: textSettings.position,
        formatting: textSettings.formatting,
        effects: {
          outline: textSettings.effects.outline,
          shadow: textSettings.effects.shadow,
          gradient: textSettings.effects.gradient
        },
        alignment: textSettings.alignment,
        maxWidth: textSettings.maxWidth
      };
      
      // Add the current text with current settings
      const textId = processorRef.current.addTextElement(processorSettings);
      
      // Add listener for text position changes
      const textObject = processorRef.current.getTextObjectById(textId);
      
      if (textObject) {
        textObject.on('moving', () => {
          setTextSettings(prev => ({
            ...prev,
            position: {
              x: textObject.left || prev.position.x,
              y: textObject.top || prev.position.y
            }
          }));
        });
      }
    }
  }, [textSettings]);

  useEffect(() => {
    return () => {
      if (processorRef.current) {
        processorRef.current.cleanup();
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Preview and Text Editor */}
        <div className="lg:col-span-2 space-y-6">
          {/* Live Preview */}
          {files.length > 0 && (
            <Card className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Preview</h3>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Real-time</span>
                </div>
                <div className="text-center bg-gray-50 rounded-lg p-4">
                  <canvas
                    ref={previewCanvasRef}
                    className="border border-gray-200 rounded-lg shadow-sm mx-auto"
                    style={{ 
                      maxWidth: '100%', 
                      maxHeight: '400px',
                      height: 'auto',
                      width: 'auto'
                    }}
                  />
                  <p className="text-sm text-gray-600 mt-2">
                    {files.length > 0 ? `Preview of: ${files[0].name}` : 'No image loaded'}
                  </p>
                  <p className="text-sm text-blue-600 mt-1">
                    {textElements.length} text element(s) added
                  </p>
                </div>
              </div>
            </Card>
          )}
        {/* Text Editor */}
        <Card className="p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Text Editor</h3>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <Icon icon="solar:check-circle-bold-duotone" className="h-3 w-3 mr-1" />
                Free
              </span>
            </div>

            {/* Text Input */}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Text Content</label>
                <textarea
                  value={textSettings.text}
                  onChange={(e) => setTextSettings(prev => ({ ...prev, text: e.target.value }))}
                  placeholder="Enter your text here..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              {/* Font Selection */}
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Font Family</label>
                  <select
                    value={textSettings.font}
                    onChange={(e) => {
                      const font = e.target.value;
                      setTextSettings(prev => ({ ...prev, font }));
                      loadGoogleFont(font);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {GOOGLE_FONTS.map(font => (
                      <option key={font} value={font} style={{ fontFamily: font }}>
                        {font}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Font Size: {textSettings.fontSize}px
                  </label>
                  <input
                    type="range"
                    min="12"
                    max="200"
                    value={textSettings.fontSize}
                    onChange={(e) => setTextSettings(prev => ({ ...prev, fontSize: parseInt(e.target.value) }))}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>

                {/* Text Formatting */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Text Formatting</label>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setTextSettings(prev => ({ 
                        ...prev, 
                        formatting: { ...prev.formatting, bold: !prev.formatting.bold }
                      }))}
                      className={`px-3 py-1 rounded-md border text-sm font-medium transition-colors ${
                        textSettings.formatting.bold
                          ? 'bg-blue-100 text-blue-700 border-blue-300'
                          : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      <Icon icon="solar:text-bold-duotone" className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setTextSettings(prev => ({ 
                        ...prev, 
                        formatting: { ...prev.formatting, italic: !prev.formatting.italic }
                      }))}
                      className={`px-3 py-1 rounded-md border text-sm font-medium transition-colors ${
                        textSettings.formatting.italic
                          ? 'bg-blue-100 text-blue-700 border-blue-300'
                          : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      <Icon icon="solar:text-italic-outline" className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setTextSettings(prev => ({ 
                        ...prev, 
                        formatting: { ...prev.formatting, underline: !prev.formatting.underline }
                      }))}
                      className={`px-3 py-1 rounded-md border text-sm font-medium transition-colors ${
                        textSettings.formatting.underline
                          ? 'bg-blue-100 text-blue-700 border-blue-300'
                          : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      <Icon icon="solar:text-underline-outline" className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setTextSettings(prev => ({ 
                        ...prev, 
                        formatting: { ...prev.formatting, strikethrough: !prev.formatting.strikethrough }
                      }))}
                      className={`px-3 py-1 rounded-md border text-sm font-medium transition-colors ${
                        textSettings.formatting.strikethrough
                          ? 'bg-blue-100 text-blue-700 border-blue-300'
                          : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      <Icon icon="solar:text-cross-outline" className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Color and Alignment */}
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Text Color</label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={textSettings.color}
                      onChange={(e) => setTextSettings(prev => ({ ...prev, color: e.target.value }))}
                      className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={textSettings.color}
                      onChange={(e) => setTextSettings(prev => ({ ...prev, color: e.target.value }))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="#000000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Alignment</label>
                  <div className="flex space-x-2">
                    {(['left', 'center', 'right'] as const).map((alignment) => (
                      <button
                        key={alignment}
                        onClick={() => setTextSettings(prev => ({ ...prev, alignment }))}
                        className={`px-3 py-1 rounded-md border text-sm font-medium transition-colors ${
                          textSettings.alignment === alignment
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {alignment.charAt(0).toUpperCase() + alignment.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        </div>

        {/* Right Column - Controls */}
        <div className="space-y-6">

        {/* Text Effects */}
        <Card className="p-4">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Text Effects</h3>
            
            {/* Outline */}
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={textSettings.effects.outline.enabled}
                  onChange={(e) => setTextSettings(prev => ({
                    ...prev,
                    effects: {
                      ...prev.effects,
                      outline: { ...prev.effects.outline, enabled: e.target.checked }
                    }
                  }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Outline</span>
              </label>
              
              {textSettings.effects.outline.enabled && (
                <div className="flex items-center space-x-3 ml-6">
                  <input
                    type="color"
                    value={textSettings.effects.outline.color}
                    onChange={(e) => setTextSettings(prev => ({
                      ...prev,
                      effects: {
                        ...prev.effects,
                        outline: { ...prev.effects.outline, color: e.target.value }
                      }
                    }))}
                    className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={textSettings.effects.outline.width}
                    onChange={(e) => setTextSettings(prev => ({
                      ...prev,
                      effects: {
                        ...prev.effects,
                        outline: { ...prev.effects.outline, width: parseInt(e.target.value) }
                      }
                    }))}
                    className="w-20 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
              )}
            </div>

            {/* Shadow */}
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={textSettings.effects.shadow.enabled}
                  onChange={(e) => setTextSettings(prev => ({
                    ...prev,
                    effects: {
                      ...prev.effects,
                      shadow: { ...prev.effects.shadow, enabled: e.target.checked }
                    }
                  }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Shadow</span>
              </label>
              
              {textSettings.effects.shadow.enabled && (
                <div className="flex items-center space-x-3 ml-6">
                  <input
                    type="color"
                    value={textSettings.effects.shadow.color}
                    onChange={(e) => setTextSettings(prev => ({
                      ...prev,
                      effects: {
                        ...prev.effects,
                        shadow: { ...prev.effects.shadow, color: e.target.value }
                      }
                    }))}
                    className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={textSettings.effects.shadow.blur}
                    onChange={(e) => setTextSettings(prev => ({
                      ...prev,
                      effects: {
                        ...prev.effects,
                        shadow: { ...prev.effects.shadow, blur: parseInt(e.target.value) }
                      }
                    }))}
                    className="w-20 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
              )}
            </div>

            {/* Gradient */}
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={textSettings.effects.gradient.enabled}
                  onChange={(e) => setTextSettings(prev => ({
                    ...prev,
                    effects: {
                      ...prev.effects,
                      gradient: { ...prev.effects.gradient, enabled: e.target.checked }
                    }
                  }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Gradient Text</span>
              </label>
              
              {textSettings.effects.gradient.enabled && (
                <div className="ml-6 space-y-3">
                  <div className="flex items-center space-x-3">
                    <label className="text-xs text-gray-600">Start:</label>
                    <input
                      type="color"
                      value={textSettings.effects.gradient.startColor}
                      onChange={(e) => setTextSettings(prev => ({
                        ...prev,
                        effects: {
                          ...prev.effects,
                          gradient: { ...prev.effects.gradient, startColor: e.target.value }
                        }
                      }))}
                      className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                    />
                    <label className="text-xs text-gray-600">End:</label>
                    <input
                      type="color"
                      value={textSettings.effects.gradient.endColor}
                      onChange={(e) => setTextSettings(prev => ({
                        ...prev,
                        effects: {
                          ...prev.effects,
                          gradient: { ...prev.effects.gradient, endColor: e.target.value }
                        }
                      }))}
                      className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">Direction:</label>
                    <div className="flex space-x-1">
                      {(['horizontal', 'vertical', 'diagonal'] as const).map((direction) => (
                        <button
                          key={direction}
                          onClick={() => setTextSettings(prev => ({
                            ...prev,
                            effects: {
                              ...prev.effects,
                              gradient: { ...prev.effects.gradient, direction }
                            }
                          }))}
                          className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                            textSettings.effects.gradient.direction === direction
                              ? 'bg-blue-100 text-blue-700 border border-blue-300'
                              : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                          }`}
                        >
                          {direction.charAt(0).toUpperCase() + direction.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Quick Templates */}
        <Card className="p-4">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">Quick Templates</h3>
            <div className="grid grid-cols-1 gap-2">
              {Object.keys(TEXT_TEMPLATES).map((templateName) => (
                <button
                  key={templateName}
                  onClick={() => applyTemplate(templateName as keyof typeof TEXT_TEMPLATES)}
                  className="p-2 rounded-md border text-sm font-medium transition-all duration-200 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300"
                >
                  {templateName.charAt(0).toUpperCase() + templateName.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Text Elements List */}
        {textElements.length > 0 && (
          <Card className="p-4">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">Text Elements ({textElements.length})</h3>
              <div className="space-y-2">
                {textElements.map((element, index) => (
                  <div key={element.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Icon icon="solar:text-bold-duotone" className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{element.text}</p>
                        <p className="text-sm text-gray-600">
                          {element.font}, {element.fontSize}px, {element.color}
                        </p>
                      </div>
                    </div>
                    <Button 
                      onClick={() => removeTextElement(element.id)}
                      size="sm"
                      variant="ghost"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Icon icon="solar:trash-bin-trash-bold-duotone" className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}


        {/* Process Button */}
        {files.length > 0 && (
          <Card className="p-4">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">Generate & Download</h3>
              <Button 
                onClick={processFiles}
                disabled={!textSettings.text.trim() || isProcessing}
                className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Icon icon="solar:download-bold-duotone" className="h-4 w-4 mr-2" />
                    Generate & Download ({files.length} files)
                  </>
                )}
              </Button>
              {!textSettings.text.trim() ? (
                <p className="text-sm text-amber-600 text-center">
                  ⚠️ Enter text first to generate images
                </p>
              ) : (
                <p className="text-sm text-gray-600 text-center">
                  Apply text "{textSettings.text.substring(0, 30)}{textSettings.text.length > 30 ? '...' : ''}" to {files.length} image(s)
                </p>
              )}
            </div>
          </Card>
        )}

        {/* Action Buttons */}
        <Card className="p-4">
          <div className="space-y-3">
            <Button 
              onClick={addTextElement}
              className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white"
            >
              <Icon icon="solar:text-bold-duotone" className="h-4 w-4 mr-2" />
              Add Text
            </Button>

            <Button 
              onClick={clearAllText}
              variant="outline"
              size="sm"
              className="w-full text-gray-600"
            >
              <Icon icon="solar:trash-bin-trash-bold-duotone" className="h-4 w-4 mr-1" />
              Clear All Text
            </Button>
          </div>
        </Card>
        </div>
      </div>

      {/* Results - Full Width */}
      {processedFiles.length > 0 && (
        <Card className="p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Images with Text</h3>
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
                        {processedFile.result ? 'Successfully processed' : 'Processing failed'}
                      </p>
                      {processedFile.textElements && (
                        <p className="text-xs text-blue-600">
                          {processedFile.textElements.length} text element(s)
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {processedFile.result ? (
                    <Button 
                      onClick={() => {
                        const originalName = processedFile.file.name.replace(/\.[^/.]+$/, '');
                        downloadFile(processedFile.result!, `${originalName}_with_text.png`);
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
