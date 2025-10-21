# ResizeSuite Project Rules & Guidelines

## Project Overview
**ResizeSuite** is a premium client-side image processing SaaS application with a freemium business model. This document establishes the rules, guidelines, and standards for consistent development.

## Core Development Principles

### 1. Client-Side Processing First
- **No server-side image storage** - All processing happens in the browser
- **Privacy by design** - Images never leave the user's device
- **Performance optimization** - Use Web Workers for heavy processing
- **Progressive enhancement** - Core features work without JavaScript

### 2. Freemium Model Implementation
- **Free tier**: 5 images, 10MB limit, basic tools
- **Pro tier**: 100 images, 50MB limit, advanced features
- **Seamless upgrade path** - Non-intrusive conversion triggers
- **Clear value proposition** - Always show Pro benefits

## Technical Stack & Tools

### Frontend Framework
- **Next.js 15** with App Router
- **TypeScript** for type safety
- **TailwindCSS** for styling
- **Shadcn/ui** for component library

### Backend Services
- **Supabase Auth** for authentication
- **Supabase PostgreSQL** for database
- **Stripe** for payments
- **Vercel** for deployment

### Required Tools & MCPs
- **Supabase MCP** - For all database operations, migrations, and RLS policies
- **Shadcn MCP** - For fetching and managing UI components
- **Iconify Solar Duotone** - For all icons (NOT Lucide React)

## Component Standards

### Shadcn/ui Component Usage
```bash
# Always use Shadcn MCP to fetch components
# Example commands:
- Fetch button component
- Fetch card component  
- Fetch input component
- Fetch dialog component
```

**Required Components:**
- Button (primary, secondary, outline, ghost variants)
- Card (for tool containers and content sections)
- Input (for form fields and settings)
- Label (for form labels)
- Dialog (for modals and overlays)
- Dropdown Menu (for user menus and tool options)
- Radio Group (for tool selection)
- Avatar (for user profiles)
- Toast (for notifications using Sonner)

### Component Structure
```typescript
// Standard component structure
interface ComponentProps {
  // Props with proper TypeScript types
  className?: string;
  children?: React.ReactNode;
}

export function ComponentName({ className, children, ...props }: ComponentProps) {
  return (
    <div className={cn("base-styles", className)} {...props}>
      {children}
    </div>
  );
}
```

## Design System & Branding

### Color Palette
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

### Typography
- **Primary Font**: Be Vietnam Pro
- **Font Weights**: 300, 400, 500, 600, 700
- **Font Sizes**: 
  - Hero: 3rem (48px)
  - Heading 1: 2.25rem (36px)
  - Heading 2: 1.875rem (30px)
  - Heading 3: 1.5rem (24px)
  - Body: 1rem (16px)
  - Small: 0.875rem (14px)

### Spacing System
- **Base Unit**: 8px
- **Spacing Scale**: 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px
- **Container Max Width**: 1280px
- **Grid System**: 12-column responsive grid

## Icon Standards

### Icon Library
- **Primary**: Iconify Solar Duotone Icons
- **Usage**: Always use Solar Duotone icons for consistency
- **Size**: 16px, 20px, 24px, 32px standard sizes
- **Color**: Inherit from parent or use theme colors

### Common Icons
```typescript
// Image processing icons
- resize: solar:resize-bold-duotone
- crop: solar:crop-bold-duotone
- compress: solar:compress-bold-duotone
- convert: solar:refresh-bold-duotone
- watermark: solar:waterdrops-bold-duotone
- download: solar:download-bold-duotone
- upload: solar:upload-bold-duotone

// Navigation icons
- dashboard: solar:widget-bold-duotone
- settings: solar:settings-bold-duotone
- user: solar:user-bold-duotone
- logout: solar:logout-bold-duotone

// Social media icons
- instagram: solar:instagram-bold-duotone
- youtube: solar:youtube-bold-duotone
- linkedin: solar:linkedin-bold-duotone
```

## Database Standards

### Supabase MCP Usage
```bash
# Always use Supabase MCP for:
- Creating migrations
- Setting up RLS policies
- Managing database schema
- Running SQL queries
- Managing users and permissions
```

### Database Schema Standards
```sql
-- Always include these fields in tables:
- id: UUID PRIMARY KEY DEFAULT gen_random_uuid()
- created_at: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
- updated_at: TIMESTAMP WITH TIME ZONE DEFAULT NOW()

-- Always enable RLS:
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- Always create proper indexes:
CREATE INDEX IF NOT EXISTS idx_table_column ON table_name(column_name);
```

### RLS Policy Standards
```sql
-- Standard RLS policies for user data:
-- Users can only see their own data
CREATE POLICY "Users can view own data" ON table_name
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own data
CREATE POLICY "Users can update own data" ON table_name
  FOR UPDATE USING (auth.uid() = user_id);

-- Service role has full access
CREATE POLICY "Service role full access" ON table_name
  FOR ALL USING (auth.role() = 'service_role');
```

