# 🚀 Complete Setup Guide

This guide will walk you through setting up your SaaS boilerplate from scratch.

## 📋 Prerequisites

Before you begin, make sure you have:

- [ ] Node.js 18+ installed
- [ ] Git installed
- [ ] A Supabase account
- [ ] A Stripe account
- [ ] A GitHub account (for deployment)

## 🚀 Step 1: Clone and Setup

```bash
# Clone the repository
git clone <your-repo-url> my-saas-app
cd my-saas-app

# Run the interactive setup
npm run setup
```

The setup script will ask you for:
- App name and description
- Supabase credentials
- Stripe credentials
- Base URL

## 🗄️ Step 2: Database Setup

### 2.1 Create Supabase Project

1. **Go to [Supabase](https://supabase.com)**
2. **Click "New Project"**
3. **Choose organization and name**
4. **Set database password**
5. **Select region**
6. **Click "Create new project"**

### 2.2 Run Database Migration

1. **Go to SQL Editor** in your Supabase dashboard
2. **Copy and paste** the contents of `supabase/migrations/001_initial_schema.sql`
3. **Click "Run"** to execute the migration

### 2.3 Configure Authentication

1. **Go to Authentication → Settings**
2. **Update Site URL**: `http://localhost:3000` (for development)
3. **Add Redirect URLs**:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/dashboard`
   - `http://localhost:3000/reset-password`

### 2.4 Get Supabase Keys

1. **Go to Settings → API**
2. **Copy the following**:
   - Project URL
   - anon public key
   - service_role key

## 💳 Step 3: Stripe Setup

### 3.1 Create Stripe Account

1. **Go to [Stripe](https://stripe.com)**
2. **Sign up for a free account**
3. **Complete account verification**

### 3.2 Get API Keys

1. **Go to Developers → API Keys**
2. **Copy**:
   - Publishable key (pk_test_...)
   - Secret key (sk_test_...)

### 3.3 Create Products and Prices

1. **Go to Products → Add Product**
2. **Create subscription plans**:

```bash
# Example plans
Basic Plan: $9/month
Pro Plan: $29/month
```

### 3.4 Configure Webhooks

1. **Go to Developers → Webhooks**
2. **Add endpoint**: `http://localhost:3000/api/stripe/webhook`
3. **Select events**:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. **Copy webhook secret** (whsec_...)

## 🔧 Step 4: Environment Configuration

Your `.env.local` file should look like this:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key

# Application Configuration
BASE_URL=http://localhost:3000
APP_NAME=Your App Name
APP_DESCRIPTION=Your app description
```

## 🚀 Step 5: Start Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:3000` to see your app!

## ✅ Step 6: Test Everything

### 6.1 Test Authentication

1. **Go to `/sign-up`**
2. **Create a new account**
3. **Check your email** for verification
4. **Click verification link**
5. **Sign in** with your credentials

### 6.2 Test Payments

1. **Go to `/pricing`**
2. **Click "Get Started"** on a plan
3. **Use test card**: `4242 4242 4242 4242`
4. **Complete checkout**
5. **Check dashboard** for subscription status

### 6.3 Test Features

- [ ] User registration and login
- [ ] Email verification
- [ ] Password reset
- [ ] Subscription purchase
- [ ] Dashboard access
- [ ] Activity logging
- [ ] Toast notifications

## 🚀 Step 7: Deploy to Production

### 7.1 Deploy to Vercel

1. **Push code to GitHub**
2. **Go to [Vercel](https://vercel.com)**
3. **Import your repository**
4. **Add environment variables**
5. **Deploy**

### 7.2 Update Production Settings

1. **Update Supabase redirect URLs** to your production domain
2. **Update Stripe webhook endpoint** to your production domain
3. **Switch to live Stripe keys** (when ready)

## 🔧 Customization

### Branding

1. **Update app name** in `package.json`
2. **Change colors** in `tailwind.config.js`
3. **Replace logo** in `app/(login)/login.tsx`

### Features

1. **Add new pages** in `app/` directory
2. **Extend database** by adding new tables
3. **Create custom components** in `components/`

## 🆘 Troubleshooting

### Common Issues

1. **"relation users does not exist"**
   - Run the database migration in Supabase

2. **"Invalid API key"**
   - Check your environment variables

3. **"Email not confirmed"**
   - Check your email and click verification link

4. **"Webhook signature verification failed"**
   - Check your webhook secret

### Debug Mode

```bash
# Enable debug logging
DEBUG=* npm run dev
```

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 🎉 You're Ready!

Your SaaS boilerplate is now set up and ready for development. You can:

- Start building your features
- Customize the design
- Add new functionality
- Deploy to production

Happy coding! 🚀

---

**Need help?** Check the other guides:
- [Supabase Setup](./SUPABASE_SETUP.md)
- [Stripe Setup](./STRIPE_SETUP.md)
- [Deployment Guide](./DEPLOYMENT.md)