# 💳 Stripe Setup Guide

This guide will help you configure Stripe for your SaaS application.

## 🚀 Quick Setup

### 1. Create Stripe Account

1. **Go to [Stripe](https://stripe.com)**
2. **Sign up for a free account**
3. **Complete account verification**

### 2. Get Your API Keys

1. **Go to Developers → API Keys**
2. **Copy your keys**:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`)

### 3. Create Products and Prices

#### Option A: Using Stripe Dashboard

1. **Go to Products → Add Product**
2. **Create your subscription plans**:

```bash
# Example: Basic Plan
Name: Basic
Description: Basic subscription plan
Price: $9/month
Billing: Monthly

# Example: Pro Plan  
Name: Pro
Description: Pro subscription plan
Price: $29/month
Billing: Monthly
```

#### Option B: Using Stripe CLI

```bash
# Install Stripe CLI
npm install -g stripe

# Login to Stripe
stripe login

# Create products
stripe products create --name "Basic" --description "Basic subscription plan"
stripe products create --name "Pro" --description "Pro subscription plan"

# Create prices
stripe prices create --product prod_xxx --unit-amount 900 --currency usd --recurring interval=month
stripe prices create --product prod_yyy --unit-amount 2900 --currency usd --recurring interval=month
```

### 4. Configure Webhooks

1. **Go to Developers → Webhooks**
2. **Add endpoint**: `https://your-domain.com/api/stripe/webhook`
3. **Select events**:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `checkout.session.completed`

4. **Copy webhook secret** (starts with `whsec_`)

## 🔧 Environment Variables

Add these to your `.env.local`:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

## 🎨 Customize Pricing Page

### Update Pricing Plans

Edit `app/(dashboard)/pricing/page.tsx`:

```typescript
const plans = [
  {
    name: 'Basic',
    price: '$9',
    period: '/month',
    description: 'Perfect for individuals',
    features: [
      'Up to 5 projects',
      'Basic support',
      '1GB storage'
    ],
    priceId: 'price_basic_monthly', // Your Stripe price ID
    popular: false
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/month', 
    description: 'Best for teams',
    features: [
      'Unlimited projects',
      'Priority support',
      '10GB storage',
      'Team collaboration'
    ],
    priceId: 'price_pro_monthly', // Your Stripe price ID
    popular: true
  }
];
```

## 🔄 Subscription Management

### Customer Portal

The boilerplate includes a customer portal where users can:
- Update payment methods
- Change subscription plans
- Cancel subscriptions
- View billing history

### Webhook Handling

The webhook handler automatically:
- Updates user subscription status
- Handles failed payments
- Manages subscription changes

## 🧪 Testing

### Test Cards

Use these test card numbers:

```bash
# Successful payment
4242 4242 4242 4242

# Declined payment
4000 0000 0000 0002

# Requires authentication
4000 0025 0000 3155
```

### Test Scenarios

1. **Successful subscription**
2. **Failed payment**
3. **Subscription cancellation**
4. **Plan upgrade/downgrade**

## 🚀 Production Checklist

- [ ] Switch to live API keys
- [ ] Configure production webhooks
- [ ] Set up monitoring
- [ ] Test all payment flows
- [ ] Configure tax settings
- [ ] Set up invoice templates

## 📊 Analytics & Monitoring

### Stripe Dashboard

Monitor:
- Revenue metrics
- Failed payments
- Customer churn
- Subscription metrics

### Custom Analytics

Track key metrics:
- Monthly Recurring Revenue (MRR)
- Customer Lifetime Value (CLV)
- Churn rate
- Conversion rate

## 🔒 Security Best Practices

1. **Never expose secret keys** in client-side code
2. **Use webhooks** for reliable event handling
3. **Validate webhook signatures**
4. **Implement idempotency** for webhook processing
5. **Use HTTPS** for all webhook endpoints

## 🆘 Troubleshooting

### Common Issues

1. **Webhook not receiving events**
   - Check endpoint URL
   - Verify webhook secret
   - Check firewall settings

2. **Payment failures**
   - Verify API keys
   - Check card details
   - Review Stripe logs

3. **Subscription not updating**
   - Check webhook events
   - Verify database connection
   - Review error logs

### Debug Mode

```bash
# Enable Stripe debug logging
STRIPE_DEBUG=true npm run dev
```

## 📞 Support

- 📧 Stripe Support: [support.stripe.com](https://support.stripe.com)
- 📖 Stripe Docs: [stripe.com/docs](https://stripe.com/docs)
- 💬 Community: [Stripe Discord](https://discord.gg/stripe)

---

**Happy billing! 💳**