## File Structure Standards

### Component Organization
```
components/
├── ui/                    # Shadcn/ui components
├── image-processing/      # Image processing components
├── layout/               # Layout components
├── forms/                # Form components
└── common/               # Shared components
```

### Page Structure
```
app/
├── (public)/             # Public pages (no auth)
├── (dashboard)/          # Protected pages (auth required)
├── (auth)/               # Authentication pages
└── api/                  # API routes
```

### Utility Organization
```
lib/
├── auth/                 # Authentication utilities
├── supabase/            # Database utilities
├── payments/            # Payment utilities
├── image-processing/    # Image processing utilities
└── utils.ts            # General utilities
```

## Code Standards

### TypeScript Standards
```typescript
// Always use proper TypeScript types
interface User {
  id: string;
  email: string;
  name: string | null;
  plan: 'free' | 'pro';
  created_at: string;
  updated_at: string;
}

// Use type guards for runtime checks
function isUser(obj: unknown): obj is User {
  return typeof obj === 'object' && obj !== null && 'id' in obj;
}
```

### Error Handling
```typescript
// Standard error handling pattern
try {
  const result = await processImage(image);
  return { success: true, data: result };
} catch (error) {
  console.error('Image processing failed:', error);
  return { 
    success: false, 
    error: error instanceof Error ? error.message : 'Unknown error' 
  };
}
```

### Performance Standards
- **Image Processing**: <3 seconds per image
- **Page Load**: <2 seconds for landing page
- **Tool Switching**: <500ms
- **File Upload**: <1 second for validation

## Testing Standards

### Required Testing
- **Cross-browser testing**: Chrome, Firefox, Safari, Edge
- **Mobile testing**: iOS Safari, Chrome Mobile
- **Performance testing**: Load testing with 100 concurrent users
- **Security testing**: Authentication and payment flows

### Testing Tools
- **Unit Tests**: Jest + React Testing Library
- **E2E Tests**: Playwright
- **Performance**: Lighthouse + Web Vitals
- **Accessibility**: axe-core

## Deployment Standards

### Environment Configuration
```bash
# Required environment variables
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
BASE_URL=
APP_NAME=ResizeSuite
APP_DESCRIPTION=Professional Image Tools That Work Instantly
```

### Deployment Checklist
- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] RLS policies enabled
- [ ] Performance benchmarks met
- [ ] Security audit completed

## Accessibility Standards

### WCAG 2.1 AA Compliance
- **Color Contrast**: Minimum 4.5:1 ratio
- **Keyboard Navigation**: All interactive elements accessible
- **Screen Readers**: Proper ARIA labels and semantic HTML
- **Focus Management**: Clear focus indicators

### Accessibility Implementation
```typescript
// Always include accessibility attributes
<button
  aria-label="Resize image"
  aria-describedby="resize-help"
  className="..."
>
  <IconifyIcon icon="solar:resize-bold-duotone" />
  Resize
</button>
```

## Security Standards

### Data Protection
- **No server image storage** - Client-side processing only
- **Minimal data collection** - Only necessary user data
- **GDPR compliance** - User consent and data portability
- **Secure authentication** - Supabase Auth with JWT tokens

### Security Implementation
```typescript
// Always validate user input
const validateFile = (file: File): ValidationResult => {
  const maxSize = user.plan === 'pro' ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  
  if (file.size > maxSize) {
    return { valid: false, error: 'File too large' };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Unsupported file type' };
  }
  
  return { valid: true };
};
```

## Performance Standards

### Optimization Requirements
- **Image Processing**: Use Web Workers for heavy operations
- **Memory Management**: Proper cleanup and garbage collection
- **Caching**: Browser cache for static assets
- **Lazy Loading**: Components and images loaded on demand

### Performance Monitoring
```typescript
// Track performance metrics
const trackPerformance = (operation: string, duration: number) => {
  if (typeof window !== 'undefined' && 'performance' in window) {
    performance.mark(`${operation}-end`);
    performance.measure(operation, `${operation}-start`, `${operation}-end`);
  }
};
```

## Documentation Standards

### Code Documentation
- **JSDoc comments** for all functions
- **README files** for each major component
- **Type definitions** for all interfaces
- **Usage examples** for complex components

### Documentation Structure
```
docs/
├── summary.md              # Project overview
├── sprint1.md - sprint6.md # Sprint plans
├── technical-specifications.md
├── system-architecture.md
└── project_rules.md        # This file
```

---

## Enforcement

These rules are **mandatory** and must be followed throughout the project. Any deviations must be approved and documented. Regular code reviews will ensure compliance with these standards.

**Remember**: Consistency, security, and performance are paramount. Always prioritize user experience and data privacy.
