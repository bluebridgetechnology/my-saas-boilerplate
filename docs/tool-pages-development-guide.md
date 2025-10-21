# Tool Pages Development Guide

## Overview
This guide provides the standardized structure, design patterns, and implementation guidelines for developing tool pages in ResizeSuite. Following this guide ensures consistency, brand compliance, and efficient development.

## Page Structure Template

### 1. Page Layout Structure
```tsx
// Standard tool page structure
export default function ToolPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Universal Navigation */}
      <Navigation />
      
      {/* Header Section */}
      <section className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Tool Name
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
              Tool description and value proposition
            </p>
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Upload */}
            <div className="space-y-6">
              <Card className="p-6">
                {/* Upload component */}
              </Card>
            </div>

            {/* Right Column - Actions */}
            <div className="space-y-6">
              <Card className="p-6">
                {/* Tool component */}
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Ad Section */}
      <div className="bg-gray-100 py-8">
        <div className="container mx-auto px-4">
          <div className="bg-gray-200 h-32 rounded-lg flex items-center justify-center">
            <span className="text-gray-500">Google AdSense Banner</span>
          </div>
        </div>
      </div>

      {/* How-to Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          {/* How-to content */}
        </div>
      </section>

      {/* More Tools Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          {/* More tools grid */}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          {/* FAQ accordion */}
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
```

## Design System Standards

### 1. Color Palette (Brand Compliant)
```css
/* Primary Colors */
--primary: #3B82F6;        /* Blue */
--primary-foreground: #FFFFFF;

/* Secondary Colors */
--secondary: #1E40AF;      /* Dark Blue */
--secondary-foreground: #FFFFFF;

/* Accent Colors */
--accent: #10B981;         /* Green */
--accent-foreground: #FFFFFF;

/* Neutral Colors */
--background: #FFFFFF;
--foreground: #1E293B;
--muted: #F8FAFC;
--muted-foreground: #64748B;
--border: #E2E8F0;
--input: #F1F5F9;
--ring: #3B82F6;
```

### 2. Typography Standards
- **Primary Font**: Be Vietnam Pro
- **Font Weights**: 300, 400, 500, 600, 700
- **Hero Title**: `text-4xl md:text-5xl font-bold`
- **Section Title**: `text-2xl md:text-3xl font-bold`
- **Card Title**: `text-xl font-semibold`
- **Body Text**: `text-base`
- **Small Text**: `text-sm`

### 3. Spacing System
- **Base Unit**: 8px
- **Section Padding**: `py-16`
- **Card Padding**: `p-6`
- **Element Spacing**: `space-y-6`, `space-y-8`
- **Grid Gap**: `gap-8` (large), `gap-4` (medium), `gap-3` (small)

## Component Standards

### 1. Header Section
```tsx
// Standard header structure
<section className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 pt-24 pb-16">
  <div className="container mx-auto px-4">
    <div className="max-w-4xl mx-auto text-center">
      <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
        {toolName}
      </h1>
      <p className="text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
        {toolDescription}
      </p>
    </div>
  </div>
</section>
```

**Key Points:**
- Always use slate gradient background
- `pt-24` ensures proper spacing from navbar
- `pb-16` provides adequate bottom padding
- Center-aligned text with max-width constraints
- White text for contrast

### 2. Tools Section Layout
```tsx
// Two-column layout structure
<section className="py-16">
  <div className="container mx-auto px-4">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left Column - Upload */}
      <div className="space-y-6">
        <Card className="p-6">
          {/* Upload component */}
        </Card>
      </div>

      {/* Right Column - Actions */}
      <div className="space-y-6">
        <Card className="p-6">
          {/* Tool component */}
        </Card>
      </div>
    </div>
  </div>
</section>
```

**Key Points:**
- Always use two-column layout on large screens
- Single column on mobile (`grid-cols-1 lg:grid-cols-2`)
- Upload on left, actions on right
- Consistent `gap-8` between columns
- Card containers for both sections

