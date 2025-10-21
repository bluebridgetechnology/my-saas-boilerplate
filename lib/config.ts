// Configuration file for the SaaS template
// Update these values to customize your application

export const config = {
  // Application Information
  app: {
    name: '{{APP_NAME}}',
    description: '{{APP_DESCRIPTION}}',
    url: process.env.BASE_URL || 'http://localhost:3000',
  },

  // Authentication Configuration
  auth: {
    // Supabase configuration
    supabase: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    },
    
    // Redirect URLs after authentication
    redirects: {
      signIn: '/dashboard',
      signUp: '/dashboard',
      signOut: '/sign-in',
    },
  },

  // Database Configuration
  database: {
    url: process.env.DATABASE_URL!,
  },

  // Stripe Configuration
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY!,
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
    
    // Stripe settings
    settings: {
      currency: 'usd',
    },
  },

  // UI Configuration
  ui: {
    theme: {
      primaryColor: 'blue',
      darkMode: true,
    },
    
    // Navigation configuration
    navigation: {
      main: [
        { name: 'Dashboard', href: '/dashboard' },
        { name: 'Pricing', href: '/pricing' },
      ],
      dashboard: [
        { name: 'General', href: '/dashboard/general' },
        { name: 'Security', href: '/dashboard/security' },
        { name: 'Activity', href: '/dashboard/activity' },
      ],
    },
  },

  // Feature Flags
  features: {
    emailVerification: true,
    passwordReset: true,
    socialAuth: true,
    subscriptionManagement: true,
    activityLogging: true,
  },

  // Email Configuration (for future features)
  email: {
    from: 'noreply@yourapp.com',
    templates: {
      welcome: 'welcome',
      passwordReset: 'password-reset',
      subscriptionUpdate: 'subscription-update',
    },
  },
} as const;

// Type-safe configuration access
export type Config = typeof config;
