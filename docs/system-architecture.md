# ResizeSuite System Architecture

## High-Level Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client-Side Application                 │
├─────────────────────────────────────────────────────────────────┤
│  Next.js 15 App Router + TypeScript + TailwindCSS + Shadcn/ui   │
├─────────────────────────────────────────────────────────────────┤
│  Image Processing Engine (HTML5 Canvas + Web Workers)          │
├─────────────────────────────────────────────────────────────────┤
│  File Handling (FileReader API + JSZip)                        │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Backend Services                         │
├─────────────────────────────────────────────────────────────────┤
│  Supabase Auth (Authentication & User Management)              │
├─────────────────────────────────────────────────────────────────┤
│  Supabase PostgreSQL (User Data & Project Storage)              │
├─────────────────────────────────────────────────────────────────┤
│  Stripe (Payment Processing & Subscription Management)         │
├─────────────────────────────────────────────────────────────────┤
│  Next.js API Routes (Server-Side Operations)                    │
└─────────────────────────────────────────────────────────────────┘
```

## Component Architecture

### Frontend Components Structure
```
app/
├── (public)/                    # Public pages (no auth required)
│   ├── page.tsx                # Landing page
│   ├── pricing/
│   └── legal/
├── (dashboard)/                 # Protected pages (auth required)
│   ├── dashboard/
│   │   ├── page.tsx            # Main dashboard
│   │   ├── tools/              # Image processing tools
│   │   └── projects/           # Project management
│   └── admin/                  # Admin dashboard (super admin only)
├── (auth)/                     # Authentication pages
│   ├── sign-in/
│   ├── sign-up/
│   └── reset-password/
└── api/                        # API routes
    ├── stripe/
    ├── user/
    └── admin/
```

### Image Processing Components
```
components/
├── image-processing/
│   ├── ImageProcessor.ts       # Core processing engine
│   ├── UploadZone.tsx          # File upload interface
│   ├── ToolTabs.tsx           # Tool navigation
│   ├── ResizeTool.tsx         # Resize functionality
│   ├── CropTool.tsx           # Crop & rotate
│   ├── CompressTool.tsx       # Compression
│   ├── ConvertTool.tsx        # Format conversion
│   ├── SocialPresets.tsx      # Social media presets
│   ├── MemeGenerator.tsx      # Meme creation
│   ├── ColorPicker.tsx        # Color extraction
│   └── WatermarkTool.tsx      # Watermarking (Pro)
├── ui/                        # Shadcn/ui components
└── layout/                    # Layout components
```

## Data Flow Architecture

### Free User Flow
```
1. User visits landing page
2. Drags & drops images (max 5, 10MB each)
3. Selects processing tool
4. Images processed client-side
5. Downloads individual files
6. Session data cleared on browser close
```

### Pro User Flow
```
1. User signs up/logs in
2. Accesses enhanced dashboard
3. Uploads up to 100 images (50MB each)
4. Uses advanced tools (watermarking, projects)
5. Saves projects to database
6. Downloads ZIP files
7. Usage tracked for analytics
```

## Database Architecture

### Entity Relationship Diagram
```
Users (Supabase Auth)
├── id (UUID, Primary Key)
├── email (VARCHAR, Unique)
├── name (VARCHAR)
├── plan (VARCHAR: 'free'|'pro')
├── stripe_customer_id (TEXT, Unique)
└── stripe_subscription_id (TEXT, Unique)

Projects
├── id (UUID, Primary Key)
├── user_id (UUID, Foreign Key → Users)
├── name (VARCHAR)
├── settings_json (JSONB)
├── thumbnail_url (TEXT)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

Project_Images
├── id (UUID, Primary Key)
├── project_id (UUID, Foreign Key → Projects)
├── original_name (VARCHAR)
├── processed_settings (JSONB)
├── file_size (INTEGER)
├── dimensions (JSONB)
└── created_at (TIMESTAMP)

Usage_Stats
├── id (UUID, Primary Key)
├── user_id (UUID, Foreign Key → Users)
├── feature (VARCHAR)
├── count (INTEGER)
├── file_sizes_total (BIGINT)
├── date (DATE)
└── created_at (TIMESTAMP)
```

## Security Architecture

### Authentication Flow
```
1. User attempts to access protected resource
2. Middleware checks for valid Supabase session
3. If no session, redirect to sign-in
4. If session exists, verify with Supabase
5. Load user data from custom users table
6. Grant access to protected resources
```

### Data Privacy Architecture
```
┌─────────────────────────────────────────────────────────────────┐
│                    Client-Side Processing                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   File Upload    │  │  Image Process  │  │   File Download  │ │
│  │   (Browser)      │  │   (Canvas API)  │  │   (Browser)     │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Server-Side Storage                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   User Data     │  │   Project Data  │  │   Usage Stats   │ │
│  │   (Supabase)    │  │   (Supabase)    │  │   (Supabase)    │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘

Note: Image files NEVER stored on server - only metadata
```

## Performance Architecture

### Image Processing Pipeline
```
1. File Validation (Client-side)
   ├── File type checking
   ├── Size limit validation
   └── Image integrity verification

2. Processing Queue (Web Workers)
   ├── Parallel processing
   ├── Progress reporting
   └── Memory management

3. Canvas Operations
   ├── Resize/Crop operations
   ├── Compression algorithms
   └── Format conversion

4. Output Generation
   ├── Blob creation
   ├── Download link generation
   └── ZIP file creation (Pro)
```

### Caching Strategy
```
Browser Cache
├── Static assets (CSS, JS, images)
├── Processed image thumbnails
└── User preferences

Session Storage
├── Uploaded file references
├── Processing settings
└── Temporary project data

Database Cache
├── User session data
├── Project metadata
└── Usage statistics
```

## Scalability Architecture

### Horizontal Scaling Considerations
```
Frontend Scaling
├── CDN for static assets
├── Edge computing for API routes
└── Client-side processing (no server load)

Database Scaling
├── Supabase managed PostgreSQL
├── Connection pooling
└── Read replicas for analytics

Payment Scaling
├── Stripe handles payment scaling
├── Webhook processing
└── Subscription management
```

### Monitoring Architecture
```
Application Monitoring
├── Vercel Analytics
├── Custom performance metrics
└── Error tracking

Business Metrics
├── User analytics
├── Conversion tracking
└── Revenue monitoring

Infrastructure Monitoring
├── Database performance
├── API response times
└── Error rates
```

## Integration Architecture

### Third-Party Integrations
```
Supabase Integration
├── Authentication service
├── Database service
├── Real-time subscriptions
└── Storage service (for thumbnails only)

Stripe Integration
├── Payment processing
├── Subscription management
├── Webhook handling
└── Customer portal

Analytics Integration
├── User behavior tracking
├── Performance monitoring
├── Business metrics
└── Error reporting
```

---

*This system architecture provides a comprehensive overview of how ResizeSuite is structured to deliver high-performance, secure, and scalable image processing capabilities.*