### 3. Tool Component Structure
```tsx
// Standard tool component structure
export function ToolComponent({ files, onProcessingStart, onProcessingEnd, onProgress }: ToolComponentProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-8">
        <h3 className="text-xl font-semibold text-gray-900">Tool Settings</h3>
        
        {/* Settings sections separated by HR */}
        <div>
          {/* Setting 1 */}
        </div>
        <hr className="border-gray-200" />
        
        <div>
          {/* Setting 2 */}
        </div>
        <hr className="border-gray-200" />
        
        {/* Process Button */}
        <Button 
          onClick={processAllImages}
          className="w-full h-14 text-lg font-semibold bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
          disabled={files.length === 0}
        >
          {isProcessing ? (
            <div className="flex items-center gap-3">
              <Icon icon="solar:refresh-bold-duotone" className="h-5 w-5 animate-spin" />
              Processing Images...
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Icon icon="solar:play-bold-duotone" className="h-5 w-5" />
              Process {files.length} Image{files.length !== 1 ? 's' : ''}
            </div>
          )}
        </Button>
      </div>

      {/* Results Section */}
      {processedFiles.some(pf => pf.result || pf.error) && (
        <Card className="p-6">
          {/* Results content */}
        </Card>
      )}
    </div>
  );
}
```

**Key Points:**
- Single container with `space-y-8` for main settings
- HR separators between sections (`<hr className="border-gray-200" />`)
- No nested cards - use single container
- Consistent button styling and loading states
- Results section in separate Card

### 4. Freemium Implementation
```tsx
// Standard freemium structure
const FREE_PRESETS = [
  // Limited free options
];

const PRO_PRESETS = [
  // Additional pro options
];

// In dropdown/selection:
<optgroup label="Free Options">
  {FREE_PRESETS.map((preset) => (
    <option key={preset.id} value={preset.id}>
      {preset.name}
    </option>
  ))}
</optgroup>
<optgroup label="Pro Options (Upgrade Required)">
  {PRO_PRESETS.map((preset) => (
    <option key={preset.id} value={preset.id} disabled>
      🔒 {preset.name} - Pro Only
    </option>
  ))}
</optgroup>

// Upgrade prompt
<div className="mt-3 p-4 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg">
  <div className="flex items-center gap-2">
    <Icon icon="solar:crown-bold-duotone" className="h-5 w-5 text-white" />
    <span className="text-sm text-white font-semibold">Want more options?</span>
  </div>
  <p className="text-xs text-white/90 mt-2 leading-relaxed">
    Upgrade to Pro for additional features and presets!
  </p>
</div>
```

**Key Points:**
- Always separate free and pro options
- Disabled options for pro features
- Brand-compliant gradient upgrade prompts
- Clear value proposition in upgrade text

## Section Order Standards

### 1. Required Section Order
1. **Header** - Tool name and description
2. **Tools Section** - Main functionality
3. **Ad Section** - Monetization
4. **How-to Section** - Instructions
5. **More Tools Section** - Internal linking
6. **FAQ Section** - Common questions
7. **Footer** - Site-wide footer

### 2. Section Spacing
- **Between sections**: `py-16`
- **Ad sections**: `py-8` (smaller)
- **Background alternation**: White → Gray → White → Gray → White

## Icon Standards

### 1. Icon Library
- **Primary**: Iconify Solar Duotone Icons
- **Usage**: Always use Solar Duotone icons for consistency
- **Size**: 16px, 20px, 24px, 32px standard sizes
- **Color**: Inherit from parent or use theme colors

### 2. Common Tool Icons
```tsx
// Image processing icons
- resize: solar:resize-bold-duotone
- crop: solar:crop-bold-duotone
- compress: solar:compress-bold-duotone
- convert: solar:refresh-bold-duotone
- watermark: solar:waterdrops-bold-duotone
- download: solar:download-bold-duotone
- upload: solar:upload-bold-duotone
- crown: solar:crown-bold-duotone
```

