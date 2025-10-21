# Cron System Documentation

## Overview

The cron system in ResizeSuite uses **Next.js API routes** (not Supabase Edge Functions) that can be triggered by external cron services. This approach is simple, cost-effective, and works with any hosting platform.

## How It Works

### Architecture
```
External Cron Service → HTTP Request → Next.js API Route → Business Logic
```

1. **API Endpoint**: `/api/cron/check-subscriptions`
2. **Trigger**: External HTTP cron services
3. **Authentication**: Bearer token via `CRON_SECRET` environment variable
4. **Deployment**: Automatic with Next.js app (no special deployment needed)

## Deployment Options

### Option 1: Vercel Cron (Recommended)

**File**: `vercel.json`
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

**Pros**:
- ✅ Automatic deployment with Vercel
- ✅ No additional setup required
- ✅ Built-in monitoring
- ✅ Free tier available

**Cons**:
- ❌ Vercel-specific (vendor lock-in)
- ❌ Limited to Vercel hosting

### Option 2: GitHub Actions

**File**: `.github/workflows/cron-subscriptions.yml`
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
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            -H "Content-Type: application/json"
```

**Required GitHub Secrets**:
- `APP_URL`: Your deployed app URL (e.g., `https://yourapp.vercel.app`)
- `CRON_SECRET`: Your cron secret token

**Pros**:
- ✅ Works with any hosting platform
- ✅ Free for public repositories
- ✅ Reliable GitHub infrastructure
- ✅ Easy to monitor via GitHub Actions

**Cons**:
- ❌ Requires GitHub repository
- ❌ Manual secret configuration

### Option 3: External Cron Services

Popular services:
- **Cron-job.org** (Free)
- **EasyCron** (Paid)
- **Cronhooks** (Paid)

**Setup**:
1. Create account on cron service
2. Add HTTP job with URL: `https://yourapp.com/api/cron/check-subscriptions`
3. Set method to `POST`
4. Add header: `Authorization: Bearer YOUR_CRON_SECRET`
5. Set schedule: `0 9 * * *` (daily at 9 AM)

## Environment Variables

Add to your `.env.local`:

```bash
# Required for cron job authentication
CRON_SECRET=your_secure_random_string_here
```

**Generate secure secret**:
```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -hex 32
```

## API Endpoint Details

### Endpoint: `POST /api/cron/check-subscriptions`

**Authentication**: Bearer token in Authorization header

**Request**:
```bash
curl -X POST https://yourapp.com/api/cron/check-subscriptions \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -H "Content-Type: application/json"
```

**Response**:
```json
{
  "success": true,
  "notificationsSent": 5,
  "errors": 0,
  "timestamp": "2024-01-20T09:00:00.000Z"
}
```

**Error Response**:
```json
{
  "error": "Unauthorized"
}
```

## Security

### Authentication
- Uses Bearer token authentication
- Token stored in environment variables
- 401 Unauthorized for invalid/missing tokens

### Rate Limiting (Recommended)
Add rate limiting to prevent abuse:

```typescript
// In your cron endpoint
const rateLimiter = new Map();

export async function POST(request: NextRequest) {
  const ip = request.ip || 'unknown';
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 5;

  if (!rateLimiter.has(ip)) {
    rateLimiter.set(ip, { count: 1, resetTime: now + windowMs });
  } else {
    const limit = rateLimiter.get(ip);
    if (now > limit.resetTime) {
      limit.count = 1;
      limit.resetTime = now + windowMs;
    } else {
      limit.count++;
      if (limit.count > maxRequests) {
        return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
      }
    }
  }
  
  // ... rest of your cron logic
}
```

## Monitoring

### Logging
The cron endpoint logs:
- Execution start/end times
- Number of notifications sent
- Errors encountered
- User processing results

### Health Checks
Add monitoring endpoint:

```typescript
// /api/cron/health
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
}
```

### Alerting
Set up alerts for:
- Cron job failures
- High error rates
- Missing executions

## Testing

### Manual Testing
```bash
# Test the endpoint manually
curl -X POST http://localhost:3000/api/cron/check-subscriptions \
  -H "Authorization: Bearer your_test_secret" \
  -H "Content-Type: application/json"
```

### Automated Testing
```typescript
// In your test file
describe('Cron Endpoints', () => {
  it('should authenticate with valid token', async () => {
    const response = await fetch('/api/cron/check-subscriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CRON_SECRET}`,
        'Content-Type': 'application/json',
      },
    });
    
    expect(response.status).toBe(200);
  });

  it('should reject invalid token', async () => {
    const response = await fetch('/api/cron/check-subscriptions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer invalid_token',
        'Content-Type': 'application/json',
      },
    });
    
    expect(response.status).toBe(401);
  });
});
```

## Troubleshooting

### Common Issues

1. **401 Unauthorized**
   - Check `CRON_SECRET` environment variable
   - Verify Authorization header format
   - Ensure secret matches between cron service and app

2. **Cron Not Running**
   - Check cron service configuration
   - Verify URL is correct and accessible
   - Check cron service logs

3. **Timeout Errors**
   - Increase timeout in cron service settings
   - Optimize cron job performance
   - Add pagination for large datasets

### Debug Mode
Enable debug logging:

```bash
NODE_ENV=development
DEBUG=cron:*
```

## Best Practices

1. **Idempotency**: Make cron jobs idempotent (safe to run multiple times)
2. **Timeouts**: Set reasonable timeouts (30-60 seconds)
3. **Error Handling**: Graceful error handling and logging
4. **Monitoring**: Set up health checks and alerting
5. **Testing**: Test cron jobs in staging environment
6. **Documentation**: Document all cron jobs and their schedules

## Future Enhancements

- [ ] Add more cron jobs (cleanup, analytics, etc.)
- [ ] Implement job queuing system
- [ ] Add cron job management UI in admin panel
- [ ] Set up comprehensive monitoring dashboard
- [ ] Add retry logic for failed jobs
