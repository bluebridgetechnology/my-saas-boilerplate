'use client';

/**
 * Text Overlay Processor using Fabric.js
 */

import { fabric } from 'fabric';
import { TextOverlaySettings } from '@/lib/types/enhanced-tools';

export interface TextElement {
  id: string;
  text: string;
  font: string;
  fontSize: number;
  color: string;
  position: { x: number; y: number };
  effects: {
    outline: { enabled: boolean; color: string; width: number };
    shadow: { enabled: boolean; blur: number; offsetX: number; offsetY: number; color: string };
    gradient: boolean;
  };
  alignment: 'left' | 'center' | 'right';
  maxWidth?: number;
  rotation?: number;
  opacity?: number;
}

export class TextOverlayProcessor {
  private canvas: fabric.Canvas;
  private textElements: TextElement[] = [];
  private backgroundImage: fabric.Image | null = null;

  constructor(canvasElement: HTMLCanvasElement) {
    this.canvas = new fabric.Canvas(canvasElement);
    this.setupCanvas();
  }

  private setupCanvas(): void {
    // Configure canvas settings
    (this.canvas as any).set({
      backgroundColor: 'transparent',
      preserveObjectStacking: true,
      selection: true,
      allowTouchScrolling: true
    });

    // Enable text editing
    this.canvas.on('text:editing:entered', () => {
      this.canvas.getActiveObject()?.set('selectable', true);
    });
  }

