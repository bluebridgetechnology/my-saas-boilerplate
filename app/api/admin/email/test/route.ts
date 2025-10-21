import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/email/email-service';
import { NotificationService } from '@/lib/email/notification-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, email, ...data } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const testContext = {
      userId: 'test-user-id',
      userEmail: email,
      userName: 'Test User',
    };

    let success = false;

    switch (type) {
      case 'welcome':
        success = await NotificationService.sendWelcomeNotification(testContext);
        break;
      
      case 'subscription_expiring':
        success = await NotificationService.sendSubscriptionExpiringNotification(
          testContext,
          {
            expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            planName: 'Pro',
          }
        );
        break;
      
      case 'subscription_expired':
        success = await NotificationService.sendSubscriptionExpiredNotification(
          testContext,
          { planName: 'Pro' }
        );
        break;
      
      case 'batch_complete':
        success = await NotificationService.sendBatchProcessCompleteNotification(
          testContext,
          {
            batchId: 'batch-123',
            processedCount: 10,
            successCount: 9,
            failedCount: 1,
            processingTime: '2m 30s',
            downloadUrl: 'https://example.com/download/batch-123',
          }
        );
        break;
      
      case 'payment_failed':
        success = await NotificationService.sendPaymentFailedNotification(
          testContext,
          {
            planName: 'Pro',
            amount: '$9.99',
            nextRetryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
          }
        );
        break;
      
      case 'connection_test':
        success = await emailService.verifyConnection();
        if (success) {
          success = await emailService.sendEmail({
            to: email,
            subject: 'Email Service Test',
            html: '<h1>Email service is working!</h1><p>This is a test email to verify SMTP configuration.</p>',
            text: 'Email service is working! This is a test email to verify SMTP configuration.',
          });
        }
        break;
      
      default:
        return NextResponse.json({ error: 'Invalid email type' }, { status: 400 });
    }

    return NextResponse.json({ 
      success,
      message: success ? 'Email sent successfully' : 'Failed to send email',
      emailServiceReady: emailService.isReady(),
    });
  } catch (error) {
    console.error('Error in email test endpoint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const isReady = emailService.isReady();
    const canConnect = isReady ? await emailService.verifyConnection() : false;

    return NextResponse.json({
      emailServiceReady: isReady,
      smtpConnectionValid: canConnect,
      availableTypes: [
        'welcome',
        'subscription_expiring',
        'subscription_expired',
        'batch_complete',
        'payment_failed',
        'connection_test',
      ],
    });
  } catch (error) {
    console.error('Error checking email service status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
