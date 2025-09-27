# 🚀 Deployment Guide

This guide will help you deploy your SaaS boilerplate to production.

## 🎯 Recommended: Vercel Deployment

### 1. Prepare Your Repository

```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit"

# Push to GitHub
git remote add origin https://github.com/yourusername/your-repo.git
git push -u origin main
```

### 2. Deploy to Vercel

1. **Go to [Vercel](https://vercel.com)**
2. **Sign in with GitHub**
3. **Click "New Project"**
4. **Import your repository**
5. **Configure environment variables** (see below)
6. **Click "Deploy"**

### 3. Environment Variables in Vercel

Add these environment variables in your Vercel dashboard:

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
BASE_URL=https://your-app.vercel.app
APP_NAME=Your App Name
APP_DESCRIPTION=Your app description
```

## 🔧 Production Configuration

### 1. Update Supabase Settings

1. **Go to Supabase Dashboard → Authentication → Settings**
2. **Update Site URL**: `https://your-app.vercel.app`
3. **Add Redirect URLs**:
   - `https://your-app.vercel.app/auth/callback`
   - `https://your-app.vercel.app/dashboard`
   - `https://your-app.vercel.app/reset-password`

### 2. Configure Stripe Webhooks

1. **Go to Stripe Dashboard → Webhooks**
2. **Add endpoint**: `https://your-app.vercel.app/api/stripe/webhook`
3. **Select events**:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

### 3. Update Database Policies (if needed)

If you need to modify RLS policies for production:

```sql
-- Example: Allow service role to manage all data
CREATE POLICY "Service role full access" ON users
  FOR ALL USING (auth.role() = 'service_role');
```

## 🌐 Alternative Deployment Options

### Netlify

1. **Connect GitHub repository**
2. **Build command**: `npm run build`
3. **Publish directory**: `.next`
4. **Add environment variables**

### Railway

1. **Connect GitHub repository**
2. **Add environment variables**
3. **Deploy automatically**

### DigitalOcean App Platform

1. **Create new app**
2. **Connect GitHub repository**
3. **Configure build settings**
4. **Add environment variables**

## 🔒 Security Checklist

- [ ] Environment variables are set correctly
- [ ] Supabase RLS policies are enabled
- [ ] Stripe webhooks are configured
- [ ] HTTPS is enabled (automatic with Vercel)
- [ ] Database backups are configured
- [ ] Error monitoring is set up

## 📊 Monitoring & Analytics

### Recommended Tools

- **Vercel Analytics**: Built-in performance monitoring
- **Sentry**: Error tracking and performance monitoring
- **PostHog**: Product analytics
- **Supabase Dashboard**: Database monitoring

### Setup Sentry (Optional)

```bash
npm install @sentry/nextjs
```

```javascript
// sentry.client.config.js
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  tracesSampleRate: 1.0,
});
```

## 🚀 Performance Optimization

### 1. Enable Vercel Analytics

```bash
npm install @vercel/analytics
```

```javascript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### 2. Optimize Images

```bash
npm install next/image
```

### 3. Enable Compression

Vercel automatically enables compression, but for other platforms:

```javascript
// next.config.js
module.exports = {
  compress: true,
  poweredByHeader: false,
};
```

## 🔄 CI/CD Pipeline

### GitHub Actions (Optional)

```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run lint
```

## 📈 Scaling Considerations

### Database Scaling

- **Supabase Pro**: For higher limits and better performance
- **Connection pooling**: Already configured with Supabase
- **Read replicas**: Available with Supabase Pro

### Application Scaling

- **Vercel Pro**: For higher limits and better performance
- **Edge functions**: For global distribution
- **CDN**: Automatic with Vercel

## 🆘 Troubleshooting

### Common Issues

1. **Build failures**: Check environment variables
2. **Database connection**: Verify Supabase credentials
3. **Stripe webhooks**: Check endpoint configuration
4. **Authentication**: Verify redirect URLs

### Debug Mode

```bash
# Enable debug logging
DEBUG=* npm run dev
```

## 📞 Support

- 📧 Email: support@yourcompany.com
- 💬 Discord: [Community server]
- 📖 Docs: [Full documentation]

---

**Happy deploying! 🚀**