  /**
   * Load background image
   */
  async loadBackgroundImage(file: File): Promise<boolean> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imgElement = new Image();
        imgElement.onload = () => {
          // Calculate dimensions maintaining aspect ratio
          const maxWidth = 600;
          const maxHeight = 450;
          
          let { width, height } = imgElement;
          
          // Scale down if too large while maintaining aspect ratio
          if (width > maxWidth || height > maxHeight) {
            const scale = Math.min(maxWidth / width, maxHeight / height);
            width *= scale;
            height *= scale;
          }
          
          // Set canvas size to match scaled image dimensions (maintaining aspect ratio)
          this.canvas.setDimensions({ width, height });
          
          const img = new fabric.Image(imgElement, {
            scaleX: width / imgElement.width,
            scaleY: height / imgElement.height,
            selectable: false,
            evented: false,
            left: 0,
            top: 0,
            originX: 'left',
            originY: 'top'
          });
          
          this.canvas.setBackgroundImage(img, () => {
            this.canvas.renderAll();
            resolve(true);
          });
        };
        imgElement.src = e.target?.result as string;
      };
      reader.onerror = () => resolve(false);
      reader.readAsDataURL(file);
    });
  }

  /**
   * Add text element to canvas
   */
  addTextElement(textSettings: TextOverlaySettings): string {
    const id = `text_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const textElement = new fabric.Text(textSettings.text, {
      left: textSettings.position.x,
      top: textSettings.position.y,
      fontFamily: textSettings.font,
      fontSize: textSettings.fontSize,
      fill: textSettings.color,
      textAlign: textSettings.alignment,
      selectable: true,
      evented: true,
      hasControls: true,
      hasBorders: true,
      cornerStyle: 'circle',
      cornerColor: '#007bff',
      cornerSize: 8,
      transparentCorners: false,
      borderColor: '#007bff',
      borderScaleFactor: 2,
      borderOpacityWhenMoving: 0.8,
      originX: 'left',
      originY: 'top',
      fontWeight: textSettings.formatting.bold ? 'bold' : 'normal',
      fontStyle: textSettings.formatting.italic ? 'italic' : 'normal',
      underline: textSettings.formatting.underline,
      linethrough: textSettings.formatting.strikethrough
    });

    // Set the id on the fabric object
    (textElement as any).customId = id;

    // Apply effects
    this.applyTextEffects(textElement, textSettings.effects);

    // Set max width if specified
    if (textSettings.maxWidth) {
      textElement.set('width', textSettings.maxWidth);
    }

    this.canvas.add(textElement);
    this.canvas.setActiveObject(textElement);
    this.canvas.renderAll();

    // Store text element data
    const elementData: TextElement = {
      id,
      text: textSettings.text,
      font: textSettings.font,
      fontSize: textSettings.fontSize,
      color: textSettings.color,
      position: textSettings.position,
      effects: {
        outline: textSettings.effects.outline,
        shadow: textSettings.effects.shadow,
        gradient: textSettings.effects.gradient.enabled
      },
      alignment: textSettings.alignment,
      maxWidth: textSettings.maxWidth,
      rotation: 0,
      opacity: 1
    };

    this.textElements.push(elementData);

    // Update position when text is moved
    textElement.on('moving', () => {
      const element = this.textElements.find(el => el.id === id);
      if (element) {
        element.position = { x: textElement.left!, y: textElement.top! };
      }
    });

    // Update text when edited
    textElement.on('changed', () => {
      const element = this.textElements.find(el => el.id === id);
      if (element) {
        element.text = textElement.text!;
      }
    });

    return id;
  }

  /**
   * Update text element position
   */
  updateTextPosition(id: string, x: number, y: number): void {
    const textElement = this.canvas.getObjects().find((obj: any) => obj.data?.id === id) as fabric.Text;
    if (textElement) {
      textElement.set({ left: x, top: y });
      this.canvas.renderAll();
      
      const element = this.textElements.find(el => el.id === id);
      if (element) {
        element.position = { x, y };
      }
    }
  }

  /**
   * Apply text effects
   */
  private applyTextEffects(textElement: fabric.Text, effects: TextOverlaySettings['effects']): void {
    // Apply outline
    if (effects.outline.enabled) {
      textElement.set({
        stroke: effects.outline.color,
        strokeWidth: effects.outline.width,
        strokeLineCap: 'round',
        strokeLineJoin: 'round'
      });
    }

    // Apply shadow
    if (effects.shadow.enabled) {
      textElement.set({
        shadow: new fabric.Shadow({
          color: effects.shadow.color,
          blur: effects.shadow.blur,
          offsetX: effects.shadow.offsetX,
          offsetY: effects.shadow.offsetY
        })
      });
    }

    // Apply gradient
    if (effects.gradient.enabled) {
      const gradient = new fabric.Gradient({
        type: 'linear',
        coords: this.getGradientCoords(effects.gradient.direction, textElement.width!, textElement.height!),
        colorStops: [
          { offset: 0, color: effects.gradient.startColor },
          { offset: 1, color: effects.gradient.endColor }
        ]
      });
      textElement.set('fill', gradient);
    }
  }

  /**
   * Get gradient coordinates based on direction
   */
  private getGradientCoords(direction: 'horizontal' | 'vertical' | 'diagonal', width: number, height: number) {
    switch (direction) {
      case 'horizontal':
        return { x1: 0, y1: 0, x2: width, y2: 0 };
      case 'vertical':
        return { x1: 0, y1: 0, x2: 0, y2: height };
      case 'diagonal':
        return { x1: 0, y1: 0, x2: width, y2: height };
      default:
        return { x1: 0, y1: 0, x2: width, y2: 0 };
    }
  }

  /**
   * Load Google Font dynamically
   */
  async loadGoogleFont(fontName: string): Promise<boolean> {
    return new Promise((resolve) => {
      // Check if font is already loaded
      if (document.fonts.check(`16px "${fontName}"`)) {
        resolve(true);
        return;
      }

      // Create link element for Google Fonts
      const link = document.createElement('link');
      link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/\s+/g, '+')}:wght@400;700&display=swap`;
      link.rel = 'stylesheet';
      
      link.onload = () => {
        // Wait for font to be loaded
        document.fonts.load(`16px "${fontName}"`).then(() => {
          resolve(true);
        }).catch(() => {
          resolve(false);
        });
      };
      
      link.onerror = () => resolve(false);
      document.head.appendChild(link);
    });
  }

  /**
   * Export canvas with text as blob
   */
  async exportWithText(format: string = 'image/png', quality: number = 0.9): Promise<Blob | null> {
    return new Promise((resolve) => {
      try {
        // Use Fabric.js toDataURL method
        const dataURL = this.canvas.toDataURL({
          format: format.split('/')[1] as 'png' | 'jpeg',
          quality: quality,
          multiplier: 1
        });
        
        // Convert dataURL to Blob
        const byteString = atob(dataURL.split(',')[1]);
        const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        
        const blob = new Blob([ab], { type: mimeString });
        resolve(blob);
      } catch (error) {
        console.error('Error exporting canvas:', error);
        resolve(null);
      }
    });
  }

  /**
   * Get text element by ID
   */
  getTextElement(id: string): TextElement | undefined {
    return this.textElements.find(el => el.id === id);
  }

  /**
   * Remove text element
   */
  removeTextElement(id: string): void {
    const textElement = this.canvas.getObjects().find((obj: any) => obj.data?.id === id);
    if (textElement) {
      this.canvas.remove(textElement);
      this.canvas.renderAll();
    }
    
    this.textElements = this.textElements.filter(el => el.id !== id);
  }

  /**
   * Update text element properties
   */
  updateTextElement(id: string, updates: Partial<TextOverlaySettings>): void {
    const textElement = this.canvas.getObjects().find((obj: any) => obj.data?.id === id) as fabric.Text;
    const element = this.textElements.find(el => el.id === id);
    
    if (textElement && element) {
      if (updates.text !== undefined) {
        textElement.set('text', updates.text);
        element.text = updates.text;
      }
      
      if (updates.font !== undefined) {
        textElement.set('fontFamily', updates.font);
        element.font = updates.font;
      }
      
      if (updates.fontSize !== undefined) {
        textElement.set('fontSize', updates.fontSize);
        element.fontSize = updates.fontSize;
      }
      
      if (updates.color !== undefined) {
        textElement.set('fill', updates.color);
        element.color = updates.color;
      }
      
      if (updates.position !== undefined) {
        textElement.set({ left: updates.position.x, top: updates.position.y });
        element.position = updates.position;
      }
      
      if (updates.effects !== undefined) {
        this.applyTextEffects(textElement, updates.effects);
        element.effects = {
          outline: updates.effects.outline,
          shadow: updates.effects.shadow,
          gradient: updates.effects.gradient.enabled
        };
      }
      
      if (updates.alignment !== undefined) {
        textElement.set('textAlign', updates.alignment);
        element.alignment = updates.alignment;
      }
      
      this.canvas.renderAll();
    }
  }

  /**
   * Clear all text elements
   */
  clearAllText(): void {
    const textObjects = this.canvas.getObjects().filter((obj: any) => obj.type === 'text');
    textObjects.forEach((obj: any) => this.canvas.remove(obj));
    this.textElements = [];
    this.canvas.renderAll();
  }

  /**
   * Get all text elements
   */
  getAllTextElements(): TextElement[] {
    return [...this.textElements];
  }

  /**
   * Set canvas size
   */
  setCanvasSize(width: number, height: number): void {
    this.canvas.setDimensions({ width, height });
    this.canvas.renderAll();
  }

  /**
   * Get canvas element
   */
  getCanvas(): fabric.Canvas {
    return this.canvas;
  }

  /**
   * Get text object by ID
   */
  getTextObjectById(id: string): fabric.Text | undefined {
    return this.canvas.getObjects().find(obj => (obj as any).id === id) as fabric.Text | undefined;
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    this.canvas.dispose();
    this.textElements = [];
    this.backgroundImage = null;
  }
}

