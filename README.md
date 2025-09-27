# 🚀 SaaS Boilerplate - Next.js 15 + Supabase + Stripe

A modern, production-ready SaaS boilerplate built with Next.js 15, Supabase, and Stripe. Perfect for quickly launching your next SaaS application.

## ✨ Features

- **🔐 Authentication**: Complete auth system with Supabase Auth
- **💳 Payments**: Stripe integration with subscriptions and billing portal
- **🎨 UI**: Beautiful, responsive design with Tailwind CSS + shadcn/ui
- **📱 Modern Stack**: Next.js 15 with Turbopack, React 19, TypeScript
- **🔒 Security**: Row Level Security (RLS) policies, secure API routes
- **📊 Activity Logging**: Track user actions and security events
- **🍞 Notifications**: Toast notifications with Sonner
- **🔄 Real-time**: Built-in real-time capabilities with Supabase
- **📦 Zero Config**: Works out of the box with minimal setup

## 🚀 Quick Start

### 1. Clone and Setup

```bash
# Clone the repository
git clone <your-repo-url> my-saas-app
cd my-saas-app

# Run the interactive setup
npm run setup
```

### 2. Database Setup

1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Run the migration from `supabase/migrations/001_initial_schema.sql`
4. Configure authentication settings

### 3. Start Development

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` and you're ready to go! 🎉

## 📋 Prerequisites

- Node.js 18+ 
- A Supabase account
- A Stripe account
- Git

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with Turbopack
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Payments**: Stripe
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Notifications**: Sonner
- **State Management**: SWR

## 📁 Project Structure

```
├── app/                    # Next.js 15 app directory
│   ├── (dashboard)/        # Protected dashboard routes
│   ├── (login)/           # Authentication pages
│   ├── api/               # API routes
│   └── layout.tsx         # Root layout
├── components/            # Reusable UI components
│   └── ui/               # shadcn/ui components
├── lib/                   # Utility libraries
│   ├── auth/             # Authentication logic
│   ├── supabase/         # Database service
│   └── payments/         # Stripe integration
├── supabase/             # Database migrations
└── scripts/              # Setup and utility scripts
```

## 🔧 Configuration

### Environment Variables

The setup script will create a `.env.local` file with all necessary variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key

# Stripe Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# Application Configuration
BASE_URL=http://localhost:3000
APP_NAME=Your App Name
APP_DESCRIPTION=Your app description
```

### Supabase Setup

1. **Create Tables**: Run the SQL migration in `supabase/migrations/001_initial_schema.sql`
2. **Configure Auth**: Set up email templates and redirect URLs
3. **Enable RLS**: Row Level Security is automatically configured

### Stripe Setup

1. **Create Products**: Set up your subscription products in Stripe
2. **Configure Webhooks**: Point webhooks to `/api/stripe/webhook`
3. **Set Prices**: Configure pricing for your products

## 🎨 Customization

### Branding

1. **App Name & Description**: Set during `npm run setup`
2. **Colors**: Update Tailwind config in `tailwind.config.js`
3. **Logo**: Replace the CircleIcon in `app/(login)/login.tsx`

### Features

- **Add new pages**: Create new routes in the `app/` directory
- **Extend database**: Add new tables and update the DatabaseService
- **Custom components**: Add components in the `components/` directory
- **API routes**: Add new endpoints in `app/api/`

## 📚 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run setup        # Interactive project setup
npm run lint         # Run ESLint
```

## 🔒 Security Features

- **Row Level Security**: Database-level security policies
- **Server-side validation**: Zod schemas for all inputs
- **Secure cookies**: HTTP-only, secure session management
- **CSRF protection**: Built-in Next.js protection
- **Rate limiting**: Supabase built-in rate limiting

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

The app works on any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 📖 Documentation

- [Supabase Setup Guide](./SUPABASE_SETUP.md)
- [Stripe Integration](./STRIPE_SETUP.md)
- [Deployment Guide](./DEPLOYMENT.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details.

## 🆘 Support

- 📧 Email: support@yourcompany.com
- 💬 Discord: [Join our community]
- 📖 Docs: [Full documentation]

---

**Built with ❤️ for the developer community**