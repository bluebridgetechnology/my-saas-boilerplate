# Email Notification System

This document describes the email notification system implemented in ResizeSuite.

## Overview

The email notification system provides automated email notifications for important events such as:
- Subscription expiry warnings
- Subscription cancellations
- Payment failures
- Batch processing completion
- Welcome messages for new users

## Architecture

### Core Components

1. **EmailService** (`lib/email/email-service.ts`)
   - Handles SMTP configuration and email sending
   - Uses Nodemailer for email transport
   - Provides connection verification and error handling

2. **EmailTemplates** (`lib/email/templates.ts`)
   - Contains HTML and text templates for all notification types
   - Responsive email designs with consistent branding
   - Supports dynamic data injection

3. **NotificationService** (`lib/email/notification-service.ts`)
   - High-level service for sending specific notification types
   - Handles template rendering and data formatting
   - Logs notifications to database (if notifications table exists)

## Configuration

### Environment Variables

Add these variables to your `.env.local` file:

```bash
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=noreply@yourapp.com

# Cron Job Security (optional)
CRON_SECRET=your_secure_cron_secret_key
```

### SMTP Providers

#### Gmail
- Host: `smtp.gmail.com`
- Port: `587`
- Secure: `false`
- Use App Password (not regular password)

#### SendGrid
- Host: `smtp.sendgrid.net`
- Port: `587`
- User: `apikey`
- Pass: Your SendGrid API key

#### Mailgun
- Host: `smtp.mailgun.org`
- Port: `587`
- User: Your Mailgun SMTP username
- Pass: Your Mailgun SMTP password

## Notification Types

### 1. Subscription Expiring
Sent 7 days and 1 day before subscription expires.

```typescript
await NotificationService.sendSubscriptionExpiringNotification(
  {
    userId: 'user-id',
    userEmail: 'user@example.com',
    userName: 'John Doe',
  },
  {
    expiryDate: new Date('2024-12-31'),
    planName: 'Pro',
  }
);
```

### 2. Subscription Expired
Sent when subscription is cancelled or expires.

```typescript
await NotificationService.sendSubscriptionExpiredNotification(
  context,
  { planName: 'Pro' }
);
```

### 3. Payment Failed
Sent when a payment fails.

```typescript
await NotificationService.sendPaymentFailedNotification(
  context,
  {
    planName: 'Pro',
    amount: '$9.99',
    nextRetryDate: new Date('2024-01-15'),
  }
);
```

### 4. Batch Process Complete
Sent when batch image processing is finished.

```typescript
await NotificationService.sendBatchProcessCompleteNotification(
  context,
  {
    batchId: 'batch-123',
    processedCount: 100,
    successCount: 95,
    failedCount: 5,
    processingTime: '5m 30s',
    downloadUrl: 'https://example.com/download/batch-123',
  }
);
```

### 5. Welcome
Sent to new users or when they subscribe.

```typescript
await NotificationService.sendWelcomeNotification(context);
```

## Integration Points

### Stripe Webhooks
Email notifications are automatically triggered by Stripe webhook events:

- `customer.subscription.created` → Welcome notification
- `customer.subscription.deleted` → Subscription expired notification
- `invoice.payment_failed` → Payment failed notification

### Batch Processing
Integrate with your batch processing system:

```typescript
// After batch processing completes
await NotificationService.sendBatchProcessCompleteNotification(
  userContext,
  batchResults
);
```

## API Endpoints

### Test Email Notifications
`POST /api/admin/email/test`

Test different email types:

```bash
curl -X POST /api/admin/email/test \
  -H "Content-Type: application/json" \
  -d '{
    "type": "welcome",
    "email": "test@example.com"
  }'
```

Available types:
- `welcome`
- `subscription_expiring`
- `subscription_expired`
- `batch_complete`
- `payment_failed`
- `connection_test`

### Check Email Service Status
`GET /api/admin/email/test`

Returns email service configuration status.

## Cron Jobs

### Subscription Expiry Check
`POST /api/cron/check-subscriptions`

Automated job to check for expiring subscriptions and send notifications.

#### Setup with Vercel Cron

Create `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/check-subscriptions",
      "schedule": "0 9 * * *"
    }
  ]
}
```

#### Setup with GitHub Actions

Create `.github/workflows/cron-subscriptions.yml`:

```yaml
name: Check Subscriptions
on:
  schedule:
    - cron: '0 9 * * *'  # Daily at 9 AM UTC

jobs:
  check-subscriptions:
    runs-on: ubuntu-latest
    steps:
      - name: Call subscription check endpoint
        run: |
          curl -X POST ${{ secrets.APP_URL }}/api/cron/check-subscriptions \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

## Monitoring and Logging

### Email Service Health Check
The system provides health check endpoints to monitor email service status:

```typescript
const isReady = emailService.isReady();
const canConnect = await emailService.verifyConnection();
```

### Notification Logging
All sent notifications are logged to the database (if notifications table exists):

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  type VARCHAR(50) NOT NULL,
  channel VARCHAR(20) DEFAULT 'email',
  status VARCHAR(20) NOT NULL,
  metadata JSONB,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Troubleshooting

### Common Issues

1. **SMTP Authentication Failed**
   - Verify SMTP credentials
   - For Gmail, use App Password instead of regular password
   - Check if 2FA is enabled

2. **Emails Not Sending**
   - Check SMTP configuration
   - Verify firewall/network settings
   - Test with `connection_test` email type

3. **Emails Going to Spam**
   - Set up SPF, DKIM, and DMARC records
   - Use a dedicated sending domain
   - Warm up your sending reputation

### Debug Mode

Enable debug logging by setting:

```bash
NODE_ENV=development
```

This will log detailed information about email sending attempts.

## Security Considerations

1. **SMTP Credentials**: Store securely in environment variables
2. **Cron Endpoints**: Protect with secret tokens
3. **Rate Limiting**: Implement rate limiting for email endpoints
4. **Content Validation**: Sanitize user data in email templates

## Future Enhancements

- [ ] Email template editor in admin panel
- [ ] Email delivery tracking and analytics
- [ ] Multiple email providers with failover
- [ ] Email preferences management for users
- [ ] Rich email templates with images and better styling
- [ ] Email scheduling and queuing system