/**
 * Predefined text templates
 */
export const TEXT_TEMPLATES = {
  quote: {
    text: 'Your inspiring quote here',
    font: 'Georgia',
    fontSize: 24,
    color: '#2D3748',
    alignment: 'center' as const,
    formatting: {
      bold: false,
      italic: true,
      underline: false,
      strikethrough: false
    },
    effects: {
      outline: { enabled: true, color: '#000000', width: 2 },
      shadow: { enabled: true, blur: 4, offsetX: 2, offsetY: 2, color: 'rgba(0,0,0,0.5)' },
      gradient: { enabled: false, startColor: '#000000', endColor: '#666666', direction: 'horizontal' as const }
    }
  },
  heading: {
    text: 'Main Heading',
    font: 'Impact',
    fontSize: 32,
    color: '#1A202C',
    alignment: 'center' as const,
    formatting: {
      bold: true,
      italic: false,
      underline: false,
      strikethrough: false
    },
    effects: {
      outline: { enabled: false, color: '#000000', width: 0 },
      shadow: { enabled: true, blur: 6, offsetX: 3, offsetY: 3, color: 'rgba(0,0,0,0.7)' },
      gradient: { enabled: true, startColor: '#FF0000', endColor: '#0000FF', direction: 'horizontal' as const }
    }
  },
  watermark: {
    text: '© Your Brand',
    font: 'Arial',
    fontSize: 16,
    color: '#718096',
    alignment: 'right' as const,
    formatting: {
      bold: false,
      italic: true,
      underline: false,
      strikethrough: false
    },
    effects: {
      outline: { enabled: false, color: '#000000', width: 0 },
      shadow: { enabled: false, blur: 0, offsetX: 0, offsetY: 0, color: 'rgba(0,0,0,0)' },
      gradient: { enabled: false, startColor: '#000000', endColor: '#666666', direction: 'horizontal' as const }
    }
  }
};

/**
 * Available Google Fonts
 */
export const GOOGLE_FONTS = [
  'Arial',
  'Helvetica',
  'Times New Roman',
  'Georgia',
  'Verdana',
  'Impact',
  'Comic Sans MS',
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Poppins',
  'Source Sans Pro',
  'Raleway',
  'Ubuntu',
  'Playfair Display',
  'Merriweather',
  'Oswald',
  'PT Sans',
  'Droid Sans'
];
