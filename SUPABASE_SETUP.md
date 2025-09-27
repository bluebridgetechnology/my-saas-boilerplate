# 🚀 Supabase Setup Guide

This guide will help you set up Supabase for your project quickly and easily.

## 📋 **Prerequisites**

- A Supabase account (free at [supabase.com](https://supabase.com))
- Your project environment variables configured

## 🗄️ **Database Setup**

### **Step 1: Create Tables**

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the following SQL:

```sql
-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(100),
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_product_id TEXT,
  plan_name VARCHAR(50),
  subscription_status VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create activity_logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address VARCHAR(45)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON users(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_timestamp ON activity_logs(timestamp);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Users can only see their own activity logs
CREATE POLICY "Users can view own activity logs" ON activity_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Service role can do everything (for server-side operations)
CREATE POLICY "Service role full access" ON users
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access" ON activity_logs
  FOR ALL USING (auth.role() = 'service_role');
```

4. Click **Run** to execute the SQL

### **Step 2: Configure Authentication**

1. Go to **Authentication** → **Settings**
2. Configure your site URL: `http://localhost:3000` (for development)
3. Add redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/dashboard`

### **Step 3: Get Your Keys**

1. Go to **Settings** → **API**
2. Copy the following values to your `.env.local`:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY`

## 🔧 **Environment Variables**

Update your `.env.local` file:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Application Configuration
BASE_URL=http://localhost:3000
APP_NAME=Your App Name
APP_DESCRIPTION=Your app description
```

## ✅ **Testing**

1. Start your development server: `npm run dev`
2. Try signing up with a new account
3. Check your Supabase dashboard to see the user created in the `users` table

## 🎯 **Benefits of This Approach**

- **Simpler**: No ORM complexity, direct SQL queries
- **Faster**: Direct database connection
- **Secure**: Built-in RLS policies
- **Scalable**: Supabase handles scaling automatically
- **Real-time**: Built-in real-time subscriptions
- **Reusable**: Easy to copy for new projects

## 🚀 **Next Steps**

1. Set up Stripe for payments
2. Configure your app branding
3. Deploy to production
4. Set up monitoring and analytics

---

**Need help?** Check the [Supabase Documentation](https://supabase.com/docs) or create an issue in your project repository.