## SEO Standards

### 1. URL Structure
- **Format**: `/tool-name` (kebab-case)
- **Examples**: `/image-resizer`, `/image-cropper`, `/image-compressor`
- **Redirects**: Old `/tools/tool-name` URLs should redirect to new format

### 2. Meta Tags
```tsx
// Standard meta tags for tool pages
export const metadata = {
  title: 'Tool Name - ResizeSuite',
  description: 'Tool description with keywords',
  keywords: 'tool, image processing, free, online',
};
```

### 3. Internal Linking
- **More Tools Section**: Link to other tool pages
- **FAQ Section**: Tool-specific questions (max 5)
- **How-to Section**: Step-by-step instructions

## File Structure

### 1. Page Files
```
app/
├── tool-name/
│   └── page.tsx
```

### 2. Component Files
```
components/
├── image-processing/
│   ├── tool-component.tsx
│   ├── tool-preview.tsx
│   └── tool-selector.tsx
```

### 3. Library Files
```
lib/
├── image-processing/
│   ├── types.ts
│   ├── validation.ts
│   ├── processor.ts
│   └── index.ts
```

## Development Checklist

### Before Starting
- [ ] Review this guide
- [ ] Check brand colors and typography
- [ ] Plan freemium feature separation
- [ ] Design tool-specific presets

### During Development
- [ ] Follow page structure template
- [ ] Use consistent spacing and typography
- [ ] Implement freemium restrictions
- [ ] Add proper loading states
- [ ] Include error handling

### Before Completion
- [ ] Test responsive design
- [ ] Verify brand compliance
- [ ] Check SEO elements
- [ ] Validate freemium restrictions
- [ ] Test all user flows

## Common Patterns

### 1. State Management
```tsx
// Standard state structure
const [settings, setSettings] = useState<ToolSettings>({
  // Default settings
});
const [isProcessing, setIsProcessing] = useState(false);
const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([]);
```

### 2. Processing Flow
```tsx
// Standard processing pattern
const processAllImages = useCallback(async () => {
  setIsProcessing(true);
  onProcessingStart();
  try {
    // Processing logic
  } finally {
    setIsProcessing(false);
    onProcessingEnd();
  }
}, [files, onProcessingStart, onProcessingEnd, onProgress]);
```

### 3. File Validation
```tsx
// Standard validation pattern
const validateFiles = (files: File[]) => {
  const maxSize = user.plan === 'pro' ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  
  return files.every(file => 
    file.size <= maxSize && allowedTypes.includes(file.type)
  );
};
```

## Quality Assurance

### 1. Design Review
- [ ] Brand colors used correctly
- [ ] Typography follows standards
- [ ] Spacing is consistent
- [ ] Icons are Solar Duotone
- [ ] Responsive design works

### 2. Functionality Review
- [ ] Freemium restrictions work
- [ ] Processing states are clear
- [ ] Error handling is robust
- [ ] File validation works
- [ ] Results display correctly

### 3. SEO Review
- [ ] URL is SEO-friendly
- [ ] Meta tags are complete
- [ ] Internal linking is present
- [ ] FAQ section is relevant
- [ ] How-to section is helpful

---

## Quick Reference

### Brand Colors
- Primary: `#3B82F6` (blue-600)
- Secondary: `#1E40AF` (blue-800)
- Accent: `#10B981` (emerald-500)

### Common Classes
- Header: `bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 pt-24 pb-16`
- Section: `py-16`
- Card: `p-6`
- Button: `h-14 text-lg font-semibold bg-blue-600 hover:bg-blue-700`
- HR: `border-gray-200`

### Icon Pattern
```tsx
<Icon icon="solar:icon-name-bold-duotone" className="h-5 w-5" />
```

This guide ensures consistent, brand-compliant, and efficient development of all tool pages in ResizeSuite.
